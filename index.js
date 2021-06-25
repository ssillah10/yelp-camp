if (process.env.NODE_ENV!=='production') {
    require('dotenv').config();
}


const express=require('express'),
    session=require('express-session'),
    flash=require('connect-flash'),
    methodOverride=require('method-override'),
    expressSanitizer=require('express-sanitizer'),
    mongoose=require('mongoose'),
    ejsMate=require('ejs-mate'),
    ExpressError=require('./utils/ExpressError'),
    campgroundRoutes=require('./routes/campgrounds'),
    reviewRoutes=require('./routes/reviews'),
    userRoutes=require('./routes/users'),
    passport=require('passport'),
    LocalStrategy=require('passport-local'),
    mongoSanitize=require('express-mongo-sanitize'),
    User=require('./models/user'),
    multer=require('multer'),
    upload=multer({ dest: 'uploads/' }),
    helmet=require('helmet'),
    dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp',
    path=require('path');

// SESSION CONFIG
const MongoStore=require('connect-mongo');
const secret=process.env.SECRET||'thisshouldbeabettersecret!';
const store=MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24*60*60,
    crypto: {
        secret
    }
});

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e)
});

const sessionConfig={
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
};





//   APP CONFIG
const app=express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(mongoSanitize());

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));
app.set('view engine', 'ejs');


// HELMET SETUP 
const scriptSrcUrls=[
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls=[
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls=[
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls=[
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ssillah/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// 'mongodb://localhost:27017/yelp-camp'

//   DB SETUP
mongoose.connect(dbUrl, {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true
});

const db=mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to the DB');
});

// MIDDLEWARE
app.use((req, res, next) => {
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.returnTo=req.originalUrl;
    }
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

// ROUTES 
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


// LANDING PAGE
app.get('/', function (req, res) {
    res.render('campgrounds/home');
})


// INVALID ROUTES

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

// ERROR HANDLER
app.use((err, req, res, next) => {
    const { statusCode=500 }=err;
    if (!err.message) err.message='Oh no, something went wrong!!!'
    res.status(statusCode).render('error', { err });
})

const port=process.env.PORT||3000;
app.listen(port, function () {
    console.log(`App Server Started on port ${port}`);
})

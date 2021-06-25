const mongoose=require('mongoose');
const cities=require('./cities');
const { places, descriptors }=require('./seedHelpers');
const Campground=require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true
})
    .then(() => console.log('Connected to the DB'))
    .catch(err => console.log(err));


const seedCamps=[
    {
        name: 'Orange',
        price: 1.20,
        description: 'fruit',
        location: 'fruit'
    },

];

const sample=array => array[Math.floor(Math.random()*array.length)]

const seedDB=async () => {
    await Campground.deleteMany({});
    for (let i=0; i<300; i++) {
        const rand1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;

        const camp=new Campground({
            name: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            author: '604bd777bd8a70278cfdfa04',
            images: [
                {
                    url: 'https://res.cloudinary.com/ssillah/image/upload/v1617543737/YelpCamp/io6iqqx5grqqgykqtqvd.jpg',
                    filename: 'YelpCamp/io6iqqx5grqqgykqtqvd'
                },
                {
                    url: 'https://res.cloudinary.com/ssillah/image/upload/v1617141643/YelpCamp/igp21ze5snbutp6mqjtg.jpg',
                    filename: 'YelpCamp/igp21ze5snbutp6mqjtg'
                }
            ],
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis in velit sunt amet facere consequatur corrupti vel temporibus, enim vitae earum molestias soluta, quae rerum totam sapiente ipsam maxime ex?',
            price
        })
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
})

// Product.insertMany(seedProducts)
//     .then(m => {
//         console.log(m)
//     })
//     .catch(err => {
//         console.log(err)
//     });
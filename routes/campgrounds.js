const express=require('express');
const router=express.Router();
const campgrounds=require('../controllers/campgrounds');
const Campground=require('../models/campground');
const ExpressError=require('../utils/ExpressError');
const catchAsync=require('../utils/CatchAsync');
const { storage }=require('../cloudinary');
const multer=require('multer');
const upload=multer({ storage });

const { isLoggedIn, isAuthor, validateCampground }=require('../middleware');

router.route('/')
    // INDEX ROUTE
    .get(catchAsync(campgrounds.index))
    // CREATE ROUTE
    .post(isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.createCampground));


// NEW ROUTE
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// EDIT ROUTE
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


router.route('/:id')
    // SHOW ROUTE
    .get(catchAsync(campgrounds.showCampground))
    // UPDATE ROUTE
    .put(isLoggedIn, isAuthor, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.updateCampground))
    // DELETE ROUTE
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.route('/page/:page')
    // INDEX ROUTE
    .get(catchAsync(campgrounds.index))
module.exports=router;
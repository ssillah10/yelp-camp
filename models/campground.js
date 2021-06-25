const { number }=require('joi');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require('./review');

const imageSchema=new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts={ toJSON: { virtuals: true } };

const campgroundSchema=new Schema({
    name: {
        type: String,
        required: true
    },
    images:
        [imageSchema]

    ,
    price: {
        type: Number,
        required: false,
        min: 0
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]

}, opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.name}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground.reviews.length) {
        await Review.deleteMany({ _id: { $in: campground.reviews } });
    }
})



let Campground=mongoose.model('Campground', campgroundSchema);

module.exports=Campground;
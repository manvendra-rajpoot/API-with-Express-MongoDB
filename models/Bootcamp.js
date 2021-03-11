const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const colors = require('colors');


const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Enter the name..'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name should be less 50 characters..']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Add the description..'],
        maxlength: [200, 'Description not more than 200 characters..']
    },
    website: {
        type: String,
        match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Enter a valid URL with HTTP or HTTPS..'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number with country-code..']
    },
    email: {
        type: String,
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Enter a valid email-address..'
        ]
    },
    address: {
        type: String,
        required: [true, 'Enter the address..']
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'DevOps',
            'Machine Learning',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

//create bootcamp slug from name
BootcampSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//node-geocoder & creation of location field
BootcampSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
    //don't save address in DB
    this.address = undefined;
    
    next();
});

//Cascade DELETE courses related to a bootcamp
BootcampSchema.pre('remove', async function (next) {
    console.log(`Courses being removed from bootcamp of id:${this._id}..`.magenta);
    await this.model('Course').deleteMany({ bootcamp: this._id });
    next();
});
/* Npte: 'remove' middleware doesnot work with Bootcamp.findByIdAndDelete() we need  Bootcamp.findById() & bootcamp.remove to make it work, so modify accordingly in ../controllers/bootcamps */


//reverse populate bootcamp with courses using virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false,
});
//reverse populate bootcamp with noOfCourses in it using virtuals
BootcampSchema.virtual('noOfCourses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    count: true,
});


module.exports = mongoose.model('Bootcamp', BootcampSchema);
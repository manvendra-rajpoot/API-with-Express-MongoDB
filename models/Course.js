const mongoose  = require("mongoose");


const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Enter the course title..']
    },
    description: {
        type: String,
        required: [true, 'Enter the course description..']
    },
    weeks: {
        type: String,
        required: [true, 'Add the number of weeks..']
    },
    tuition: {
        type: Number,
        required: [true, 'Add the tuition fee..']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Add minimum skill level..'],
        enum: ['beginner','intermediate','advanced']
    },
	scholarhip: {
        type: Boolean,
        default: false,
        required: [true, 'Add the number of weeks..']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: [true, 'Add a bootcamp for this course']
    },
});


module.exports = mongoose.model('Course', CourseSchema);    

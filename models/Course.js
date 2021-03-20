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
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
});

//static method to get avg   pf courses tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId){
    // console.log('Calculating Avg cost....'.blue);
    
    const obj = await this.aggregate([
        {
            $match: {
                bootcamp: bootcampId,
            }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' },
            }
        }
    ]);
    
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost)
        });
    } catch (err) {
        console.error(err);
    }
}

//call getAverageCost after save
CourseSchema.post('save', function(){
    this.constructor.getAverageCost(this.bootcamp);
});

//call getAverageCost before remove
CourseSchema.pre('remove', function(){
    this.constructor.getAverageCost(this.bootcamp); 
});


module.exports = mongoose.model('Course', CourseSchema);    

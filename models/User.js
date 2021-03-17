const mongoose  = require("mongoose");
const bcrypt  = require("bcryptjs");
const jwt  = require("jsonwebtoken");


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Enter your name..'],
    },
    email: {
        type: String,
        required: [true,'Enter your Email-address..'],
        unique: true,
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Enter a valid email-address..'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true,'Enter your password..'],
        minlegth: 6,
        select: false,
    },
    resetPasswordToken: String,
    resetPassworkExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
});

//Encrypt password using bcrypt
UserSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id: this._id},process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}
/*Schema.stactics is called upon model itself and Schema.methods is called upon something created from model */

//Match user's entered password with password in DB for a specific object
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
} //This will return a promise i.e.,boolean

module.exports = mongoose.model('User', UserSchema);
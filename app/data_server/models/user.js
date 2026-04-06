const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: false
    },
    lastName:{
        type: String,
        required: false
    },
    dob:{
        type: Date,
        required: false,
        default: Date.now
    },
    weight:{
        type: Number,
        required: false
    },
    height:{
        type: Number,
        required: false
    },
    phone:{
        type: String,
        required: false
    },
    email:{
        type: String,
        required: false
    },
    username:{
        type: String,
        required: false
    },
    password:{
        type: String,
        required: false
    },
    imagePath:{
        type: String,
        required: false
    },
    image: {
        data: { type: Buffer },
        contentType: { type: String }
    },
    results:{
        type: String,
        required: false
    }
})

module.exports = mongoose.model('User', userSchema)
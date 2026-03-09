const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    dob:{
        type: Date,
        required: true,
        default: Date.now
    },
    weight:{
        type: Number,
        required: true
    },
    //height:{},
    //result:{},
    //phone:{},
    email:{
        type: String,
        required: true
    },
    imagePath:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema)
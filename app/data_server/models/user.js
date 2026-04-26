const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    image: {
        data: Buffer,
        contentType: String
    },
    prediction: { type: String, required: true },
    date: { type: Date, required: false, default: Date.now }
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    username: { type: String, required: false },
    password: { type: String, required: false },
    imagePath: { type: String, required: false }, 
    image: {
        data: Buffer,
        contentType: String
    },
    results: [resultSchema] 
});

module.exports = mongoose.model('User', userSchema);
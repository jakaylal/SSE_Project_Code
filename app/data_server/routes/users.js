const express = require('express')
const router = express.Router()
const User = require('../models/user')
const multer = require('multer')

//USE MULTER FOR IMAGE TRANSFER
const imageStorage = multer.diskStorage({
    destination: (req,file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniquePrefix + '-' + file.originalname);
    }
})

const upload = multer({storage: imageStorage});

// Geting all
router.get('/', async (req,res) => {
    try{
        const users = await User.find()
        res.json(users)
    }catch(err){
        res.status(500).json({message: err.message})
    }
})
//Getting one
router.get('/:id', getUser,(req, res) => {
    res.json(res.user)
})

//creating one
router.post('/',async (req,res) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        username: req.body.username,
        password: req.body.password,
    })
    try{
        const newUser = await user.save()
        res.status(201).json(newUser)
    }catch(err){
        res.status(400).json({message: err.message})
    }
})

//login verify POST
router.post('/login', async (req,res) => {
    try{
        const{username, password} = req.body;

        const user = await User.findOne({username: username})

        if(user && user.password === password){
            res.status(200).json({message:"login successful", userId: user._id})
        }else{
            res.status(401).json({message:"Invalid username or password"})
        }
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//updating one FIX THIS
router.patch('/:id', getUser,async(req,res) => {
    try{
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        );

        if (!updatedUser){
            return res.status(404).json({message: 'User not found'})
        }

        res.json(updatedUser);
    }catch(err){
        res.status(400).json({message:err.message})
    }
})

//deleting one
router.delete('/:id', getUser, async (req,res) => {
    try{
        await res.user.deleteOne()
        res.json({message: 'Deleted User'})
    }catch(err){
        res.status(500).json({message: err.message})
    }
})

//middleware
async function getUser(req,res,next){
    let user
    try{
        user = await User.findById(req.params.id)
        if(user == null){
            return res.status(404).json({message: 'Cannot find User'})
        }
    }catch(err){
        res.status(500).json({message: err.message})
    }

    res.user = user
    next()
}

module.exports = router
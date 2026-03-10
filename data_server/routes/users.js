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
    res.json(res.User)
})

//creating one
router.post('/', upload.single('image'),async (req,res) => {
    const user = new User({
        name: req.body.name,
        weight: req.body.weight,
        email: req.body.email,
        imagePath: req.file.path
    })
    try{
        const newUser = await user.save()
        res.status(201).json(newUser)
    }catch(err){
        res.status(400).json({message: err.message})
    }
})

//updating one FIX THIS
router.patch('/:id', getUser,async(req,res) => {
    if(req.body.name != null){
        res.user.name = req.body.name
    }
    if(req.body.weight != null && req.body.weight == Number){
        res.user.weight = req.body.weight
    }
    if(req.body.email != null){
        res.user.email = req.body.email
    }
    try{
        const updatedUser = await res.user.save()
        res.json(updatedUser)
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
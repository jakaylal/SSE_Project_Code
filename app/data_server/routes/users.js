const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const SECRET_KEY = "436a1111bed35e788d0b15e3d2157174e1c209edf1758aa2ca3b875f26fb2cb1" //VERY IMPORTANT DO NOT CHANGE 

const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 16 * 1024 * 1024 } // Optional: 16MB limit for MongoDB
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Access Denied");
    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send("Invalid Token");
    }
};

// Getting all
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

// Authorization Route
router.get('/details', async (req, res) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'YOUR_SECRET_KEY');   
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ 
            userId: user.username, 
            firstName: user.firstName,
            email: user.email 
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
});

//creating one
//not sure if i still need this yet
/*router.post('/',async (req,res) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        username: req.body.username,
        password: req.body.password,
        image: req.body.image  //might not need this for post but instead for patch
    })
    try{
        const newUser = await user.save()
        res.status(201).json(newUser)
    }catch(err){
        res.status(400).json({message: err.message})
    }
})*/

//might add back the commented out fields later
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newPatient = new User({
            firstName: req.body.firstName, 
            lastName: req.body.lastName,
            //dob: req.body.dateOfBirth,
            //weight: req.body.weight,
            //height: req.body.height,
            phone: req.body.phone,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            /*image: req.file ? {
                data: req.file.buffer,
                contentType: req.file.mimetype
            } : undefined*/
        });

        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (err) {
        console.error(err.message); 
        res.status(400).json({ message: err.message });
    }
});

//login verify 
router.post('/login', async (req,res) => {
    try{
        const{username, password} = req.body;
        const user = await User.findOne({username: username})
        
        if(user && await bcrypt.compare(password, user.password)){
            const token = jwt.sign(
                { userId: user._id }, 
                SECRET_KEY, 
                { expiresIn: '2h' }
            );
            //token sent as an http cookie
            res.cookie('token', token, {
                httpOnly: true,   
                secure: false,     //set to true if using HTTPS
                sameSite: 'lax',//protects against CSRF
                maxAge: 7200000    //2hr limit on login
            })
            res.status(200).json({ message: "Login successful" });
        }else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//updating one FIX THIS
//ive yet to try and fix this
/*router.patch('/:id', getUser,async(req,res) => {
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
})*/

router.patch('/:id', upload.single('image'), async (req, res) => {
    try {
        //copies the fields provided
        let updateFields = { ...req.body };

        //checks for binary file
        if (req.file) {
            updateFields.image = {
                data: req.file.buffer,      
                contentType: req.file.mimetype
            };
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields }, // Use $set to only update what's provided
            { new: true, runValidators: true }
        )
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//deleting one
router.delete('/:id', getUser, async (req,res) => {
    try{
        await res.user.deleteOne()
        res.json({message: 'Deleted User'})
    }catch(err){
        res.status(500).json({message: err.message})
    }
})

//middleware to verify user
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

//IMPORTANT MIDDLEWARE to check credentials
router.get('/details', authenticateToken, (req, res) => {
    // 401 error if token is invalid
    // else the below code runs
    res.json({ 
        message: "Patient Login Successful!",
        userId: req.user.userId
    });
});

module.exports = router
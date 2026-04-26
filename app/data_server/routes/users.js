//2xx = success
//3xx = redirect
//4xx = client error
//5xx = server error

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

// Get all users
router.get('/', async (req,res) => {
    try{
        const users = await User.find()
        res.json(users)
    }catch(err){
        res.status(500).json({message: err.message})
    }
})

// Authorization Route
router.get('/details', async (req, res) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || SECRET_KEY);   
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ 
            userId: user._id,
            firstName: user.firstName,
            username: user.username,
            email: user.email
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });
    res.status(200).send({ message: "Logged out successfully" });
});

// Get specific user
router.get('/:id', getUser,(req, res) => {
    res.json(res.user)
})



//might add back the commented out fields later
//didn't keep image because when you create an account you are not immediately uploading an image
//use PATCH to update the account with image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newPatient = new User({
            firstName: req.body.firstName, 
            lastName: req.body.lastName,
            phone: req.body.phone,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
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
                secure: false,  
                sameSite: 'lax',
                maxAge: 7200000,   
                path: '/'
            })
            res.status(200).json({ message: "Login successful" });
        }else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

// update specific user info
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
            { $set: updateFields },
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

//middleware to check token credentials
router.get('/details', authenticateToken, (req, res) => {
    // 401 error if token is invalid
    // else the below code runs
    res.json({ 
        message: "Patient Login Successful!",
        userId: req.user.userId
    });
});

module.exports = router
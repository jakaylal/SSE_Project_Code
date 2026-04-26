require('dotenv').config()
const express = require("express")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const mongoose = require('mongoose')
const path = require('path');
const app = express()

//this is for logging purposes
app.use((req, res, next) => {
    console.log(`>>> ${req.method} request to: ${req.originalUrl}`);
    next();
});

//security + parsing
app.use(cors({
    origin: 'http://localhost:5500', 
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization','Cookie'],
    credentials: true //added this could cause problems check back later
})) 
app.use(express.json())
app.use(cookieParser());

//changed path could cause problems
app.use(express.static(path.join(__dirname, 'Frontend','ColorVisionWebsite')));

//database connection
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

//routes
const usersRouter = require('./routes/users')
const resultRouter = require('./routes/results')
app.use('/api/patients', usersRouter)
app.use('/api/results', resultRouter)

app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000 and accessible via network'));
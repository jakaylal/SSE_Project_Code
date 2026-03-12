require('dotenv').config()

const express = require("express")
const cors = require("cors")
const app = express()
const mongoose = require('mongoose')

app.use(cors({
    //enter the IP the webpage URL uses
    origin: 'http://127.0.0.1:5500'
})) 
app.use(express.json())

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

//app.listen(3000, () => console.log('Server Started'))
app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000 and accessible via network'));
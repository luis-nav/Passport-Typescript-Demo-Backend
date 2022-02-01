import mongoose, { Document, Error } from 'mongoose'
import express from 'express'
import cors from 'cors'
import passport from 'passport'
import passportLocal from 'passport-local'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import User from './User'

mongoose.connect("mongodb://localhost:27017/passport-ts", (err: Error) => {
    if (err) throw err
    console.log('Connected to Mongo')
})

//Middleware
const app = express()
app.use(express.json())
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(
    session(
        {
            secret: "Secret",
            resave: true,
            saveUninitialized: true,
        }
    )
)
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())


//App Routes
app.post('/register', async (req, res) => {

    const { username, password } = req?.body

    //Check user and password
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        res.send("Improper Values")
        return
    }

    //Check if user exists
    User.findOne({ username }, async (err: Error, doc: Document) => {
        if (err) throw err
        if (doc) res.send("User Already Exists")
        if (!doc) {
            const hashPassword = await bcrypt.hash(password, 10)
            const newUser = new User({
                username: username,
                password: hashPassword
            })
            await newUser.save()
            res.send("Success")
        }
    })
})

app.listen(8000, () => {
    console.log(`Serving on port ${8000}`)
})
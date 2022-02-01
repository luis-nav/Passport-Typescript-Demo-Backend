import mongoose, { Error } from 'mongoose'
import express from 'express'
import cors from 'cors'
import passport from 'passport'
import passportLocal from 'passport-local'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

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
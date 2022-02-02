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
import { UserInterface } from './interfaces/UserInterface'

const LocalStrategy = passportLocal.Strategy

mongoose.connect("mongodb://localhost:27017/passport-ts", (err: Error) => {
    if (err) throw err
    console.log('Connected to Mongo')
})

//Middleware
const app = express()
app.use(express.json())
app.use(cors({ origin: 'http://localhost:3000', credentials: true, preflightContinue: true }))
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


//Passport
passport.use(new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username: username }, (err: Error, user: any) => {
        if (err) throw err;
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result: boolean) => {
            if (err) throw err;
            if (result === true) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    });
})
);

passport.serializeUser((user: any, cb) => {
    cb(null, user._id);
});

passport.deserializeUser((id: string, cb) => {
    User.findOne({ _id: id }, (err: Error, user: any) => {
        const userInformation = {
            username: user.username,
            isAdmin: user.isAdmin,
            id: user._id
        };
        cb(err, userInformation);
    });
});


//App Routes
app.post('/register', async (req, res) => {

    const { username, password } = req?.body

    //Check user and password
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        res.send("Improper Values")
        return
    }

    //Check if user exists
    User.findOne({ username }, async (err: Error, doc: UserInterface) => {
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

app.post("/login", passport.authenticate('local'), (req, res) => {
    res.send("Seccessfully Authenticated")
})

app.get("/user", (req, res) => {
    res.send(req.user)
})

app.get("/logout", (req, res) => {
    req.logOut()
    res.send("Success")
})

app.listen(8000, () => {
    console.log(`Serving on port ${8000}`)
})
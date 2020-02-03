const express = require('express');
const router = express.Router();
const bcrypt =  require('bcryptjs');
const passport = require('passport');
// const mongoose = require('mongoose');

//use model

const User = require('../models/User');


router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
// router.get('/', (req, res) => res.render('dashboard'));

//register handle
router.post('/register' , (req , res) => {
    const{ name, email, password, password2 } = req.body;
    let errors = [];

    // check required field
    if( !name || !email || !password || !password2)
    {
        errors.push({ msg: 'please enter all fields' });
    }

    // check password match

    if(password !== password2)
    {
        errors.push({ msg: ' password do not match'});
    }

    // check password length 
    if(password.length < 6)
    {
        errors.push({ msg: ' password should be at least 6 characters'});
    }
    if (errors.length > 0)
    {
        res.render('register' ,  {
            errors,
            name,
            email,
            password,
            password2
        });

    }
    else
    {
        //validation pased
        // res.send('pass');
        User.findOne({ email : req.body.email })
        .then(user => {
            if(user)
            {
                //User exist
                errors.push({ msg: 'Email already registerd' });
                res.render('register' ,  {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }
            else
            {
                const newUser = new User({ 
                    name,
                    email,
                    password
                });

                // console.log(newUser)
                // res.send('hello');

                // hash password
                bcrypt.genSalt(10 , (err , salt) => 
                bcrypt.hash(newUser.password, salt, (err,hash) => {
                    if(err) throw err;

                    newUser.password = hash;
                    newUser.save()
                    .then(user => {
                        req.flash('success_msg' , 'You are now registered and can log in');
                        res.redirect('/users/login')
                    })
                    .catch(err => console.log(err));
                } ) )
            }
        });
    }
} );

// login handle
router.post('/login', (req , res , next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res , next);
});

// logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;

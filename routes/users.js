const express = require('express');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/users')
const User = require('../models/user');
const catchAsync = require('../utils/CatchAsync');

router.route('/register')
    .get(users.renderRegisterForm)

    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLoginForm)

    .post(passport.authenticate('local', {
        failureFlash: true, failureRedirect: '/login'
    }), catchAsync(users.login));

router.get('/logout', users.logout);


module.exports = router;
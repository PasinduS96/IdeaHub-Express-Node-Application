const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

require('../models/User');
const User = mongoose.model('users');

router.get('/login', (req, res) => {
	res.render('users/login');
});

router.get('/reg', (req, res) => {
	res.render('users/register');
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/ideas',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

router.post('/reg', (req, res) => {
	let errors = [];

	if (req.body.password != req.body.password2) {
		errors.push({ text: 'Passwords are not matching' });
	}
	if (req.body.password.length < 4) {
		errors.push({ text: 'Passwords should contain at least 4 characters' });
	}
	if (errors.length > 0) {
		res.render('users/register', {
			errors: errors,
			name: req.body.name,
			email: req.body.email,
			password: req.body.password1,
			password2: req.body.password2
		});
	} else {
		User.findOne({ email: req.body.email }).then((user) => {
			if (user) {
				req.flash('error_msg', 'Email already used! Please try different email address to register.');
				res.redirect('/users/login');
			} else {
				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				});

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						// if (err) throw err;
						newUser.password = hash;
						newUser
							.save()
							.then((user) => {
								req.flash(
									'success_msg',
									'You are now registered, Please Login using your password and email address!'
								);
								res.redirect('/users/login');
							})
							.catch((err) => {
								console.log(err);
								return;
							});
					});
				});
			}
		});
	}
});

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'Your Logged Out');
	res.redirect('/users/login');
});

module.exports = router;

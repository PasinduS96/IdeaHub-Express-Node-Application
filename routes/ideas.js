const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const { ensureAuthenticated } = require('../helpers/auth');
module.exports = router;

require('../models/Idea');
const Idea = mongoose.model('ideas');

router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('ideas/add');
});

router.get('/', ensureAuthenticated, (req, res) => {
	Idea.find({ user: req.user.id }).sort({ date: 'desc' }).then((ideas) => {
		if (idea.user != req.user.id) {
			req.flash('error_msg', 'You can not modify that idea');
			res.redirect('/ideas');
		}
		res.render('ideas/index', { ideas: ideas });
	});
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Idea.findOne({ _id: req.params.id }).then((idea) => {
		res.render('ideas/edit', { idea: idea });
	});
});

router.put('/:id', ensureAuthenticated, (req, res) => {
	Idea.findOne({
		_id: req.params.id
	}).then((idea) => {
		idea.title = req.body.title;
		idea.details = req.body.details;

		idea.save().then((idea) => {
			req.flash('success_msg', 'Record Successfuly Updated');
			res.redirect('/ideas');
		});
	});
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
	Idea.remove({ _id: req.params.id }).then(() => {
		req.flash('success_msg', 'Record Successfuly Removed');
		res.redirect('/ideas');
	});
});

router.post('/', ensureAuthenticated, (req, res) => {
	let errors = [];

	if (!req.body.title) {
		errors.push({ text: 'Please Add Titile' });
	}
	if (!req.body.details) {
		errors.push({ text: 'Please Provide Details' });
	}
	if (errors.length > 0) {
		res.render('/add', {
			errors: errors,
			title: req.body.title,
			details: req.body.details
		});
	} else {
		const newUser = {
			title: req.body.title,
			details: req.body.details,
			user: req.user.id
		};

		new Idea(newUser).save().then((idea) => {
			req.flash('success_msg', 'Record Successfuly Added');
			res.redirect('/ideas');
		});
	}
});

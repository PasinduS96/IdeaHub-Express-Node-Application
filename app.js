const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

mongoose.Promise = global.Promise;

const ideass = require('./routes/ideas');
const users = require('./routes/users');

require('./config/passport')(passport);

mongoose
	.connect('mongodb://localhost/express-app-01', {
		useNewUrlParser: true
	})
	.then(() => {
		console.log('MongoDB Connected');
	})
	.catch((err) => console.log(err));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));

app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

app.get('/', (req, res) => {
	let title = 'Are You Innovator ?';
	res.render('index', {
		title: title
	});
});

app.get('/about', (req, res) => {
	res.render('about');
});

app.use('/ideas', ideass);
app.use('/users', users);

const port = 5000;

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

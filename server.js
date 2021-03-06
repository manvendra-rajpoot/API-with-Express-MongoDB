const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
const cors = require('cors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');

//loading env vars
dotenv.config({path: './config/config.env'});

//initialize our app
const app = express();

//connect to db
connectDB();

//body-parser
app.use(express.json());

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File uploader
app.use(fileupload());

//sanitize data
app.use(mongoSanitize());

//secure your Express apps by setting various HTTP headers
app.use(helmet());

/* make sure this comes before any routes */
//prevent XXS attacks
app.use(xss());

//rate limiting i.e, API per min
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter); // apply to all requests

//protect against HTTP Parameter Pollution attacks
app.use(hpp());

//enable CORS
app.use(cors());

//cookie parser
app.use(cookieParser());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//mount rounters
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

//middleware for errors
app.use(errorHandler);

//port
const PORT = process.env.PORT || 5001;

//listener
const  server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on ${PORT}...`.yellow);
});

// handle Unhandled Promise Rejections
process.on('unhandledRejection', (err,promise) => {
    console.log(`ERROR: ${err.message}`.red);

    //close the server and exit process
    server.close(() => process.exit(1));
});
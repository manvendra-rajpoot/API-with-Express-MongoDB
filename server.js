const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
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

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//mount rounters
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

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
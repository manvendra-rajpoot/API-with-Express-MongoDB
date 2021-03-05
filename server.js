const express = require('express');
const dotenv = require('dotenv');

const morgan = require('morgan');

//loading env vars
dotenv.config({path: './config/config.env'});

//initialize our app
const app = express();

//route files
const bootcamps = require('./routes/bootcamps');

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//mount rounters
app.use('/api/v1/bootcamps', bootcamps);

//port
const PORT = process.env.PORT || 5001;

//listener
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on ${PORT}...`);
});
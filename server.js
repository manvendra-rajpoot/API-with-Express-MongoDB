const express = require('express');
const dotenv = require('dotenv');

//loading env vars
dotenv.config({path: './config/config.env'});

//initialize our app
const app = express();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on ${PORT}...`);
});
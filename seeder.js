const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const colors = require('colors');

//loading env vars
dotenv.config({path: './config/config.env'});

//load models
const Bootcamp = require('./models/Bootcamp');

//connect to db
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

//read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

//import to db
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);

        console.log('Data imported to DB>>'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

//delete data from db
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();

        console.log('Data deleted from DB>>'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] === '-i'){
    importData();
} else if (process.argv[2] === '-d'){
    deleteData();
}
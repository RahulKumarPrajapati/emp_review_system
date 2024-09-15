const mongoose = require('mongoose');


function connectDB() {
    const url = process.env.MONGO_URI;
    mongoose.connect(url);

    const db = mongoose.connection;

    db.on('error', (err) => {
        console.log(`Connection error: ${err}`)
    });

    db.once('open', () => {
        console.log('Connected to MongoDB')
    });
}

module.exports = connectDB;
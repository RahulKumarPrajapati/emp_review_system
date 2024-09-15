
const express = require('express');
const connectDB = require('./database');
const cors = require('cors');

const app = express()
const ReviewController = require('./src/controllers/review.controller');
const port = process.env.PORT || 4200;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

connectDB();

app.use(express.json());  // Add this line to enable JSON body parsing


app.get('/', (req, res) => {
    res.send('Hello Express!')
})

app.use('/api', ReviewController);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
})
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    employeeId: { type: Number, required: true},
    evaluationPeriod: { type: String, required: true},
    productivity: { type: Number, required: true},
    teamwork: { type: Number, required: true},
    punctuality: { type: Number, required: true},
    communication: { type: Number, required: true},
    problemSolving: { type: Number, required: true},
    feedback: { type: String, default: "" },
    created: { type: Date, default: Date.now }
  });
  
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
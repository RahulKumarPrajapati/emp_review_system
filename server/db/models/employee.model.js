const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employeeId: { type: Number, required: true },
    feedbackGenerated: { type: Boolean, default: false }
  });
  
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
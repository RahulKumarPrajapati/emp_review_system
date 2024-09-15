const { default: mongoose } = require('mongoose');
const Review = require('../../db/models/review.model');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Employee = require('../../db/models/employee.model');
const dotenv = require('dotenv');
dotenv.config();
console.log(process.env.GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.addReview = async (data) => {

    try{
        let reviewData = {
            employeeId: data.employeeId,
            evaluationPeriod: data.evaluationPeriod,
            productivity: data.productivity,
            teamwork: data.teamwork,
            punctuality: data.punctuality,
            communication: data.communication,
            problemSolving: data.problemSolving
        }
        let empData = {
            name: data.name,
            employeeId: data.employeeId,
            feedbackGenerated: false
        }
        await Employee.updateOne({employeeId: parseInt(data.employeeId)}, empData, {upsert: true});
        await Review.create(reviewData);
        return { message: "review_added" };
    }
    catch(err){
        throw err;
    }
}

exports.getAllReviews = async (skip = 0, limit = 10) => {
    try{
        const data = await Employee.aggregate([
            {
              $lookup: {
                from: 'reviews',
                localField: 'employeeId',
                foreignField: 'employeeId',
                as: 'reviews'
              }
            },
            {
              $unwind: {
                path: "$reviews",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $sort: { 'reviews.created': -1 }
            },
            {
              // Group by employeeId to get the latest review for each employee
              $group: {
                _id: "$employeeId",
                latestReview: { $first: "$reviews" },
                name: { $first: "$name" },
                feedbackGenerated: { $first: "$feedbackGenerated" }
              }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
              $project: {
                _id: 0,
                latestReview: 1,
                name:1,
                feedbackGenerated: 1
              }
            }
          ]);
        const reviewData = data.map((empData) => {
            return {
                ...empData.latestReview,
                name: empData.name,
                feedbackGenerated: empData.feedbackGenerated
            }
        });
        const totalReviews = await Employee.countDocuments();
        const result = {
            reviewData: reviewData,
            totalReviews: totalReviews
        }
        return result;
    }
    catch(err){
        throw err;
    }
}

exports.deleteReview = async(id) => {
    try{
        const result = await Review.deleteMany({employeeId: parseInt(id)});
        await Employee.deleteOne({employeeId: parseInt(id)})
        if(result.deletedCount > 0){
            return { message: "review_deleted" };
        }
        else{
            return { message: "review_not_found" };
        }
    }
    catch(err){
        throw err;
    }
}

exports.editReview = async(data) => {
    try{
        const {_id, created, ...newData} = data;
        await Review.create(newData);
        const result = await Employee.updateOne({employeeId: parseInt(data.employeeId)}, {$set: {feedbackGenerated: false}});
        return { message: "review_edited" };
    }
    catch(err){
        throw err;
    }
}

exports.generateFeedback = async(data) => {
    try{
        const metrics = `Productivity: ${data.productivity}/10, Teamwork: ${data.teamwork}/10, Punctuality: ${data.punctuality}/10, Communication: ${data.communication}/10, Problem Solving: ${data.problemSolving}/10.`;

        const prompt = `Give professional and constructive feedback for employee ${data.name} based on given employee metrics: ${metrics}.
        Feedback should be based on performance scores. If score is b/w (7-10) then positive feedback. If score is b/w (4-6) then suggestions for improvement
        and if score is b/w (1-3) then constructive criticism`;

        const result = await model.generateContent(prompt);
        const feedback = result.response.text()
        await Review.updateOne({_id:  new mongoose.Types.ObjectId(data._id)}, {$set: {feedback: feedback}})
        await Employee.updateOne({employeeId: parseInt(data.employeeId)}, {$set: {feedbackGenerated: true}})
        return { message: 'feedback_generated' , feedback: feedback};
    }
    catch(err){
        throw err;
    }
}

exports.generateReport = async(id) => {
    try{
        let employeeData = await Employee.aggregate([
            {
                $match :{ employeeId: parseInt(id) }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'employeeId',
                    foreignField: 'employeeId',
                    as: 'reviews'
                }
            },
            {
              $project: {
                _id: 0,
                name: 1,
                reviews: 1
              }
            }
          ]);

          return employeeData;
    }
    catch(err){
        throw err;
    }
}
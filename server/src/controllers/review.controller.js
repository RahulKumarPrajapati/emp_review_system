const express = require('express');
const reviewService = require('../services/review.service');
const router = express.Router();
BASE_URI = '/review'

router.post(BASE_URI + '/add', async (request, response) => {
    try{
        const result = await reviewService.addReview(request.body);
        response.status(201).json(result);
    }
    catch(err){
        if (err.code === 11000) {
            response.status(400).send({ message: 'employee_id_must_be_unique' });
        }
        else{
            response.status(500).json({ message: 'error_adding_review' });
        }
    }
});

router.get(BASE_URI + '/getAllReviews', async (request, response) => {
    try{
        const result = await reviewService.getAllReviews(skip = +request.query.skip, +request.query.limit);
        response.status(200).json(result);
    }
    catch(err){
        response.status(500).json({ message: 'error_fetching_reviews' });
    }
});

router.delete(BASE_URI + '/delete/:id', async (request, response) => {
    try{
        let result = await reviewService.deleteReview(request.params.id);
        if(result.message == 'review_deleted'){
            response.status(200).send(result);
        }
        else{
            response.status(404).send(result);
        }
    }
    catch(err){
        response.status(500).json({ message: 'error_deleting_review', error: err });
    }
  });

router.post(BASE_URI + '/edit', async (request, response) => {
    try{
        const result = await reviewService.editReview(request.body);
        response.status(201).json(result);
    }
    catch(err){
        if (err.code === 11000) {
            response.status(400).send({ message: 'employee_id_must_be_unique' });
        }
        else{
            response.status(500).json({ message: 'error_editing_review' });
        }
    }
});

router.post(BASE_URI + '/generate-feedback', async (request, response) => {
  try{  
        const result = await reviewService.generateFeedback(request.body);
        response.status(200).json(result);
    }
    catch(err){
        response.status(500).json({ message: 'error_generating_feedback' });
    }
});

router.get(BASE_URI + '/report-download/:id', async (request, response) => {
    try{  
        const result = await reviewService.generateReport(request.params.id);
        response.status(200).json(result);
    }
    catch(err){
        response.status(500).json({ message: 'error_downloading_report' });
    }
  });

router.get(BASE_URI + '/generate-preview/:id', async (request, response) => {
    try{  
        const result = await reviewService.generateReport(request.params.id);
        response.status(200).json(result);
    }
    catch(err){
        response.status(500).json({ message: 'error_generating_preview' });
    }
});

module.exports = router;
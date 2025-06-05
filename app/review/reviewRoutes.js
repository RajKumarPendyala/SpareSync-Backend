const express = require('express');
const router = express.Router();

const reviewController = require('./reviewController');
const isBuyer = require('../../middleware/isBuyer');
const authMiddleware = require('../../middleware/authMiddleware');
const upload = require('../../middleware/upload');


// router.post('/', authMiddleware, isBuyer, upload.array('images', 5), reviewController.createReview);
router.post('/', authMiddleware, isBuyer, reviewController.createReview);


module.exports = router;
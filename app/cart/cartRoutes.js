const express = require('express');
const router = express.Router();

const cartController = require('./cartController');
const isBuyer = require('../../middleware/isBuyer');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/', authMiddleware, isBuyer, cartController.addItem);
router.get('/', authMiddleware, isBuyer, cartController.getItems);
router.patch('/', authMiddleware, isBuyer, cartController.updateItem);
router.patch('/buyer', authMiddleware, isBuyer, cartController.removeItems);


module.exports = router;
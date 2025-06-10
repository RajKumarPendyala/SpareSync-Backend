const express = require('express');
const router = express.Router();

const orderController = require('./orderController');
const isAdmin = require('../../middleware/isAdmin');
const isBuyer = require('../../middleware/isBuyer');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/',  authMiddleware, isBuyer, orderController.placeOrder);
router.get('/', authMiddleware, isBuyer, orderController.getOrders);
router.patch('/', authMiddleware, isBuyer, orderController.updateOrder);

router.get('/admin', authMiddleware, isAdmin, orderController.viewPlatformOrders);
router.patch('/admin', authMiddleware, isAdmin, orderController.updateOrderStatus);


module.exports = router;
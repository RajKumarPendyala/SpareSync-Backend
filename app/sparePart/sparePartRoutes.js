const express = require('express');
const router = express.Router();

const sparePartController = require('./sparePartController');
const isSeller = require('../../middleware/isSeller');
const isAdmin = require('../../middleware/isAdmin');
const authMiddleware = require('../../middleware/authMiddleware');


router.get('/', sparePartController.getSparePartsWithFilter);

router.get('/seller', authMiddleware, isSeller, sparePartController.getSparePartsWithFilter);
router.post('/seller', authMiddleware, isSeller, sparePartController.addSparePart);
router.patch('/seller', authMiddleware, isSeller, sparePartController.editSparePartById);

router.patch('/admin', authMiddleware, isAdmin, sparePartController.editSparePartById);


module.exports = router;

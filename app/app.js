const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const errorHandler = require('../middleware/errorHandler');
const cors = require('cors'); 


const app = express();
 
app.use(cors()); 

dotenv.config();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('../uploads', express.static('uploads')); 

app.get('/', (req, res) => {
  res.send('SpareSync API is running...');
});

app.use('/api/users', require('./user/userRoutes'));
app.use('/api/users/products', require('./sparePart/sparePartRoutes'));
app.use('/api/users/orders', require('./order/orderRoutes'));
app.use('/api/users/reviews', require('./review/reviewRoutes'));
app.use('/api/users/financial-reports', require('./financialReport/financialReportRoutes'));
app.use('/api/users/cart/items', require('./cart/cartRoutes'));
app.use('/api/users/conversations', require('./conversation/conversationRoutes'));

app.use(errorHandler);

module.exports = app;
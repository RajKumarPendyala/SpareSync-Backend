const { placeOrderFromCart, getOrdersByUser, cancelOrder, getPlatformOrders, updateOrderStatus } = require('./orderService');
const { broadcastSpareParts } = require('../../utils/broadcastSpareParts');
const mongoose = require('mongoose');


exports.placeOrder = async(req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userId = req.user?._id;
    // const { paymentMethod, transactionId } = req.body;

    const paymentMethod = 'DigitalWallet';
    const transactionId = userId;

    const order = await placeOrderFromCart(session, userId, paymentMethod, transactionId);

    await session.commitTransaction();
    session.endSession();

    if(order){
      await broadcastSpareParts(req.app.get('io'));
      return res.status(201).json({
          message: 'Order placed successfully'
      });
    }
    res.status(400).json({
        message: 'Failed to place order'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  } finally {
    session.endSession();
  }
}


exports.getOrders = async(req, res, next) => {
  try {
    const userId = req.user?._id;
    const shipmentStatus = req.query.status;

    const orders = await getOrdersByUser(userId, shipmentStatus);

    if(orders){
        return res.status(200).json({
            message: 'Orders fetched successfully',
            orders
        });
    }
    res.status(400).json({
        message: 'Failed to fetch placed orders'
    });
  } catch (error) {
    next(error);
  }
}


exports.updateOrder = async(req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userId = req.user?._id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ status: 'error', message: 'orderId is required' });
    }

    const orders = await cancelOrder(session, userId, orderId, req);

    await session.commitTransaction();
    session.endSession();

    if(orders){
      await broadcastSpareParts(req.app.get('io'));
        return res.status(200).json({
            message: 'Order cancelled successfully',
            data: orders
        });
    }
    res.status(400).json({
        message: 'Failed to cancel order'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  } finally {
    session.endSession();
  }
}


exports.viewPlatformOrders = async(req, res, next) => {
  try {
    const shipmentStatus = req.query.status;

    const orders = await getPlatformOrders(shipmentStatus);

    if(orders){
        return res.status(200).json({
            message: 'Orders fetched successfully',
            orders
        });
    }
    res.status(400).json({
        message: 'Failed to fetch orders'
    });
  } catch (error) {
    next(error);
  }
}


exports.updateOrderStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { orderId, shipmentStatus } = req.body;

    if (!orderId || !shipmentStatus) {
      return res.status(400).json({ message: "orderId and shipmentStatus are required" });
    }

    const result = await updateOrderStatus(session, orderId, shipmentStatus);

    await session.commitTransaction();
    session.endSession();

    if(result){
        return res.status(200).json({
            message: `Order status updated to ${shipmentStatus}`
        });
    }
    res.status(400).json({
        message: 'Failed to update order shipment status'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  } finally {
    session.endSession();
  }
};
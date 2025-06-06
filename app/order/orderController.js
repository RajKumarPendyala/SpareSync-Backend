const { placeOrderFromCart, getOrdersByUser, cancelOrder, getPlatformOrders, updateOrderStatus } = require('./orderService');

exports.placeOrder = async(req, res, next) => {
  try {
    const userId = req.user?._id;
    // const { paymentMethod, transactionId } = req.body;

    const paymentMethod = 'DigitalWallet';
    const transactionId = userId;

    const order = await placeOrderFromCart(userId, paymentMethod, transactionId);

    if(order){
        return res.status(201).json({
            message: 'Order placed successfully'
        });
    }
    res.status(400).json({
        message: 'Failed to place order'
    });
  } catch (error) {
    next(error);
  }
}


exports.getOrders = async(req, res, next) => {
  try {
    const userId = req.user?._id;

    const orders = await getOrdersByUser(userId);

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
  try {
    const userId = req.user?._id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ status: 'error', message: 'orderId is required' });
    }

    const orders = await cancelOrder(userId, orderId);

    if(orders){
        return res.status(200).json({
            message: 'Order cancelled successfully',
            data: orders
        });
    }
    res.status(400).json({
        message: 'Failed to cancel order'
    });
  } catch (error) {
    next(error);
  }
}


exports.viewPlatformOrders = async(req, res, next) => {
  try {
    const { shipmentStatus } = req.body;

    const orders = await getPlatformOrders(shipmentStatus);

    if(orders){
        return res.status(200).json({
            message: 'Orders fetched successfully',
            data: orders
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
  try {
    const { orderId, shipmentStatus } = req.body;

    if (!orderId || !shipmentStatus) {
      return res.status(400).json({ message: "orderId and shipmentStatus are required" });
    }

    const result = await updateOrderStatus(orderId, shipmentStatus);

    if(result){
        return res.status(200).json({
            message: `Order status updated to ${shipmentStatus}`
        });
    }
    res.status(400).json({
        message: 'Failed to update order shipment status'
    });
  } catch (error) {
    next(error);
  }
};
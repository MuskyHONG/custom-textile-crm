const Customer = require('../models/customer');
const Project = require('../models/project');
const Order = require('../models/order');
const logger = require('../utils/logger');

exports.getStatistics = async (req, res) => {
  try {
    const customerCount = await Customer.countDocuments();
    const projectCount = await Project.countDocuments();
    const orderCount = await Order.countDocuments();
    
    const orders = await Order.find();
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const orderedOrders = await Order.countDocuments({ status: 'ordered' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    res.json({
      customerCount,
      projectCount,
      orderCount,
      totalSales,
      orderStatus: {
        pending: pendingOrders,
        ordered: orderedOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders
      }
    });
  } catch (error) {
    logger.error(`Error getting statistics: ${error.message}`);
    res.status(500).json({ message: 'Error getting statistics' });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    const sales = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthOrders = await Order.find({
        createdAt: {
          $gte: monthStart,
          $lt: monthEnd
        }
      });
      
      const monthSales = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      months.push(`${monthStart.getMonth() + 1}月`);
      sales.push(Math.round(monthSales));
    }
    
    res.json({ months, sales });
  } catch (error) {
    logger.error(`Error getting sales trend: ${error.message}`);
    res.status(500).json({ message: 'Error getting sales trend' });
  }
};

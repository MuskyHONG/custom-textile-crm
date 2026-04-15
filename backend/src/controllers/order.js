const Order = require('../models/order');
const Project = require('../models/project');
const Customer = require('../models/customer');
const logger = require('../utils/logger');

/**
 * 获取订单列表
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId').populate('projectId');
    res.json({ orders });
  } catch (error) {
    logger.error(`Error getting orders: ${error.message}`);
    res.status(500).json({ message: 'Error getting orders' });
  }
};

/**
 * 获取订单详情
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId').populate('projectId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    logger.error(`Error getting order: ${error.message}`);
    res.status(500).json({ message: 'Error getting order' });
  }
};

/**
 * 创建订单
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.createOrder = async (req, res) => {
  try {
    const { projectId, customerId, totalAmount, receiverName, receiverPhone, receiverAddress } = req.body;
    
    // 验证项目是否存在
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // 生成订单编号
    const orderNumber = `ORD${Date.now()}`;
    
    // 创建订单，订单状态与项目状态保持一致
    const order = new Order({
      projectId,
      customerId,
      orderNumber,
      totalAmount: totalAmount || project.finalPrice,
      status: 'ordered',
      receiverName,
      receiverPhone,
      receiverAddress
    });
    
    await order.save();
    
    // 更新项目状态为已下单
    project.status = 'ordered';
    await project.save();
    
    // 将订单ID添加到客户的orders数组中
    await Customer.findByIdAndUpdate(customerId, {
      $push: { orders: order._id }
    });
    
    logger.info(`Order created: ${order.orderNumber}`);
    
    // 重新查询订单，包含关联信息
    const createdOrder = await Order.findById(order._id).populate('customerId').populate('projectId');
    res.json({ order: createdOrder });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    res.status(500).json({ message: 'Error creating order' });
  }
};

/**
 * 更新订单状态
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    logger.info(`Order status updated: ${order.orderNumber}, new status: ${status}`);
    
    // 重新查询订单，包含关联信息
    const updatedOrder = await Order.findById(order._id).populate('customerId').populate('projectId');
    res.json({ order: updatedOrder });
  } catch (error) {
    logger.error(`Error updating order status: ${error.message}`);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

/**
 * 取消订单
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // 更新订单状态为已取消
    order.status = 'cancelled';
    await order.save();
    
    // 更新关联项目的状态为已取消
    const project = await Project.findById(order.projectId);
    if (project) {
      project.status = 'cancelled';
      await project.save();
    }
    
    logger.info(`Order cancelled: ${order.orderNumber}, reason: ${reason}`);
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    logger.error(`Error cancelling order: ${error.message}`);
    res.status(500).json({ message: 'Error cancelling order' });
  }
};
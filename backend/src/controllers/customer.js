const Customer = require('../models/customer');
const Project = require('../models/project');
const Order = require('../models/order');
const logger = require('../utils/logger');

/**
 * 获取客户列表
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    
    const customersWithTotalAmount = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ customerId: customer._id });
        const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        return {
          ...customer.toObject(),
          totalAmount
        };
      })
    );
    
    res.json({ customers: customersWithTotalAmount });
  } catch (error) {
    logger.error(`Error getting customers: ${error.message}`);
    res.status(500).json({ message: 'Error getting customers' });
  }
};

/**
 * 获取客户详情
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ customer });
  } catch (error) {
    logger.error(`Error getting customer: ${error.message}`);
    res.status(500).json({ message: 'Error getting customer' });
  }
};

/**
 * 创建客户
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.createCustomer = async (req, res) => {
  try {
    const { name, customerId, phone, remark } = req.body;
    
    if (customerId) {
      const existingCustomer = await Customer.findOne({ customerId });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer ID already exists' });
      }
    }
    
    const customer = new Customer({
      name,
      customerId,
      phone,
      remark
    });
    
    await customer.save();
    logger.info(`Customer created: ${customer.name}`);
    res.json({ customer });
  } catch (error) {
    logger.error(`Error creating customer: ${error.message}`);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

/**
 * 更新客户
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { name, customerId, phone, remark } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    if (customerId && customerId !== customer.customerId) {
      const existingCustomer = await Customer.findOne({ customerId });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer ID already exists' });
      }
    }
    
    customer.name = name || customer.name;
    customer.customerId = customerId || customer.customerId;
    customer.phone = phone || customer.phone;
    customer.remark = remark || customer.remark;
    
    await customer.save();
    logger.info(`Customer updated: ${customer.name}`);
    res.json({ customer });
  } catch (error) {
    logger.error(`Error updating customer: ${error.message}`);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

/**
 * 删除客户
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    await customer.remove();
    logger.info(`Customer deleted: ${customer.name}`);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting customer: ${error.message}`);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};

/**
 * 生成唯一客户编号
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.generateCustomerId = async (req, res) => {
  try {
    // 获取当前日期（格式：YYYYMMDD）
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 查询当天创建的客户数量
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const count = await Customer.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // 生成客户编号（格式：YYYYMMDD + 三位序号）
    const sequence = String(count + 1).padStart(3, '0');
    const customerId = `${dateStr}${sequence}`;
    
    res.json({ customerId });
  } catch (error) {
    logger.error(`Error generating customer ID: ${error.message}`);
    res.status(500).json({ message: 'Error generating customer ID' });
  }
};

/**
 * 获取客户历史记录
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getCustomerHistory = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // 直接通过customerId查询项目（咨询记录）和订单（成交记录）
    // 使用mongoose.Types.ObjectId确保类型匹配
    const mongoose = require('mongoose');
    const customerObjectId = new mongoose.Types.ObjectId(req.params.id);
    const projects = await Project.find({ customerId: customerObjectId }).sort({ createdAt: -1 });
    const orders = await Order.find({ customerId: customerObjectId }).populate('projectId').sort({ createdAt: -1 });
    
    res.json({ 
      projects, 
      orders 
    });
  } catch (error) {
    logger.error(`Error getting customer history: ${error.message}`);
    res.status(500).json({ message: 'Error getting customer history' });
  }
};
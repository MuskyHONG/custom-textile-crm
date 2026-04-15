const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

// 模拟用户数据，实际项目中应该使用数据库存储用户信息
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // 实际项目中应该使用bcrypt加密
    email: 'admin@example.com'
  }
];

/**
 * 用户注册
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // 创建新用户
    const newUser = {
      id: users.length + 1,
      username,
      password, // 实际项目中应该使用bcrypt加密
      email
    };
    
    users.push(newUser);
    
    // 生成JWT令牌
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
    
    logger.info(`User registered: ${username}`);
    res.json({ token, user: newUser });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ message: 'Error registering user' });
  }
};

/**
 * 用户登录
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
    
    logger.info(`User logged in: ${username}`);
    res.json({ token, user });
  } catch (error) {
    logger.error(`Error logging in: ${error.message}`);
    res.status(500).json({ message: 'Error logging in' });
  }
};

/**
 * 获取当前用户信息
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getMe = async (req, res) => {
  try {
    const user = users.find(user => user.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    logger.error(`Error getting user info: ${error.message}`);
    res.status(500).json({ message: 'Error getting user info' });
  }
};
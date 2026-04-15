const logger = require('../utils/logger');

/**
 * 错误处理中间件
 * @param {object} err - 错误对象
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @param {function} next - 下一个中间件
 * @returns {void}
 */
function errorMiddleware(err, req, res, next) {
  logger.error(err.message);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    status: err.status || 500
  });
}

module.exports = errorMiddleware;
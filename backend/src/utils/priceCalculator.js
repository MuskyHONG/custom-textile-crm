const config = require('../config');

// 材质单价配置
const materialPrices = {
  'cotton': 100,   // 元/平方米
  'linen': 150,    // 元/平方米
  'silk': 300,     // 元/平方米
  'wool': 200      // 元/平方米
};

// 工艺系数配置
const processFactors = {
  'embroidery': 0.3,    // 绣花工艺附加30%
  'printing': 0.15,      // 印花工艺附加15%
  'jacquard': 0.4,       // 提花工艺附加40%
  'plain': 0             // 平纹工艺无附加
};

// 客户等级折扣率配置
const discountRates = {
  'vip': 0.2,      // VIP客户20%折扣
  'regular': 0.1,  // 常规客户10%折扣
  'new': 0         // 新客户无折扣
};

/**
 * 计算基础价格
 * @param {string} material - 材质类型
 * @param {number} width - 宽度（厘米）
 * @param {number} height - 高度（厘米）
 * @returns {number} 基础价格
 */
function calculateBasePrice(material, width, height) {
  const pricePerSquareMeter = materialPrices[material] || 100;
  const area = width * height / 10000; // 转换为平方米
  return pricePerSquareMeter * area;
}

/**
 * 计算工艺费用
 * @param {number} basePrice - 基础价格
 * @param {string} process - 工艺类型
 * @returns {number} 工艺费用
 */
function calculateProcessCost(basePrice, process) {
  const factor = processFactors[process] || 0;
  return basePrice * factor;
}

/**
 * 计算折扣
 * @param {number} basePrice - 基础价格
 * @param {number} processCost - 工艺费用
 * @param {string} customerLevel - 客户等级
 * @returns {number} 折扣金额
 */
function calculateDiscount(basePrice, processCost, customerLevel) {
  const rate = discountRates[customerLevel] || 0;
  const subtotal = basePrice + processCost;
  return subtotal * rate;
}

/**
 * 计算税费
 * @param {number} basePrice - 基础价格
 * @param {number} processCost - 工艺费用
 * @param {number} discount - 折扣金额
 * @param {number} taxRate - 税率
 * @returns {number} 税费金额
 */
function calculateTax(basePrice, processCost, discount, taxRate = config.taxRate) {
  const taxableAmount = basePrice + processCost - discount;
  return taxableAmount * taxRate;
}

/**
 * 计算最终报价
 * @param {number} basePrice - 基础价格
 * @param {number} processCost - 工艺费用
 * @param {number} discount - 折扣金额
 * @param {number} tax - 税费金额
 * @returns {number} 最终报价
 */
function calculateFinalPrice(basePrice, processCost, discount, tax) {
  return basePrice + processCost - discount + tax;
}

/**
 * 完整的价格计算
 * @param {object} parameters - 项目参数
 * @param {string} customerLevel - 客户等级
 * @returns {object} 价格明细
 */
function calculatePrice(parameters, customerLevel = 'new') {
  const { material, width, height, process } = parameters;
  
  const basePrice = calculateBasePrice(material, width, height);
  const processCost = calculateProcessCost(basePrice, process);
  const discount = calculateDiscount(basePrice, processCost, customerLevel);
  const tax = calculateTax(basePrice, processCost, discount);
  const finalPrice = calculateFinalPrice(basePrice, processCost, discount, tax);
  
  return {
    basePrice: Math.round(basePrice * 100) / 100,
    processCost: Math.round(processCost * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100
  };
}

module.exports = {
  calculateBasePrice,
  calculateProcessCost,
  calculateDiscount,
  calculateTax,
  calculateFinalPrice,
  calculatePrice
};
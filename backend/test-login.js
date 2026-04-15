const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

// 模拟用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com'
  }
];

// 配置中间件
app.use(express.json());

// 登录测试路由
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', username, password);
    
    // 查找用户
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign({ id: user.id, username: user.username }, 'your-secret-key', {
      expiresIn: '7d'
    });
    
    console.log('Login successful:', username);
    res.json({ token, user });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// 启动服务器
app.listen(3002, () => {
  console.log('Test server running on port 3002');
  console.log('Test login with:');
  console.log('POST http://localhost:3002/api/auth/login');
  console.log('Body: {"username": "admin", "password": "admin123"}');
});
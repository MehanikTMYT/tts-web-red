const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Настройка БД
const pool = mysql.createPool({
  host: 'localhost',
  user: 'cp_red_user',
  password: 'secure_password_2025',
  database: 'game_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@RedWeb',
    pass: process.env.EMAIL_PASS || 'testVDS123!'
  }
});

app.use(cors());
app.use(bodyParser.json());

// Регистрация
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email или имя заняты' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Авторизация
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const validPassword = await bcrypt.compare(password, rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    res.json({
      user: {
        id: rows[0].id,
        username: rows[0].username,
        email: rows[0].email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отправка кода для регистрации
app.post('/api/register/send-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохранение кода в БД
    await pool.query(
      'REPLACE INTO verification_codes (email, code) VALUES (?, ?)', 
      [email, code]
    );
    
    // Отправка email
    await transporter.sendMail({
      from: '"Cyberpunk Red" <noreply@example.com>',
      to: email,
      subject: 'Код подтверждения регистрации',
      text: `Ваш код: ${code} (действует 5 минут)`
    });
    
    res.json({ message: 'Код отправлен на почту' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка отправки кода' });
  }
});

// Проверка кода для регистрации
app.post('/api/register/verify-code', async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ error: 'Email и код обязательны' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM verification_codes WHERE email = ?', 
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Код не найден' });
    }
    
    const storedCode = rows[0];
    
    if (new Date(storedCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Код истек' });
    }
    
    if (storedCode.attempts >= 5) {
      return res.status(403).json({ error: 'Слишком много попыток' });
    }
    
    if (storedCode.code !== code) {
      await pool.query(
        'UPDATE verification_codes SET attempts = attempts + 1 WHERE email = ?', 
        [email]
      );
      return res.status(400).json({ error: 'Неверный код' });
    }
    
    await pool.query(
      'UPDATE verification_codes SET is_used = TRUE WHERE email = ?', 
      [email]
    );
    
    res.json({ message: 'Код подтвержден' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка проверки кода' });
  }
});

// Отправка кода для сброса пароля
app.post('/api/password/reset/send-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }

  try {
    // Поиск пользователя
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Генерация кода
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохранение кода
    await pool.query(
      'UPDATE users SET reset_code = ?, reset_expires = NOW() + INTERVAL 5 MINUTE WHERE email = ?', 
      [code, email]
    );
    
    // Отправка email
    await transporter.sendMail({
      from: '"Cyberpunk Red" <noreply@example.com>',
      to: email,
      subject: 'Сброс пароля',
      text: `Ваш код сброса пароля: ${code} (действует 5 минут)`
    });
    
    res.json({ message: 'Код отправлен на почту' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка отправки кода' });
  }
});

// Проверка кода сброса пароля
app.post('/api/password/reset/verify-code', async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ error: 'Email и код обязательны' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const user = rows[0];
    
    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ error: 'Неверный код' });
    }
    
    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Код истек' });
    }
    
    res.json({ message: 'Код подтвержден' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка проверки кода' });
  }
});

// Обновление пароля
app.post('/api/password/reset/update', async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const user = rows[0];
    
    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ error: 'Неверный код' });
    }
    
    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Код истек' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_code = NULL WHERE email = ?', 
      [hashedPassword, email]
    );
    
    res.json({ message: 'Пароль обновлен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления пароля' });
  }
});

// Вспомогательная функция валидации email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
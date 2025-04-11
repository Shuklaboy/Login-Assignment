const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const crypto = require('crypto');
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Rate limiter for login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts from this IP, please try again after 15 minutes"
});
app.use('/login', limiter);

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
db.connect(err => {
  if (err) console.error("❌ DB Error:", err);
  else console.log("✅ Connected to MariaDB");
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register route
app.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Phone number must be 10 digits" });
  }
  
  if (!/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Za-z]).{8,}$/.test(password)) {
    return res.status(400).json({ message: "Password must be 8+ characters, include a number and special character" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0) return res.status(400).json({ message: "Email already exists" });

    db.query("INSERT INTO users (name, email, password, phone, is_verified, verification_token) VALUES (?, ?, ?, ?, 0, ?)",
      [name, email, hashedPassword, phone, verificationToken],
      (err) => {
        if (err) return res.status(500).json({ message: "Error creating user" });

        const verificationLink = `${process.env.BASE_URL}/verify/${verificationToken}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify your email",
          html: `<p>Hello ${name},</p><p>Click the link to verify your account:</p><a href="${verificationLink}">${verificationLink}</a>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) console.error("Mail error:", err);
        });

        res.status(201).json({ message: "Registered successfully. Please verify your email." });
      }
    );
  });
});

// Email verification route
app.get('/verify/:token', (req, res) => {
  const { token } = req.params;

  db.query("UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?", [token], (err, result) => {
    if (err || result.affectedRows === 0) {
      return res.status(400).send("Invalid or expired verification link.");
    }
    res.send("Email verified! You can now login.");
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = result[0];

    if (user.is_verified === 0) return res.status(401).json({ message: "Please verify your email first" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, message: "Login successful" });
  });
});

// Forgot password route
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err || result.length === 0) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);

    db.query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?", [token, expiry, email]);

    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Link",
      html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).json({ message: "Email could not be sent" });
      res.json({ message: "Reset link sent to email" });
    });
  });
});

// Reset password route
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.query("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()", [token], (err, result) => {
    if (err || result.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

    db.query("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?", [hashedPassword, result[0].id], (err2) => {
      if (err2) return res.status(500).json({ message: "Error resetting password" });
      res.json({ message: "Password updated successfully" });
    });
  });
});

// Start Server
const PORT = 5000;
// Serve React static files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle React routing, return index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

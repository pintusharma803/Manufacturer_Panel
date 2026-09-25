const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userResult = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customer_id: user.customer_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Optional: get customer details if customer
    let customerData = null;
    if (user.customer_id) {
      const custRes = await query('SELECT * FROM customers WHERE id = $1', [user.customer_id]);
      if (custRes.rows.length > 0) customerData = custRes.rows[0];
    }

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        customerId: user.customer_id,
        customer: customerData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const userResult = await query('SELECT id, email, name, role, customer_id, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const user = userResult.rows[0];

    let customerData = null;
    if (user.customer_id) {
      const custRes = await query('SELECT * FROM customers WHERE id = $1', [user.customer_id]);
      if (custRes.rows.length > 0) customerData = custRes.rows[0];
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        customerId: user.customer_id,
        customer: customerData
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching user.' });
  }
}

// GET /api/auth/verify-invite/:token
async function verifyInviteToken(req, res) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const result = await query('SELECT id, name, email, status, invite_expires_at FROM customers WHERE invite_token = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation link.' });
    }

    const customer = result.rows[0];
    if (customer.invite_expires_at && new Date(customer.invite_expires_at) < new Date()) {
      return res.status(410).json({ success: false, message: 'Invitation link has expired. Please ask the administrator to resend the link.' });
    }

    return res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status
      }
    });
  } catch (error) {
    console.error('verifyInviteToken error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error verifying token.' });
  }
}

// POST /api/auth/set-password
async function setPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const custResult = await query('SELECT * FROM customers WHERE invite_token = $1', [token]);
    if (custResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid invitation token.' });
    }

    const customer = custResult.rows[0];

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update customer status to ACTIVE and invalidate token
    await query(
      'UPDATE customers SET status = $1, invite_token = NULL, invite_expires_at = NULL WHERE id = $2',
      ['ACTIVE', customer.id]
    );

    // Check if user already exists
    const userCheck = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [customer.email]);
    let userId;

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      await query(
        'UPDATE users SET password_hash = $1, customer_id = $2, role = $3, name = $4 WHERE id = $5',
        [passwordHash, customer.id, 'CUSTOMER', customer.name, userId]
      );
    } else {
      userId = uuidv4();
      await query(
        'INSERT INTO users (id, email, password_hash, name, role, customer_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, customer.email, passwordHash, customer.name, 'CUSTOMER', customer.id]
      );
    }

    // Add audit log
    await query(
      'INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [uuidv4(), customer.email, 'CUSTOMER_PASSWORD_SET', 'CUSTOMER', customer.id, `Password established and customer activated`]
    );

    return res.json({
      success: true,
      message: 'Password successfully set! You can now log in with your email and password.',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: 'ACTIVE'
      }
    });
  } catch (error) {
    console.error('setPassword error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error setting password.' });
  }
}

module.exports = {
  login,
  getMe,
  verifyInviteToken,
  setPassword
};

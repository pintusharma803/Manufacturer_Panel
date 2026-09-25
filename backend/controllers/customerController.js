const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { query } = require('../config/db');
const { sendSetPasswordEmail } = require('../services/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// GET /api/customers
async function getAllCustomers(req, res) {
  try {
    const { search = '', status = 'ALL', page, limit } = req.query;

    let whereSql = '';
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status);
      whereSql += ` AND c.status = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      whereSql += ` AND (c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.company ILIKE $${params.length})`;
    }

    let total = null;
    if (page !== undefined) {
      const countSql = `SELECT COUNT(*) as total FROM customers c WHERE 1=1 ${whereSql}`;
      const countRes = await query(countSql, params);
      total = parseInt(countRes.rows[0]?.total || 0, 10);
    }

    let sql = `
      SELECT c.*,
        (SELECT COUNT(*) FROM devices d WHERE d.customer_id = c.id) as assigned_device_count
      FROM customers c
      WHERE 1=1 ${whereSql}
      ORDER BY c.created_at DESC
    `;

    let pageNum = 1;
    let limitNum = 10;
    if (page !== undefined) {
      pageNum = Math.max(1, parseInt(page, 10) || 1);
      limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const offset = (pageNum - 1) * limitNum;
      params.push(limitNum);
      sql += ` LIMIT $${params.length}`;
      params.push(offset);
      sql += ` OFFSET $${params.length}`;
    }

    const result = await query(sql, params);

    // Format customers and construct invite links if pending
    const customers = result.rows.map(c => {
      let inviteLink = null;
      if (c.invite_token) {
        inviteLink = `${FRONTEND_URL}/set-password?token=${c.invite_token}`;
      }
      return {
        ...c,
        assigned_device_count: parseInt(c.assigned_device_count || 0),
        invite_link: inviteLink
      };
    });

    return res.json({ 
      success: true, 
      customers,
      pagination: page !== undefined ? {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      } : undefined
    });
  } catch (error) {
    console.error('getAllCustomers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
}

// GET /api/customers/:id
async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const custRes = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (custRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = custRes.rows[0];
    const devRes = await query('SELECT * FROM devices WHERE customer_id = $1 ORDER BY created_at DESC', [id]);
    
    let inviteLink = null;
    if (customer.invite_token) {
      inviteLink = `${FRONTEND_URL}/set-password?token=${customer.invite_token}`;
    }

    return res.json({
      success: true,
      customer: {
        ...customer,
        invite_link: inviteLink,
        assignedDevices: devRes.rows
      }
    });
  } catch (error) {
    console.error('getCustomerById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer details.' });
  }
}

// POST /api/customers
async function createCustomer(req, res) {
  try {
    const { name, email, phone = '', company = '', status = 'PENDING_INVITE' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Customer Name and Email are required.' });
    }

    // Check duplicate email
    const existing = await query('SELECT id FROM customers WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A customer with this email already exists.' });
    }

    const id = uuidv4();
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days valid

    await query(
      `INSERT INTO customers (id, name, email, phone, company, status, invite_token, invite_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, name.trim(), email.trim().toLowerCase(), phone.trim(), company.trim(), status, inviteToken, expiresAt]
    );

    const inviteLink = `${FRONTEND_URL}/set-password?token=${inviteToken}`;

    // Send set-password invitation email to customer
    const emailResult = await sendSetPasswordEmail({
      to: email.trim().toLowerCase(),
      name: name.trim(),
      inviteLink
    });

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv4(),
        req.user ? req.user.email : 'system',
        'CUSTOMER_CREATED',
        'CUSTOMER',
        id,
        `Created customer ${name} (${email}) with invitation link. Email sent: ${emailResult.success ? 'YES' : 'NO'}`
      ]
    );

    return res.status(201).json({
      success: true,
      message: emailResult.success
        ? 'Customer created and password setup invitation sent to email.'
        : 'Customer created, but email could not be sent. You can share the invitation link manually.',
      emailDelivery: {
        sent: emailResult.success,
        previewUrl: emailResult.previewUrl || null,
        error: emailResult.error || null
      },
      customer: {
        id,
        name,
        email: email.toLowerCase(),
        phone,
        company,
        status,
        invite_token: inviteToken,
        invite_link: inviteLink,
        assigned_device_count: 0
      }
    });
  } catch (error) {
    console.error('createCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create customer.' });
  }
}

// POST /api/customers/:id/resend-invite
async function resendInvite(req, res) {
  try {
    const { id } = req.params;
    const custRes = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (custRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = custRes.rows[0];
    const newToken = crypto.randomBytes(24).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await query(
      `UPDATE customers SET invite_token = $1, invite_expires_at = $2, status = 'PENDING_INVITE' WHERE id = $3`,
      [newToken, newExpiresAt, id]
    );

    const inviteLink = `${FRONTEND_URL}/set-password?token=${newToken}`;

    // Send regenerated set-password invitation email to customer
    const emailResult = await sendSetPasswordEmail({
      to: customer.email,
      name: customer.name,
      inviteLink
    });

    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv4(),
        req.user ? req.user.email : 'system',
        'INVITE_RESENT',
        'CUSTOMER',
        id,
        `Regenerated invite link for customer ${customer.email}. Email sent: ${emailResult.success ? 'YES' : 'NO'}`
      ]
    );

    return res.json({
      success: true,
      message: emailResult.success
        ? `Password setup invitation email resent to ${customer.email}.`
        : 'New password-set invitation link generated, but email could not be sent.',
      emailDelivery: {
        sent: emailResult.success,
        previewUrl: emailResult.previewUrl || null,
        error: emailResult.error || null
      },
      invite_token: newToken,
      invite_link: inviteLink
    });
  } catch (error) {
    console.error('resendInvite error:', error);
    return res.status(500).json({ success: false, message: 'Failed to regenerate invite link.' });
  }
}

// PUT /api/customers/:id
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, company, status } = req.body;

    const check = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await query(
      `UPDATE customers SET name = COALESCE($1, name), phone = COALESCE($2, phone), company = COALESCE($3, company), status = COALESCE($4, status) WHERE id = $5`,
      [name, phone, company, status, id]
    );

    // If customer updated name, also update associated user name
    if (name) {
      await query('UPDATE users SET name = $1 WHERE customer_id = $2', [name, id]);
    }

    return res.json({ success: true, message: 'Customer updated successfully.' });
  } catch (error) {
    console.error('updateCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update customer.' });
  }
}

// DELETE /api/customers/:id
async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;

    // Unassign all devices assigned to this customer
    await query(`UPDATE devices SET status = 'AVAILABLE', customer_id = NULL, assigned_at = NULL WHERE customer_id = $1`, [id]);

    // Delete user account if any
    await query('DELETE FROM users WHERE customer_id = $1', [id]);

    // Delete customer
    const result = await query('DELETE FROM customers WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user ? req.user.email : 'system', 'CUSTOMER_DELETED', 'CUSTOMER', id, 'Deleted customer and unassigned devices']
    );

    return res.json({ success: true, message: 'Customer deleted and assigned devices released to Available.' });
  } catch (error) {
    console.error('deleteCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete customer.' });
  }
}

// GET /api/customers/:id/devices
async function getCustomerAssignedDevices(req, res) {
  try {
    const { id } = req.params;
    const devices = await query('SELECT * FROM devices WHERE customer_id = $1 ORDER BY assigned_at DESC', [id]);
    return res.json({ success: true, devices: devices.rows });
  } catch (error) {
    console.error('getCustomerAssignedDevices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned devices.' });
  }
}

// POST /api/customers/:id/assign-devices
async function assignDevicesToCustomer(req, res) {
  try {
    const { id } = req.params;
    const { deviceIds } = req.body;

    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one device ID is required.' });
    }

    const custRes = await query('SELECT name, email FROM customers WHERE id = $1', [id]);
    if (custRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const now = new Date().toISOString();
    for (const devId of deviceIds) {
      await query(
        `UPDATE devices SET status = 'ASSIGNED', customer_id = $1, assigned_at = $2 WHERE id = $3`,
        [id, now, devId]
      );
    }

    return res.json({ success: true, message: `Successfully assigned ${deviceIds.length} device(s) to customer.` });
  } catch (error) {
    console.error('assignDevicesToCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign devices to customer.' });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  resendInvite,
  updateCustomer,
  deleteCustomer,
  getCustomerAssignedDevices,
  assignDevicesToCustomer
};

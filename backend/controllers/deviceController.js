const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { query } = require('../config/db');

// Helper to generate ThingsBoard style Unique Device ID
function generateUniqueDeviceId() {
  const prefix = 'TB-DEV';
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${rand}`;
}

// GET /api/devices
async function getAllDevices(req, res) {
  try {
    const { search = '', status = 'ALL', model = 'ALL', customerId = '', page, limit } = req.query;

    let whereSql = '';
    const params = [];

    // If logged in as customer, only show their devices
    if (req.user && req.user.role === 'CUSTOMER') {
      params.push(req.user.customerId || req.user.customer_id || 'none');
      whereSql += ` AND d.customer_id = $${params.length}`;
    } else if (customerId) {
      params.push(customerId);
      whereSql += ` AND d.customer_id = $${params.length}`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      whereSql += ` AND d.status = $${params.length}`;
    }

    if (model && model !== 'ALL') {
      params.push(model);
      whereSql += ` AND d.model = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      whereSql += ` AND (
        d.unique_id ILIKE $${params.length} OR 
        d.serial_number ILIKE $${params.length} OR 
        d.model ILIKE $${params.length} OR 
        d.firmware_version ILIKE $${params.length} OR
        c.name ILIKE $${params.length} OR
        c.email ILIKE $${params.length}
      )`;
    }

    let total = null;
    if (page !== undefined) {
      const countSql = `
        SELECT COUNT(*) as total 
        FROM devices d
        LEFT JOIN customers c ON d.customer_id = c.id
        WHERE 1=1 ${whereSql}
      `;
      const countRes = await query(countSql, params);
      total = parseInt(countRes.rows[0]?.total || 0, 10);
    }

    let sql = `
      SELECT 
        d.*,
        c.name as customer_name,
        c.email as customer_email,
        c.company as customer_company
      FROM devices d
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE 1=1 ${whereSql}
      ORDER BY d.created_at DESC
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

    // Also fetch all distinct models available to user for filter dropdown
    let modelsSql = "SELECT DISTINCT model FROM devices WHERE model IS NOT NULL AND model != ''";
    let modelsParams = [];
    if (req.user && req.user.role === 'CUSTOMER') {
      modelsSql += ' AND customer_id = $1';
      modelsParams.push(req.user.customerId || req.user.customer_id || 'none');
    }
    modelsSql += ' ORDER BY model ASC';
    const modelsRes = await query(modelsSql, modelsParams);
    const models = modelsRes.rows.map(r => r.model);

    return res.json({
      success: true,
      devices: result.rows,
      models,
      pagination: page !== undefined ? {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      } : undefined
    });
  } catch (error) {
    console.error('getAllDevices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve devices.' });
  }
}

// GET /api/devices/:id
async function getDeviceById(req, res) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        d.*,
        c.name as customer_name,
        c.email as customer_email,
        c.company as customer_company
      FROM devices d
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE d.id = $1 OR d.unique_id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Device not found.' });
    }

    const device = result.rows[0];

    // Check customer permission
    if (req.user && req.user.role === 'CUSTOMER' && device.customer_id !== req.user.customerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized device access.' });
    }

    return res.json({ success: true, device });
  } catch (error) {
    console.error('getDeviceById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve device.' });
  }
}

// POST /api/devices
async function createDevice(req, res) {
  try {
    let { 
      unique_id, 
      serial_number, 
      model, 
      firmware_version = 'v1.0.0', 
      mfg_date, 
      status = 'AVAILABLE',
      customer_id = null 
    } = req.body;

    if (!serial_number || !model || !mfg_date) {
      return res.status(400).json({
        success: false,
        message: 'Serial Number, Model, and Manufacturing Date are required.'
      });
    }

    // Auto-generate unique ID if not provided
    if (!unique_id || unique_id.trim() === '') {
      unique_id = generateUniqueDeviceId();
    }

    // Check duplicate serial or unique_id
    const existing = await query('SELECT id FROM devices WHERE unique_id = $1 OR serial_number = $2', [unique_id, serial_number]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A device with this Serial Number or Unique ID already exists.'
      });
    }

    const id = uuidv4();
    const credentialsToken = `ACCESS_${crypto.randomBytes(16).toString('hex')}`;
    let assignedAt = null;

    if (status === 'ASSIGNED' && customer_id) {
      assignedAt = new Date().toISOString();
    } else {
      status = 'AVAILABLE';
      customer_id = null;
    }

    await query(
      `INSERT INTO devices (id, unique_id, serial_number, model, firmware_version, mfg_date, status, customer_id, assigned_at, credentials_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, unique_id.trim(), serial_number.trim(), model.trim(), firmware_version.trim(), mfg_date, status, customer_id, assignedAt, credentialsToken]
    );

    // Seed initial telemetry sample for this device
    await query(
      `INSERT INTO telemetry_readings (id, device_id, metric, value, unit) VALUES
       ($1, $2, 'piezo_voltage', 3.42, 'V'),
       ($3, $2, 'frequency', 124.5, 'Hz'),
       ($4, $2, 'pulse_intensity', 88.2, 'kPa'),
       ($5, $2, 'temperature', 26.4, '°C')`,
      [uuidv4(), id, uuidv4(), uuidv4(), uuidv4()]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user ? req.user.email : 'system', 'DEVICE_CREATED', 'DEVICE', id, `Created device ${unique_id} (${model})`]
    );

    return res.status(201).json({
      success: true,
      message: 'Device created successfully.',
      device: {
        id,
        unique_id,
        serial_number,
        model,
        firmware_version,
        mfg_date,
        status,
        customer_id,
        assigned_at: assignedAt,
        credentials_token: credentialsToken
      }
    });
  } catch (error) {
    console.error('createDevice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create device.' });
  }
}

// PUT /api/devices/:id
async function updateDevice(req, res) {
  try {
    const { id } = req.params;
    const { model, firmware_version, mfg_date, status, customer_id } = req.body;

    const existing = await query('SELECT * FROM devices WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Device not found.' });
    }

    let assignedAt = existing.rows[0].assigned_at;
    let newStatus = status || existing.rows[0].status;
    let newCustomerId = customer_id !== undefined ? customer_id : existing.rows[0].customer_id;

    if (newStatus === 'ASSIGNED' && newCustomerId) {
      if (!assignedAt || newCustomerId !== existing.rows[0].customer_id) {
        assignedAt = new Date().toISOString();
      }
    } else if (newStatus === 'AVAILABLE') {
      newCustomerId = null;
      assignedAt = null;
    }

    await query(
      `UPDATE devices 
       SET model = COALESCE($1, model),
           firmware_version = COALESCE($2, firmware_version),
           mfg_date = COALESCE($3, mfg_date),
           status = $4,
           customer_id = $5,
           assigned_at = $6
       WHERE id = $7`,
      [model, firmware_version, mfg_date, newStatus, newCustomerId, assignedAt, id]
    );

    return res.json({ success: true, message: 'Device updated successfully.' });
  } catch (error) {
    console.error('updateDevice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update device.' });
  }
}

// POST /api/devices/:id/assign
async function assignDevice(req, res) {
  try {
    const { id } = req.params;
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, message: 'Customer ID is required for assignment.' });
    }

    const customerRes = await query('SELECT name, email FROM customers WHERE id = $1', [customer_id]);
    if (customerRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const devRes = await query('SELECT * FROM devices WHERE id = $1', [id]);
    if (devRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Device not found.' });
    }

    const assignedAt = new Date().toISOString();

    await query(
      `UPDATE devices SET status = 'ASSIGNED', customer_id = $1, assigned_at = $2 WHERE id = $3`,
      [customer_id, assignedAt, id]
    );

    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user ? req.user.email : 'system', 'DEVICE_ASSIGNED', 'DEVICE', id, `Assigned to customer ${customerRes.rows[0].name} (${customerRes.rows[0].email})`]
    );

    return res.json({
      success: true,
      message: `Device successfully assigned to ${customerRes.rows[0].name}.`,
      assigned_at: assignedAt,
      customer: customerRes.rows[0]
    });
  } catch (error) {
    console.error('assignDevice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign device.' });
  }
}

// POST /api/devices/:id/unassign
async function unassignDevice(req, res) {
  try {
    const { id } = req.params;
    const devRes = await query('SELECT * FROM devices WHERE id = $1', [id]);
    if (devRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Device not found.' });
    }

    await query(
      `UPDATE devices SET status = 'AVAILABLE', customer_id = NULL, assigned_at = NULL WHERE id = $1`,
      [id]
    );

    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user ? req.user.email : 'system', 'DEVICE_UNASSIGNED', 'DEVICE', id, 'Device released back to Available pool']
    );

    return res.json({ success: true, message: 'Device unassigned successfully and marked Available.' });
  } catch (error) {
    console.error('unassignDevice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to unassign device.' });
  }
}

// DELETE /api/devices/:id
async function deleteDevice(req, res) {
  try {
    const { id } = req.params;

    // Delete telemetry
    await query('DELETE FROM telemetry_readings WHERE device_id = $1', [id]);

    const result = await query('DELETE FROM devices WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Device not found.' });
    }

    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user ? req.user.email : 'system', 'DEVICE_DELETED', 'DEVICE', id, 'Device deleted permanently']
    );

    return res.json({ success: true, message: 'Device deleted successfully.' });
  } catch (error) {
    console.error('deleteDevice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete device.' });
  }
}

// GET /api/devices/:id/telemetry
async function getDeviceTelemetry(req, res) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM telemetry_readings WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 50', [id]);
    
    // If no telemetry exists, generate realistic dynamic piezo pulse values
    let telemetry = result.rows;
    if (telemetry.length === 0) {
      telemetry = [
        { metric: 'piezo_voltage', value: (3.1 + Math.random() * 0.8).toFixed(2), unit: 'V', timestamp: new Date().toISOString() },
        { metric: 'frequency', value: (120 + Math.random() * 15).toFixed(1), unit: 'Hz', timestamp: new Date().toISOString() },
        { metric: 'pulse_intensity', value: (85 + Math.random() * 10).toFixed(1), unit: 'kPa', timestamp: new Date().toISOString() },
        { metric: 'temperature', value: (25 + Math.random() * 3).toFixed(1), unit: '°C', timestamp: new Date().toISOString() }
      ];
    }

    return res.json({ success: true, telemetry });
  } catch (error) {
    console.error('getDeviceTelemetry error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch telemetry.' });
  }
}

// GET /api/devices/generate-id
function getGeneratedId(req, res) {
  return res.json({ success: true, unique_id: generateUniqueDeviceId() });
}

module.exports = {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  assignDevice,
  unassignDevice,
  deleteDevice,
  getDeviceTelemetry,
  getGeneratedId
};

const { query, getDatabaseStatus } = require('../config/db');
const { getEmailServiceStatus } = require('../services/emailService');

async function getOverviewStats(req, res) {
  try {
    const isCustomer = req.user && req.user.role === 'CUSTOMER';
    const customerId = req.user && (req.user.customerId || req.user.customer_id);

    let totalDevicesQuery = 'SELECT COUNT(*) as count FROM devices';
    let availableDevicesQuery = "SELECT COUNT(*) as count FROM devices WHERE status = 'AVAILABLE'";
    let assignedDevicesQuery = "SELECT COUNT(*) as count FROM devices WHERE status = 'ASSIGNED'";
    let params = [];

    if (isCustomer) {
      totalDevicesQuery += ' WHERE customer_id = $1';
      availableDevicesQuery += ' AND customer_id = $1';
      assignedDevicesQuery += ' AND customer_id = $1';
      params = [customerId];
    }

    const totalDevRes = await query(totalDevicesQuery, params);
    const availDevRes = await query(availableDevicesQuery, params);
    const assignedDevRes = await query(assignedDevicesQuery, params);

    const totalCustRes = await query('SELECT COUNT(*) as count FROM customers');
    const activeCustRes = await query("SELECT COUNT(*) as count FROM customers WHERE status = 'ACTIVE'");
    const pendingCustRes = await query("SELECT COUNT(*) as count FROM customers WHERE status = 'PENDING_INVITE'");

    // Device models distribution
    const modelsRes = await query(`
      SELECT model, COUNT(*) as count 
      FROM devices 
      ${isCustomer ? 'WHERE customer_id = $1' : ''}
      GROUP BY model
    `, isCustomer ? [customerId] : []);

    // Recent devices
    const recentDevicesRes = await query(`
      SELECT d.*, c.name as customer_name 
      FROM devices d
      LEFT JOIN customers c ON d.customer_id = c.id
      ${isCustomer ? 'WHERE d.customer_id = $1' : ''}
      ORDER BY d.created_at DESC LIMIT 5
    `, isCustomer ? [customerId] : []);

    // Recent audit logs
    const auditRes = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 8');

    return res.json({
      success: true,
      stats: {
        totalDevices: parseInt(totalDevRes.rows[0]?.count || 0),
        availableDevices: parseInt(availDevRes.rows[0]?.count || 0),
        assignedDevices: parseInt(assignedDevRes.rows[0]?.count || 0),
        totalCustomers: isCustomer ? 1 : parseInt(totalCustRes.rows[0]?.count || 0),
        activeCustomers: isCustomer ? 1 : parseInt(activeCustRes.rows[0]?.count || 0),
        pendingCustomers: isCustomer ? 0 : parseInt(pendingCustRes.rows[0]?.count || 0),
        deviceModels: modelsRes.rows,
        recentDevices: recentDevicesRes.rows,
        recentActivity: auditRes.rows,
        database: getDatabaseStatus(),
        emailService: getEmailServiceStatus()
      }
    });
  } catch (error) {
    console.error('getOverviewStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve overview statistics.' });
  }
}

module.exports = {
  getOverviewStats
};

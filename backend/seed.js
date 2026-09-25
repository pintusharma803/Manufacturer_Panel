const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { query } = require('./config/db');

async function seedDatabase() {
  try {
    // Check if admin already exists
    const adminCheck = await query("SELECT id FROM users WHERE role = 'ADMIN'");
    if (adminCheck.rows.length > 0) {
      console.log('ℹ️ [Seed] Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('🌱 [Seed] Seeding initial database data...');

    // 1. Create Default Admin User
    const adminId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    await query(
      `INSERT INTO users (id, email, password_hash, name, role, customer_id)
       VALUES ($1, $2, $3, $4, $5, NULL)`,
      [adminId, 'admin@thingspulse.io', adminPasswordHash, 'System Administrator', 'ADMIN']
    );

    // 2. Create Initial Customers
    const customer1Id = uuidv4();
    const customer2Id = uuidv4();
    const customer3Id = uuidv4();

    const inviteToken2 = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await query(
      `INSERT INTO customers (id, name, email, phone, company, status, invite_token, invite_expires_at)
       VALUES 
       ($1, 'Alpha Energies', 'contact@alphaenergies.com', '+1 (555) 234-8811', 'Alpha Renewable Corp', 'ACTIVE', NULL, NULL),
       ($2, 'Beta Sensors Ltd', 'iot@betasensors.com', '+1 (555) 789-2234', 'Beta Industrial Labs', 'PENDING_INVITE', $4, $5),
       ($3, 'Apex Dynamics', 'tech@apexdynamics.io', '+1 (555) 432-9011', 'Apex Robotics Inc', 'ACTIVE', NULL, NULL)`,
      [customer1Id, customer2Id, customer3Id, inviteToken2, expiresAt]
    );

    // Create Customer login for Alpha Energies (Password: Customer@123)
    const cust1PassHash = await bcrypt.hash('Customer@123', 10);
    await query(
      `INSERT INTO users (id, email, password_hash, name, role, customer_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), 'contact@alphaenergies.com', cust1PassHash, 'Alpha Energies Admin', 'CUSTOMER', customer1Id]
    );

    // 3. Create Sample Devices
    const now = new Date().toISOString();
    const dev1Id = uuidv4();
    const dev2Id = uuidv4();
    const dev3Id = uuidv4();
    const dev4Id = uuidv4();
    const dev5Id = uuidv4();

    await query(
      `INSERT INTO devices (id, unique_id, serial_number, model, firmware_version, mfg_date, status, customer_id, assigned_at, credentials_token)
       VALUES 
       ($1, 'TB-DEV-7A2F', 'PZ-100-8841', 'PiezoPulse X100', 'v2.1.0', '2025-11-12', 'ASSIGNED', $6, $7, 'ACCESS_7A2F881944'),
       ($2, 'TB-DEV-9B1C', 'ES-200-4492', 'EchoSense Lite', 'v1.4.2', '2026-01-15', 'ASSIGNED', $6, $7, 'ACCESS_9B1C229910'),
       ($3, 'TB-DEV-3E8D', 'PN-500-1193', 'PulseNode Pro', 'v3.0.1', '2026-02-10', 'ASSIGNED', $8, $7, 'ACCESS_3E8D118833'),
       ($4, 'TB-DEV-4F2A', 'GW-900-3320', 'Gateway Ultra', 'v2.4.0', '2026-03-01', 'AVAILABLE', NULL, NULL, 'ACCESS_4F2A776655'),
       ($5, 'TB-DEV-6C7E', 'PZ-100-9921', 'PiezoPulse X100', 'v2.1.0', '2026-03-05', 'AVAILABLE', NULL, NULL, 'ACCESS_6C7E991122')`,
      [dev1Id, dev2Id, dev3Id, dev4Id, dev5Id, customer1Id, now, customer3Id]
    );

    // 4. Create sample telemetry
    const devList = [dev1Id, dev2Id, dev3Id];
    for (const dId of devList) {
      await query(
        `INSERT INTO telemetry_readings (id, device_id, metric, value, unit) VALUES
         ($1, $2, 'piezo_voltage', 3.45, 'V'),
         ($3, $2, 'frequency', 128.4, 'Hz'),
         ($4, $2, 'pulse_intensity', 89.1, 'kPa'),
         ($5, $2, 'temperature', 25.8, '°C')`,
        [uuidv4(), dId, uuidv4(), uuidv4(), uuidv4()]
      );
    }

    // 5. Initial Audit Log
    await query(
      `INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
       VALUES 
       ($1, 'system', 'SYSTEM_INITIALIZED', 'PLATFORM', 'SYSTEM', 'ThingsBoard Pulse system initialization and demo data provisioning'),
       ($2, 'admin@thingspulse.io', 'DEVICE_ASSIGNED', 'DEVICE', $3, 'Assigned TB-DEV-7A2F to Alpha Energies')`,
      [uuidv4(), uuidv4(), dev1Id]
    );

    console.log('✅ [Seed] Successfully seeded initial admin, customers, and devices.');
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
  }
}

module.exports = { seedDatabase };

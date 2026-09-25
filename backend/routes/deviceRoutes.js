const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Device ID generation helper
router.get('/generate-id', deviceController.getGeneratedId);

// Device CRUD & operations
router.get('/', deviceController.getAllDevices);
router.post('/', requireRole('ADMIN'), deviceController.createDevice);
router.get('/:id', deviceController.getDeviceById);
router.put('/:id', requireRole('ADMIN'), deviceController.updateDevice);
router.delete('/:id', requireRole('ADMIN'), deviceController.deleteDevice);

// Assignment routes
router.post('/:id/assign', requireRole('ADMIN'), deviceController.assignDevice);
router.post('/:id/unassign', requireRole('ADMIN'), deviceController.unassignDevice);

// Telemetry
router.get('/:id/telemetry', deviceController.getDeviceTelemetry);

module.exports = router;

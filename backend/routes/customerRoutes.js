const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Admin-only customer operations
router.get('/', requireRole('ADMIN'), customerController.getAllCustomers);
router.post('/', requireRole('ADMIN'), customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', requireRole('ADMIN'), customerController.updateCustomer);
router.delete('/:id', requireRole('ADMIN'), customerController.deleteCustomer);
router.post('/:id/resend-invite', requireRole('ADMIN'), customerController.resendInvite);
router.get('/:id/devices', customerController.getCustomerAssignedDevices);
router.post('/:id/assign-devices', requireRole('ADMIN'), customerController.assignDevicesToCustomer);

module.exports = router;

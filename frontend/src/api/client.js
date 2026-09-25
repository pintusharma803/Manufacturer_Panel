const API_BASE = 'https://manufacturer-panel.onrender.com/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('thingspulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('thingspulse_token');
      localStorage.removeItem('thingspulse_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new Error(data.message || 'An error occurred while communicating with the server.');
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  verifyInviteToken: (token) => request(`/auth/verify-invite/${token}`),
  setPassword: (payload) => request('/auth/set-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Devices
  getDevices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/devices${query ? `?${query}` : ''}`);
  },
  getDeviceById: (id) => request(`/devices/${id}`),
  createDevice: (deviceData) => request('/devices', { method: 'POST', body: JSON.stringify(deviceData) }),
  updateDevice: (id, deviceData) => request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(deviceData) }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),
  assignDevice: (id, customerId) => request(`/devices/${id}/assign`, { method: 'POST', body: JSON.stringify({ customer_id: customerId }) }),
  unassignDevice: (id) => request(`/devices/${id}/unassign`, { method: 'POST' }),
  getDeviceTelemetry: (id) => request(`/devices/${id}/telemetry`),
  getGeneratedDeviceId: () => request('/devices/generate-id'),

  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers${query ? `?${query}` : ''}`);
  },
  getCustomerById: (id) => request(`/customers/${id}`),
  createCustomer: (customerData) => request('/customers', { method: 'POST', body: JSON.stringify(customerData) }),
  updateCustomer: (id, customerData) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customerData) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  resendInvite: (id) => request(`/customers/${id}/resend-invite`, { method: 'POST' }),
  getCustomerDevices: (id) => request(`/customers/${id}/devices`),
  assignDevicesToCustomer: (id, deviceIds) => request(`/customers/${id}/assign-devices`, { method: 'POST', body: JSON.stringify({ deviceIds }) }),

  // Stats
  getOverviewStats: () => request('/stats/overview'),
};

import apiClient from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: {
    name?: string;
    phone?: string;
    password?: string;
    permanentAddress?: string;
    occupation?: string;
    companyOrCollege?: string;
    emergencyContactName?: string;
    emergencyContactNumber?: string;
  }) => {
    const res = await apiClient.put('/auth/profile', data);
    return res.data;
  },
};

export const propertyService = {
  getAll: async () => {
    const res = await apiClient.get('/properties');
    return res.data.properties;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/properties/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/properties', data);
    return res.data.property;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/properties/${id}`, data);
    return res.data.property;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/properties/${id}`);
    return res.data;
  },
};

export const roomService = {
  getRooms: async (propertyId?: string) => {
    const res = await apiClient.get('/rooms', { params: { propertyId } });
    return res.data.rooms;
  },
  getRoomById: async (id: string) => {
    const res = await apiClient.get(`/rooms/${id}`);
    return res.data.room;
  },
  createRoom: async (data: any) => {
    const res = await apiClient.post('/rooms', data);
    return res.data.room;
  },
  updateRoom: async (id: string, data: any) => {
    const res = await apiClient.put(`/rooms/${id}`, data);
    return res.data.room;
  },
  getBeds: async (propertyId?: string, roomId?: string) => {
    const res = await apiClient.get('/beds', { params: { propertyId, roomId } });
    return res.data.beds;
  },
  allocateBed: async (bedId: string, residentId: string) => {
    const res = await apiClient.post('/beds/action', { action: 'allocate', bedId, residentId });
    return res.data;
  },
  vacateBed: async (bedId: string) => {
    const res = await apiClient.post('/beds/action', { action: 'vacate', bedId });
    return res.data;
  },
};

export const residentService = {
  getAll: async (params?: { propertyId?: string; status?: string; search?: string }) => {
    const res = await apiClient.get('/residents', { params });
    return res.data.residents;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/residents/${id}`);
    return res.data.resident;
  },
  register: async (data: any) => {
    const res = await apiClient.post('/residents', data);
    return res.data.resident;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/residents/${id}`, data);
    return res.data.resident;
  },
  checkout: async (id: string, data: any) => {
    const res = await apiClient.post(`/residents/${id}`, data);
    return res.data;
  },
};

export const documentService = {
  getByResident: async (residentId?: string) => {
    const res = await apiClient.get('/documents', { params: { residentId } });
    return res.data.documents;
  },
  upload: async (formData: FormData) => {
    const res = await apiClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.document;
  },
  verify: async (id: string) => {
    const res = await apiClient.post(`/documents/${id}/verify`, { action: 'verify' });
    return res.data.document;
  },
  reject: async (id: string, rejectionReason: string) => {
    const res = await apiClient.post(`/documents/${id}/verify`, { action: 'reject', rejectionReason });
    return res.data.document;
  },
  getFileUrl: (id: string) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents/${id}/file`;
  },
};

export const rentService = {
  getRentRecords: async (params?: { propertyId?: string; residentId?: string; rentMonth?: string; status?: string }) => {
    const res = await apiClient.get('/rent', { params });
    return res.data.rentRecords;
  },
  generateRent: async (billingMonth: string) => {
    const res = await apiClient.post('/rent', { billingMonth });
    return res.data;
  },
  adjustRent: async (data: { rentRecordId: string; adjustmentAmount: number; adjustmentReason: string }) => {
    const res = await apiClient.put('/rent', data);
    return res.data.rentRecord;
  },
};

export const paymentService = {
  getSubmissions: async (params?: { status?: string; residentId?: string }) => {
    const res = await apiClient.get('/payments', { params });
    return res.data.payments;
  },
  submitPayment: async (formData: FormData) => {
    const res = await apiClient.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.submission;
  },
  approvePayment: async (id: string) => {
    const res = await apiClient.post(`/payments/${id}/verify`, { action: 'approve' });
    return res.data;
  },
  rejectPayment: async (id: string, rejectionReason: string) => {
    const res = await apiClient.post(`/payments/${id}/verify`, { action: 'reject', rejectionReason });
    return res.data;
  },
  recordCash: async (data: { residentId: string; rentRecordId: string; amount: number; remarks?: string }) => {
    const res = await apiClient.post('/payments/cash', data);
    return res.data;
  },
  getReceipts: async (params?: { residentId?: string; propertyId?: string }) => {
    const res = await apiClient.get('/receipts', { params });
    return res.data.receipts;
  },
  downloadReceiptPdf: async (id: string, receiptNumber?: string) => {
    const res = await apiClient.get(`/receipts/${id}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${receiptNumber || id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
  getReceiptPdfUrl: (id: string) => {
    const token = localStorage.getItem('pg_auth_token') || localStorage.getItem('token') || '';
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/receipts/${id}/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
};

export const depositService = {
  getDeposits: async (params?: { propertyId?: string; residentId?: string }) => {
    const res = await apiClient.get('/deposits', { params });
    return res.data.deposits;
  },
  recordPayment: async (data: { depositId: string; amount: number; paymentMethod: string; transactionReference?: string; notes?: string }) => {
    const res = await apiClient.post('/deposits', data);
    return res.data;
  },
};

export const complaintService = {
  getAll: async (params?: { propertyId?: string; residentId?: string; status?: string }) => {
    const res = await apiClient.get('/complaints', { params });
    return res.data.complaints;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/complaints', data);
    return res.data.complaint;
  },
  updateStatus: async (id: string, data: any) => {
    const res = await apiClient.put(`/complaints/${id}`, data);
    return res.data.complaint;
  },
};

export const notificationService = {
  getAll: async () => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markRead: async (notificationId: string) => {
    const res = await apiClient.post('/notifications', { action: 'mark-read', notificationId });
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.post('/notifications', { action: 'read-all' });
    return res.data;
  },
  registerFcm: async (fcmToken: string) => {
    const res = await apiClient.post('/notifications', { action: 'register-fcm', fcmToken });
    return res.data;
  },
  sendNotification: async (data: { title: string; message: string; type?: string; targetResidentId?: string }) => {
    const res = await apiClient.post('/notifications', { action: 'send', ...data });
    return res.data;
  },
  triggerCronReminders: async () => {
    const res = await apiClient.post('/cron/reminders');
    return res.data;
  },
};

export const reportService = {
  getDashboardStats: async (propertyId?: string, month?: string) => {
    const res = await apiClient.get('/reports', { params: { type: 'dashboard', propertyId, month } });
    return res.data;
  },
  getRentReport: async (params?: { propertyId?: string; month?: string }) => {
    const res = await apiClient.get('/reports', { params: { type: 'rent', ...params } });
    return res.data.report;
  },
  getCollectionReport: async (params?: { propertyId?: string }) => {
    const res = await apiClient.get('/reports', { params: { type: 'collection', ...params } });
    return res.data.report;
  },
  downloadRentExcel: async (month?: string) => {
    const res = await apiClient.get('/reports', {
      params: { type: 'rent', format: 'excel', month },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rent_Report_${month || 'All'}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
  downloadCollectionExcel: async () => {
    const res = await apiClient.get('/reports', {
      params: { type: 'collection', format: 'excel' },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Payment_Receipts_Ledger.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
  getExcelDownloadUrl: (type: 'rent' | 'collection', month?: string) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('pg_auth_token') || localStorage.getItem('token') || '';
    return `${base}/reports?type=${type}&format=excel${month ? `&month=${month}` : ''}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  },
};

export const settingsService = {
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data.settings;
  },
  updateSettings: async (data: any) => {
    const res = await apiClient.put('/settings', data);
    return res.data.settings;
  },
};


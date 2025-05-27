import axios from 'axios';

const API_URL = process.env.REACT_APP_API_AUTH_URL;
const API = process.env.REACT_APP_API_BASE_URL;


export const registerUser = async (userData) =>
  await axios.post(`${API_URL}/register`, userData);

export const verifyOtp = async (email, code) =>
  await axios.post(`${API_URL}/verify-otp`, { email, code });

export const getAvailableSlots = async () =>
  await axios.get(`${API_URL}/slotsavailable`);

export const loginUser = async (credentials) =>
  await axios.post(`${API_URL}/login`, credentials);

export const createOrder = async (amount) =>
  await axios.post(`${API}/payment/create-order`, { amount });

export const verifyPayment = async (paymentData) =>
  await axios.post(`${API}/payment/verify-payment`, paymentData);

export const updateUserProfile = async (userData) =>
  await axios.post(`${API_URL}/update`, userData);

export const changePassword = async (data) =>
  await axios.post(`${API_URL}/change-password`, data);

export const getBookedSlot = async (email) =>
  await axios.get(`${API}/bookings/${email}`);

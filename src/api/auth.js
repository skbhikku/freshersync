import axios from "axios";

const API_URL = process.env.REACT_APP_API_AUTH_URL;
const API = process.env.REACT_APP_API_BASE_URL;

// REGISTER
export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

// VERIFY OTP
export const verifyOtp = async (email, otpCode) => {
  return axios.post(`${API_URL}/verify-otp`, {
    email,
    otp: otpCode,
  });
};

// AVAILABLE SLOTS
export const getAvailableSlots = async () => {
  return axios.get(`${API_URL}/slotsavailable`);
};

// LOGIN
export const loginUser = async (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};

// CREATE PAYMENT ORDER
export const createOrder = async (amount) => {
  return axios.post(`${API}/payment/create-order`, {
    amount,
  });
};

// VERIFY PAYMENT
export const verifyPayment = async (paymentData) => {
  return axios.post(`${API}/payment/verify-payment`, paymentData);
};

// UPDATE USER PROFILE
export const updateUserProfile = async (userData) => {
  return axios.post(`${API_URL}/update`, userData);
};

// CHANGE PASSWORD
export const changePassword = async (data) => {
  return axios.post(`${API_URL}/change-password`, data);
};

// GET BOOKED SLOT
export const getBookedSlot = async (email) => {
  return axios.get(`${API}/bookings/${encodeURIComponent(email)}`);
};

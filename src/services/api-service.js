import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Регистрация
export async function sendVerificationCodeAPI(email) {
  const response = await apiClient.post('/register/send-code', { email });
  return response.data;
}

export async function verifyRegistrationCodeAPI(email, code) {
  const response = await apiClient.post('/register/verify-code', { email, code });
  return response.data;
}

export async function registerUser(data) {
  const response = await apiClient.post('/register', {
    username: data.email.split('@')[0],
    email: data.email,
    password: data.password
  });
  return response.data;
}

// Авторизация
export async function loginUser(data) {
  const response = await apiClient.post('/login', data);
  return response.data;
}

// Восстановление пароля
export async function sendResetCodeAPI(email) {
  const response = await apiClient.post('/password/reset/send-code', { email });
  return response.data;
}

export async function verifyResetCodeAPI(email, code) {
  const response = await apiClient.post('/password/reset/verify-code', { email, code });
  return response.data;
}

export async function updatePassword(email, code, newPassword) {
  const response = await apiClient.post('/password/reset/update', { email, code, newPassword });
  return response.data;
}
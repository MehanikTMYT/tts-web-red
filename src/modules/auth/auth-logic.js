// auth-logic.js
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function createAuthLogic() {
  // Состояние формы
  const form = ref({
    email: '',
    password: '',
    verificationCode: '',
    newPassword: ''
  });

  // Ошибки
  const errors = ref({
    email: '',
    password: '',
    verificationCode: '',
    newPassword: '',
    general: ''
  });

  // Режимы: 'login', 'register', 'forgot-password', 'reset-password'
  const mode = ref('login');
  const resendCooldown = ref(0); // Таймер повторной отправки кода
  const router = useRouter();

  // Валидация email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Валидация пароля (минимум 6 символов)
  function validatePassword(password) {
    return password.length >= 6;
  }

  // Валидация кода (6 цифр)
  function validateCode(code) {
    return code.length === 6 && !isNaN(code);
  }

  // Сброс ошибок и формы
  function resetErrors() {
    errors.value = { email: '', password: '', verificationCode: '', newPassword: '', general: '' };
  }

  function resetForm() {
    form.value = { email: '', password: '', verificationCode: '', newPassword: '' };
    resetErrors();
  }

  // Таймер повторной отправки кода
  function startResendTimer() {
    resendCooldown.value = 60;
    const interval = setInterval(() => {
      resendCooldown.value--;
      if (resendCooldown.value <= 0) clearInterval(interval);
    }, 1000);
  }

  // Отправка кода подтверждения
  async function sendVerificationCode() {
    if (!validateEmail(form.value.email)) {
      errors.value.email = 'Введите корректный email';
      return;
    }
    try {
      if (mode.value === 'register') {
        await sendVerificationCodeAPI(form.value.email); // Вызов API
        mode.value = 'code';
        startResendTimer();
      } else if (mode.value === 'forgot-password') {
        await sendResetCodeAPI(form.value.email); // Вызов API
        mode.value = 'reset-password';
        startResendTimer();
      }
    } catch (error) {
      errors.value.general = error.message || 'Ошибка отправки кода';
    }
  }

  // Проверка кода
  async function verifyCode() {
    if (!validateCode(form.value.verificationCode)) {
      errors.value.verificationCode = 'Введите 6 цифр';
      return;
    }
    try {
      if (mode.value === 'code') {
        await verifyRegistrationCodeAPI(form.value.email, form.value.verificationCode); // Вызов API
        mode.value = 'password';
      } else if (mode.value === 'reset-password') {
        await verifyResetCodeAPI(form.value.email, form.value.verificationCode); // Вызов API
        mode.value = 'new-password';
      }
    } catch (error) {
      errors.value.general = error.message || 'Неверный код';
    }
  }

  // Регистрация пользователя
  async function handleRegister() {
    if (!validatePassword(form.value.password)) {
      errors.value.password = 'Пароль должен быть минимум 6 символов';
      return;
    }
    try {
      await registerUserAPI(form.value); // Вызов API
      localStorage.setItem('user', JSON.stringify({ email: form.value.email }));
      router.push('/profile');
    } catch (error) {
      errors.value.general = error.message || 'Ошибка регистрации';
    }
  }

  // Вход пользователя
  async function handleLogin() {
    if (!validateEmail(form.value.email) || !form.value.password) {
      errors.value.email = 'Email обязателен';
      errors.value.password = 'Пароль обязателен';
      return;
    }
    try {
      const response = await loginUserAPI(form.value); // Вызов API
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/profile');
    } catch (error) {
      errors.value.general = error.message || 'Ошибка входа';
    }
  }

  // Восстановление пароля
  async function handleResetPassword() {
    if (!validatePassword(form.value.newPassword)) {
      errors.value.newPassword = 'Пароль должен быть минимум 6 символов';
      return;
    }
    try {
      await updatePasswordAPI(form.value.email, form.value.verificationCode, form.value.newPassword); // Вызов API
      mode.value = 'login';
    } catch (error) {
      errors.value.general = error.message || 'Ошибка обновления пароля';
    }
  }

  // Валидация формы в зависимости от режима
  function validateForm() {
    resetErrors();
    if (mode.value === 'login' || mode.value === 'forgot-password') {
      if (!validateEmail(form.value.email)) {
        errors.value.email = 'Введите корректный email';
        return false;
      }
    } else if (mode.value === 'password') {
      if (!validatePassword(form.value.password)) {
        errors.value.password = 'Пароль обязателен';
        return false;
      }
    } else if (mode.value === 'new-password') {
      if (!validatePassword(form.value.newPassword)) {
        errors.value.newPassword = 'Пароль должен быть минимум 6 символов';
        return false;
      }
    }
    return true;
  }

  return {
    form,
    errors,
    mode,
    resendCooldown,
    resetForm,
    validateForm,
    sendVerificationCode,
    verifyCode,
    handleRegister,
    handleLogin,
    handleResetPassword
  };
}
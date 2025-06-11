import { ref } from 'vue';
import { getProfile, updateProfile } from '../../services/api-service';
import { useRouter } from 'vue-router';

export function createProfileLogic() {
  // Состояние
  const user = ref(null);
  const isLoading = ref(false);
  const errors = ref({
    general: '',
    form: {}
  });
  
  // Форма профиля
  const form = ref({
    username: '',
    email: '',
    bio: ''
  });

  const router = useRouter();

  // Загрузка профиля
  async function loadProfile() {
    isLoading.value = true;
    try {
      const data = await getProfile();
      user.value = data;
      // Инициализация формы данными пользователя
      form.value = {
        username: data.username || '',
        email: data.email || '',
        bio: data.bio || ''
      };
    } catch (error) {
      errors.value.general = 'Ошибка загрузки профиля';
      router.push('/login'); // Перенаправление при ошибке
    } finally {
      isLoading.value = false;
    }
  }

  // Валидация формы
  function validateForm() {
    const newErrors = {};
    
    if (!form.value.username.trim()) {
      newErrors.username = 'Имя обязательно';
    }
    
    if (!form.value.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!validateEmail(form.value.email)) {
      newErrors.email = 'Введите корректный email';
    }

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  }

  // Валидация email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Сохранение профиля
  async function saveProfile() {
    errors.value.form = {};
    
    const validationErrors = validateForm();
    if (validationErrors) {
      errors.value.form = validationErrors;
      return;
    }

    try {
      const updatedData = await updateProfile(form.value);
      user.value = updatedData;
      errors.value.general = 'Профиль успешно обновлен';
    } catch (error) {
      errors.value.general = 'Ошибка сохранения профиля';
    }
  }

  // Выход из аккаунта
  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return {
    user,
    isLoading,
    errors,
    form,
    loadProfile,
    saveProfile,
    logout
  };
}
import { postLogin } from '@/services/api-service';

export async function handleLogin(form, errors) {
  try {
    const response = await postLogin(form.value); 
    return response;
  } catch (error) {
    // Если сервер возвращает подробности
    if (error.response && error.response.data && typeof error.response.data === 'object') {
      const data = error.response.data;
      errors.value.general = data.message || 'Ошибка входа';
      if (data.errors) {
        Object.assign(errors.value, data.errors); // email, password и т.д.
      }
    } else {
      errors.value.general = error.message || 'Произошла неизвестная ошибка';
    }
    throw error;
  }
}

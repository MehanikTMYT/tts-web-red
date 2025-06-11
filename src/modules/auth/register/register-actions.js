import { postRegister } from '@/services/api-service';

export async function handleRegister(form, errors) {
  try {
    // Отправляем данные формы на сервер
    await postRegister(form.value);
  } catch (error) {
    // В случае ошибки сохраняем сообщение в errors.general
    errors.value.general = error.response?.data?.message || error.message || 'Ошибка при регистрации';
    throw error; // Пробрасываем дальше, если нужно для обработки в компоненте
  }
}

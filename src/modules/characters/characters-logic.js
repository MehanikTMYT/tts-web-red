import { ref } from 'vue';
import { 
  getCharacters, 
  createCharacter, 
  updateCharacter, 
  deleteCharacter 
} from '../../services/api-service';

export function createCharactersLogic() {
  // Состояние
  const characters = ref([]);
  const isLoading = ref(false);
  const errors = ref({
    general: '',
    form: {}
  });
  
  // Форма создания/редактирования
  const form = ref({
    id: null,
    name: '',
    int_stat: 0,
    lck_stat: 0,
    tech_stat: 0,
    rea_stat: 0,
    luck_stat: 0,
    cha_stat: 0,
    will_stat: 0,
    move_stat: 0,
    body_stat: 0,
    emp_stat: 0
  });

  // Загрузка персонажей
  async function loadCharacters() {
    isLoading.value = true;
    try {
      const data = await getCharacters();
      characters.value = data;
    } catch (error) {
      errors.value.general = 'Ошибка загрузки персонажей';
    } finally {
      isLoading.value = false;
    }
  }

  // Валидация формы
  function validateForm() {
    const newErrors = {};
    
    if (!form.value.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }
    
    if (form.value.int_stat < 0 || form.value.int_stat > 10) {
      newErrors.int_stat = 'Должно быть от 0 до 10';
    }
    // Аналогично для других характеристик...

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  }

  // Создание/обновление персонажа
  async function saveCharacter() {
    errors.value.form = {};
    
    const validationErrors = validateForm();
    if (validationErrors) {
      errors.value.form = validationErrors;
      return;
    }

    try {
      if (form.value.id) {
        // Обновление
        await updateCharacter(form.value.id, form.value);
      } else {
        // Создание
        await createCharacter(form.value);
      }
      
      // Обновляем список
      await loadCharacters();
      resetForm();
    } catch (error) {
      errors.value.general = 'Ошибка сохранения персонажа';
    }
  }

  // Удаление персонажа
  async function removeCharacter(id) {
    if (!confirm('Вы уверены, что хотите удалить этого персонажа?')) return;
    
    try {
      await deleteCharacter(id);
      characters.value = characters.value.filter(c => c.id !== id);
    } catch (error) {
      errors.value.general = 'Ошибка удаления персонажа';
    }
  }

  // Редактирование персонажа
  function editCharacter(character) {
    form.value = { ...character };
  }

  // Сброс формы
  function resetForm() {
    form.value = {
      id: null,
      name: '',
      int_stat: 0,
      lck_stat: 0,
      tech_stat: 0,
      rea_stat: 0,
      luck_stat: 0,
      cha_stat: 0,
      will_stat: 0,
      move_stat: 0,
      body_stat: 0,
      emp_stat: 0
    };
  }

  return {
    characters,
    isLoading,
    errors,
    form,
    loadCharacters,
    saveCharacter,
    removeCharacter,
    editCharacter,
    resetForm
  };
}
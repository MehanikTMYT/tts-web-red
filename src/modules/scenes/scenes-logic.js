import { ref } from 'vue';
import { 
  getScenes, 
  createScene, 
  updateScene, 
  deleteScene,
  assignNPCToScene,
  assignInjuryToNPC
} from '../../services/api-service';

import { 
  getCharacters 
} from '../../services/api-service';

export function createScenesLogic() {
  // Состояние
  const scenes = ref([]);
  const isLoading = ref(false);
  const errors = ref({
    general: '',
    form: {}
  });
  
  // Форма создания/редактирования
  const form = ref({
    id: null,
    title: '',
    description: '',
    npcs: [],
  });

  // Дополнительные данные
  const availableNPCs = ref([]);

  // Загрузка сцен
  async function loadScenes() {
    isLoading.value = true;
    try {
      const data = await getScenes();
      scenes.value = data;
    } catch (error) {
      errors.value.general = 'Ошибка загрузки сцен';
    } finally {
      isLoading.value = false;
    }
  }

  // Загрузка NPC
  async function loadNPCs() {
    try {
      const data = await getCharacters();
      availableNPCs.value = data;
    } catch (error) {
      errors.value.general = 'Ошибка загрузки NPC';
    }
  }


  // Валидация формы
  function validateForm() {
    const newErrors = {};
    
    if (!form.value.title.trim()) {
      newErrors.title = 'Название обязательно';
    }
    
    if (!form.value.npcs.length) {
      newErrors.npcs = 'Выберите хотя бы одного NPC';
    }

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  }

  // Создание/обновление сцены
  async function saveScene() {
    errors.value.form = {};
    
    const validationErrors = validateForm();
    if (validationErrors) {
      errors.value.form = validationErrors;
      return;
    }

    try {
      if (form.value.id) {
        // Обновление
        await updateScene(form.value.id, form.value);
      } else {
        // Создание
        await createScene(form.value);
      }
      
      // Обновляем список
      await loadScenes();
      resetForm();
    } catch (error) {
      errors.value.general = 'Ошибка сохранения сцены';
    }
  }

  // Удаление сцены
  async function removeScene(id) {
    if (!confirm('Вы уверены, что хотите удалить эту сцену?')) return;
    
    try {
      await deleteScene(id);
      scenes.value = scenes.value.filter(s => s.id !== id);
    } catch (error) {
      errors.value.general = 'Ошибка удаления сцены';
    }
  }

  // Редактирование сцены
  function editScene(scene) {
    form.value = { ...scene };
  }

  // Сброс формы
  function resetForm() {
    form.value = {
      id: null,
      title: '',
      description: '',
      npcs: [],
      injuries: [],
      rewards: {
        items: [],
        xp: 0
      }
    };
  }

  // Добавление NPC
  function addNPC(npc) {
    if (!form.value.npcs.some(existing => existing.id === npc.id)) {
      form.value.npcs.push({ ...npc });
    }
  }

  // Удаление NPC
  function removeNPC(index) {
    form.value.npcs.splice(index, 1);
  }

  // Добавление травмы к NPC
  function addInjuryToNPC(npcIndex, injury) {
    if (!form.value.npcs[npcIndex].injuries) {
      form.value.npcs[npcIndex].injuries = [];
    }
    
    if (!form.value.npcs[npcIndex].injuries.some(i => i.id === injury.id)) {
      form.value.npcs[npcIndex].injuries.push({ ...injury });
    }
  }

  // Удаление травмы у NPC
  function removeInjuryFromNPC(npcIndex, injuryIndex) {
    form.value.npcs[npcIndex].injuries.splice(injuryIndex, 1);
  }

  // Добавление предмета в награду
  function addItemReward(item) {
    if (item.trim()) {
      form.value.rewards.items.push(item.trim());
    }
  }

  // Удаление предмета из награды
  function removeItemReward(index) {
    form.value.rewards.items.splice(index, 1);
  }

  return {
    scenes,
    isLoading,
    errors,
    form,
    availableNPCs,
    availableInjuries,
    loadScenes,
    saveScene,
    removeScene,
    editScene,
    resetForm,
    addNPC,
    removeNPC,
    addInjuryToNPC,
    removeInjuryFromNPC,
    addItemReward,
    removeItemReward,
    loadNPCs,
    loadInjuries
  };
}
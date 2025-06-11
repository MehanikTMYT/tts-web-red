<template>
  <div class="characters-module">
    <!-- Ошибки -->
    <div v-if="logic.errors.general" class="error">
      {{ logic.errors.general }}
    </div>

    <!-- Форма создания/редактирования -->
    <div class="character-form">
      <h3>{{ logic.form.id ? 'Редактировать' : 'Создать' }} персонажа</h3>
      
      <div class="form-group">
        <label>Имя</label>
        <input v-model="logic.form.name" />
        <span v-if="logic.errors.form.name" class="error">
          {{ logic.errors.form.name }}
        </span>
      </div>

      <!-- Характеристики -->
      <div class="stats">
        <div class="stat-row" v-for="stat in statsConfig" :key="stat.key">
          <label>{{ stat.label }}</label>
          <input type="number" v-model.number="logic.form[stat.key]" :min="0" :max="10" />
          <span v-if="logic.errors.form[stat.key]" class="error">
            {{ logic.errors.form[stat.key] }}
          </span>
        </div>
      </div>

      <button @click="logic.saveCharacter">
        {{ logic.form.id ? 'Сохранить' : 'Создать' }}
      </button>
    </div>

    <!-- Список персонажей -->
    <div class="character-list">
      <h3>Список персонажей</h3>
      
      <div v-if="logic.isLoading">Загрузка...</div>
      
      <div v-else class="character-cards">
        <div v-for="char in logic.characters" :key="char.id" class="character-card">
          <h4>{{ char.name }}</h4>
          
          <div class="char-stats">
            <div v-for="stat in statsConfig" :key="stat.key">
              {{ stat.label }}: {{ char[stat.key] }}
            </div>
          </div>
          
          <div class="actions">
            <button @click="logic.editCharacter(char)">Редактировать</button>
            <button @click="logic.removeCharacter(char.id)">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createCharactersLogic } from './characters-logic';

const logic = createCharactersLogic();

// Конфигурация характеристик для отображения
const statsConfig = [
  { key: 'int_stat', label: 'Интеллект' },
  { key: 'lck_stat', label: 'Ловкость' },
  { key: 'tech_stat', label: 'Техника' },
  { key: 'rea_stat', label: 'Реакция' },
  { key: 'luck_stat', label: 'Удача' },
  { key: 'cha_stat', label: 'Харизма' },
  { key: 'will_stat', label: 'Воля' },
  { key: 'move_stat', label: 'Скорость' },
  { key: 'body_stat', label: 'Телосложение' },
  { key: 'emp_stat', label: 'Эмпатия' }
];

// Загружаем персонажей при монтировании
logic.loadCharacters();
</script>
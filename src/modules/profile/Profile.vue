<template>
  <div class="profile-module">
    <!-- Ошибки -->
    <div v-if="logic.errors.general" class="error">
      {{ logic.errors.general }}
    </div>

    <!-- Загрузка -->
    <div v-if="logic.isLoading">Загрузка профиля...</div>

    <!-- Профиль -->
    <div v-else class="profile-content">
      <h2>Профиль</h2>
      
      <!-- Информация о пользователе -->
      <div class="user-info">
        <p><strong>Имя:</strong> {{ logic.user?.username }}</p>
        <p><strong>Email:</strong> {{ logic.user?.email }}</p>
        <p><strong>Биография:</strong> {{ logic.user?.bio || 'Не указана' }}</p>
      </div>

      <!-- Форма редактирования -->
      <div class="profile-form">
        <h3>Редактировать профиль</h3>
        
        <div class="form-group">
          <label>Имя</label>
          <input v-model="logic.form.username" />
          <span v-if="logic.errors.form.username" class="error">
            {{ logic.errors.form.username }}
          </span>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="logic.form.email" />
          <span v-if="logic.errors.form.email" class="error">
            {{ logic.errors.form.email }}
          </span>
        </div>

        <div class="form-group">
          <label>Биография</label>
          <textarea v-model="logic.form.bio"></textarea>
        </div>

        <button @click="logic.saveProfile">Сохранить изменения</button>
      </div>

      <!-- Выход -->
      <div class="logout-section">
        <button @click="logic.logout">Выйти из аккаунта</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createProfileLogic } from './profile-logic';

const logic = createProfileLogic();

// Загружаем профиль при монтировании
logic.loadProfile();
</script>
<template>
  <div class="auth-form">
    <h2>{{ logic.mode.value === 'login' ? 'Вход' : 'Восстановление пароля' }}</h2>

    <!-- Общая ошибка -->
    <div v-if="logic.errors.general" class="error">{{ logic.errors.general }}</div>

    <!-- Вход -->
    <form v-if="logic.mode.value === 'login'" @submit.prevent="handleForm">
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="logic.form.email" placeholder="Email" />
        <span v-if="logic.errors.email" class="error">{{ logic.errors.email }}</span>
      </div>

      <div class="form-group">
        <label>Пароль</label>
        <input type="password" v-model="logic.form.password" placeholder="Пароль" />
        <span v-if="logic.errors.password" class="error">{{ logic.errors.password }}</span>
      </div>

      <button type="submit">Войти</button>
      <button type="button" @click="logic.mode.value = 'forgot-password'">Забыли пароль?</button>
    </form>

    <!-- Запрос кода -->
    <form v-if="logic.mode.value === 'forgot-password'" @submit.prevent="handleForm">
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="logic.form.email" placeholder="Email" />
        <span v-if="logic.errors.email" class="error">{{ logic.errors.email }}</span>
      </div>

      <button type="submit">Получить код</button>
      <button type="button" @click="logic.mode.value = 'login'">Назад</button>
    </form>

    <!-- Подтверждение кода -->
    <form v-if="logic.mode.value === 'reset-password'" @submit.prevent="handleForm">
      <p>На {{ logic.form.email }} отправлен код</p>

      <div class="form-group">
        <label>Код из письма</label>
        <input v-model="logic.form.verificationCode" placeholder="6 цифр" />
        <span v-if="logic.errors.verificationCode" class="error">{{ logic.errors.verificationCode }}</span>
      </div>

      <button type="submit">Продолжить</button>
      <button
        type="button"
        @click="logic.sendVerificationCode"
        :disabled="logic.resendCooldown > 0"
      >
        {{ logic.resendCooldown > 0 ? `Повторно через ${logic.resendCooldown}с` : 'Отправить код повторно' }}
      </button>
    </form>

    <!-- Новый пароль -->
    <form v-if="logic.mode.value === 'new-password'" @submit.prevent="handleForm">
      <div class="form-group">
        <label>Новый пароль</label>
        <input type="password" v-model="logic.form.newPassword" placeholder="Новый пароль" />
        <span v-if="logic.errors.newPassword" class="error">{{ logic.errors.newPassword }}</span>
      </div>

      <button type="submit">Обновить пароль</button>
    </form>
  </div>
</template>

<script setup>
import { createAuthLogic } from '@/modules/auth/auth-logic';

const logic = createAuthLogic();

async function handleForm() {
  if (!logic.validateForm()) return;

  switch (logic.mode.value) {
    case 'login':
      await logic.handleLogin();
      break;
    case 'forgot-password':
      await logic.sendVerificationCode();
      break;
    case 'reset-password':
      await logic.verifyCode();
      break;
    case 'new-password':
      await logic.handleResetPassword();
      break;
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 1rem;
}
.error {
  color: red;
  font-size: 0.9em;
}
button {
  margin-right: 0.5rem;
}
</style>

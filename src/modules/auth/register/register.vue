<template>
  <div class="auth-form">
    <h2>{{ modeLabel }}</h2>
    <div v-if="errors.general" class="error">{{ errors.general }}</div>
    
    <!-- Форма регистрации -->
    <form v-if="mode === 'register'" @submit.prevent="handleForm">
      <input type="email" v-model="form.email" placeholder="Email" />
      <span v-if="errors.email" class="error">{{ errors.email }}</span>
      <button type="submit">Получить код</button>
    </form>

    <!-- Подтверждение кода -->
    <form v-if="mode === 'code'" @submit.prevent="verifyCode">
      <p>На <b>{{ form.email }}</b> отправлен код</p>
      <input v-model="form.verificationCode" placeholder="6 цифр" maxlength="6" />
      <span v-if="errors.verificationCode" class="error">{{ errors.verificationCode }}</span>
      <button type="submit">Продолжить</button>
      <button @click.prevent="sendVerificationCode" :disabled="resendCooldown > 0">Повторить код</button>
    </form>

    <!-- Установка пароля -->
    <form v-if="mode === 'password'" @submit.prevent="handleRegister">
      <input type="password" v-model="form.password" placeholder="Новый пароль" />
      <span v-if="errors.password" class="error">{{ errors.password }}</span>
      <button type="submit">Завершить регистрацию</button>
    </form>
  </div>
</template>

<script setup>
import { createAuthLogic } from '@/modules/auth/auth-logic';
const logic = createAuthLogic();
const { form, errors, mode, validateForm, sendVerificationCode, verifyCode, handleRegister } = logic;

const modeLabel = computed(() => {
  return mode.value === 'register' ? 'Регистрация' : mode.value === 'code' ? 'Подтверждение' : 'Создание пароля';
});

function handleForm() {
  if (!validateForm()) return;
  sendVerificationCode();
}
</script>
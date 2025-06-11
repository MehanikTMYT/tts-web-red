<template>
  <div class="layout">
    <nav v-if="isLoggedIn" class="navbar">
      <router-link to="/profile">Профиль</router-link>
      <router-link to="/characters">Персонажи</router-link>
      <router-link to="/injuries">Травмы и состояния</router-link>
      <router-link to="/scenes">Сцены</router-link>
      <button @click="logout">Выйти</button>
    </nav>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = localStorage.getItem('token');

function logout() {
  localStorage.removeItem('token');
  router.push('/login');
}
</script>
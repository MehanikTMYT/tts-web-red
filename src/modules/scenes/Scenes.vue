<template>
  <div class="scenes-module">
    <!-- Ошибки -->
    <div v-if="logic.errors.general" class="error">
      {{ logic.errors.general }}
    </div>

    <!-- Форма создания/редактирования -->
    <div class="scene-form">
      <h3>{{ logic.form.id ? 'Редактировать' : 'Создать' }} сцену</h3>
      
      <div class="form-group">
        <label>Название</label>
        <input v-model="logic.form.title" />
        <span v-if="logic.errors.form.title" class="error">
          {{ logic.errors.form.title }}
        </span>
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="logic.form.description"></textarea>
      </div>

      <!-- Выбор NPC -->
      <div class="form-group">
        <label>Добавить NPC</label>
        <select @change="addNPC($event.target.value)">
          <option value="">-- Выберите NPC --</option>
          <option v-for="npc in logic.availableNPCs" :key="npc.id" :value="npc.id">
            {{ npc.name }}
          </option>
        </select>
      </div>

      <!-- Список NPC в сцене -->
      <div class="npcs-list" v-if="logic.form.npcs.length">
        <h4>Участники сцены</h4>
        <div v-for="(npc, index) in logic.form.npcs" :key="npc.id" class="npc-card">
          <h5>{{ npc.name }}</h5>
          
          <!-- Травмы для NPC -->
          <div class="injuries-section">
            <label>Травмы:</label>
            <select @change="addInjuryToNPC(index, $event.target.value)">
              <option value="">-- Добавить травму --</option>
              <option v-for="injury in logic.availableInjuries" :key="injury.id" :value="injury.id">
                {{ injury.name }} ({{ injury.penalty }})
              </option>
            </select>
            
            <ul v-if="npc.injuries && npc.injuries.length">
              <li v-for="(injury, injuryIndex) in npc.injuries" :key="injury.id">
                {{ injury.name }} ({{ injury.penalty }})
                <button @click="removeInjuryFromNPC(index, injuryIndex)">Удалить</button>
              </li>
            </ul>
          </div>

          <button @click="removeNPC(index)">Удалить NPC</button>
        </div>
      </div>

      <!-- Награды -->
      <div class="rewards-section">
        <h4>Награды</h4>
        
        <div class="form-group">
          <label>Предметы</label>
          <div class="rewards-input">
            <input v-model="newItem" placeholder="Название предмета" />
            <button @click.prevent="addItemReward(newItem); newItem = ''">Добавить</button>
          </div>
          <ul v-if="logic.form.rewards.items.length">
            <li v-for="(item, index) in logic.form.rewards.items" :key="index">
              {{ item }}
              <button @click="removeItemReward(index)">Удалить</button>
            </li>
          </ul>
        </div>

        <div class="form-group">
          <label>Опыт (XP)</label>
          <input type="number" v-model.number="logic.form.rewards.xp" :min="0" />
        </div>
      </div>

      <button @click="logic.saveScene">
        {{ logic.form.id ? 'Сохранить' : 'Создать' }} сцену
      </button>
    </div>

    <!-- Список сцен -->
    <div class="scenes-list">
      <h3>Список сцен</h3>
      
      <div v-if="logic.isLoading">Загрузка...</div>
      
      <div v-else class="scene-cards">
        <div v-for="scene in logic.scenes" :key="scene.id" class="scene-card">
          <h4>{{ scene.title }}</h4>
          
          <div class="scene-details">
            <p><strong>Описание:</strong> {{ scene.description }}</p>
            
            <div v-if="scene.npcs && scene.npcs.length">
              <p><strong>Участники:</strong></p>
              <ul>
                <li v-for="npc in scene.npcs" :key="npc.id">
                  {{ npc.name }}
                  <span v-if="npc.injuries && npc.injuries.length">
                    (Травмы: {{ npc.injuries.map(i => i.name).join(', ') }})
                  </span>
                </li>
              </ul>
            </div>

            <div v-if="scene.rewards && (scene.rewards.items.length || scene.rewards.xp)">
              <p><strong>Награды:</strong></p>
              <ul>
                <li v-for="(item, index) in scene.rewards.items" :key="index">
                  {{ item }}
                </li>
                <li v-if="scene.rewards.xp">+{{ scene.rewards.xp }} XP</li>
              </ul>
            </div>
          </div>
          
          <div class="actions">
            <button @click="logic.editScene(scene)">Редактировать</button>
            <button @click="logic.removeScene(scene.id)">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createScenesLogic } from './scenes-logic';

const logic = createScenesLogic();
const newItem = ref('');

// Загружаем данные при монтировании
logic.loadScenes();
logic.loadNPCs();
logic.loadInjuries();
</script>
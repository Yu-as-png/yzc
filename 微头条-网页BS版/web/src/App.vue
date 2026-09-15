<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const q = ref('');

const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
});

function doSearch() {
  if (!q.value.trim()) return;
  router.push({ path: '/', query: { q: q.value.trim() } });
  q.value = '';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}
</script>

<template>
  <div>
    <header class="navbar">
      <div class="navbar-inner">
        <span class="logo" @click="router.push('/')" style="cursor:pointer">微头条</span>
        <nav v-if="user">
          <router-link to="/">首页</router-link>
          <router-link to="/publish">发布头条</router-link>
          <router-link to="/mine">我的头条</router-link>
          <router-link to="/profile">个人中心</router-link>
          <router-link v-if="user.role === 1" to="/admin">管理后台</router-link>
        </nav>
        <div class="nav-search" v-if="user">
          <input v-model="q" type="text" placeholder="搜索你感兴趣的内容" @keyup.enter="doSearch" />
        </div>
        <div class="nav-user" v-if="user">
          <span class="avatar" :style="{ background: '#f04142' }">{{ (user.nickname || '?').slice(0, 1) }}</span>
          <span class="nickname">{{ user.nickname }}</span>
          <span class="role-tag" v-if="user.role === 1">管理员</span>
          <a class="logout" @click="logout">退出</a>
        </div>
      </div>
    </header>
    <main class="container">
      <router-view :key="route.fullPath" />
    </main>
  </div>
</template>

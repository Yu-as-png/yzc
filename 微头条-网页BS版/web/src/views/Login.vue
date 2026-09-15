<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const route = useRoute();
const mode = ref(route.query.mode === 'register' ? 'register' : 'login');
const form = ref({ username: '', password: '', confirm: '', nickname: '' });
const err = ref('');
const loading = ref(false);

function switchMode(m) {
  mode.value = m;
  err.value = '';
}

async function submit() {
  err.value = '';
  const f = form.value;
  if (!f.username || !f.password) {
    err.value = '请输入用户名和密码';
    return;
  }
  if (mode.value === 'register') {
    if (!f.nickname) { err.value = '请输入昵称'; return; }
    if (f.password !== f.confirm) { err.value = '两次密码不一致'; return; }
  }
  loading.value = true;
  try {
    if (mode.value === 'register') {
      await api.post('/auth/register', {
        username: f.username, password: f.password, confirm: f.confirm, nickname: f.nickname,
      });
      mode.value = 'login';
      err.value = '';
      return;
    }
    const data = await api.post('/auth/login', { username: f.username, password: f.password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push(String(route.query.redirect || '/'));
  } catch (e) {
    err.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="card form">
    <h2>{{ mode === 'login' ? '登录微头条' : '注册账号' }}</h2>
    <div class="msg-tip err" v-if="err">{{ err }}</div>
    <div class="form-item">
      <label>用户名</label>
      <input v-model.trim="form.username" placeholder="请输入用户名" />
    </div>
    <div class="form-item" v-if="mode === 'register'">
      <label>昵称</label>
      <input v-model.trim="form.nickname" placeholder="请输入昵称" />
    </div>
    <div class="form-item">
      <label>密码</label>
      <input v-model.trim="form.password" type="password" placeholder="请输入密码" />
    </div>
    <div class="form-item" v-if="mode === 'register'">
      <label>确认密码</label>
      <input v-model.trim="form.confirm" type="password" placeholder="请再次输入密码" />
    </div>
    <button class="btn block" :disabled="loading" @click="submit">
      {{ loading ? '提交中...' : mode === 'login' ? '登 录' : '注 册' }}
    </button>
    <p style="margin-top:14px; text-align:center; font-size:14px; color:var(--text-light)">
      <template v-if="mode === 'login'">
        还没有账号？<a @click="switchMode('register')" style="cursor:pointer">去注册</a>
      </template>
      <template v-else>
        已有账号？<a @click="switchMode('login')" style="cursor:pointer">去登录</a>
      </template>
    </p>
  </div>
</template>

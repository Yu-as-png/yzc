<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const profile = ref(null);
const form = ref({ oldPassword: '', newPassword: '', confirm: '' });
const err = ref('');
const okMsg = ref('');

async function load() {
  profile.value = await api.get('/auth/profile');
}

async function changePassword() {
  err.value = '';
  okMsg.value = '';
  const f = form.value;
  if (!f.oldPassword || !f.newPassword || !f.confirm) { err.value = '请填写完整'; return; }
  if (f.newPassword !== f.confirm) { err.value = '两次新密码不一致'; return; }
  try {
    await api.put('/auth/password', f);
    okMsg.value = '密码修改成功，请重新登录';
    form.value = { oldPassword: '', newPassword: '', confirm: '' };
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }, 1500);
  } catch (e) {
    err.value = e.message;
  }
}

onMounted(load);
</script>

<template>
  <h2 class="page-title">个人中心</h2>
  <div class="card" v-if="profile">
    <table class="table">
      <tr><td class="muted" style="width:120px">用户名</td><td>{{ profile.username }}</td></tr>
      <tr><td class="muted">昵称</td><td>{{ profile.nickname }}</td></tr>
      <tr><td class="muted">角色</td><td>{{ profile.role === 1 ? '管理员' : '普通用户' }}</td></tr>
      <tr><td class="muted">注册时间</td><td>{{ profile.create_time }}</td></tr>
    </table>
  </div>

  <div class="card" style="max-width:460px">
    <h3 style="margin-bottom:14px">修改密码</h3>
    <div class="msg-tip err" v-if="err">{{ err }}</div>
    <div class="msg-tip ok" v-if="okMsg">{{ okMsg }}</div>
    <div class="form-item">
      <label>旧密码</label>
      <input v-model="form.oldPassword" type="password" />
    </div>
    <div class="form-item">
      <label>新密码</label>
      <input v-model="form.newPassword" type="password" />
    </div>
    <div class="form-item">
      <label>确认新密码</label>
      <input v-model="form.confirm" type="password" />
    </div>
    <button class="btn" @click="changePassword">修改密码</button>
  </div>
</template>

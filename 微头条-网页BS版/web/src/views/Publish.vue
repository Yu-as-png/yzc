<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const types = ref([]);
const form = ref({ title: '', content: '', typeId: '' });
const err = ref('');
const loading = ref(false);

onMounted(async () => {
  types.value = await api.get('/types');
  if (types.value.length) form.value.typeId = types.value[0].id;
});

async function submit() {
  err.value = '';
  const f = form.value;
  if (!f.title.trim()) { err.value = '标题不能为空'; return; }
  if (!f.content.trim()) { err.value = '内容不能为空'; return; }
  if (f.content.length > 5000) { err.value = '内容不能超过 5000 字'; return; }
  if (!f.typeId) { err.value = '请选择类型'; return; }
  loading.value = true;
  try {
    const data = await api.post('/headlines', { title: f.title, content: f.content, typeId: Number(f.typeId) });
    router.push('/headlines/' + data.id);
  } catch (e) {
    err.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <h2 class="page-title">发布头条</h2>
  <div class="card">
    <div class="msg-tip err" v-if="err">{{ err }}</div>
    <div class="form-item">
      <label>标题</label>
      <input v-model.trim="form.title" maxlength="100" placeholder="请输入标题" />
    </div>
    <div class="form-item">
      <label>类型</label>
      <select v-model="form.typeId">
        <option v-for="t in types" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>
    <div class="form-item">
      <label>内容（{{ form.content.length }}/5000）</label>
      <textarea v-model="form.content" rows="12" placeholder="请输入内容（不超过 5000 字）"></textarea>
    </div>
    <button class="btn" :disabled="loading" @click="submit">{{ loading ? '发布中...' : '发布' }}</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api';

const types = ref([]);
const list = ref([]);
const total = ref(0);
const keyword = ref('');
const typeId = ref('');
const page = ref(1);
const pageSize = 10;
const err = ref('');
const okMsg = ref('');

const me = computed(() => JSON.parse(localStorage.getItem('user') || 'null'));

// 编辑弹层状态
const editing = ref(null); // {id, title, content}

async function load() {
  err.value = '';
  const params = new URLSearchParams();
  params.set('uid', String(me.value.id));
  if (keyword.value) params.set('keyword', keyword.value);
  if (typeId.value) params.set('typeId', String(typeId.value));
  params.set('page', String(page.value));
  params.set('pageSize', String(pageSize));
  try {
    const data = await api.get('/headlines?' + params.toString());
    list.value = data.list;
    total.value = data.total;
  } catch (e) {
    err.value = e.message;
  }
}

function search() { page.value = 1; load(); }
function prev() { if (page.value > 1) { page.value--; load(); } }
function next() { if (page.value * pageSize < total.value) { page.value++; load(); } }

async function removeOne(h) {
  if (!confirm(`确认删除头条「${h.title}」？相关点赞和评论将一并删除！`)) return;
  try {
    await api.del('/headlines/' + h.id);
    okMsg.value = '删除成功';
    load();
  } catch (e) {
    err.value = e.message;
  }
}

function startEdit(h) {
  editing.value = { id: h.id, title: h.title, content: h.content, typeName: h.typeName };
}

async function saveEdit() {
  const e = editing.value;
  if (!e.title.trim()) { err.value = '标题不能为空'; return; }
  if (e.content.length > 5000) { err.value = '内容不能超过 5000 字'; return; }
  try {
    await api.put('/headlines/' + e.id, { title: e.title, content: e.content });
    editing.value = null;
    okMsg.value = '修改成功';
    load();
  } catch (e2) {
    err.value = e2.message;
  }
}

onMounted(async () => {
  types.value = await api.get('/types');
  load();
});
</script>

<template>
  <h2 class="page-title">我的头条</h2>
  <div class="toolbar">
    <input type="text" v-model.trim="keyword" placeholder="搜索我的头条..." @keyup.enter="search" />
    <select v-model="typeId" @change="search">
      <option value="">全部类型</option>
      <option v-for="t in types" :key="t.id" :value="t.id">{{ t.name }}</option>
    </select>
    <button class="btn" @click="search">查询</button>
  </div>

  <div class="msg-tip err" v-if="err">{{ err }}</div>
  <div class="msg-tip ok" v-if="okMsg">{{ okMsg }}</div>

  <div v-if="list.length === 0" class="card empty">暂无发布的头条</div>

  <div class="card" v-for="h in list" :key="h.id">
    <template v-if="editing && editing.id === h.id">
      <div class="form-item">
        <label>标题</label>
        <input v-model="editing.title" />
      </div>
      <div class="form-item">
        <label>内容（类型「{{ editing.typeName }}」不可修改，{{ editing.content.length }}/5000）</label>
        <textarea v-model="editing.content" rows="6"></textarea>
      </div>
      <button class="btn" @click="saveEdit">保存</button>
      <button class="btn ghost" style="margin-left:8px" @click="editing = null">取消</button>
    </template>
    <template v-else>
      <router-link :to="'/headlines/' + h.id"><h3>{{ h.title }}</h3></router-link>
      <div class="headline-meta" style="margin:8px 0">
        <span class="type-tag">{{ h.typeName }}</span>
        <span>{{ h.create_time }}</span>
        
        
        
      </div>
      <div style="display:flex; gap:10px">
        <button class="btn small ghost" @click="startEdit(h)">修改</button>
        <button class="btn small danger" @click="removeOne(h)">删除</button>
      </div>
    </template>
  </div>

  <div class="pager" v-if="total > pageSize">
    <button class="btn ghost small" :disabled="page <= 1" @click="prev">上一页</button>
    <span>第 {{ page }} 页 / 共 {{ Math.ceil(total / pageSize) }} 页</span>
    <button class="btn ghost small" :disabled="page * pageSize >= total" @click="next">下一页</button>
  </div>
</template>

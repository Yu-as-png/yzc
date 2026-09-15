<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api';

const tab = ref('users');
const err = ref('');
const okMsg = ref('');

const me = computed(() => JSON.parse(localStorage.getItem('user') || 'null'));

// 用户
const users = ref([]);
// 头条管理
const headlines = ref([]);
const hKeyword = ref('');
const hUid = ref('');
// 类型
const types = ref([]);
const newType = ref('');
const editingType = ref(null); // {id, name}
// 公告
const notices = ref([]);
const noticeForm = ref({ title: '', content: '', remark: '' });
const editingNotice = ref(null);
// 排行
const hotList = ref([]);
const hotTotal = ref(0);
const hotSort = ref('like');
const hotPage = ref(1);
const hotPageSize = 10;
// 评论管理
const comments = ref([]);
const cHid = ref('');
const cUid = ref('');
const cKeyword = ref('');
// 头条编辑
const editingHeadline = ref(null);
// 用户排行
const statUsers = ref([]);

function flash(msg) { okMsg.value = msg; setTimeout(() => (okMsg.value = ''), 1500); }
function fail(e) { err.value = e.message; setTimeout(() => (err.value = ''), 2500); }

async function loadUsers() { users.value = await api.get('/users'); statUsers.value = await api.get('/stats/users'); }

async function loadHeadlines() {
  const params = new URLSearchParams();
  if (hKeyword.value) params.set('keyword', hKeyword.value);
  if (hUid.value) params.set('uid', hUid.value);
  headlines.value = await api.get('/admin/headlines?' + params.toString());
}

async function loadTypes() { types.value = await api.get('/types'); }

async function addType() {
  if (!newType.value.trim()) return;
  try {
    await api.post('/types', { name: newType.value.trim() });
    newType.value = '';
    flash('类型添加成功');
    loadTypes();
  } catch (e) { fail(e); }
}

async function saveType() {
  try {
    await api.put('/types/' + editingType.value.id, { name: editingType.value.name.trim() });
    editingType.value = null;
    flash('类型修改成功');
    loadTypes();
  } catch (e) { fail(e); }
}

async function removeType(t) {
  if (!confirm(`确认删除类型「${t.name}」？`)) return;
  try {
    await api.del('/types/' + t.id);
    flash('类型删除成功');
    loadTypes();
  } catch (e) { fail(e); }
}

async function loadNotices() { notices.value = await api.get('/notices'); }

async function addNotice() {
  const f = noticeForm.value;
  if (!f.title.trim() || !f.content.trim()) { fail(new Error('标题和内容不能为空')); return; }
  try {
    await api.post('/notices', { ...f });
    noticeForm.value = { title: '', content: '', remark: '' };
    flash('公告发布成功');
    loadNotices();
  } catch (e) { fail(e); }
}

async function saveNotice() {
  try {
    await api.put('/notices/' + editingNotice.value.id, editingNotice.value);
    editingNotice.value = null;
    flash('公告修改成功');
    loadNotices();
  } catch (e) { fail(e); }
}

async function removeNotice(n) {
  if (!confirm(`确认删除公告「${n.title}」？`)) return;
  try {
    await api.del('/notices/' + n.id);
    flash('公告删除成功');
    loadNotices();
  } catch (e) { fail(e); }
}

async function loadHot() {
  const params = new URLSearchParams({ sort: hotSort.value, page: String(hotPage.value), pageSize: String(hotPageSize) });
  const data = await api.get('/stats/hot?' + params.toString());
  hotList.value = data.list;
  hotTotal.value = data.total;
}

async function loadComments() {
  const params = new URLSearchParams();
  if (cHid.value) params.set('hid', cHid.value);
  if (cUid.value) params.set('uid', cUid.value);
  if (cKeyword.value) params.set('keyword', cKeyword.value);
  comments.value = await api.get('/admin/comments?' + params.toString());
}

async function removeComment(c) {
  if (!confirm(`确认删除该评论（${(c.content || '').slice(0, 20)}...）？`)) return;
  try {
    await api.del('/comments/' + c.id);
    flash('评论删除成功');
    loadComments();
  } catch (e) { fail(e); }
}

async function removeHeadline(h) {
  if (!confirm(`确认删除头条「${h.title}」？`)) return;
  try {
    await api.del('/headlines/' + h.id);
    flash('头条删除成功');
    loadHeadlines();
  } catch (e) { fail(e); }
}

function startEditHeadline(h) {
  editingHeadline.value = { id: h.id, title: h.title, content: h.content, typeId: h.typeId };
}

async function saveHeadline() {
  const e = editingHeadline.value;
  try {
    await api.put('/headlines/' + e.id, { title: e.title, content: e.content, typeId: Number(e.typeId) });
    editingHeadline.value = null;
    flash('头条修改成功');
    loadHeadlines();
  } catch (e2) { fail(e2); }
}

function switchTab(t) {
  tab.value = t;
  err.value = '';
  ({
    users: loadUsers,
    headlines: loadHeadlines,
    types: loadTypes,
    notices: loadNotices,
    hot: loadHot,
    comments: loadComments,
  }[t]());
}

onMounted(() => {
  if (me.value && me.value.role !== 1) return;
  loadUsers();
});
</script>

<template>
  <h2 class="page-title">管理员面板</h2>

  <div class="tabs">
    <button :class="{ active: tab === 'users' }" @click="switchTab('users')">用户列表</button>
    <button :class="{ active: tab === 'headlines' }" @click="switchTab('headlines')">头条管理</button>
    <button :class="{ active: tab === 'types' }" @click="switchTab('types')">类型管理</button>
    <button :class="{ active: tab === 'notices' }" @click="switchTab('notices')">公告管理</button>
    <button :class="{ active: tab === 'hot' }" @click="switchTab('hot')">热门排行</button>
    <button :class="{ active: tab === 'comments' }" @click="switchTab('comments')">评论管理</button>
  </div>

  <div class="msg-tip err" v-if="err">{{ err }}</div>
  <div class="msg-tip ok" v-if="okMsg">{{ okMsg }}</div>

  <!-- 用户列表 -->
  <div class="card" v-if="tab === 'users'">
    <table class="table">
      <thead><tr><th>ID</th><th>用户名</th><th>昵称</th><th>角色</th><th>注册时间</th><th>发布数</th><th>评论数</th><th>获赞数</th><th>活跃度</th></tr></thead>
      <tbody>
        <tr v-for="s in statUsers" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.username }}</td>
          <td>{{ s.nickname }}</td>
          <td>{{ s.role === 1 ? '管理员' : '普通用户' }}</td>
          <td>{{ (users.find(u => u.id === s.id) || {}).create_time }}</td>
          <td>{{ s.headlines }}</td>
          <td>{{ s.comments }}</td>
          <td>{{ s.likes }}</td>
          <td><b>{{ s.activity }}</b></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 头条管理 -->
  <div class="card" v-if="tab === 'headlines'">
    <div class="toolbar">
      <input type="text" v-model.trim="hKeyword" placeholder="标题/作者关键字" @keyup.enter="loadHeadlines" />
      <input type="text" v-model.trim="hUid" placeholder="发布者用户ID" style="max-width:140px" @keyup.enter="loadHeadlines" />
      <button class="btn" @click="loadHeadlines">查询</button>
    </div>
    <div v-for="h in headlines" :key="h.id" style="padding:12px 0; border-bottom:1px solid var(--border)">
      <template v-if="editingHeadline && editingHeadline.id === h.id">
        <div class="form-item"><label>标题</label><input v-model="editingHeadline.title" /></div>
        <div class="form-item"><label>内容</label><textarea v-model="editingHeadline.content" rows="4"></textarea></div>
        <div class="form-item"><label>类型</label>
          <select v-model="editingHeadline.typeId">
            <option v-for="t in types" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <button class="btn small" @click="saveHeadline">保存</button>
        <button class="btn small ghost" style="margin-left:8px" @click="editingHeadline = null">取消</button>
      </template>
      <template v-else>
        <div><b>{{ h.title }}</b> <span class="muted">（{{ h.author }} · {{ h.create_time }}）</span></div>
        <div class="muted" style="margin:6px 0">阅读 {{ h.view_count }} · 赞 {{ h.like_count }} · 评论 {{ h.comment_count }}</div>
        <button class="btn small ghost" @click="startEditHeadline(h)">修改</button>
        <button class="btn small danger" style="margin-left:8px" @click="removeHeadline(h)">删除</button>
      </template>
    </div>
    <div v-if="headlines.length === 0" class="empty">暂无数据</div>
  </div>

  <!-- 类型管理 -->
  <div class="card" v-if="tab === 'types'">
    <div class="toolbar">
      <input type="text" v-model.trim="newType" placeholder="新类型名称" @keyup.enter="addType" />
      <button class="btn" @click="addType">添加类型</button>
    </div>
    <table class="table">
      <thead><tr><th>ID</th><th>名称</th><th style="width:200px">操作</th></tr></thead>
      <tbody>
        <tr v-for="t in types" :key="t.id">
          <td>{{ t.id }}</td>
          <td>
            <template v-if="editingType && editingType.id === t.id">
              <input v-model="editingType.name" style="padding:5px 8px; border:1px solid var(--border); border-radius:6px" />
            </template>
            <template v-else>{{ t.name }}</template>
          </td>
          <td>
            <template v-if="editingType && editingType.id === t.id">
              <button class="btn small" @click="saveType">保存</button>
              <button class="btn small ghost" style="margin-left:6px" @click="editingType = null">取消</button>
            </template>
            <template v-else>
              <button class="btn small ghost" @click="editingType = { id: t.id, name: t.name }">修改</button>
              <button class="btn small danger" style="margin-left:6px" @click="removeType(t)">删除</button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 公告管理 -->
  <div class="card" v-if="tab === 'notices'">
    <h3 style="margin-bottom:12px">发布新公告</h3>
    <div class="form-item"><label>标题</label><input v-model="noticeForm.title" /></div>
    <div class="form-item"><label>内容</label><textarea v-model="noticeForm.content" rows="3"></textarea></div>
    <div class="form-item"><label>备注（可选）</label><input v-model="noticeForm.remark" /></div>
    <button class="btn" @click="addNotice">发布公告</button>
    <hr style="margin:18px 0; border:none; border-top:1px solid var(--border)" />
    <div v-for="n in notices" :key="n.id" style="padding:12px 0; border-bottom:1px solid var(--border)">
      <template v-if="editingNotice && editingNotice.id === n.id">
        <div class="form-item"><label>标题</label><input v-model="editingNotice.title" /></div>
        <div class="form-item"><label>内容</label><textarea v-model="editingNotice.content" rows="3"></textarea></div>
        <div class="form-item"><label>备注</label><input v-model="editingNotice.remark" /></div>
        <button class="btn small" @click="saveNotice">保存</button>
        <button class="btn small ghost" style="margin-left:6px" @click="editingNotice = null">取消</button>
      </template>
      <template v-else>
        <div><b>{{ n.title }}</b> <span class="muted">{{ n.create_time }} {{ n.remark ? '· ' + n.remark : '' }}</span></div>
        <p class="muted" style="margin:6px 0">{{ n.content }}</p>
        <button class="btn small ghost" @click="editingNotice = { ...n }">修改</button>
        <button class="btn small danger" style="margin-left:6px" @click="removeNotice(n)">删除</button>
      </template>
    </div>
  </div>

  <!-- 热门排行 -->
  <div class="card" v-if="tab === 'hot'">
    <div class="toolbar">
      <select v-model="hotSort" @change="hotPage = 1; loadHot()">
        <option value="like">按点赞数</option>
        <option value="comment">按评论数</option>
        <option value="view">按浏览数</option>
      </select>
    </div>
    <table class="table">
      <thead><tr><th>排名</th><th>标题</th><th>作者</th><th>类型</th><th>浏览</th><th>点赞</th><th>评论</th></tr></thead>
      <tbody>
        <tr v-for="h in hotList" :key="h.id">
          <td><b :style="{ color: h.rank <= 3 ? 'var(--primary)' : '' }">{{ h.rank }}</b></td>
          <td><router-link :to="'/headlines/' + h.id">{{ h.title }}</router-link></td>
          <td>{{ h.author }}</td>
          <td>{{ h.typeName }}</td>
          <td>{{ h.view_count }}</td>
          <td>{{ h.like_count }}</td>
          <td>{{ h.comment_count }}</td>
        </tr>
      </tbody>
    </table>
    <div class="pager" v-if="hotTotal > hotPageSize">
      <button class="btn ghost small" :disabled="hotPage <= 1" @click="hotPage--; loadHot()">上一页</button>
      <span>第 {{ hotPage }} 页 / 共 {{ Math.ceil(hotTotal / hotPageSize) }} 页</span>
      <button class="btn ghost small" :disabled="hotPage * hotPageSize >= hotTotal" @click="hotPage++; loadHot()">下一页</button>
    </div>
  </div>

  <!-- 评论管理 -->
  <div class="card" v-if="tab === 'comments'">
    <div class="toolbar">
      <input type="text" v-model.trim="cHid" placeholder="头条ID" style="max-width:110px" @keyup.enter="loadComments" />
      <input type="text" v-model.trim="cUid" placeholder="用户ID" style="max-width:110px" @keyup.enter="loadComments" />
      <input type="text" v-model.trim="cKeyword" placeholder="评论内容/作者关键字" @keyup.enter="loadComments" />
      <button class="btn" @click="loadComments">筛选</button>
    </div>
    <table class="table">
      <thead><tr><th>ID</th><th>头条ID</th><th>作者</th><th>内容</th><th>回复目标</th><th>时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="c in comments" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.hid }}</td>
          <td>{{ c.author }}</td>
          <td>{{ c.content }}</td>
          <td>{{ c.parent_cid === 0 ? '—' : '#' + c.parent_cid }}</td>
          <td>{{ c.create_time }}</td>
          <td><button class="btn small danger" @click="removeComment(c)">删除</button></td>
        </tr>
      </tbody>
    </table>
    <div v-if="comments.length === 0" class="empty">暂无数据</div>
  </div>
</template>

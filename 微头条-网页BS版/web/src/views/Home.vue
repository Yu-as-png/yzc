<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const notices = ref([]);
const types = ref([]);
const list = ref([]);
const hot = ref([]);
const total = ref(0);
const keyword = ref('');
const typeId = ref('');
const sort = ref('time');
const page = ref(1);
const pageSize = 10;
const err = ref('');

const avatarColor = (name) => {
  const colors = ['#f04142', '#2f7ff5', '#00b96b', '#fa8c16', '#722ed1', '#13c2c2'];
  let s = 0;
  for (const ch of String(name)) s += ch.charCodeAt(0);
  return colors[s % colors.length];
};
const shortTime = (t) => String(t || '').slice(5, 16);

async function load() {
  try {
    const params = new URLSearchParams();
    if (keyword.value) params.set('keyword', keyword.value);
    if (typeId.value) params.set('typeId', String(typeId.value));
    params.set('sort', sort.value);
    params.set('page', String(page.value));
    params.set('pageSize', String(pageSize));
    const data = await api.get('/headlines?' + params.toString());
    list.value = data.list;
    total.value = data.total;
  } catch (e) {
    err.value = e.message;
  }
}

function search() {
  page.value = 1;
  load();
}

function pickChannel(id) {
  typeId.value = id;
  page.value = 1;
  load();
}

function prev() { if (page.value > 1) { page.value--; load(); } }
function next() { if (page.value * pageSize < total.value) { page.value++; load(); } }

onMounted(async () => {
  if (route.query.q) keyword.value = String(route.query.q);
  try {
    const [n, t, h] = await Promise.all([
      api.get('/notices'),
      api.get('/types'),
      api.get('/headlines?sort=like&page=1&pageSize=10'),
    ]);
    notices.value = n;
    types.value = t;
    hot.value = h.list;
  } catch (e) {
    err.value = e.message;
  }
  load();
});

const noticeKeyword = ref('');
const noticeList = ref([]);
const showNotices = ref(false);
const searchNotices = async () => {
  try {
    noticeList.value = await api.get('/notices', { keyword: noticeKeyword.value });
    showNotices.value = true;
  } catch (e) {
    err.value = e.message;
  }
};
</script>

<template>
  <div class="tt-layout">
    <!-- 左栏：频道 + 信息流 -->
    <div class="tt-main">
      <div class="channel-bar">
        <div class="channel-scroll">
          <span class="channel" :class="{ on: typeId === '' }" @click="pickChannel('')">推荐</span>
          <span v-for="t in types" :key="t.id" class="channel" :class="{ on: typeId === t.id }" @click="pickChannel(t.id)">{{ t.name }}</span>
        </div>
        <select v-model="sort" class="sort-mini" @change="search">
          <option value="time">最新发布</option>
          <option value="like">按点赞数</option>
          <option value="comment">按评论数</option>
          <option value="view">按浏览量</option>
        </select>
      </div>

      <div class="search-row" v-if="keyword">
        <span class="muted">“{{ keyword }}” 的搜索结果 · {{ total }} 条</span>
        <a class="clear-kw" @click="keyword = ''; search()">清除</a>
      </div>

      <div class="msg-tip err" v-if="err">{{ err }}</div>

      <div class="feed">
        <router-link v-for="h in list" :key="h.id" class="feed-item" :to="'/headlines/' + h.id">
          <div class="feed-body">
            <div class="feed-title">{{ h.title }}</div>
            <div class="feed-meta">
              <span class="author-dot" :style="{ background: avatarColor(h.author) }"></span>
              <span>{{ h.author }}</span>
              <span class="sep">·</span>
              <span>评论 {{ h.comment_count }}</span>
              <span class="sep">·</span>
              <span>赞 {{ h.like_count }}</span>
              <span class="sep">·</span>
              <span>{{ shortTime(h.create_time) }}</span>
              <span class="type-tag">{{ h.typeName }}</span>
            </div>
          </div>
          <div class="feed-stat">
            <b>{{ h.view_count }}</b>
            <i>阅读</i>
          </div>
        </router-link>
        <div v-if="!list.length && !err" class="empty">暂时没有更多内容了</div>
      </div>

      <div class="pager" v-if="total > pageSize">
        <button class="btn ghost small" :disabled="page <= 1" @click="prev">上一页</button>
        <span>{{ page }} / {{ Math.ceil(total / pageSize) }} 页 · 共 {{ total }} 条</span>
        <button class="btn ghost small" :disabled="page * pageSize >= total" @click="next">下一页</button>
      </div>
    </div>

    <!-- 右栏：热榜 + 公告 -->
    <aside class="tt-aside">
      <div class="side-card" v-if="hot.length">
        <div class="side-head"><span class="hot-icon"></span>热榜</div>
        <router-link v-for="(h, i) in hot" :key="h.id" class="hot-item" :to="'/headlines/' + h.id">
          <span class="hot-rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <span class="hot-title">{{ h.title }}</span>
          <span class="hot-count">{{ h.like_count }}赞</span>
        </router-link>
      </div>

      <div class="side-card" v-if="notices.length">
        <div class="side-head">公告</div>
        <div v-for="n in notices.slice(0, 3)" :key="n.id" class="notice-item">
          <div class="notice-t">{{ n.title }}</div>
          <div class="notice-c">{{ n.content }}</div>
          <div class="muted">{{ shortTime(n.create_time) }}</div>
        </div>
        <a class="more-link" @click="showNotices = !showNotices; showNotices && !noticeList.length && searchNotices()">
          {{ showNotices ? '收起' : '查看全部 / 搜索公告' }}
        </a>
        <div v-if="showNotices" class="notice-search">
          <input type="text" v-model.trim="noticeKeyword" placeholder="搜索公告标题/内容" @keyup.enter="searchNotices" />
          <div v-for="n in noticeList" :key="n.id" class="notice-item">
            <div class="notice-t">{{ n.title }}</div>
            <div class="notice-c">{{ n.content }}</div>
          </div>
          <p v-if="!noticeList.length" class="muted">暂无匹配公告</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const id = Number(route.params.id);
const headline = ref(null);
const comments = ref([]);
const types = ref([]);
const err = ref('');
const content = ref('');
const replyTo = ref(null); // {id, author}

const me = computed(() => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
});

const topComments = computed(() => comments.value.filter((c) => c.parent_cid === 0));
function childrenOf(cid) { return comments.value.filter((c) => c.parent_cid === cid); }

const avatarColor = (name) => {
  const colors = ['#f04142', '#2f7ff5', '#00b96b', '#fa8c16', '#722ed1', '#13c2c2'];
  let s = 0;
  for (const ch of String(name)) s += ch.charCodeAt(0);
  return colors[s % colors.length];
};
const shortTime = (t) => String(t || '').slice(5, 16);

async function loadDetail() {
  headline.value = await api.get('/headlines/' + id);
}

async function loadComments() {
  comments.value = await api.get('/headlines/' + id + '/comments');
}

async function toggleLike() {
  if (!me.value) return;
  try {
    const data = await api.post(`/headlines/${id}/like`);
    headline.value.liked = data.liked;
    headline.value.like_count = data.likeCount;
  } catch (e) {
    err.value = e.message;
  }
}

async function submitComment() {
  err.value = '';
  if (!content.value.trim()) { err.value = '评论内容不能为空'; return; }
  if (content.value.length > 500) { err.value = '评论不能超过 500 字'; return; }
  try {
    await api.post(`/headlines/${id}/comments`, {
      content: content.value,
      parentCid: replyTo.value ? replyTo.value.id : 0,
    });
    content.value = '';
    replyTo.value = null;
    await loadComments();
    headline.value.comment_count = comments.value.length;
  } catch (e) {
    err.value = e.message;
  }
}

async function removeComment(cid) {
  if (!confirm('确认删除该评论？（其下回复也会被删除）')) return;
  try {
    await api.del('/comments/' + cid);
    await loadComments();
    headline.value.comment_count = comments.value.length;
  } catch (e) {
    err.value = e.message;
  }
}

onMounted(async () => {
  types.value = await api.get('/types');
  await loadDetail();
  await loadComments();
});
</script>

<template>
  <div v-if="headline" class="detail-wrap">
    <div class="card detail-article">
      <div class="msg-tip err" v-if="err">{{ err }}</div>
      <h1 class="detail-title">{{ headline.title }}</h1>
      <div class="author-bar">
        <span class="avatar" :style="{ background: avatarColor(headline.author) }">{{ (headline.author || '?').slice(0, 1) }}</span>
        <div class="author-info">
          <div class="author-name">{{ headline.author }}</div>
          <div class="muted">{{ shortTime(headline.create_time) }} · 阅读 {{ headline.view_count }}</div>
        </div>
        <span class="type-tag">{{ (types.find(t => t.id === headline.typeId) || {}).name || '' }}</span>
      </div>
      <div class="detail-content">{{ headline.content }}</div>
      <div class="article-actions">
        <button v-if="me" class="btn like-btn" :class="{ liked: headline.liked }" @click="toggleLike">
          {{ headline.liked ? '已赞' : '点赞' }} {{ headline.like_count }}
        </button>
        <span v-else class="muted"><router-link to="/login">登录</router-link> 后可点赞评论</span>
      </div>
    </div>

    <div class="card">
      <h3 class="comment-title">全部评论（{{ comments.length }}）</h3>

      <div v-if="me" class="comment-box">
        <div v-if="replyTo" class="muted" style="margin-bottom:6px">
          回复 <b style="color:#f04142">@{{ replyTo.author }}</b>
          <a style="cursor:pointer; margin-left:8px" @click="replyTo = null">取消回复</a>
        </div>
        <div class="form-item">
          <textarea v-model="content" rows="3" placeholder="写下你的评论…"></textarea>
        </div>
        <button class="btn" @click="submitComment">发布</button>
      </div>

      <div v-if="comments.length === 0" class="empty">还没有评论，来说两句吧</div>

      <div class="comment-item" v-for="c in topComments" :key="c.id">
        <span class="avatar sm" :style="{ background: avatarColor(c.author) }">{{ (c.author || '?').slice(0, 1) }}</span>
        <div class="comment-main">
          <div class="comment-head">
            <span class="author">{{ c.author }}</span>
            <span>{{ shortTime(c.create_time) }}</span>
          </div>
          <div class="comment-content">{{ c.content }}</div>
          <div class="comment-actions">
            <a v-if="me" @click="replyTo = { id: c.id, author: c.author }">回复</a>
            <a v-if="me && (me.id === c.uid || me.role === 1)" @click="removeComment(c.id)">删除</a>
          </div>
          <div class="comment-children" v-if="childrenOf(c.id).length">
            <div v-for="sub in childrenOf(c.id)" :key="sub.id" class="comment-sub">
              <div class="comment-head">
                <span class="author">{{ sub.author }}</span>
                <span>回复 @{{ c.author }}</span>
                <span>{{ shortTime(sub.create_time) }}</span>
              </div>
              <div class="comment-content">{{ sub.content }}</div>
              <div class="comment-actions">
                <a v-if="me && (me.id === sub.uid || me.role === 1)" @click="removeComment(sub.id)">删除</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

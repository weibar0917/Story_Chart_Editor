<script setup lang="ts">
import type { Chapter } from '../types';

defineProps<{
  chapters: Chapter[];
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [chapter: Chapter];
  delete: [chapterId: string];
}>();
</script>

<template>
  <div class="chapter-list-container">
    <div class="sidebar-header">
      <h2>📚 章节列表</h2>
    </div>
    <div class="chapter-list">
      <div
        v-for="chapter in chapters"
        :key="chapter.id"
        class="chapter-item"
        :class="{ active: chapter.id === selectedId }"
        @click="emit('select', chapter)"
      >
        <div class="chapter-title">{{ chapter.title }}</div>
        <div class="chapter-desc">{{ chapter.description }}</div>
        <div class="chapter-meta">
          <span>{{ chapter.nodes.length }} 个节点</span>
          <button
            class="btn-delete"
            @click.stop="emit('delete', chapter.id)"
          >删除</button>
        </div>
      </div>
      <div v-if="chapters.length === 0" class="empty-chapters">
        <p>暂无章节，点击「新建章节」开始</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chapter-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.sidebar-header h2 {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.chapter-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chapter-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.chapter-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(102,126,234,0.2);
}

.chapter-item.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
}

.chapter-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.chapter-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.chapter-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.btn-delete {
  background: #ff4757;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.btn-delete:hover {
  background: #ff6b81;
}

.empty-chapters {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
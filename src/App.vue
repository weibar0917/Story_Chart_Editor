<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStoryStore } from './store';
import StoryChartEditor from './components/StoryChartEditor.vue';
import ChapterList from './components/ChapterList.vue';
import NodeEditor from './components/NodeEditor.vue';
import type { Chapter, StoryNode } from './types';

const store = useStoryStore();
const selectedChapterId = ref<string | null>(null);
const selectedNodeId = ref<string | null>(null);
const showNodeEditor = ref(false);
const chartEditorRef = ref<InstanceType<typeof StoryChartEditor> | null>(null);

const selectedChapter = computed(() => {
  if (!selectedChapterId.value) return null;
  return store.getChapter(selectedChapterId.value);
});

const selectedNode = computed(() => {
  if (!selectedChapterId.value || !selectedNodeId.value) return null;
  return store.getNode(selectedChapterId.value, selectedNodeId.value);
});

onMounted(() => {
  store.initDemo();
  if (store.state.chapters.length > 0) {
    selectedChapterId.value = store.state.chapters[0].id;
  }
});

function handleChapterSelect(chapter: Chapter) {
  selectedChapterId.value = chapter.id;
  selectedNodeId.value = null;
  showNodeEditor.value = false;
}

function handleNodeSelect(node: StoryNode) {
  selectedNodeId.value = node.id;
  showNodeEditor.value = true;
}

function handleCreateChapter() {
  const chapter = store.createChapter('新章节', '点击添加描述...');
  selectedChapterId.value = chapter.id;
  selectedNodeId.value = null;
  showNodeEditor.value = false;
}

function handleAddNode() {
  if (!selectedChapterId.value) return;
  const node = store.addNode(selectedChapterId.value);
  selectedNodeId.value = node.id;
  showNodeEditor.value = true;
}

function handleDeleteChapter(chapterId: string) {
  store.deleteChapter(chapterId);
  if (selectedChapterId.value === chapterId) {
    selectedChapterId.value = store.state.chapters.length > 0 ? store.state.chapters[0].id : null;
    selectedNodeId.value = null;
    showNodeEditor.value = false;
  }
}

function handleDeleteNode(nodeId: string) {
  if (!selectedChapterId.value) return;
  store.deleteNode(selectedChapterId.value, nodeId);
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = null;
    showNodeEditor.value = false;
  }
}

async function handleExportPNG() {
  if (!chartEditorRef.value) {
    alert('图表未加载');
    return;
  }

  try {
    const dataUrl = await chartEditorRef.value.exportToPNG();
    const link = window.document.createElement('a');
    link.download = `${selectedChapter.value?.title || 'story-chart'}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('导出PNG失败:', err);
    alert('导出PNG失败，请重试');
  }
}

function handleExportMarkdown() {
  if (!selectedChapterId.value) return;

  const md = store.exportToMarkdown(selectedChapterId.value);

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = window.document.createElement('a');
  link.download = `${selectedChapter.value?.title || 'story-chart'}.md`;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>📖 Story Chart - 多选择多结局剧情编辑器</h1>
      <div class="header-actions">
        <button v-if="selectedChapter" class="btn btn-secondary" @click="handleExportPNG">📷 导出PNG</button>
        <button v-if="selectedChapter" class="btn btn-secondary" @click="handleExportMarkdown">📝 导出Markdown</button>
        <button class="btn btn-primary" @click="handleCreateChapter">+ 新建章节</button>
      </div>
    </header>

    <main class="main-container">
      <aside class="sidebar">
        <ChapterList
          :chapters="store.state.chapters"
          :selectedId="selectedChapterId"
          @select="handleChapterSelect"
          @delete="handleDeleteChapter"
        />
      </aside>

      <section class="chart-container">
        <div v-if="selectedChapter" class="toolbar">
          <button class="btn" @click="handleAddNode">+ 添加节点</button>
        </div>
        <StoryChartEditor
          ref="chartEditorRef"
          v-if="selectedChapter"
          :chapter="selectedChapter"
          :selectedNodeId="selectedNodeId"
          @nodeSelect="handleNodeSelect"
          @nodeUpdate="handleNodeSelect"
        />
        <div v-else class="empty-state">
          <div class="empty-state-icon">📚</div>
          <p>请选择或创建一个章节开始编辑</p>
        </div>
      </section>

      <aside class="editor-panel">
        <NodeEditor
          v-if="showNodeEditor && selectedChapter && selectedNode"
          :chapter="selectedChapter"
          :node="selectedNode"
          @update="(node) => store.updateNode(selectedChapter!.id, selectedNode!.id, node)"
          @delete="handleDeleteNode(selectedNode!.id)"
        />
        <div v-else class="empty-state">
          <div class="empty-state-icon">✏️</div>
          <p>从图表中选择一个节点进行编辑</p>
        </div>
      </aside>
    </main>
  </div>
</template>
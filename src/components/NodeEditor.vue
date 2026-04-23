<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Chapter, StoryNode, StoryOption } from '../types';
import { useStoryStore } from '../store';

const props = defineProps<{
  chapter: Chapter;
  node: StoryNode;
}>();

const emit = defineEmits<{
  update: [node: Partial<StoryNode>];
  delete: [];
}>();

const store = useStoryStore();

const localText = ref(props.node.text);
const localType = ref(props.node.type);

watch(() => props.node, (newNode) => {
  localText.value = newNode.text;
  localType.value = newNode.type;
}, { immediate: true });

watch([localText, localType], () => {
  emit('update', {
    text: localText.value,
    type: localType.value
  });
});

function handleAddOption() {
  store.addOption(props.chapter.id, props.node.id);
}

function handleDeleteOption(optionId: string) {
  store.deleteOption(props.chapter.id, props.node.id, optionId);
}

function handleOptionTextChange(optionId: string, text: string) {
  const option = props.node.options.find(o => o.id === optionId);
  if (option) {
    store.updateOption(props.chapter.id, props.node.id, optionId, { text });
  }
}

function handleOptionLinkChange(optionId: string, nextNodeId: string) {
  store.updateOption(props.chapter.id, props.node.id, optionId, {
    nextNodeId: nextNodeId || null
  });
}

const availableNodes = computed(() => {
  return props.chapter.nodes.filter(n => n.id !== props.node.id);
});
</script>

<template>
  <div class="node-editor">
    <div class="editor-header">
      <h2>✏️ 编辑节点</h2>
      <button class="btn-delete" @click="emit('delete')">删除节点</button>
    </div>

    <div class="editor-content">
      <div class="form-group">
        <label>节点类型</label>
        <select v-model="localType">
          <option value="story">📖 剧情节点</option>
          <option value="ending">🌟 结局节点</option>
        </select>
      </div>

      <div class="form-group">
        <label>剧情文本</label>
        <textarea
          v-model="localText"
          placeholder="输入剧情描述..."
          rows="4"
        ></textarea>
      </div>

      <div v-if="localType === 'story'" class="options-section">
        <div class="options-header">
          <label>选项分支</label>
          <button class="btn-add-option" @click="handleAddOption">+ 添加选项</button>
        </div>

        <div v-if="node.options.length === 0" class="no-options">
          暂无选项，点击添加创建分支
        </div>

        <div v-for="option in node.options" :key="option.id" class="option-item">
          <div class="option-content">
            <input
              type="text"
              :value="option.text"
              @input="(e) => handleOptionTextChange(option.id, (e.target as HTMLInputElement).value)"
              placeholder="选项文本..."
              class="option-input"
            />
            <select
              :value="option.nextNodeId || ''"
              @change="(e) => handleOptionLinkChange(option.id, (e.target as HTMLSelectElement).value)"
              class="option-select"
            >
              <option value="">-- 选择跳转节点 --</option>
              <option v-for="n in availableNodes" :key="n.id" :value="n.id">
                {{ n.text.substring(0, 20) }}...
              </option>
            </select>
          </div>
          <button class="btn-remove-option" @click="handleDeleteOption(option.id)">×</button>
        </div>
      </div>

      <div v-if="localType === 'ending'" class="ending-badge">
        🌟 这是结局节点，不会显示选项
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h2 {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.btn-delete {
  background: #ff4757;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete:hover {
  background: #ff6b81;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.options-section {
  margin-top: 20px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.options-header label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.btn-add-option {
  background: #667eea;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-add-option:hover {
  background: #5a67d8;
}

.no-options {
  text-align: center;
  padding: 20px;
  color: #999;
  background: #f8f9fa;
  border-radius: 8px;
}

.option-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-input,
.option-select {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.option-input:focus,
.option-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-remove-option {
  background: #ff4757;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.btn-remove-option:hover {
  background: #ff6b81;
}

.ending-badge {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  border-radius: 8px;
  text-align: center;
  color: #333;
  font-weight: 500;
}
</style>
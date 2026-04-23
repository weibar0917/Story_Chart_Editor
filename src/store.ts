import { reactive } from 'vue';
import type { StoryChart, Chapter, StoryNode, StoryOption } from './types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const defaultChapter: Chapter = {
  id: generateId(),
  title: '第一章',
  description: '故事的开始',
  nodes: [],
  rootNodeId: null
};

const defaultNode: StoryNode = {
  id: generateId(),
  type: 'story',
  text: '这是一个新的剧情节点...',
  options: []
};

const defaultOption: StoryOption = {
  id: generateId(),
  text: '新选项',
  nextNodeId: null
};

const state = reactive<StoryChart>({
  chapters: []
});

export function useStoryStore() {
  function createChapter(title: string = '新章节', description: string = ''): Chapter {
    const chapter: Chapter = {
      id: generateId(),
      title,
      description,
      nodes: [],
      rootNodeId: null
    };
    state.chapters.push(chapter);
    return chapter;
  }

  function deleteChapter(chapterId: string): void {
    const index = state.chapters.findIndex(c => c.id === chapterId);
    if (index !== -1) {
      state.chapters.splice(index, 1);
    }
  }

  function getChapter(chapterId: string): Chapter | undefined {
    return state.chapters.find(c => c.id === chapterId);
  }

  function updateChapter(chapterId: string, updates: Partial<Pick<Chapter, 'title' | 'description'>>): void {
    const chapter = getChapter(chapterId);
    if (chapter) {
      Object.assign(chapter, updates);
    }
  }

  function addNode(chapterId: string, node: Partial<StoryNode> = {}): StoryNode {
    const chapter = getChapter(chapterId);
    if (!chapter) throw new Error('Chapter not found');

    const newNode: StoryNode = {
      id: generateId(),
      type: node.type || 'story',
      text: node.text || '新的剧情...',
      options: [],
      position: node.position
    };

    chapter.nodes.push(newNode);

    if (!chapter.rootNodeId) {
      chapter.rootNodeId = newNode.id;
    }

    return newNode;
  }

  function deleteNode(chapterId: string, nodeId: string): void {
    const chapter = getChapter(chapterId);
    if (!chapter) return;

    chapter.nodes = chapter.nodes.filter(n => n.id !== nodeId);

    if (chapter.rootNodeId === nodeId) {
      chapter.rootNodeId = chapter.nodes.length > 0 ? chapter.nodes[0].id : null;
    }

    chapter.nodes.forEach(node => {
      node.options = node.options.filter(opt => opt.nextNodeId !== nodeId);
    });
  }

  function updateNode(chapterId: string, nodeId: string, updates: Partial<StoryNode>): void {
    const chapter = getChapter(chapterId);
    if (!chapter) return;

    const node = chapter.nodes.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  }

  function getNode(chapterId: string, nodeId: string): StoryNode | undefined {
    const chapter = getChapter(chapterId);
    return chapter?.nodes.find(n => n.id === nodeId);
  }

  function addOption(chapterId: string, nodeId: string, option: Partial<StoryOption> = {}): StoryOption | null {
    const node = getNode(chapterId, nodeId);
    if (!node) return null;

    const newOption: StoryOption = {
      id: generateId(),
      text: option.text || '新选项',
      nextNodeId: option.nextNodeId || null
    };

    node.options.push(newOption);
    return newOption;
  }

  function deleteOption(chapterId: string, nodeId: string, optionId: string): void {
    const node = getNode(chapterId, nodeId);
    if (!node) return;

    node.options = node.options.filter(o => o.id !== optionId);
  }

  function updateOption(chapterId: string, nodeId: string, optionId: string, updates: Partial<StoryOption>): void {
    const node = getNode(chapterId, nodeId);
    if (!node) return;

    const option = node.options.find(o => o.id === optionId);
    if (option) {
      Object.assign(option, updates);
    }
  }

  function linkNodes(chapterId: string, fromNodeId: string, optionId: string, toNodeId: string | null): void {
    const node = getNode(chapterId, fromNodeId);
    if (!node) return;

    const option = node.options.find(o => o.id === optionId);
    if (option) {
      option.nextNodeId = toNodeId;
    }
  }

  function initDemo(): void {
    if (state.chapters.length > 0) return;

    const chapter = createChapter('第一章：命运的起点', '主角面临人生重大抉择');

    const startNode = addNode(chapter.id, {
      type: 'story',
      text: '深夜，你独自走在回家的路上，突然听到前方传来一声尖叫...'
    });

    const investigateNode = addNode(chapter.id, {
      type: 'story',
      text: '你快步上前查看，发现一个女孩被几个黑衣人围住。她看到你，眼中闪过一丝希望...'
    });

    const ignoreNode = addNode(chapter.id, {
      type: 'story',
      text: '你决定不惹麻烦，绕道而行。但内心深处，你知道自己做出了一个懦弱的选择。'
    });

    const helpNode = addNode(chapter.id, {
      type: 'story',
      text: '「放开她！」你大喊一声，冲了上去。混乱中，你感觉到有人刺中了你的腹部...'
    });

    const fleeNode = addNode(chapter.id, {
      type: 'ending',
      text: '【结局：懦弱之路】你选择了逃避。虽然活了下来，但你永远无法原谅自己的懦弱。游戏结束。'
    });

    const surviveNode = addNode(chapter.id, {
      type: 'ending',
      text: '【结局：英雄救美】你挺身而出，成为见义勇为的英雄。女孩对你感激不尽...'
    });

    const badEndNode = addNode(chapter.id, {
      type: 'ending',
      text: '【结局：英雄末路】你受了重伤，在医院醒来。医生说你很幸运，捡回一条命。'
    });

    addOption(chapter.id, startNode.id, { text: '上前查看', nextNodeId: investigateNode.id });
    addOption(chapter.id, startNode.id, { text: '假装没听见，绕道走', nextNodeId: ignoreNode.id });
    addOption(chapter.id, investigateNode.id, { text: '冲上去救她', nextNodeId: helpNode.id });
    addOption(chapter.id, investigateNode.id, { text: '悄悄报警，然后离开', nextNodeId: fleeNode.id });
    addOption(chapter.id, helpNode.id, { text: '拼命反抗', nextNodeId: surviveNode.id });
    addOption(chapter.id, helpNode.id, { text: '坚持到警察来', nextNodeId: badEndNode.id });
  }

  function exportToMarkdown(chapterId: string): string {
    const chapter = getChapter(chapterId);
    if (!chapter) return '';

    let md = `# ${chapter.title}\n\n${chapter.description}\n\n---\n\n`;

    function traverseNode(nodeId: string, depth: number = 0): void {
      const node = chapter.nodes.find(n => n.id === nodeId);
      if (!node) return;

      const indent = '  '.repeat(depth);
      const prefix = node.type === 'ending' ? '🌟' : '📖';

      md += `${indent}${prefix} ${node.text}\n\n`;

      if (node.type !== 'ending' && node.options.length > 0) {
        node.options.forEach(opt => {
          md += `${indent}- [选择] ${opt.text}\n`;
          if (opt.nextNodeId) {
            traverseNode(opt.nextNodeId, depth + 1);
          }
        });
      }
    }

    if (chapter.rootNodeId) {
      traverseNode(chapter.rootNodeId);
    }

    return md;
  }

  return {
    state,
    createChapter,
    deleteChapter,
    getChapter,
    updateChapter,
    addNode,
    deleteNode,
    updateNode,
    getNode,
    addOption,
    deleteOption,
    updateOption,
    linkNodes,
    initDemo,
    exportToMarkdown
  };
}

export { defaultChapter, defaultNode, defaultOption };
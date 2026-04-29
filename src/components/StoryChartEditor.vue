<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import type { Chapter, StoryNode } from '../types';

const props = defineProps<{
  chapter: Chapter;
  selectedNodeId: string | null;
}>();

const emit = defineEmits<{
  nodeSelect: [node: StoryNode];
  nodeUpdate: [node: StoryNode];
}>();

const diagramDiv = ref<HTMLElement | null>(null);
let diagram: any = null;
let gojsModule: any = null;
let pendingViewport: { position: any; scale: number } | null = null;
const NODE_WIDTH = 240;
const STORY_ICON = '🎬';
const ENDING_ICON = '🏁';

const DEFAULT_SCALE = 1;

async function initDiagram() {
  if (!diagramDiv.value) return;

  gojsModule = await import('gojs');
  const gojs = gojsModule;
  const $ = gojs.GraphObject.make;

  if (diagram) {
    diagram.div = null;
  }

  diagram = $(gojs.Diagram, diagramDiv.value, {
    initialContentAlignment: gojs.Spot.Center,
    initialScale: DEFAULT_SCALE,
    layout: $(gojs.TreeLayout, {
      angle: 0,
      layerSpacing: 120,
      nodeSpacing: 40
    }),
    'draggingTool.isEnabled': true,
    'linkingTool.isEnabled': true
  });

  diagram.addDiagramListener('LayoutCompleted', () => {
    if (!diagram || !pendingViewport) return;

    const viewport = pendingViewport;
    pendingViewport = null;

    requestAnimationFrame(() => {
      if (!diagram) return;
      diagram.scale = viewport.scale;
      diagram.position = viewport.position;
    });
  });

  updateDiagram();
}

function updateDiagram() {
  if (!diagram) return;

  import('gojs').then(gojs => {
    const $ = gojs.GraphObject.make;
    pendingViewport = diagram.nodes.count > 0
      ? {
          position: diagram.position.copy(),
          scale: diagram.scale
        }
      : null;

    const nodeDataArray: any[] = props.chapter.nodes.map(node => ({
      key: node.id,
      text: node.text,
      scene: node.scene || '未设置场景',
      type: node.type
    }));

    const linkDataArray: any[] = [];
    props.chapter.nodes.forEach(node => {
      node.options.forEach(opt => {
        if (opt.nextNodeId) {
          linkDataArray.push({
            key: opt.id,
            from: node.id,
            to: opt.nextNodeId,
            text: opt.text
          });
        }
      });
    });

    const storyNodeTemplate = $(
      gojs.Node,
      'Vertical',
      {
        cursor: 'pointer',
        click: (_e: any, node: any) => {
          const nodeId = node.data.key;
          const foundNode = props.chapter.nodes.find(n => n.id === nodeId);
          if (foundNode) {
            emit('nodeSelect', foundNode);
          }
        }
      },
      $(gojs.TextBlock, '剧情',
        {
          font: '13px Microsoft YaHei',
          stroke: '#667eea',
          margin: new gojs.Margin(0, 0, 6, 0)
        }
      ),
      $(gojs.Panel, 'Auto',
        $(gojs.Shape, 'RoundedRectangle',
          {
            fill: '#667eea',
            stroke: '#5a67d8',
            strokeWidth: 2,
            width: NODE_WIDTH
          }
        ),
        $(gojs.Panel, 'Horizontal',
          { padding: 12 },
          $(gojs.Panel, 'Auto',
            $(gojs.Shape, 'Ellipse',
              {
                width: 32,
                height: 32,
                fill: 'white'
              }
            ),
            $(gojs.TextBlock, STORY_ICON,
              {
                font: '20px Microsoft YaHei',
                stroke: '#667eea',
                textAlign: 'center',
                verticalAlignment: gojs.Spot.Center
              }
            )
          ),
          $(gojs.TextBlock,
            {
              margin: 10,
              font: 'bold 16px Microsoft YaHei',
              stroke: 'white',
              width: NODE_WIDTH - 76,
              maxLines: 2,
              overflow: gojs.TextBlock.OverflowEllipsis
            },
            new gojs.Binding('text', 'text')
          )
        )
      ),
      $(gojs.TextBlock,
        {
          font: '13px Microsoft YaHei',
          stroke: '#4a5568',
          margin: new gojs.Margin(6, 0, 0, 0)
        },
        new gojs.Binding('text', 'scene')
      )
    );

    const endingNodeTemplate = $(
      gojs.Node,
      'Vertical',
      {
        cursor: 'pointer',
        click: (_e: any, node: any) => {
          const nodeId = node.data.key;
          const foundNode = props.chapter.nodes.find(n => n.id === nodeId);
          if (foundNode) {
            emit('nodeSelect', foundNode);
          }
        }
      },
      $(gojs.TextBlock, '结局',
        {
          font: '13px Microsoft YaHei',
          stroke: '#ed8936',
          margin: new gojs.Margin(0, 0, 6, 0)
        }
      ),
      $(gojs.Panel, 'Auto',
        $(gojs.Shape, 'RoundedRectangle',
          {
            fill: '#ed8936',
            stroke: '#dd6b20',
            strokeWidth: 2,
            width: NODE_WIDTH
          }
        ),
        $(gojs.Panel, 'Horizontal',
          { padding: 12 },
          $(gojs.Panel, 'Auto',
            $(gojs.Shape, 'Ellipse',
              {
                width: 32,
                height: 32,
                fill: 'white'
              }
            ),
            $(gojs.TextBlock, ENDING_ICON,
              {
                font: '20px Microsoft YaHei',
                stroke: '#ed8936',
                textAlign: 'center',
                verticalAlignment: gojs.Spot.Center
              }
            )
          ),
          $(gojs.TextBlock,
            {
              margin: 10,
              font: 'bold 16px Microsoft YaHei',
              stroke: 'white',
              width: NODE_WIDTH - 76,
              maxLines: 2,
              overflow: gojs.TextBlock.OverflowEllipsis
            },
            new gojs.Binding('text', 'text')
          )
        )
      ),
      $(gojs.TextBlock,
        {
          font: '13px Microsoft YaHei',
          stroke: '#4a5568',
          margin: new gojs.Margin(6, 0, 0, 0)
        },
        new gojs.Binding('text', 'scene')
      )
    );

    diagram.nodeTemplateMap.add('story', storyNodeTemplate);
    diagram.nodeTemplateMap.add('ending', endingNodeTemplate);
    diagram.nodeTemplate = storyNodeTemplate;

    diagram.linkTemplate = $(
      gojs.Link,
      {
        routing: gojs.Link.Orthogonal,
        toEndSegmentLength: 30,
        fromEndSegmentLength: 30
      },
      $(gojs.Shape,
        {
          stroke: '#a0aec0',
          strokeWidth: 2,
          strokeDashArray: [6, 3]
        }
      ),
      $(gojs.Shape,
        {
          toArrow: 'Triangle',
          fill: '#a0aec0',
          stroke: '#a0aec0'
        }
      ),
      $(gojs.TextBlock,
        {
          font: '12px Microsoft YaHei',
          stroke: '#4a5568',
          background: 'rgba(255,255,255,0.9)',
          segmentOffset: new gojs.Point(0, -12),
          maxLines: 1,
          overflow: gojs.TextBlock.OverflowEllipsis
        },
        new gojs.Binding('text', 'text')
      )
    );

    const model = new gojs.GraphLinksModel();
    model.nodeCategoryProperty = 'type';
    model.linkKeyProperty = 'key';
    model.nodeDataArray = nodeDataArray;
    model.linkDataArray = linkDataArray;
    diagram.model = model;
  });
}

const chartSignature = computed(() => JSON.stringify(
  props.chapter.nodes.map(node => ({
    id: node.id,
    type: node.type,
    text: node.text,
    scene: node.scene,
    options: node.options.map(option => ({
      id: option.id,
      text: option.text,
      nextNodeId: option.nextNodeId
    }))
  }))
));

watch(chartSignature, () => {
  updateDiagram();
});

onMounted(() => {
  initDiagram();
});

function refreshDiagram() {
  if (diagram) {
    diagram.layoutDiagram(true);
  }
}

function zoomIn() {
  if (diagram) {
    const newScale = diagram.scale * 1.2;
    diagram.scale = Math.min(newScale, 5);
  }
}

function zoomOut() {
  if (diagram) {
    const newScale = diagram.scale / 1.2;
    diagram.scale = Math.max(newScale, 0.3);
  }
}

function exportToPNG(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!diagram) {
      reject(new Error('Diagram not initialized'));
      return;
    }

    // 1. 强制立即更新所有布局和绑定
    diagram.maybeUpdate();
    
    // 2. 导出全量图片
    // 关键点：设置 maxSize 为无穷大，防止大图被截断
    const imgData = diagram.makeImageData({
      scale: 2,            // 2倍高清
      background: 'white',
      padding: 50,         // 四周留白
      maxSize: new gojsModule.Size(Infinity, Infinity) // 解除尺寸限制
    });
    
    if (imgData) {
      resolve(imgData);
    } else {
      reject(new Error('Failed to generate image data'));
    }
  });
}

defineExpose({ refreshDiagram, exportToPNG });
</script>

<template>
  <div class="story-chart-wrapper">
    <div class="chart-toolbar">
      <button class="btn btn-sm" @click.stop="zoomOut">➖ 缩小</button>
      <button class="btn btn-sm" @click.stop="zoomIn">➕ 放大</button>
      <button class="btn btn-sm" @click.stop="refreshDiagram">🔄 重置布局</button>
      <div class="toolbar-legend">
        <span class="legend-item"><span class="legend-dot story"></span>剧情节点</span>
        <span class="legend-item"><span class="legend-dot ending"></span>结局节点</span>
      </div>
    </div>
    <div ref="diagramDiv" class="story-chart-canvas"></div>
  </div>
</template>

<style scoped>
.story-chart-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-toolbar {
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-sm:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.toolbar-legend {
  display: flex;
  gap: 16px;
  margin-left: auto;
  font-size: 12px;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.story {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.legend-dot.ending {
  background: linear-gradient(135deg, #f6ad55, #ed8936);
}

.story-chart-canvas {
  flex: 1;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  overflow: auto;
}
</style>

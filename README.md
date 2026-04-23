# Story Chart - 多选择多结局剧情编辑器

一款专为游戏剧情策划设计的可视化编辑器，灵感来源于《底特律：变人》的多分支剧情系统。

## 🚀 运行方式

### 方式一：使用开发服务器

```bash
# 进入项目目录
cd g:\Design_Tools\Story_Chart

# 安装依赖（首次运行或依赖变更后）
npm install

# 启动开发服务器
npm run dev
```

启动成功后，在浏览器访问 **http://localhost:5173/**

### 方式二：构建生产版本

```bash
# 构建项目
npm run build

# 预览生产版本
npm run preview
```

## ✨ 功能特性

### 📚 章节管理
- 创建、删除、切换多个章节
- 每个章节独立管理自己的剧情树

### 📖 节点编辑
- **剧情节点**：包含选项分支的普通剧情点
- **结局节点**：故事的终点，无选项分支
- 支持修改节点文本和类型

### 🔀 选项分支
- 为每个剧情节点添加多个选项
- 每个选项可跳转至任意后续节点
- 选项显示在连接线上

### 🌲 树形可视化
- 使用 GoJS 实时渲染剧情分支图
- 紫色节点表示剧情节点
- 橙色节点表示结局节点
- 支持拖拽调整节点位置
- 点击节点查看/编辑详情
- **缩放操作**：在图表上 Ctrl + 滚轮 缩放视图
- **拖拽移动**：在图表空白处拖拽移动视图

### 📤 导出功能
- **导出 PNG**：将剧情树导出为图片
- **导出 Markdown**：导出结构化的剧情文本大纲

## 🎮 使用流程

1. **创建章节**：点击右上角「+ 新建章节」
2. **添加节点**：点击图表上方的「+ 添加节点」
3. **编辑节点**：点击图表中的节点，在右侧面板编辑
4. **添加选项**：在节点编辑面板中点击「+ 添加选项」
5. **连接节点**：为每个选项选择跳转的目标节点
6. **导出成果**：使用右上角的导出按钮导出 PNG 或 Markdown

## 📁 项目结构

```
story-chart/
├── src/
│   ├── components/
│   │   ├── ChapterList.vue      # 章节列表组件
│   │   ├── NodeEditor.vue       # 节点编辑器组件
│   │   └── StoryChartEditor.vue # 树形图表组件
│   ├── App.vue                  # 主应用组件
│   ├── main.ts                  # 入口文件
│   ├── store.ts                 # 状态管理
│   ├── types.ts                 # TypeScript 类型定义
│   └── style.css                # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🛠️ 技术栈

- **前端框架**：Vue 3 + TypeScript
- **可视化库**：GoJS
- **图片导出**：html-to-image
- **构建工具**：Vite

## 📝 数据结构

```typescript
// 故事选项
interface StoryOption {
  id: string;
  text: string;           // 选项文本
  nextNodeId: string | null;  // 跳转目标节点
}

// 故事节点
interface StoryNode {
  id: string;
  type: 'story' | 'ending';  // 节点类型
  text: string;               // 剧情文本
  options: StoryOption[];     // 选项列表
}

// 章节
interface Chapter {
  id: string;
  title: string;
  description: string;
  nodes: StoryNode[];
  rootNodeId: string | null;
}
```

## 🎯 适用场景

- 游戏剧情设计与规划
- 互动小说创作
- 剧本分支结构梳理
- 教学场景模拟演练

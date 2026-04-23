export interface StoryOption {
  id: string;
  text: string;
  nextNodeId: string | null;
}

export interface StoryNode {
  id: string;
  type: 'story' | 'ending';
  text: string;
  options: StoryOption[];
  position?: { x: number; y: number };
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  nodes: StoryNode[];
  rootNodeId: string | null;
}

export interface StoryChart {
  chapters: Chapter[];
}
export interface SceneDetails {
  title: string;
  filePath: string;
}

export const SCENE_DETAILS: Record<string, SceneDetails> = {
  intro: { title: 'Introduction', filePath: 'src/components/video/video_scenes/Scene1.tsx' },
  professor: { title: 'Former Professor', filePath: 'src/components/video/video_scenes/Scene2.tsx' },
  stats: { title: 'Publications & Apps', filePath: 'src/components/video/video_scenes/Scene3.tsx' },
  products: { title: 'Product Roll Call', filePath: 'src/components/video/video_scenes/Scene4.tsx' },
  depth: { title: 'Scholarly Depth', filePath: 'src/components/video/video_scenes/Scene5.tsx' },
  outro: { title: 'Closing URL', filePath: 'src/components/video/video_scenes/Scene6.tsx' },
};
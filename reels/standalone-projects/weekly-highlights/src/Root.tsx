import React from 'react';
import { Composition } from 'remotion';
import { WeeklyHighlights } from './WeeklyHighlights';
import { CANVAS } from './styles';

// Named export used by registerRoot in index.ts
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WeeklyHighlights"
        component={WeeklyHighlights}
        durationInFrames={CANVAS.durationInFrames}
        fps={CANVAS.fps}
        width={CANVAS.width}
        height={CANVAS.height}
      />
    </>
  );
};

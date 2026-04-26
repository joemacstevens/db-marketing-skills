import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  OffthreadVideo,
  staticFile,
} from 'remotion';
import { COLORS } from '../styles';

export const ClosingClip: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade out at the end to transition to end card
  const opacity = interpolate(frame, [45, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: COLORS.background, opacity }}>
      {/* IMG_4676 floor exercise 3-6s (3s = 90f) */}
      <OffthreadVideo
        src={staticFile('clips/IMG_4676.MOV')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
        startFrom={3 * 30}
        endAt={6 * 30}
        muted
      />

      {/* Subtle dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  OffthreadVideo,
  staticFile,
  Sequence,
} from 'remotion';
import { COLORS, FONTS, SUB } from '../styles';

export const FlexibilitySegment: React.FC = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const labelX = interpolate(frame, [5, 20], [-200, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: COLORS.background }}>
      {/* Clip 1: IMG_4674 pilates "bring your hip up" 5-8s (3s = 90f) */}
      <Sequence from={0} durationInFrames={SUB.flex1}>
        <OffthreadVideo
          src={staticFile('clips/IMG_4674.MOV')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
          startFrom={5 * 30}
          endAt={8 * 30}
          muted
        />
      </Sequence>

      {/* Clip 2: IMG_4675 floor partner exercise 2-3s (1s = 30f) */}
      <Sequence from={SUB.flex1} durationInFrames={SUB.flex2}>
        <OffthreadVideo
          src={staticFile('clips/IMG_4675.MOV')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
          startFrom={2 * 30}
          endAt={3 * 30}
          muted
        />
      </Sequence>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 300,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        pointerEvents: 'none',
      }} />

      {/* Segment label */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: labelOpacity,
        transform: `translateX(${labelX}px)`,
      }}>
        <div style={{
          display: 'inline-block',
          background: COLORS.red,
          padding: '8px 40px',
        }}>
          <span style={{
            fontFamily: FONTS.oswald,
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: 'uppercase',
            letterSpacing: 4,
          }}>
            COOL DOWN
          </span>
        </div>
      </div>
    </div>
  );
};

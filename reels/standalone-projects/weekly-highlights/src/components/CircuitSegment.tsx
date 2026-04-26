import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  OffthreadVideo,
  staticFile,
  Sequence,
} from 'remotion';
import { COLORS, FONTS, SUB } from '../styles';

export const CircuitSegment: React.FC = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const labelX = interpolate(frame, [5, 20], [-200, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: COLORS.background }}>
      {/* Clip 1: IMG_4670 BOSU ball group training 3-7s (4s = 120f) */}
      <Sequence from={0} durationInFrames={SUB.circuit1}>
        <OffthreadVideo
          src={staticFile('clips/IMG_4670.MOV')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
          startFrom={3 * 30}
          endAt={7 * 30}
          muted
        />
      </Sequence>

      {/* Clip 2: IMG_4672 gym floor coaching 5-8s (3s = 90f) */}
      <Sequence from={SUB.circuit1} durationInFrames={SUB.circuit2}>
        <OffthreadVideo
          src={staticFile('clips/IMG_4672.MOV')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
          startFrom={5 * 30}
          endAt={8 * 30}
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

      {/* Coach credit */}
      <div style={{
        position: 'absolute',
        bottom: 260,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,0,0,0.6)',
          padding: '6px 30px',
          borderRadius: 4,
        }}>
          <span style={{
            fontFamily: FONTS.oswald,
            fontSize: 40,
            fontWeight: 400,
            color: COLORS.white,
            textTransform: 'uppercase',
            letterSpacing: 6,
          }}>
            Led by Coach Carlos
          </span>
        </div>
      </div>

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
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: 'uppercase',
            letterSpacing: 4,
          }}>
            CIRCUIT TRAINING
          </span>
        </div>
      </div>
    </div>
  );
};

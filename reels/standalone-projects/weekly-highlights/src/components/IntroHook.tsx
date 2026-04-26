import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  OffthreadVideo,
  staticFile,
  Img,
} from 'remotion';
import { COLORS, FONTS } from '../styles';

export const IntroHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo slides in from top
  const logoY = interpolate(frame, [0, 20], [-100, 0], {
    extrapolateRight: 'clamp',
  });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // "THIS WEEK AT" fades in
  const labelOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // "DIFFERENT BREED" scales up
  const titleScale = interpolate(frame, [15, 35], [0.7, 1], {
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Red bar swipe across screen
  const barWidth = interpolate(frame, [5, 25], [0, 1080], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: COLORS.background }}>
      {/* Background video: IMG_4668 seconds 2-5 */}
      <OffthreadVideo
        src={staticFile('clips/IMG_4668.MOV')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        startFrom={2 * 30}
        endAt={5 * 30}
        muted
      />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
      }} />

      {/* Red accent bar */}
      <div style={{
        position: 'absolute',
        top: '38%',
        left: 0,
        width: barWidth,
        height: 6,
        background: COLORS.red,
      }} />

      {/* DB Logo */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: '50%',
        transform: `translateX(-50%) translateY(${logoY}px)`,
        opacity: logoOpacity,
      }}>
        <Img
          src={staticFile('brand/DB-logo.png')}
          style={{ width: 120, height: 'auto' }}
        />
      </div>

      {/* Text overlay */}
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '0 60px',
      }}>
        <div style={{
          fontFamily: FONTS.oswald,
          fontSize: 36,
          color: COLORS.white,
          letterSpacing: 8,
          textTransform: 'uppercase',
          opacity: labelOpacity,
          marginBottom: 12,
        }}>
          EVERY TUESDAY AT 6:15
        </div>
        <div style={{
          fontFamily: FONTS.oswald,
          fontSize: 96,
          fontWeight: 700,
          color: COLORS.white,
          textTransform: 'uppercase',
          lineHeight: 0.95,
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          letterSpacing: -2,
        }}>
          FULL BODY<br />
          <span style={{ color: COLORS.red }}>IGNITER</span>
        </div>
      </div>
    </div>
  );
};

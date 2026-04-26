import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
  Img,
} from 'remotion';
import { COLORS, FONTS } from '../styles';

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in from black
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Logo scale in
  const logoScale = interpolate(frame, [5, 30], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  // Tagline fades in after logo
  const taglineOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Red line grows
  const lineWidth = interpolate(frame, [25, 50], [0, 500], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: COLORS.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
    }}>
      {/* DB Logo */}
      <div style={{
        transform: `scale(${logoScale})`,
        marginBottom: 40,
      }}>
        <Img
          src={staticFile('brand/DB-logo.png')}
          style={{ width: 200, height: 'auto' }}
        />
      </div>

      {/* Red line */}
      <div style={{
        width: lineWidth,
        height: 4,
        background: COLORS.red,
        marginBottom: 40,
      }} />

      {/* Schedule line */}
      <div style={{
        opacity: taglineOpacity,
        fontFamily: FONTS.oswald,
        fontSize: 28,
        color: COLORS.white,
        textTransform: 'uppercase',
        letterSpacing: 8,
        marginBottom: 24,
      }}>
        EVERY TUESDAY • 6:15 PM
      </div>

      {/* Evolve tagline image */}
      <div style={{ opacity: taglineOpacity }}>
        <Img
          src={staticFile('brand/Evolve-tagline.png')}
          style={{ width: 600, height: 'auto' }}
        />
      </div>

      {/* Website/handle */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        opacity: taglineOpacity,
        fontFamily: FONTS.oswald,
        fontSize: 28,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 6,
      }}>
        @DIFFERENTBREEDELITE
      </div>
    </div>
  );
};

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { createTikTokStyleCaptions } from '@remotion/captions';
import type { Caption } from '@remotion/captions';
import rawCaptions from '../captions.json';

// Voiceover starts at frame 60 = 2000ms into the video
const VOICEOVER_OFFSET_MS = 2000;

// Convert raw captions.json entries to Caption format with 2s offset applied
const captions: Caption[] = (rawCaptions as Caption[]).map((c) => ({
  text: c.text,
  startMs: c.startMs + VOICEOVER_OFFSET_MS,
  endMs: c.endMs + VOICEOVER_OFFSET_MS,
  timestampMs: (c.timestampMs ?? c.startMs) + VOICEOVER_OFFSET_MS,
  confidence: c.confidence,
}));

const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,
});

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;

  // Find the current page
  const currentPage = pages.findLast(
    (page) => page.startMs <= currentTimeMs
  );

  if (!currentPage) return null;

  // Only show while this page is active (within its duration)
  if (currentTimeMs > currentPage.startMs + currentPage.durationMs) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '12px 24px',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        {currentPage.tokens.map((token, i) => {
          const isActive =
            currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;

          return (
            <span
              key={i}
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 'bold',
                fontSize: '52px',
                textTransform: 'uppercase',
                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                color: isActive ? '#E31937' : '#FFFFFF',
                display: 'inline',
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

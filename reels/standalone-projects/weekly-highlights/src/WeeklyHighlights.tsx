import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
} from 'remotion';
import { CANVAS, SEGMENTS } from './styles';
import { IntroHook } from './components/IntroHook';
import { Captions } from './components/Captions';
import { AgilitySegment } from './components/AgilitySegment';
import { CircuitSegment } from './components/CircuitSegment';
import { SquadSegment } from './components/SquadSegment';
import { FlexibilitySegment } from './components/FlexibilitySegment';
import { EndCard } from './components/EndCard';

export const WeeklyHighlights: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#1a1a1a' }}>
      {/* Background music — full duration, lowered volume */}
      <Audio src={staticFile('music.mp3')} volume={0.4} />

      {/* Voiceover — starts at 2s (frame 60) to let title breathe */}
      <Sequence from={60}>
        <Audio src={staticFile('voiceover.mp3')} volume={1} />
      </Sequence>

      {/* Intro Hook: 0-3s */}
      <Sequence from={SEGMENTS.intro.from} durationInFrames={SEGMENTS.intro.durationInFrames}>
        <AbsoluteFill>
          <IntroHook />
        </AbsoluteFill>
      </Sequence>

      {/* Agility Drills: 3-10s */}
      <Sequence from={SEGMENTS.agility.from} durationInFrames={SEGMENTS.agility.durationInFrames}>
        <AbsoluteFill>
          <AgilitySegment />
        </AbsoluteFill>
      </Sequence>

      {/* Circuit Training: 10-17s */}
      <Sequence from={SEGMENTS.circuit.from} durationInFrames={SEGMENTS.circuit.durationInFrames}>
        <AbsoluteFill>
          <CircuitSegment />
        </AbsoluteFill>
      </Sequence>

      {/* The Squad (4K Pro Shots): 17-24s */}
      <Sequence from={SEGMENTS.squad.from} durationInFrames={SEGMENTS.squad.durationInFrames}>
        <AbsoluteFill>
          <SquadSegment />
        </AbsoluteFill>
      </Sequence>

      {/* Flexibility & Strength: 24-28s */}
      <Sequence from={SEGMENTS.flexibility.from} durationInFrames={SEGMENTS.flexibility.durationInFrames}>
        <AbsoluteFill>
          <FlexibilitySegment />
        </AbsoluteFill>
      </Sequence>

      {/* End Card: 28-30s */}
      <Sequence from={SEGMENTS.endcard.from} durationInFrames={SEGMENTS.endcard.durationInFrames}>
        <AbsoluteFill>
          <EndCard />
        </AbsoluteFill>
      </Sequence>

      {/* TikTok-style captions overlay — spans full composition */}
      <Captions />
    </AbsoluteFill>
  );
};

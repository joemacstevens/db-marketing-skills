# Cinematic Effects Library — Remotion Components

You have a library of cinematic visual effects at `reels/src/cinematic-effects/`. These are reusable React components for Remotion that make reels feel like film instead of slideshows.

## Quick Reference: "I want X feel, use Y"

| Mood / Moment | Component | Example |
|---|---|---|
| Coach/name introduction | `TextScramble` | Name decodes from random characters — "RAMSEY BEARSE" |
| Hype / energy burst | `GlitchEffect` | RGB channel split + flash on fight announcements, PR lifts |
| Typing out stats/lists | `Typewriter` | "Ages 11-16 / 9 Weeks / 5 Coaches" types character by character |
| Continuous energy ticker | `KineticMarquee` | "BOXING • CONDITIONING • BASKETBALL •" scrolling strip |
| Premium motion background | `MeshGradient` | Animated gradient blobs behind text — replaces flat black |

### Phase 2 — Cinematic Transitions
| Mood / Moment | Component | Example |
|---|---|---|
| Dramatic reveal | `CurtainReveal` | Two panels part to reveal content — new coach, new class |
| Authority / gravitas | `TextMaskVideo` | Video plays inside letterforms — "DIFFERENT BREED" over footage |
| Data / stats flex | `OdometerCounter` | Digit wheels spin up — member counts, PR numbers, countdowns |
| Building energy | `ColorShift` | Background color ramps from cool blue → red → gold |
| Cinematic pull-in | `ZoomParallax` | Stacked images at different depths — gym interior pull-in |
| Schedule / roster reveal | `StickyCards` | Cards enter + stack with slight offset — weekly schedule |
| Side-by-side compare | `SplitScreen` | Two halves animate in — beginner vs. fight team |
| Whip pan / carousel | `HorizontalPan` | Long strip pans across viewport — coach roster, class schedule |
| Quote over cycling b-roll | `StickyStack` | Foreground pinned while backgrounds cross-dissolve behind |

### Not Yet Built (Phase 3 — on demand)
| Mood / Moment | Component | Notes |
|---|---|---|
| Elegant title entrance | `GradientStroke` | SVG text that "writes on" with gradient fill |
| Annotation / emphasis | `SVGDraw` | Arrows, underlines drawn over footage |
| Badge / stamp | `CircularText` | Text on a circle path — "SUMMER CAMP 2026" seal |
| Before/after wipe | `CursorReveal` | Wipe line across screen on a beat |
| Coach card flip | `FlipCard` | Auto-flip: front photo / back bio |
| Notification reveal | `DynamicIsland` | Pill morphs to "NEW CLASS ADDED" |

## How to Use in a Reel

```tsx
import { TextScramble, GlitchEffect, MeshGradient } from "./cinematic-effects";

// Wrap content in a MeshGradient for animated background
<MeshGradient>
  <TextScramble text="DIFFERENT BREED" startFrame={10} framesPerChar={3} />
</MeshGradient>

// Wrap a scene in GlitchEffect for a hype burst
<GlitchEffect startFrame={0} duration={12} intensity={0.8}>
  <MyTitleScene />
</GlitchEffect>

// Typewriter for stats
<Typewriter text={"Line 1\nLine 2\nLine 3"} startFrame={15} framesPerChar={2} />

// Marquee ticker at bottom of frame
<KineticMarquee text="BOXING  CONDITIONING  BASKETBALL" speed={2} />
```

## Component API Reference

### TextScramble
Reveals text by decoding from random characters, one character at a time.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | string | required | Use `\n` for line breaks |
| `startFrame` | number | 0 | When scramble begins |
| `framesPerChar` | number | 3 | Lower = faster reveal |
| `fontSize` | number | 72 | |
| `color` | string | COLORS.white | |
| `fontFamily` | string | FONTS.headline | |

### GlitchEffect
RGB channel split + scanlines + impact flash. Wraps children.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `startFrame` | number | 0 | When glitch burst starts |
| `duration` | number | 12 | Frames of glitch |
| `intensity` | number (0-1) | 1 | Controls offset magnitude |
| `colorA` | string | "#00f0ff" | Top channel (cyan) |
| `colorB` | string | COLORS.red | Bottom channel |
| `children` | ReactNode | required | Content to glitch |

### Typewriter
Types text character by character with optional blinking cursor.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | string | required | Use `\n` for line breaks |
| `startFrame` | number | 0 | When typing starts |
| `framesPerChar` | number | 2 | Typing speed |
| `showCursor` | boolean | true | |
| `cursorColor` | string | COLORS.red | |
| `fontSize` | number | 48 | |

### KineticMarquee
Continuously scrolling text strip.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | string | required | Text to scroll |
| `separator` | string | " • " | Between repeats |
| `speed` | number | 2 | Pixels per frame |
| `direction` | "left" \| "right" | "left" | |
| `separatorColor` | string | COLORS.red | |

### MeshGradient
Animated gradient blob background. Wraps children.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `blobs` | GradientBlob[] | DB red/gold defaults | Custom blob config |
| `backgroundColor` | string | COLORS.black | Base color |
| `children` | ReactNode | optional | Content on top |

### CurtainReveal
Two panels slide apart to reveal content behind. Wraps children.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `startFrame` | number | 0 | When curtain opens |
| `duration` | number | 30 | Frames to fully open |
| `leftContent` | ReactNode | "DIFFERENT" | Content on left panel |
| `rightContent` | ReactNode | "BREED" | Content on right panel |
| `curtainColor` | string | COLORS.black | Panel background |
| `easing` | "power2" \| "linear" \| "bounce" | "power2" | |
| `children` | ReactNode | required | Revealed content |

### ZoomParallax
Stacked image layers at different depths that zoom at different rates.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `layers` | ParallaxLayer[] | required | `{src, depth, startScale?, filter?, opacity?}` |
| `startFrame` | number | 0 | When zoom starts |
| `duration` | number | 90 | Full zoom duration |
| `zoomSpeed` | number | 1 | Overall speed multiplier |

### TextMaskVideo
Video plays inside text letterforms. Reveals filled text over outlined text.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | string | required | Text for the mask |
| `videoSrc` | string | required | Video file in public/ |
| `revealStartFrame` | number | 0 | When filled text reveals |
| `revealDuration` | number | 30 | Reveal animation length |
| `revealDirection` | "up" \| "down" \| "left" \| "right" | "up" | |
| `fontSize` | number | 180 | |

### OdometerCounter
Mechanical digit wheels that roll to a target number.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | number | required | Target number |
| `startFrame` | number | 0 | When roll starts |
| `duration` | number | 40 | Roll animation length |
| `stagger` | number | 4 | Delay between digits (frames) |
| `prefix` | string | — | e.g., "$" |
| `suffix` | string | — | e.g., "%", "/wk" |
| `fontSize` | number | 80 | |
| `affixColor` | string | COLORS.red | Prefix/suffix color |

### ColorShift
Background color transitions across frame ranges. Wraps children.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `stops` | ColorStop[] | DB blue→red→gold | `{frame, backgroundColor, textColor?}` |
| `children` | ReactNode | optional | Content on top |

### StickyCards
Cards enter from below and stack with slight offset. Great for schedules/lists.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `cards` | CardData[] | required | `{title, subtitle?, backgroundColor?, color?, accentColor?}` |
| `startFrame` | number | 0 | First card entrance |
| `stagger` | number | 25 | Frames between cards |
| `stackOffset` | number | 24 | Vertical px between stacked cards |

### SplitScreen
Two halves animate in from opposite sides with a divider line.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `left` | ReactNode | required | Left/top content |
| `right` | ReactNode | required | Right/bottom content |
| `direction` | "vertical" \| "horizontal" | "vertical" | Split orientation |
| `startFrame` | number | 0 | Entrance start |
| `dividerColor` | string | COLORS.red | |

### HorizontalPan
Pans a wide content strip horizontally across the viewport.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `contentWidth` | number | 4000 | Total strip width in px |
| `startFrame` | number | 0 | Pan start |
| `duration` | number | 90 | Full pan duration |
| `easing` | "linear" \| "easeInOut" \| "easeOut" | "easeInOut" | |
| `children` | ReactNode | required | Horizontally laid-out content |

### StickyStack
Foreground stays pinned while backgrounds cross-dissolve.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `foreground` | ReactNode | required | Pinned element (quote, overlay) |
| `backgrounds` | ReactNode[] | required | Scenes that cycle behind |
| `holdDuration` | number | 60 | Frames each bg is visible |
| `transitionDuration` | number | 15 | Cross-dissolve frames |

## Brand Defaults

All components use DB brand defaults:
- **Colors:** `COLORS.red` (#C4161C), `COLORS.black` (#0E0E0E), `COLORS.white` (#FFFFFF), `COLORS.gold` (#D4A843)
- **Fonts:** `FONTS.headline` (Oswald), `FONTS.body` (Inter)
- **Dimensions:** 1080x1920 (9:16), 30fps
- **Safe zones:** top 210px, bottom 420px, sides 120px

## Audio Sync Tips

The biggest "cinematic unlock" is syncing effects to music beats:
- Anchor `GlitchEffect` to beat drops (set `startFrame` to the beat frame)
- Land `TextScramble` reveals on vocal hits
- Time `Typewriter` line breaks to land on downbeats
- Use `KineticMarquee` speed changes to match energy shifts

## Project Location

- **Components:** `reels/src/cinematic-effects/`
- **Shared brand styles:** `reels/src/components/BrandStyles.ts`
- **Compositions:** `reels/src/` (one file per reel)
- **Static assets:** `reels/public/`
- **Render output:** `reels/out/`
- **Studio:** `cd reels && npm run studio`
- **Render:** `cd reels && npm run render:camp-story`

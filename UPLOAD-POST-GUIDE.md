# Upload-Post Social Media Posting Guide

> Reference doc for posting to social media via the Upload-Post Node.js SDK.
> Use this when you need to post videos, photos, or text to any social platform.

## Setup

```bash
# In any project directory:
npm install upload-post
```

**API Key** (from secrets.env):
```bash
source /Users/noahajeo/.openclaw/workspace/secrets.env
# Key is in: $UPLOAD_POST_API_KEY
```

## Quick Start Template

```javascript
import { UploadPost } from 'upload-post/index.js';
import { readFileSync } from 'fs';

// Load API key
const secrets = readFileSync('/Users/noahajeo/.openclaw/workspace/secrets.env', 'utf8');
const apiKey = secrets.match(/UPLOAD_POST_API_KEY=(.*)/)?.[1]?.trim();
const client = new UploadPost(apiKey);
```

## Our Accounts (profile names are case-sensitive!)

| Profile | Platforms | Notes |
|---------|-----------|-------|
| `dbelitefitness` | IG + FB + Threads + LinkedIn | Different Breed Elite Fitness |
| `exit_163` | IG + FB | Exit 163 newsletter |
| `ajeo` | IG + LinkedIn | Ajeo (Joey's brand) |
| `american_safe` | IG + Threads | American Safe (@american_safe_vault) |

## Posting Videos

```javascript
// Basic video post (e.g. reel)
const response = await client.upload('/path/to/video.mp4', {
  title: 'Your caption here',
  user: 'dbelitefitness',           // profile name (case-sensitive)
  platforms: ['instagram', 'facebook'],
  instagram: { isReel: true },       // post as Reel
});

// Post as Instagram Story
const response = await client.upload('/path/to/video.mp4', {
  title: 'Story caption',
  user: 'dbelitefitness',
  platforms: ['instagram'],
  instagramMediaType: 'STORIES',
});

// Post as Facebook Reel
const response = await client.upload('/path/to/video.mp4', {
  title: 'FB caption (255 char max!)',
  user: 'dbelitefitness',
  platforms: ['facebook'],
  facebookMediaType: 'REELS',
});
```

**IMPORTANT:** The param is `title` (not `caption`) and `user` (not `profile`).

## Posting Photos

```javascript
// Single or multiple photos
const response = await client.uploadPhotos(
  ['/path/to/photo1.jpg', '/path/to/photo2.jpg'],
  {
    title: 'Photo caption here',
    user: 'dbelitefitness',
    platforms: ['instagram', 'facebook'],
    instagramMediaType: 'IMAGE',      // 'IMAGE' for feed, 'STORIES' for story
  }
);
```

## Posting Text

```javascript
const response = await client.uploadText({
  title: 'Your text post content',
  user: 'ajeo',
  platforms: ['linkedin'],
  linkedinVisibility: 'PUBLIC',
  // For LinkedIn body text (separate from title):
  linkedinDescription: 'Extended description here',
});
```

## Posting to LinkedIn

```javascript
// Personal profile post
const response = await client.upload('/path/to/video.mp4', {
  title: 'Post title',
  user: 'ajeo',
  platforms: ['linkedin'],
  linkedinVisibility: 'PUBLIC',
  linkedinDescription: 'Body text goes here',
});

// Text-only LinkedIn post
const response = await client.uploadText({
  title: 'Your LinkedIn post text',
  user: 'ajeo',
  platforms: ['linkedin'],
  linkedinVisibility: 'PUBLIC',
});
```

## Async Upload Handling

Large uploads go async. Poll for completion:

```javascript
const response = await client.upload('/path/to/large-video.mp4', {
  title: 'Big video',
  user: 'dbelitefitness',
  platforms: ['instagram', 'facebook'],
});

// If async, poll status
if (response.request_id) {
  let status;
  do {
    await new Promise(r => setTimeout(r, 5000)); // wait 5s
    status = await client.getStatus(response.request_id);
    console.log('Status:', status.status);
  } while (status.status !== 'completed' && status.status !== 'error');
  console.log('Final:', status);
}
```

## Platform-Specific Options

### Instagram
- `instagramMediaType`: `'REELS'` | `'STORIES'` | `'IMAGE'`
- `instagramCollaborators`: comma-separated usernames
- `instagramUserTags`: comma-separated user tags
- `instagramCoverUrl`: custom cover image URL
- `instagramLocationId`: location ID
- `firstComment`: auto-post first comment after publishing

### Facebook
- `facebookMediaType`: `'REELS'` | `'STORIES'` | `'VIDEO'`
- **Caption limit: 255 characters** (truncate or use shorter version)
- `facebookVideoState`: `'PUBLISHED'` | `'DRAFT'`

### LinkedIn
- `linkedinVisibility`: `'PUBLIC'` | `'CONNECTIONS'` | `'LOGGED_IN'`
- `linkedinDescription`: body text
- `targetLinkedinPageId`: for company page posts

### Threads
- Posts go through the same `upload()` / `uploadPhotos()` methods
- Platform name: `'threads'`

## Business Rules (MUST FOLLOW)

1. **Different Breed (dbelitefitness):** ALL content goes to BOTH IG + FB. Always.
2. **Facebook caption limit:** 255 characters. If IG caption is longer, use `facebookTitle` for a shortened version.
3. **DB daily schedule posts:** Post as **STORIES** (not Reels). Use `instagramMediaType: 'STORIES'`.
4. **Profile names are case-sensitive.** Use exact names from the table above.
5. **Instagram hashtag limit:** Max 5 hashtags per post.
6. **Always credit @veteranwithacamera** on DB posts using his content.
7. **LinkedIn (ajeo profile):** NEVER mention client names — use industry descriptions only.
8. **American Safe:** NO real installation photos (privacy). Use AI-generated vault imagery only.

## Handling Different Captions Per Platform

When IG and FB need different captions (e.g., FB is shorter):

```javascript
// Post to IG with full caption
const igResponse = await client.upload('/path/to/video.mp4', {
  title: 'Full long Instagram caption with all the details...',
  user: 'dbelitefitness',
  platforms: ['instagram'],
});

// Post to FB with short caption
const fbResponse = await client.upload('/path/to/video.mp4', {
  title: 'Short FB caption (under 255 chars)',
  user: 'dbelitefitness',
  platforms: ['facebook'],
  facebookMediaType: 'REELS',
});
```

Or use platform-specific title overrides in a single call:

```javascript
const response = await client.upload('/path/to/video.mp4', {
  title: 'Default caption for most platforms',
  instagramTitle: 'Full IG caption with hashtags and details...',
  facebookTitle: 'Short FB version (255 char max)',
  user: 'dbelitefitness',
  platforms: ['instagram', 'facebook'],
});
```

## Scheduling Posts

```javascript
const response = await client.upload('/path/to/video.mp4', {
  title: 'Scheduled post',
  user: 'dbelitefitness',
  platforms: ['instagram', 'facebook'],
  scheduledDate: '2026-04-15T10:00:00Z',
  timezone: 'America/New_York',
});
```

## First Comment (Auto)

```javascript
const response = await client.upload('/path/to/video.mp4', {
  title: 'Main caption',
  user: 'dbelitefitness',
  platforms: ['instagram'],
  firstComment: 'First comment with extra hashtags or links',
  // Or platform-specific:
  instagramFirstComment: 'IG-specific first comment',
  facebookFirstComment: 'FB-specific first comment',
});
```

## Upload Documents (LinkedIn only)

```javascript
const response = await client.uploadDocument('/path/to/deck.pdf', {
  title: 'Document title',
  user: 'ajeo',
  description: 'Description text',
  linkedinVisibility: 'PUBLIC',
});
```

## Troubleshooting

- **"user not found"** → Check profile name is exact match (case-sensitive)
- **Upload hangs** → Large files go async; use `getStatus(requestId)` to poll
- **FB post fails** → Caption might exceed 255 chars
- **No delete API** → Upload-Post has no delete endpoint; delete manually on the platform
- **LinkedIn requires video format** → For static images on LinkedIn, convert to a short video first

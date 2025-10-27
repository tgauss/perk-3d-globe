# M&M's Fun Club Globe - Integration Quickstart

**Last Updated**: October 27, 2025
**Repository**: https://github.com/tgauss/perk-3d-globe
**Live Demo**: https://perk-3d-globe.vercel.app

## Overview

The M&M's Fun Club 3D Globe is a fully portable React component that visualizes member activities on an interactive 3D globe. This guide shows you how to integrate it into another React/Node.js application.

## What You Get

- 🌍 **3D Globe Visualization** - Interactive globe with activity markers
- 🎨 **M&M's Branded** - Official colors, no gradients, brand compliant
- ⚡ **Progressive Loading** - 20 initial + batches of 30 up to 100 activities
- 🎬 **Animated Loading Screen** - 5-stage loading with live activity feed
- ⏱️ **Relative Timestamps** - "3min ago", "2hr ago", "today", "recently"
- 📍 **Vertical Pillars** - Color-coded activity markers by type
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- 🔌 **Configurable** - Custom API endpoints, program IDs, and styling

## Features

### Core Functionality
- Progressive batch loading (fast initial load, then background fetching)
- Fresh data on every page load (no stale cache)
- Dual geocoding (IP addresses + city/state fallback)
- Automatic replay with activity cards
- Click to explore individual activities
- 5-second minimum loading screen for polish

### Activity Types with M&M's Colors
- 🔑 Brown (#5A1F06) - Account & System (join, sign in)
- 🏆 Yellow (#FFD200) - Rewards & Achievements
- 🛒 Green (#00A836) - Commerce & Receipts
- 📺 Blue (#0E74E1) - Content & Education (videos, quizzes)
- 🎮 Orange (#FA6400) - Social & Games
- 💰 Red (#D70100) - Negative/Spending

### Technical Stack
- React 18+
- react-globe.gl (3D visualization)
- Metabase API integration
- IP geolocation services
- Vercel serverless functions

## Quick Start (15 minutes)

### Prerequisites
- React/Node.js application (React 18+ recommended)
- Access to same Metabase instance (Question 178)
- Node.js 18+ and npm/yarn

### Installation Steps

**Option A: Copy Files Directly (Fastest - 15 minutes)**

1. **Copy component files** from this repo:
   ```
   src/routes/mms-globe.jsx → [your-app]/components/MMSGlobe.jsx
   src/components/MMSLoadingScreen.jsx → [your-app]/components/MMSLoadingScreen.jsx
   src/hooks/useMMSGlobeData.js → [your-app]/hooks/useMMSGlobeData.js
   src/constants/globe-config.js → [your-app]/constants/globe-config.js
   api/mms-activity.js → [your-app]/api/mms-activity.js
   ```

2. **Install dependencies**:
   ```bash
   npm install react-globe.gl three prop-types
   ```

3. **Add to your page**:
   ```jsx
   import MMSGlobe from './components/MMSGlobe';

   function MyPage() {
     return (
       <div style={{ width: '100vw', height: '100vh' }}>
         <MMSGlobe />
       </div>
     );
   }
   ```

4. **Done!** The globe should work with default settings.

## Configuration Options

All props are optional and have sensible defaults:

```jsx
<MMSGlobe
  // Data Loading
  initialLimit={20}           // Initial activities to load (default: 20)
  batchSize={30}              // Activities per batch (default: 30)
  maxTotal={100}              // Maximum total activities (default: 100)
  batchDelay={15000}          // ms between batches (default: 15000)
  minLoadingTime={5000}       // Minimum loading screen (default: 5000)

  // API Configuration
  apiEndpoint="/api/mms-activity"  // Your API endpoint
  programId="10000154"             // M&M's Fun Club program ID

  // Appearance
  backgroundColor="#FFD200"    // M&M's yellow
  playbackSpeed={3000}        // ms per activity (default: 3000)

  // Event Callbacks
  onActivityClick={(activity) => console.log(activity)}
  onLoad={() => console.log('Globe loaded')}
  onError={(error) => console.error(error)}
/>
```

## API Endpoint Setup

The globe requires a serverless function that:
1. Fetches from Metabase Question 178
2. Geocodes IP addresses and city/state
3. Returns activity points with coordinates

**Copy `api/mms-activity.js` to your project** - it's a Vercel serverless function that works out of the box.

### Environment Variables

Add to your `.env`:
```bash
METABASE_URL=https://your-metabase.com
METABASE_USERNAME=your-username
METABASE_PASSWORD=your-password
```

## Metabase Setup

The globe uses **Metabase Question 178** which should use the optimized SQL query from `sql/globe_activity_feed.sql`.

**Key Features of This Query:**
- Pre-calculates Unix timestamps for efficiency
- Samples from last 7 days for time diversity
- One activity per participant (spam prevention)
- Returns "Timestamp (ms)" field for accurate relative times

**If Question 178 isn't set up**, create a new question with the SQL from `sql/globe_activity_feed.sql` and update `apiEndpoint`.

## Customization Examples

### Custom Colors
```jsx
import { MMS_BRAND_COLORS } from './constants/globe-config';

<MMSGlobe
  backgroundColor={MMS_BRAND_COLORS.orange}
/>
```

### Custom API Endpoint
```jsx
<MMSGlobe
  apiEndpoint="/api/custom-activities"
  programId="10000999"
/>
```

### Event Handling
```jsx
<MMSGlobe
  onActivityClick={(activity) => {
    console.log('Activity clicked:', activity);
    // Open modal, navigate, etc.
  }}
  onError={(error) => {
    // Handle errors (show toast, log to service, etc.)
  }}
/>
```

### Faster Loading
```jsx
<MMSGlobe
  minLoadingTime={3000}      // Shorter loading screen
  playbackSpeed={2000}       // Faster replay
  batchDelay={10000}         // Faster batch loading
/>
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  MMSGlobe                       │
│  (Main component with globe visualization)     │
└────────────┬────────────────────────────────────┘
             │
             ├─── MMSLoadingScreen
             │    (5-stage animated loading)
             │
             ├─── useMMSGlobeData (hook)
             │    ├─── Progressive batch loading
             │    ├─── Cache busting
             │    └─── State management
             │
             └─── API Endpoint
                  ├─── Fetch from Metabase
                  ├─── Geocode IPs + cities
                  └─── Return activity points
```

## File Reference

### Core Components
- **MMSGlobe** (`src/routes/mms-globe.jsx`) - Main globe component
- **MMSLoadingScreen** (`src/components/MMSLoadingScreen.jsx`) - Loading animation
- **useMMSGlobeData** (`src/hooks/useMMSGlobeData.js`) - Data fetching hook
- **globe-config** (`src/constants/globe-config.js`) - Configuration constants

### API
- **mms-activity** (`api/mms-activity.js`) - Vercel serverless function
- **SQL Query** (`sql/globe_activity_feed.sql`) - Optimized Metabase query

### Documentation
- **CHANGELOG.md** - Complete change history
- **INTEGRATION_GUIDE.md** - Multiple integration approaches
- **REACT_INTEGRATION.md** - React-specific integration guide
- **README.md** - Project overview and setup

## Troubleshooting

### "Everything shows 1s ago"
- Check that Metabase Question 178 uses the SQL from `sql/globe_activity_feed.sql`
- Verify "Timestamp (ms)" field is returned in API response
- Clear browser cache and refresh

### Globe not centered on resize
- Verify you're on the latest version (ResizeObserver implementation)
- Check that globe container has proper width/height

### No activities showing
- Check API endpoint is returning data
- Verify Metabase credentials in environment variables
- Check browser console for errors
- Ensure geocoding services are accessible

### Loading screen too fast/slow
- Adjust `minLoadingTime` prop (default: 5000ms)
- Minimum recommended: 3000ms for full animation

### Activities repeating
- Check `maxTotal` prop (default: 100)
- Verify batch loading is working (check Network tab)
- Ensure Metabase query returns diverse timestamps

## Performance Tips

1. **Geocoding Cache**: IP geocoding results are cached for performance
2. **Progressive Loading**: Shows 20 activities immediately, loads more in background
3. **Static Pillars**: Pillars don't animate (reduces GPU load)
4. **ResizeObserver**: Smooth responsive updates without lag
5. **Timestamp Diversity**: SQL query samples from 7 days for variety

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 90+)

## License

Contact Mars/Perk team for licensing information.

## Support

- **Issues**: https://github.com/tgauss/perk-3d-globe/issues
- **Live Demo**: https://perk-3d-globe.vercel.app
- **Documentation**: See CHANGELOG.md for detailed change history

---

## Claude Code Integration Prompt

**Copy this prompt and paste it into Claude Code in your other React/Node.js application:**

```
I need to integrate the M&M's Fun Club 3D Globe from https://github.com/tgauss/perk-3d-globe into my React/Node.js application.

Please follow these steps:

1. **Copy these files** from the perk-3d-globe repository:
   - src/routes/mms-globe.jsx → src/components/MMSGlobe.jsx
   - src/components/MMSLoadingScreen.jsx → src/components/MMSLoadingScreen.jsx
   - src/hooks/useMMSGlobeData.js → src/hooks/useMMSGlobeData.js
   - src/constants/globe-config.js → src/constants/globe-config.js
   - api/mms-activity.js → api/mms-activity.js
   - public/light-earth-map.jpg → public/light-earth-map.jpg (if needed)

2. **Install required dependencies**:
   npm install react-globe.gl three prop-types

3. **Create a new page** (or update an existing one) to display the globe:
   - Import MMSGlobe component
   - Add it to the page with full viewport dimensions
   - Use default configuration for M&M's Fun Club (program ID: 10000154)

4. **Verify environment variables** are set:
   - METABASE_URL
   - METABASE_USERNAME
   - METABASE_PASSWORD

5. **Test the integration**:
   - Start the dev server
   - Navigate to the page with the globe
   - Verify the 5-stage loading screen appears
   - Confirm activities appear on the globe
   - Check that timestamps show relative times (e.g., "3min ago")
   - Test responsive behavior by resizing the browser

The globe should work with these defaults:
- 20 initial activities (fast startup)
- Progressive loading up to 100 activities
- M&M's yellow background (#FFD200)
- Activity-specific colored pillars
- Relative timestamps
- Fresh data on every page load

Let me know if you encounter any issues with paths, dependencies, or API connectivity.
```

---

**Last Updated**: October 27, 2025
**Version**: 2.0.0
**Status**: Production Ready ✅

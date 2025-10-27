# Integration Guide - M&M's Globe Component

Guide for embedding the M&M's Fun Club Globe in other applications and reporting tools.

---

## Option 1: Iframe Embed (Easiest - Works Now!)

**Best for:** Quick integration, no code changes needed

### Setup:

1. **Deploy the globe** (already done on Vercel)
2. **Embed with iframe** in your reporting tool:

```html
<!-- Basic Embed -->
<iframe
  src="https://your-vercel-app.vercel.app/mms"
  width="100%"
  height="800px"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  allow="autoplay"
></iframe>
```

```html
<!-- Responsive Embed -->
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://your-vercel-app.vercel.app/mms"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    frameborder="0"
    allow="autoplay"
  ></iframe>
</div>
```

### Pros:
- ✅ Works immediately (no build/packaging needed)
- ✅ Isolated environment (no CSS conflicts)
- ✅ Auto-updates when you deploy changes
- ✅ Works in any platform (React, Vue, vanilla HTML)

### Cons:
- ❌ Limited communication with parent page
- ❌ Separate network requests
- ❌ Can't easily pass custom data

### Communication with Parent Page:

```javascript
// In parent reporting tool
<script>
  // Listen for messages from globe
  window.addEventListener('message', (event) => {
    if (event.origin === 'https://your-vercel-app.vercel.app') {
      console.log('Globe event:', event.data);
      // { type: 'activity-clicked', data: {...} }
    }
  });

  // Send message to globe
  const iframe = document.getElementById('mms-globe');
  iframe.contentWindow.postMessage({
    type: 'filter',
    programId: '10000154'
  }, 'https://your-vercel-app.vercel.app');
</script>
```

---

## Option 2: NPM Package (Most Integrated)

**Best for:** React applications, full control and customization

### Steps to Create Package:

#### 1. Update package.json for publishing:

```json
{
  "name": "@yourorg/mms-globe",
  "version": "1.0.0",
  "description": "M&M's Fun Club 3D Activity Globe Component",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "react-globe.gl": "^2.27.2"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

#### 2. Create entry point (src/index.js):

```javascript
// Export main components
export { default as MMSGlobe } from './routes/mms-globe';
export { default as MMSLoadingScreen } from './components/MMSLoadingScreen';
export { useMMSGlobeData } from './hooks/useMMSGlobeData';

// Export types/utilities if needed
export * from './utils/activityTypes';
```

#### 3. Install build tools:

```bash
npm install --save-dev @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-babel rollup-plugin-peer-deps-external rollup
```

#### 4. Create rollup.config.js:

```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react'],
    }),
  ],
};
```

#### 5. Build and publish:

```bash
# Build the package
npm run build

# Login to npm
npm login

# Publish
npm publish --access public
```

### Usage in Other React Apps:

```bash
npm install @yourorg/mms-globe
```

```jsx
import { MMSGlobe } from '@yourorg/mms-globe';
import '@yourorg/mms-globe/dist/index.css';

function MyReportingDashboard() {
  return (
    <div className="dashboard">
      <h1>M&M's Fun Club Analytics</h1>

      {/* Embed the globe */}
      <MMSGlobe />

      {/* Or with custom config */}
      <MMSGlobe
        initialLimit={30}
        maxTotal={150}
        programId="10000154"
      />
    </div>
  );
}
```

### Pros:
- ✅ Full React integration
- ✅ Customizable props
- ✅ Type safety (TypeScript)
- ✅ Tree-shakeable imports
- ✅ Same build process as parent app

### Cons:
- ❌ Requires packaging setup
- ❌ Need to publish updates
- ❌ React-specific

---

## Option 3: Web Component (Most Portable)

**Best for:** Framework-agnostic integration (works in React, Vue, Angular, vanilla JS)

### Create Web Component Wrapper:

```javascript
// src/web-component/mms-globe-element.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import MMSGlobe from '../routes/mms-globe';

class MMSGlobeElement extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    // Get attributes
    const initialLimit = parseInt(this.getAttribute('initial-limit')) || 20;
    const maxTotal = parseInt(this.getAttribute('max-total')) || 100;
    const programId = this.getAttribute('program-id');

    // Render React component
    this.root = ReactDOM.createRoot(mountPoint);
    this.root.render(
      <MMSGlobe
        initialLimit={initialLimit}
        maxTotal={maxTotal}
        programId={programId}
      />
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

// Register the custom element
customElements.define('mms-globe', MMSGlobeElement);
```

### Build standalone bundle:

```javascript
// webpack.config.js
module.exports = {
  entry: './src/web-component/mms-globe-element.js',
  output: {
    filename: 'mms-globe.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // ... webpack config for bundling
};
```

### Usage in Any Framework:

```html
<!-- Include the script -->
<script src="https://cdn.yoursite.com/mms-globe.min.js"></script>

<!-- Use the web component -->
<mms-globe
  initial-limit="30"
  max-total="150"
  program-id="10000154"
></mms-globe>
```

```jsx
// Works in React
function Dashboard() {
  return <mms-globe initial-limit="30" />;
}
```

```vue
<!-- Works in Vue -->
<template>
  <mms-globe initial-limit="30" />
</template>
```

### Pros:
- ✅ Framework-agnostic
- ✅ Works anywhere (React, Vue, Angular, vanilla)
- ✅ Scoped styles (Shadow DOM)
- ✅ Standard web technology

### Cons:
- ❌ Requires bundling setup
- ❌ Shadow DOM can complicate styling
- ❌ Larger bundle size

---

## Option 4: Direct Import (Monorepo)

**Best for:** Multiple apps in same organization

### Setup Git Submodule:

```bash
# In your reporting tool repo
git submodule add https://github.com/yourorg/perk-3d-globe.git packages/mms-globe

# Install dependencies
cd packages/mms-globe && npm install
```

### Import directly:

```jsx
// In your reporting tool
import MMSGlobe from '../../packages/mms-globe/src/routes/mms-globe';

function Dashboard() {
  return <MMSGlobe />;
}
```

### Pros:
- ✅ No packaging needed
- ✅ Direct source access
- ✅ Easy to modify

### Cons:
- ❌ Tight coupling
- ❌ Version management challenges
- ❌ Build complexity

---

## Option 5: CDN Distribution

**Best for:** Maximum portability, quick embedding

### Build standalone bundle:

```bash
# Build production bundle
npm run build

# Upload to CDN (Cloudflare, AWS S3, etc.)
aws s3 cp dist/mms-globe.min.js s3://your-cdn-bucket/
```

### Usage:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.yoursite.com/mms-globe.min.css">
</head>
<body>
  <div id="mms-globe-container"></div>

  <script src="https://cdn.yoursite.com/mms-globe.min.js"></script>
  <script>
    MMSGlobe.init({
      container: '#mms-globe-container',
      initialLimit: 30,
      maxTotal: 150,
      programId: '10000154'
    });
  </script>
</body>
</html>
```

### Pros:
- ✅ No installation needed
- ✅ Works anywhere
- ✅ Simple script tag

### Cons:
- ❌ Global namespace pollution
- ❌ Version control challenges
- ❌ Large initial download

---

## Recommended Approach

### For Your Use Case (Embedding in Reporting Tool):

**Phase 1 - Quick Start (Now):**
```
Use Option 1: Iframe Embed
```
- Deploy current code to Vercel
- Embed via iframe in reporting tool
- Works immediately, no changes needed
- Can enhance later

**Phase 2 - Enhanced Integration (Later):**
```
Use Option 2: NPM Package OR Option 3: Web Component
```
- If reporting tool is React → NPM Package
- If reporting tool uses multiple frameworks → Web Component
- Better integration, customization, performance

---

## Configuration Options

### Props/Attributes to Support:

```typescript
interface MMSGlobeConfig {
  // Data loading
  initialLimit?: number;        // Default: 20
  maxTotal?: number;            // Default: 100
  batchSize?: number;           // Default: 30
  batchDelay?: number;          // Default: 15000 (ms)

  // Filtering
  programId?: string;           // Default: M&M's program
  startDate?: Date;             // Filter activities after date
  endDate?: Date;               // Filter activities before date
  actionTypes?: number[];       // Filter specific action types

  // Appearance
  backgroundColor?: string;     // Globe background
  playbackSpeed?: number;       // Animation speed (ms)
  showLoadingScreen?: boolean;  // Default: true

  // API
  apiEndpoint?: string;         // Custom API endpoint

  // Events
  onActivityClick?: (activity) => void;
  onLoad?: () => void;
  onError?: (error) => void;
}
```

### Example with Custom Config:

```jsx
<MMSGlobe
  initialLimit={30}
  maxTotal={200}
  programId="10000154"
  backgroundColor="#FFD200"
  onActivityClick={(activity) => {
    console.log('Activity clicked:', activity);
    // Open detail modal, etc.
  }}
  onLoad={() => {
    console.log('Globe loaded successfully');
  }}
/>
```

---

## Security Considerations

### If using Iframe:
- Set appropriate `Content-Security-Policy` headers
- Whitelist iframe domains
- Use HTTPS only

### If publishing Package:
- Don't expose Metabase credentials
- Use environment variables
- Provide API endpoint as prop

### Example Secure Config:

```jsx
// In reporting tool
<MMSGlobe
  apiEndpoint={process.env.REACT_APP_MMS_API}
  programId={process.env.REACT_APP_PROGRAM_ID}
/>

// In globe component - accept custom API
const { points, isLoading } = useMMSGlobeData({
  apiEndpoint: props.apiEndpoint || '/api/mms-activity',
  programId: props.programId
});
```

---

## Next Steps

1. **Immediate (Iframe):**
   - Ensure Vercel deployment is stable
   - Add `/mms` route to standalone page
   - Test iframe embedding in reporting tool

2. **Short-term (Package):**
   - Choose packaging approach (NPM vs Web Component)
   - Set up build configuration
   - Create configuration props
   - Publish to registry

3. **Long-term (Enhancement):**
   - Add TypeScript types
   - Create Storybook documentation
   - Add unit tests
   - Create demo site

---

## Example: Quick Iframe Setup

### 1. Create standalone route (already done at `/mms`)

### 2. Embed in reporting tool:

```html
<!-- reporting-tool/dashboard.html -->
<!DOCTYPE html>
<html>
<head>
  <title>M&M's Analytics Dashboard</title>
  <style>
    .globe-container {
      width: 100%;
      height: 800px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>M&M's Fun Club Activity Globe</h1>

  <div class="globe-container">
    <iframe
      src="https://your-vercel-app.vercel.app/mms"
      width="100%"
      height="100%"
      frameborder="0"
      style="border: none;"
    ></iframe>
  </div>
</body>
</html>
```

That's it! The globe is now embedded in your reporting tool. 🎉

---

## Support & Updates

**Repository:** https://github.com/yourorg/perk-3d-globe
**Documentation:** See CHANGELOG.md for latest updates
**Issues:** Report integration issues on GitHub

**Version:** 1.0.0
**Last Updated:** 2025-10-15

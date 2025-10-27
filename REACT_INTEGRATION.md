# React-to-React Integration Guide

**Scenario:** Integrating M&M's Globe into another React/Node.js reporting tool with shared Metabase access.

---

## 🎯 Recommended Approach: NPM Workspace (Monorepo Style)

Since both apps use React + Node.js + Metabase, the best approach is to share the component at source level.

---

## Option A: NPM Workspaces (Best for Shared Codebase)

### Setup Structure:

```
your-organization/
├── packages/
│   ├── mms-globe/              # This project
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── reporting-tool/         # Your other tool
│       ├── src/
│       ├── package.json
│       └── ...
├── package.json                # Root workspace config
└── lerna.json (optional)
```

### 1. Create Root package.json:

```json
{
  "name": "mms-analytics-workspace",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev:globe": "npm run dev --workspace=mms-globe",
    "dev:reporting": "npm run dev --workspace=reporting-tool",
    "build": "npm run build --workspaces"
  }
}
```

### 2. Update Globe package.json:

```json
{
  "name": "@mms/globe",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./hooks": "./src/hooks/index.js",
    "./components": "./src/components/index.js"
  }
}
```

### 3. Create Export Index (src/index.js):

```javascript
// Main components
export { default as MMSGlobe } from './routes/mms-globe';
export { default as MMSLoadingScreen } from './components/MMSLoadingScreen';

// Hooks
export { useMMSGlobeData } from './hooks/useMMSGlobeData';

// Utilities (if needed)
export { getActivityType } from './utils/activityTypes';
```

### 4. Use in Reporting Tool:

```javascript
// packages/reporting-tool/src/pages/GlobeDashboard.jsx
import { MMSGlobe, useMMSGlobeData } from '@mms/globe';
import '@mms/globe/src/index.css'; // Import styles

function GlobeDashboard() {
  return (
    <div className="dashboard">
      <h1>M&M's Fun Club Activity Globe</h1>
      <MMSGlobe />
    </div>
  );
}
```

### 5. Install Dependencies:

```bash
# From root
npm install

# This installs all workspaces and links them
```

### Benefits:
- ✅ No build step needed (source-level import)
- ✅ Hot reload works across packages
- ✅ Shared dependencies (single node_modules)
- ✅ Easy to modify both apps simultaneously
- ✅ TypeScript types work automatically

---

## Option B: Shared Hook + Component Pattern

**Best if:** You want reporting tool to have full control over data fetching.

### 1. Extract Shared Hook to Reporting Tool:

```javascript
// reporting-tool/src/hooks/useMMSGlobeData.js
// Copy from mms-globe/src/hooks/useMMSGlobeData.js

export const useMMSGlobeData = ({
  initialLimit = 20,
  batchSize = 30,
  maxTotal = 100,
  programId = '10000154', // Make this configurable
  // ... other options
} = {}) => {
  // Same implementation
  // But can customize for your reporting tool needs
};
```

### 2. Copy Globe Component:

```javascript
// reporting-tool/src/components/MMSGlobe.jsx
// Copy from mms-globe/src/routes/mms-globe.jsx

import { useMMSGlobeData } from '../hooks/useMMSGlobeData';

export function MMSGlobe({ programId, ...props }) {
  const { points, isLoading, error } = useMMSGlobeData({
    programId,
    ...props
  });

  // Rest of component...
}
```

### 3. Use with Custom Props:

```javascript
// reporting-tool/src/pages/Dashboard.jsx
import { MMSGlobe } from '../components/MMSGlobe';

function Dashboard() {
  return (
    <div>
      <h1>Multi-Program Dashboard</h1>

      {/* M&M's Globe */}
      <MMSGlobe programId="10000154" />

      {/* Could add other programs */}
      <MMSGlobe programId="10000155" />
    </div>
  );
}
```

### Benefits:
- ✅ Full control over implementation
- ✅ Can customize for specific needs
- ✅ No dependency on external package
- ✅ Easy to modify

### Drawbacks:
- ❌ Need to manually sync updates
- ❌ Duplicate code

---

## Option C: Shared Metabase API Module

**Best if:** Both apps need same data but different visualizations.

### 1. Create Shared API Package:

```
packages/
├── mms-api/
│   ├── src/
│   │   ├── metabase.js       # Metabase client
│   │   ├── queries.js        # SQL queries
│   │   └── index.js
│   └── package.json
├── mms-globe/                 # Uses @mms/api
└── reporting-tool/            # Uses @mms/api
```

### 2. Metabase Client (packages/mms-api/src/metabase.js):

```javascript
export class MetabaseClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.username = config.username;
    this.password = config.password;
    this.sessionToken = null;
  }

  async authenticate() {
    const response = await fetch(`${this.baseUrl}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        password: this.password
      })
    });

    const data = await response.json();
    this.sessionToken = data.id;
    return this.sessionToken;
  }

  async query(questionId, parameters = {}) {
    if (!this.sessionToken) {
      await this.authenticate();
    }

    const params = new URLSearchParams();
    if (Object.keys(parameters).length > 0) {
      params.append('parameters', JSON.stringify(parameters));
    }

    const url = `${this.baseUrl}/api/card/${questionId}/query/json?${params}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': this.sessionToken
      }
    });

    return response.json();
  }

  async getGlobeActivities({ limit = 50, programId } = {}) {
    // Call your optimized query (question 178)
    const parameters = programId ? [
      {
        type: 'category',
        target: ['variable', ['template-tag', 'program_id']],
        value: programId
      }
    ] : [];

    return this.query(178, parameters);
  }
}
```

### 3. Use in Both Apps:

```javascript
// reporting-tool/src/hooks/useMetabaseData.js
import { MetabaseClient } from '@mms/api';

const client = new MetabaseClient({
  baseUrl: process.env.REACT_APP_METABASE_URL,
  username: process.env.REACT_APP_METABASE_USER,
  password: process.env.REACT_APP_METABASE_PASSWORD
});

export function useGlobeActivities(options) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.getGlobeActivities(options)
      .then(setData)
      .finally(() => setLoading(false));
  }, [options]);

  return { data, loading };
}
```

```javascript
// mms-globe/src/hooks/useMMSGlobeData.js
import { MetabaseClient } from '@mms/api';

// Same pattern - shared client
```

### Benefits:
- ✅ Single source of truth for queries
- ✅ Shared authentication/session management
- ✅ Easy to add new queries for other reports
- ✅ Better caching strategy
- ✅ Consistent error handling

---

## Option D: Git Submodule (Quick & Simple)

**Best if:** You want to keep projects separate but share code.

### 1. Add Globe as Submodule:

```bash
cd your-reporting-tool
git submodule add https://github.com/yourorg/perk-3d-globe.git src/vendor/mms-globe
```

### 2. Import Directly:

```javascript
// reporting-tool/src/pages/Dashboard.jsx
import MMSGlobe from '../vendor/mms-globe/src/routes/mms-globe';
import '../vendor/mms-globe/src/index.css';

function Dashboard() {
  return <MMSGlobe />;
}
```

### 3. Update Submodule:

```bash
# Pull latest changes
git submodule update --remote
```

### Benefits:
- ✅ Very simple setup
- ✅ Easy to pull updates
- ✅ Keep repos separate

### Drawbacks:
- ❌ Need to commit submodule updates
- ❌ Can get out of sync
- ❌ Build config may need adjustment

---

## Recommended Setup for Your Use Case

### Phase 1: Quick Integration (Now)

**Use Option B: Copy Components Directly**

1. Copy these files to your reporting tool:
   - `src/routes/mms-globe.jsx` → `reporting-tool/src/components/MMSGlobe.jsx`
   - `src/hooks/useMMSGlobeData.js` → `reporting-tool/src/hooks/useMMSGlobeData.js`
   - `src/components/MMSLoadingScreen.jsx` → `reporting-tool/src/components/MMSLoadingScreen.jsx`
   - `src/index.css` → `reporting-tool/src/styles/globe.css`

2. Install dependencies:
   ```bash
   npm install react-globe.gl
   ```

3. Use in your pages:
   ```javascript
   import MMSGlobe from '../components/MMSGlobe';
   import '../styles/globe.css';

   function Dashboard() {
     return <MMSGlobe />;
   }
   ```

**Time to integrate:** ~15 minutes

---

### Phase 2: Structured Sharing (Later)

**Use Option A: NPM Workspace**

1. Restructure into monorepo
2. Share components at source level
3. Add Lerna for version management
4. Set up shared build pipeline

**Time to set up:** ~2 hours

---

### Phase 3: Shared Services (Future)

**Use Option C: Shared API Module**

1. Extract Metabase client
2. Create shared query library
3. Add caching layer
4. Implement shared types

**Time to set up:** ~4 hours

---

## Example: Full Integration in Reporting Tool

### 1. Install Dependencies:

```bash
cd your-reporting-tool
npm install react-globe.gl
```

### 2. Copy Components:

```bash
# Copy globe component
cp ../perk-3d-globe/src/routes/mms-globe.jsx ./src/components/MMSGlobe.jsx

# Copy hook
cp ../perk-3d-globe/src/hooks/useMMSGlobeData.js ./src/hooks/

# Copy loading screen
cp ../perk-3d-globe/src/components/MMSLoadingScreen.jsx ./src/components/

# Copy styles
cp ../perk-3d-globe/src/index.css ./src/styles/globe.css
```

### 3. Update Imports in Copied Files:

```javascript
// MMSGlobe.jsx - update imports to match your structure
import { useMMSGlobeData } from '../hooks/useMMSGlobeData';
import MMSLoadingScreen from './MMSLoadingScreen';
```

### 4. Configure API Endpoint:

```javascript
// src/hooks/useMMSGlobeData.js
const fetchBatch = async (limit, offset = 0) => {
  const response = await fetch(
    process.env.REACT_APP_API_ENDPOINT || '/api/mms-activity',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify({ limit, _t: Date.now() }),
    }
  );
  // ... rest
};
```

### 5. Use in Dashboard:

```javascript
// src/pages/Dashboard.jsx
import React from 'react';
import MMSGlobe from '../components/MMSGlobe';
import '../styles/globe.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <header>
        <h1>M&M's Fun Club Analytics</h1>
        <nav>{/* Your navigation */}</nav>
      </header>

      <main>
        <section className="metrics">
          {/* Your KPIs and charts */}
        </section>

        <section className="globe-section">
          <h2>Real-Time Activity Globe</h2>
          <MMSGlobe
            initialLimit={30}
            maxTotal={150}
            programId="10000154"
          />
        </section>

        <section className="tables">
          {/* Your data tables */}
        </section>
      </main>
    </div>
  );
}
```

### 6. Add API Route (if needed):

If your reporting tool needs its own API endpoint:

```javascript
// reporting-tool/api/mms-activity.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { limit = 50 } = req.body;

  // Use same Metabase credentials
  const metabaseUrl = process.env.METABASE_URL;
  const username = process.env.METABASE_USERNAME;
  const password = process.env.METABASE_PASSWORD;

  // Authenticate
  const authResponse = await fetch(`${metabaseUrl}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const { id: sessionToken } = await authResponse.json();

  // Query question 178
  const parameters = [{
    type: 'category',
    target: ['variable', ['template-tag', 'program_id']],
    value: '10000154'
  }];

  const queryUrl = `${metabaseUrl}/api/card/178/query/json?parameters=${JSON.stringify(parameters)}`;
  const dataResponse = await fetch(queryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': sessionToken
    }
  });

  const data = await dataResponse.json();

  // Transform and return
  res.json({
    points: data.map(row => ({
      lat: /* geocode */,
      lon: /* geocode */,
      label: row['Activity Marquee String'],
      timestamp: row['Timestamp (ms)'],
      points: row['Branded Points'],
      // ...
    }))
  });
}
```

---

## Advanced: Shared Configuration

### Create Shared Config File:

```javascript
// shared/config/globe.config.js
export const globeConfig = {
  // M&M's Fun Club
  programs: {
    mms: {
      id: '10000154',
      name: "M&M's Fun Club",
      colors: {
        primary: '#FFD200',
        brown: '#5A1F06',
        yellow: '#FFD200',
        green: '#00A836',
        blue: '#0E74E1',
        orange: '#FA6400',
        red: '#D70100'
      },
      metabase: {
        questionId: 178
      }
    },
    // Add other programs
    snickers: {
      id: '10000155',
      name: 'Snickers Club',
      // ...
    }
  },

  // Globe settings
  globe: {
    initialLimit: 20,
    batchSize: 30,
    maxTotal: 100,
    batchDelay: 15000,
    minLoadingTime: 5000,
    playbackSpeed: 3000
  }
};
```

### Use in Both Apps:

```javascript
import { globeConfig } from '@shared/config/globe.config';

<MMSGlobe {...globeConfig.globe} programId={globeConfig.programs.mms.id} />
```

---

## Environment Variables

### Shared .env.example:

```bash
# Metabase
REACT_APP_METABASE_URL=https://metabase.yourcompany.com
REACT_APP_METABASE_USERNAME=your-username
REACT_APP_METABASE_PASSWORD=your-password

# Program IDs
REACT_APP_MMS_PROGRAM_ID=10000154

# API
REACT_APP_API_ENDPOINT=/api/mms-activity

# Globe Config
REACT_APP_GLOBE_INITIAL_LIMIT=20
REACT_APP_GLOBE_MAX_TOTAL=100
```

---

## Testing Integration

### 1. Test in Development:

```bash
# Terminal 1 - Globe app
cd perk-3d-globe
npm run dev

# Terminal 2 - Reporting tool
cd reporting-tool
npm run dev
```

### 2. Test Component:

```javascript
// reporting-tool/src/components/MMSGlobe.test.jsx
import { render, screen } from '@testing-library/react';
import MMSGlobe from './MMSGlobe';

test('renders globe component', () => {
  render(<MMSGlobe />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});
```

---

## Troubleshooting

### Issue: "Module not found: react-globe.gl"
```bash
npm install react-globe.gl
```

### Issue: "Cannot find module '../hooks/useMMSGlobeData'"
- Check import paths match your directory structure
- Update relative imports

### Issue: Styles not applying
- Ensure CSS is imported: `import '../styles/globe.css'`
- Check Tailwind config includes glob paths

### Issue: API errors
- Check environment variables are set
- Verify Metabase credentials
- Check CORS settings if API is on different domain

---

## Next Steps

**Immediate:**
1. Copy components to reporting tool
2. Install react-globe.gl
3. Test basic rendering

**Short-term:**
1. Share Metabase API configuration
2. Add program switching
3. Customize colors/branding

**Long-term:**
1. Move to workspace structure
2. Extract shared API package
3. Add TypeScript types
4. Create shared Storybook

---

## Summary

**For Your Use Case (React + Node.js + Metabase):**

✅ **Start with:** Copy components directly (Option B)
- Takes 15 minutes
- Works immediately
- Full control

🚀 **Upgrade to:** NPM Workspace (Option A)
- Better long-term maintainability
- Shared dependencies
- Hot reload across projects

🎯 **Eventually:** Shared API Module (Option C)
- Single source of truth
- Better caching
- Type safety

The globe is already production-ready and React-native, so integration should be straightforward! 🎉

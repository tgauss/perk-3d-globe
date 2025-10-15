# Perk Activity Globe

A beautiful 3D globe visualization showing real-time Perk user activities from around the world. Built with React, Three.js, and react-globe.gl.

## 🌍 Live Demo

**Production**: [world.perklabs.dev](https://world.perklabs.dev)
**M&M's Fun Club**: [world.perklabs.dev/mms](https://world.perklabs.dev/mms)

## ✨ Features

### Main Globe (`/`)
- **Real-time Activity Visualization**: Watch Perk user activities appear chronologically across the globe
- **Interactive Globe**: Click on any activity point to see details
- **Auto-playing Timeline**: Continuous 3-second intervals with auto-looping
- **Mobile Responsive**: Optimized card positioning and sizing for mobile devices
- **Glassmorphic Design**: Modern translucent activity cards with activity-type icons
- **Geographic Coverage**: Activities from major US metros, Alaska, Hawaii, Canada, and Mexico
- **IBM Plex Sans Typography**: Professional, consistent font styling throughout

### M&M's Fun Club Globe (`/mms`)
- **Branded Experience**: M&M's yellow background (#FFD200) with light gray earth texture
- **Color-Coded Activities**: M&M's brand colors (Brown, Yellow, Green, Blue, Orange, Red) for different activity types
- **Points Display**: Shows earned/spent points as subtitle on activity cards (e.g., "+23,198 points")
- **Official Typography**: All Together Sans and All Together Serif fonts from M&M's brand guidelines
- **Fun Club Logo**: Official M&M's Fun Club branding in top-right corner
- **Non-Repeating Pins**: Pin drop markers grow once and stay at full height
- **Smart Caching**: 20-minute server-side cache with progressive loading (15 → 100 items)
- **Dual Geocoding**: Both IP address and city/state location resolution

## 🎮 Activity Types

The globe visualizes diverse user activities including:
- 🎮 Gaming (challenges, high scores, streaks)
- 🔑 Authentication (sign-ins, joins)
- 🧠 Learning (quizzes, courses, articles)
- 🛒 Shopping (purchases, reviews, redemptions)
- 💪 Fitness (workouts, goals, tracking)
- 🎬 Entertainment (videos, ratings, playlists)
- ✈️ Travel (bookings, rentals)
- 🍕 Food & Dining (orders, check-ins)
- 💰 Rewards (earning, spending, milestones)

## 🏗️ Architecture

### Frontend
- **React 18** with modern hooks and state management
- **react-globe.gl** for 3D globe rendering
- **Tailwind CSS** for styling and responsive design
- **Vite** for fast development and optimized builds

### Backend
- **Express.js** API server
- **Metabase Integration** for real activity data
- **IP Geolocation** using ipapi.co and ipinfo.io
- **Fallback Mock Data** with realistic coordinates

### Deployment
- **Vercel** for serverless deployment
- **Node.js** functions for API endpoints
- **Production optimizations** for performance

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tgauss/perk-3d-globe.git
cd perk-3d-globe
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Metabase Configuration (optional - falls back to mock data)
METABASE_URL=your-metabase-url
METABASE_API_KEY=your-api-key
METABASE_CARD_ID=115

# Data Configuration
USE_MOCK_DATA=true  # Set to false to use real Metabase data
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Scripts

- `npm run dev` - Start development server with API
- `npm run dev:vite` - Start Vite development server only
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🌐 Deployment to Vercel

This project is configured for easy deployment to Vercel:

### Automatic Deployment

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

2. **Configure Domain**
   - In Vercel dashboard, go to your project settings
   - Add custom domain: `world.perklabs.dev`
   - Configure DNS as instructed by Vercel

3. **Set Environment Variables** (if using real Metabase data)
   - In Vercel dashboard: Settings → Environment Variables
   - Add your `METABASE_URL`, `METABASE_API_KEY`, and `METABASE_CARD_ID`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🎨 Customization

### Adding New Activity Types

Edit `src/routes/activity-replay.jsx` in the `getActivityType` function:

```javascript
if (text.includes('your-activity')) {
  return { icon: '🎯', color: '#your-color' };
}
```

### Modifying Mock Data

Update `src/utils/mockData.js` to add new:
- Activity templates
- Geographic locations  
- User personas
- Program types

### Styling Changes

The project uses Tailwind CSS and inline styles:
- Global styles: `src/index.css`
- Component styles: Inline styles in React components
- Glassmorphic effects: Custom CSS with backdrop-filter

## 📱 Mobile Optimization

The application includes specific mobile optimizations:
- Cards positioned in upper third of screen (30% from top)
- Reduced padding and font sizes for mobile
- Touch-friendly interaction areas
- Responsive globe sizing

## 🔧 API Endpoints

### `POST /api/activity`
Returns paginated activity data with geographic coordinates.

**Request Body:**
```json
{
  "limit": 30
}
```

**Response:**
```json
{
  "points": [
    {
      "lat": 40.7128,
      "lon": -74.0060,
      "label": "User earned 100 points for playing a game in M&M'S Fun Club",
      "timestamp": 1640995200000,
      "actionId": 12345
    }
  ]
}
```

## 🎯 Performance Features

- **Concurrent IP Geocoding** with rate limiting
- **Ring Animation Cleanup** to prevent memory leaks  
- **Responsive Globe Sizing** for optimal performance
- **Lazy Loading** of activity data
- **Optimized Build** with Vite bundling

## 🔒 Security

- Environment variable protection
- IP address anonymization in logs
- Rate limiting on API endpoints
- No sensitive data exposure in frontend

## 📄 License

This project is proprietary to Perk Labs Inc.

## 🤝 Contributing

This is a private project for Perk Labs. For access or questions, contact the development team.

---

Built with ❤️ by the Perk Labs team
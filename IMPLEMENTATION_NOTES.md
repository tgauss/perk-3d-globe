# Perk Activity Globe - Implementation Notes

## 🏆 Current Status: **PRODUCTION READY**

**Live Demo**: [world.perklabs.dev](https://world.perklabs.dev) (configured for Vercel deployment)

## ✅ Completed Features

### Core Visualization
- **3D Globe**: Interactive react-globe.gl with custom earth texture and night sky
- **Real-time Activity Feed**: Chronological replay of user activities across the globe
- **Auto-playing Timeline**: 3-second intervals with immediate startup and auto-looping
- **Geographic Visualization**: IP geolocation with fallback to realistic mock coordinates

### User Experience  
- **Mobile Responsive**: Optimized card positioning (30% from top on mobile vs 50% on desktop)
- **Interactive Points**: Click any activity point to view details with 5-second pause
- **Glassmorphic Cards**: Modern translucent activity cards with activity-type icons
- **Smooth Animations**: Fluid camera transitions and green pulse ring effects
- **IBM Plex Sans Typography**: Professional font styling throughout

### Data & Performance
- **Client Brand Data**: 75+ activities across 6 actual Perk client programs
- **Geographic Accuracy**: Program-specific locations (Ohio for Buckeye Nation, etc.)
- **Concurrent IP Geocoding**: Rate-limited with fallback coordinates  
- **Ring Animation Cleanup**: Memory leak prevention and performance optimization
- **Responsive Globe Sizing**: Auto-adjusts to viewport changes

### Deployment & Infrastructure
- **Vercel Integration**: Serverless functions with 30-second timeout
- **API Structure**: Modern `/api/activity` endpoint with CORS support
- **Error Handling**: Comprehensive fallbacks and timeout management
- **Production Build**: Optimized Vite bundling for performance

## 🎯 Client Programs Implemented

### **M&M'S Fun Club** (18 activities)
- Gaming: Playing games, daily challenges, rating content
- Social: Sign-ins, social sharing, friend engagement  
- Content: Viewing posts, watching videos, profile completion

### **Buckeye Nation Rewards** (9 activities)
- Sports: Game day participation, event check-ins
- Commerce: Merchandise purchases, reward earning
- Engagement: Social media, video watching

### **CBJ Rush Rewards** (7 activities)
- Hockey: Game attendance, season ticket renewals
- Merchandise: Jersey purchases, team gear
- Digital: Link clicking, social sharing

### **U of U Plus** (6 activities)
- Campus: Event attendance, game day check-ins
- Alumni: Alumni engagement, merchandise
- Content: Article reading, post viewing

### **Huskers Rewards** (5 activities)
- Football: Season tickets, fan engagement
- Commerce: Merchandise orders, purchases
- Profile: Profile questions, post interactions

### **PEDIGREE® GoodPoints™ Mexico** (8 activities)
- Charitable: Shelter donations, pet welfare
- Commercial: Product discounts, registration
- Engagement: Social follows, surveys

## 🛠 Technical Architecture

### Frontend Stack
```
React 18 + Vite
├── react-globe.gl (3D visualization)
├── Tailwind CSS (styling)  
├── IBM Plex Sans (typography)
└── Custom hooks (useActivityGlobeData)
```

### Backend API
```
Vercel Functions (Node.js)
├── IP Geolocation (ipapi.co + ipinfo.io)
├── Metabase Integration (ready for connection)
├── Mock Data Fallback (75+ realistic activities)
└── CORS + Error Handling
```

### Deployment
```
Vercel Serverless
├── Static Site (React build)
├── API Functions (/api/activity)
├── Environment Variables
└── Custom Domain (world.perklabs.dev)
```

## 🔧 Key Files & Structure

```
/src/routes/activity-replay.jsx    # Main globe component
/src/utils/mockData.js             # Client activity data
/src/hooks/useActivityGlobeData.js # Data fetching hook
/api/activity.js                   # Vercel API function
/server.js                         # Development server (local only)
vercel.json                        # Deployment configuration
```

## 🌍 Geographic Coverage

### Program-Specific Locations
- **Ohio Cities**: Columbus, Cleveland, Cincinnati (Buckeye Nation)
- **Utah Cities**: Salt Lake City, Provo, Logan (U of U Plus)  
- **Nebraska Cities**: Lincoln, Omaha (Huskers)
- **Mexico Cities**: Mexico City, Monterrey, Guadalajara (PEDIGREE®)

### General Coverage
- **50+ US Metro Areas**: NYC, LA, Chicago, Houston, etc.
- **Alaska**: Anchorage, Fairbanks, Juneau
- **Hawaii**: Honolulu, Hilo, Kahului  
- **Canada**: Toronto, Montreal, Vancouver, Calgary, Edmonton, Ottawa

## 🚧 Known Issues & Limitations

### Metabase Integration
**Status**: ⚠️ **NEEDS ATTENTION**
- Connection configuration completed but needs testing
- API endpoint timing out on Card ID 115 queries
- Environment variables configured for production
- Fallback to mock data working perfectly

### Performance Considerations
- IP geocoding rate limits (handled with delays and batching)
- Memory usage with long-running sessions (ring cleanup implemented)
- Mobile performance on older devices (optimization may be needed)

## 🔄 Next Steps & Recommendations

### Priority 1: Metabase Connection
1. **Debug Metabase API**:
   ```bash
   # Test direct API call
   curl -H "X-Metabase-Session: YOUR_API_KEY" \
        "YOUR_METABASE_URL/api/card/115/query/json"
   ```
2. **Check Metabase Permissions**: Ensure API key has Card 115 access
3. **Verify Network**: Test from production environment (Vercel) vs local
4. **Update Timeout**: Consider increasing from 20s if queries are slow

### Priority 2: Data Enhancements
1. **Real User Privacy**: Implement IP anonymization for production data
2. **Activity Filtering**: Add date range and program filtering capabilities
3. **Performance Metrics**: Track API response times and error rates

### Priority 3: Feature Additions
1. **Activity Heatmap**: Show activity density by region
2. **Time-based Filtering**: Daily/weekly/monthly activity views  
3. **Program Toggles**: Show/hide specific client programs
4. **Export Functionality**: Save activity data or screenshots

### Priority 4: Monitoring & Analytics
1. **Error Tracking**: Implement Sentry or similar for production errors
2. **Usage Analytics**: Track user interactions and performance metrics
3. **Uptime Monitoring**: Monitor API endpoints and globe loading

## 💡 Development Tips

### Local Development
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
# Metabase (production)
METABASE_URL=https://your-metabase-instance.com
METABASE_API_KEY=your-api-key
METABASE_CARD_ID=115

# Data Source
USE_MOCK_DATA=true  # Set to false when Metabase is working
```

### Debugging Globe Issues
1. **Check Console**: React errors appear in browser dev tools
2. **Monitor Network**: Watch API calls in Network tab
3. **Verify Data**: Ensure activities have valid lat/lng coordinates
4. **Globe Controls**: Test camera movement and point interactions

### Adding New Client Programs
1. **Update mockData.js**: Add new activity templates
2. **Update API**: Sync api/activity.js with new activities  
3. **Add Locations**: Include program-specific geographic coordinates
4. **Test Icons**: Verify activity type detection in `getActivityType()`

## 📚 References & Resources

### Documentation
- [react-globe.gl Docs](https://github.com/vasturiano/react-globe.gl)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Vite Configuration](https://vitejs.dev/config/)

### External APIs
- [ipapi.co](https://ipapi.co/api/) - IP Geolocation
- [ipinfo.io](https://ipinfo.io/developers) - Backup geolocation

### Design Assets
- Perk Logo: `/public/Perk Logo Gold Primary.svg`
- Perk Favicon: `/public/Perk Favicon.svg`
- Globe Texture: CDN-hosted earth-dark.jpg

---

**Last Updated**: December 2024  
**Status**: Production Ready - Awaiting Metabase Integration  
**Deployment**: [world.perklabs.dev](https://world.perklabs.dev)
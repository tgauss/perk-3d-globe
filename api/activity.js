import fetch from 'node-fetch';
import { AbortController } from 'abort-controller';

// Mock data generator for fallback
function generateMockActivityData(count = 50) {
  // Expanded activity templates with more variety
  const activityTemplates = [
    // Gaming activities
    { name: "Alex M.", action: "earned 150 points for completing a challenge", program: "M&M'S Fun Club" },
    { name: "Jordan K.", action: "earned 100 points for playing a game", program: "GameStop PowerUp" },
    { name: "Casey R.", action: "earned 75 points for achieving a high score", program: "Xbox Rewards" },
    { name: "Taylor S.", action: "earned 200 points for daily game streak", program: "M&M'S Fun Club" },
    
    // Social engagement
    { name: "Morgan P.", action: "earned 25 points for signing in", program: "Starbucks Rewards" },
    { name: "Riley H.", action: "earned 50 points for sharing on social media", program: "Nike Membership" },
    { name: "Quinn B.", action: "earned 75 points for leaving a review", program: "Amazon Prime" },
    { name: "Dakota L.", action: "earned 30 points for following on Instagram", program: "Target Circle" },
    
    // Learning activities
    { name: "Sage T.", action: "earned 200 points for finishing a quiz", program: "Duolingo Plus" },
    { name: "River J.", action: "earned 250 points for completing a course", program: "Coursera Plus" },
    { name: "Phoenix A.", action: "earned 150 points for reading an article", program: "Medium Membership" },
    { name: "Skylar W.", action: "earned 300 points for watching a tutorial", program: "MasterClass" },
    
    // Shopping activities
    { name: "Avery C.", action: "earned 500 points for making a purchase", program: "Best Buy Rewards" },
    { name: "Parker D.", action: "earned 1,000 points for first purchase", program: "Nordstrom Rewards" },
    { name: "Cameron F.", action: "spent 750 points to redeem free shipping", program: "Amazon Prime" },
    { name: "Reese G.", action: "earned 250 points for product review", program: "Sephora Beauty Insider" },
    
    // International activities
    { name: "Diego R.", action: "spent 500 points to redeem pet food discount", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Maria S.", action: "earned 300 points for survey completion", program: "Telcel Rewards Mexico" },
    { name: "Jean-Luc M.", action: "earned 400 points for loyalty milestone", program: "Tim Hortons Rewards Canada" },
    { name: "Sarah K.", action: "earned 250 points for app download", program: "Canadian Tire Triangle" },
    { name: "Keoni P.", action: "earned 200 points for local business support", program: "Hawaii Rewards Network" },
    { name: "Nalani H.", action: "earned 350 points for eco-friendly purchase", program: "Whole Foods Hawaii" }
  ];
  
  // Realistic coordinates for major US metros and international locations
  const locationCoordinates = [
    // Major US Metropolitan Areas
    { lat: 40.7128, lng: -74.0060, city: "New York, NY" },
    { lat: 34.0522, lng: -118.2437, city: "Los Angeles, CA" },
    { lat: 41.8781, lng: -87.6298, city: "Chicago, IL" },
    { lat: 29.7604, lng: -95.3698, city: "Houston, TX" },
    { lat: 33.4484, lng: -112.0740, city: "Phoenix, AZ" },
    { lat: 37.7749, lng: -122.4194, city: "San Francisco, CA" },
    { lat: 30.2672, lng: -97.7431, city: "Austin, TX" },
    { lat: 32.7157, lng: -117.1611, city: "San Diego, CA" },
    { lat: 39.7392, lng: -104.9903, city: "Denver, CO" },
    { lat: 47.6062, lng: -122.3321, city: "Seattle, WA" },
    { lat: 25.7617, lng: -80.1918, city: "Miami, FL" },
    { lat: 33.7490, lng: -84.3880, city: "Atlanta, GA" },
    { lat: 42.3601, lng: -71.0589, city: "Boston, MA" },
    { lat: 36.1627, lng: -86.7816, city: "Nashville, TN" },
    
    // Alaska
    { lat: 61.2181, lng: -149.9003, city: "Anchorage, AK" },
    { lat: 64.8378, lng: -147.7164, city: "Fairbanks, AK" },
    
    // Hawaii
    { lat: 21.3099, lng: -157.8581, city: "Honolulu, HI" },
    { lat: 19.8968, lng: -155.5828, city: "Hilo, HI" },
    
    // Canada
    { lat: 43.6532, lng: -79.3832, city: "Toronto, ON" },
    { lat: 45.5017, lng: -73.5673, city: "Montreal, QC" },
    { lat: 49.2827, lng: -123.1207, city: "Vancouver, BC" },
    
    // Mexico
    { lat: 19.4326, lng: -99.1332, city: "Mexico City, Mexico" },
    { lat: 25.6866, lng: -100.3161, city: "Monterrey, Mexico" },
    { lat: 20.6597, lng: -103.3496, city: "Guadalajara, Mexico" }
  ];
  
  const data = [];
  const now = Date.now();
  let actionId = 15234567;
  
  for (let i = 0; i < count; i++) {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const location = locationCoordinates[Math.floor(Math.random() * locationCoordinates.length)];
    
    const minutesAgo = Math.random() * 480;
    const timestamp = new Date(now - minutesAgo * 60 * 1000);
    
    const timezones = ["-05:00", "-06:00", "-07:00", "-08:00", "-04:00", "-03:00"];
    const tzOffset = timezones[Math.floor(Math.random() * timezones.length)];
    const isoString = timestamp.toISOString().replace('Z', tzOffset);
    
    const shouldHaveIP = Math.random() > 0.15;
    let ip = null;
    
    if (shouldHaveIP) {
      const ipRanges = [
        `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254 + 1)}`,
        `2001:db8:${Math.floor(Math.random() * 9999).toString(16)}:${Math.floor(Math.random() * 9999).toString(16)}::${Math.floor(Math.random() * 9999).toString(16)}`,
      ];
      ip = ipRanges[Math.floor(Math.random() * ipRanges.length)];
    }
    
    data.push({
      sentence: `${template.name} ${template.action} in ${template.program}`,
      ip: ip,
      ts: isoString,
      action_id: actionId - i * 3,
      _mockLat: location.lat + (Math.random() - 0.5) * 0.1,
      _mockLng: location.lng + (Math.random() - 0.5) * 0.1,
      _mockCity: location.city
    });
  }
  
  return data.sort((a, b) => {
    const dateA = new Date(a.ts);
    const dateB = new Date(b.ts);
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    return b.action_id - a.action_id;
  });
}

const geocodeCache = new Map();

function isPrivateIP(ip) {
  if (!ip) return true;
  
  if (ip.includes(':')) {
    if (ip.startsWith('::1') || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
      return true;
    }
    return false;
  }
  
  const parts = ip.split('.');
  if (parts.length !== 4) return true;
  
  const first = parseInt(parts[0]);
  const second = parseInt(parts[1]);
  
  return (first === 10) || 
         (first === 172 && second >= 16 && second <= 31) || 
         (first === 192 && second === 168) ||
         (first === 127) ||
         (first === 169 && second === 254);
}

async function geocodeIP(ip) {
  if (isPrivateIP(ip)) {
    return null;
  }
  
  if (geocodeCache.has(ip)) {
    const cached = geocodeCache.get(ip);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`http://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Perk Activity Globe/1.0' }
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.latitude && data.longitude && !data.error) {
      const result = { lat: data.latitude, lon: data.longitude };
      geocodeCache.set(ip, { data: result, timestamp: Date.now() });
      return result;
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding failed for ${ip}:`, error.message);
    return null;
  }
}

async function geocodeWithConcurrencyLimit(ips, limit = 5) {
  const results = new Map();
  const uniqueIPs = [...new Set(ips.filter(Boolean))];
  
  for (let i = 0; i < uniqueIPs.length; i += limit) {
    const batch = uniqueIPs.slice(i, i + limit);
    const promises = batch.map(async (ip) => {
      const coords = await geocodeIP(ip);
      if (coords) {
        results.set(ip, coords);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    await Promise.all(promises);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { limit = 30 } = req.body;
    
    console.log('Using mock data (set USE_MOCK_DATA=false and configure Metabase credentials to use real data)');
    const data = generateMockActivityData(limit);
    
    const validRows = data.filter(row => row.sentence && row.ts);
    console.log(`Found ${validRows.length} valid activity rows`);
    
    const ips = validRows.map(row => row.ip).filter(Boolean);
    console.log(`Found ${ips.length} IPs to geocode:`, ips.slice(0, 3));
    
    const geocodeResults = await geocodeWithConcurrencyLimit(ips, 5);
    console.log(`Geocoded ${geocodeResults.size} IPs successfully`);
    
    const points = [];
    let skippedNoIP = 0;
    let skippedNoGeocode = 0;
    
    for (const row of validRows) {
      let coords = null;
      
      if (row.ip && geocodeResults.has(row.ip)) {
        coords = geocodeResults.get(row.ip);
      }
      
      if (!coords && row._mockLat && row._mockLng) {
        coords = { lat: row._mockLat, lon: row._mockLng };
      }
      
      if (coords) {
        points.push({
          lat: coords.lat,
          lon: coords.lon,
          label: row.sentence,
          timestamp: new Date(row.ts).getTime(),
          actionId: row.action_id
        });
      } else if (!row.ip) {
        skippedNoIP++;
      } else {
        skippedNoGeocode++;
      }
    }
    
    console.log(`Point creation: ${points.length} created, ${skippedNoIP} no IP, ${skippedNoGeocode} no geocode`);
    console.log(`Returning ${points.length} points to client`);
    
    res.status(200).json({ points });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
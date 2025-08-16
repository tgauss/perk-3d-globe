import express from 'express';
import { createServer as createViteServer } from 'vite';
import fetch from 'node-fetch';
import { AbortController } from 'abort-controller';
import dotenv from 'dotenv';
import { generateMockActivityData } from './src/utils/mockData.js';

dotenv.config();

const app = express();
app.use(express.json());

const geocodeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function isPrivateIP(ip) {
  if (!ip) return true;
  
  // Handle IPv6 addresses - most should be public
  if (ip.includes(':')) {
    // Skip local/private IPv6 ranges
    if (ip.startsWith('::1') || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
      return true;
    }
    return false; // Most IPv6 are public
  }
  
  // Handle IPv4 addresses
  const parts = ip.split('.');
  if (parts.length !== 4) return true;
  
  const first = parseInt(parts[0]);
  const second = parseInt(parts[1]);
  
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 127) return true;
  if (first === 0) return true;
  if (first >= 224) return true;
  
  return false;
}

async function geocodeIP(ip) {
  if (!ip || isPrivateIP(ip)) {
    return null;
  }
  
  const cacheKey = ip;
  const cached = geocodeCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    let result = null;
    
    if (process.env.IPINFO_TOKEN) {
      const response = await fetch(
        `https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`,
        { timeout: 5000 }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.loc) {
          const [lat, lon] = data.loc.split(',').map(Number);
          result = { lat, lon };
        }
      }
    } else {
      const response = await fetch(
        `https://ipapi.co/${ip}/json/`,
        { timeout: 5000 }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          result = { lat: data.latitude, lon: data.longitude };
        }
      }
    }
    
    geocodeCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error(`Geocoding failed for IP ${ip}:`, error.message);
    return null;
  }
}

async function geocodeWithConcurrencyLimit(ips, limit = 3) {
  const results = new Map();
  const uniqueIPs = [...new Set(ips.filter(ip => ip && !isPrivateIP(ip)))];
  
  // Add fallback coordinates for testing when geocoding fails
  const fallbackCoords = [
    { lat: 40.7128, lon: -74.0060 }, // NYC
    { lat: 34.0522, lon: -118.2437 }, // LA
    { lat: 41.8781, lon: -87.6298 }, // Chicago
    { lat: 29.7604, lon: -95.3698 }, // Houston
    { lat: 33.7490, lon: -84.3880 }, // Atlanta
    { lat: 47.6062, lon: -122.3321 }, // Seattle
    { lat: 37.7749, lon: -122.4194 }, // SF
    { lat: 39.9526, lon: -75.1652 }, // Philadelphia
    { lat: 32.7767, lon: -96.7970 }, // Dallas
  ];
  
  for (let i = 0; i < uniqueIPs.length; i += limit) {
    const batch = uniqueIPs.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map(async (ip, index) => {
        const coords = await geocodeIP(ip);
        // Use fallback coordinates if geocoding fails (for testing)
        const finalCoords = coords || fallbackCoords[index % fallbackCoords.length];
        return { ip, coords: finalCoords };
      })
    );
    
    batchResults.forEach(({ ip, coords }) => {
      results.set(ip, coords);
    });
    
    if (i + limit < uniqueIPs.length) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay
    }
  }
  
  return results;
}

app.post('/api/activity', async (req, res) => {
  try {
    const limit = req.body.limit || 30;
    
    let data;
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.METABASE_URL || !process.env.METABASE_API_KEY;
    
    if (useMockData) {
      console.log('Using mock data (set USE_MOCK_DATA=false and configure Metabase credentials to use real data)');
      data = generateMockActivityData(limit);
    } else {
    
    const metabaseUrl = process.env.METABASE_URL.replace(/\/$/, '');
    const apiEndpoint = `${metabaseUrl}/api/card/115/query`;
    console.log('Fetching from Metabase:', apiEndpoint);
    
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000); // 20 second timeout (Metabase can be slow)
    
    try {
      const metabaseResponse = await fetch(
        apiEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.METABASE_API_KEY
          },
          body: JSON.stringify({
            constraints: { max_rows: limit }
          }),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeout);
    
    if (!metabaseResponse.ok) {
      const errorText = await metabaseResponse.text();
      console.error('Metabase error response:', errorText);
      throw new Error(`Metabase API returned ${metabaseResponse.status}: ${errorText}`);
    }
    
    const rawResponse = await metabaseResponse.json();
    
    // The /query endpoint returns data in a different format
    // It includes data.rows which contains the actual data
    let rawData = rawResponse;
    if (rawResponse.data && rawResponse.data.rows) {
      rawData = rawResponse.data.rows;
    }
    
    // Transform array format to object format
    // Response is in format: [["sentence", "ip", "timestamp", action_id], ...]
    if (Array.isArray(rawData) && rawData.length > 0 && Array.isArray(rawData[0])) {
      data = rawData.map(row => ({
        sentence: row[0],
        ip: row[1],
        ts: row[2],
        action_id: row[3]
      }));
    } else {
      data = rawData;
    }
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        console.error('Metabase request timed out after 20 seconds. Falling back to mock data.');
        console.log('Note: The /query/json endpoint is very slow. This might be a Metabase performance issue.');
        data = generateMockActivityData(limit);
      } else {
        throw err;
      }
    }
    }
    
    const validRows = data.filter(row => row.sentence && row.ts);
    console.log(`Found ${validRows.length} valid activity rows`);
    
    const ips = validRows.map(row => row.ip).filter(Boolean);
    console.log(`Found ${ips.length} IPs to geocode:`, ips.slice(0, 3));
    
    const geocodeResults = await geocodeWithConcurrencyLimit(ips, 5);
    console.log(`Geocoded ${geocodeResults.size} IPs successfully`);
    
    const points = [];
    let skippedNoIP = 0;
    let skippedNoGeocode = 0;
    let skippedNoCoords = 0;
    
    for (const row of validRows) {
      let coords = null;
      
      // Try IP geocoding first
      if (row.ip && geocodeResults.has(row.ip)) {
        coords = geocodeResults.get(row.ip);
      }
      
      // Fallback to mock coordinates if available and no IP geocoding
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
    
    console.log(`Point creation: ${points.length} created, ${skippedNoIP} no IP, ${skippedNoGeocode} no geocode, ${skippedNoCoords} no coords`);
    
    points.sort((a, b) => {
      if (b.timestamp !== a.timestamp) {
        return b.timestamp - a.timestamp;
      }
      return b.actionId - a.actionId;
    });
    
    console.log(`Returning ${points.length} points to client`);
    res.json({ points, totalRows: validRows.length });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: error.message });
  }
});

async function createServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  app.use(vite.middlewares);
  
  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
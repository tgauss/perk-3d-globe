// Pre-cached city/state coordinates for fast lookup
// This eliminates the need for API calls for common locations
const CITY_STATE_CACHE = {
  // Major US Cities - Top 100
  "New York,NY": { lat: 40.7128, lon: -74.0060 },
  "Los Angeles,CA": { lat: 34.0522, lon: -118.2437 },
  "Chicago,IL": { lat: 41.8781, lon: -87.6298 },
  "Houston,TX": { lat: 29.7604, lon: -95.3698 },
  "Phoenix,AZ": { lat: 33.4484, lon: -112.0740 },
  "Philadelphia,PA": { lat: 39.9526, lon: -75.1652 },
  "San Antonio,TX": { lat: 29.4241, lon: -98.4936 },
  "San Diego,CA": { lat: 32.7157, lon: -117.1611 },
  "Dallas,TX": { lat: 32.7767, lon: -96.7970 },
  "San Jose,CA": { lat: 37.3382, lon: -121.8863 },
  "Austin,TX": { lat: 30.2672, lon: -97.7431 },
  "Jacksonville,FL": { lat: 30.3322, lon: -81.6557 },
  "Fort Worth,TX": { lat: 32.7555, lon: -97.3308 },
  "Columbus,OH": { lat: 39.9612, lon: -82.9988 },
  "Indianapolis,IN": { lat: 39.7684, lon: -86.1581 },
  "Charlotte,NC": { lat: 35.2271, lon: -80.8431 },
  "San Francisco,CA": { lat: 37.7749, lon: -122.4194 },
  "Seattle,WA": { lat: 47.6062, lon: -122.3321 },
  "Denver,CO": { lat: 39.7392, lon: -104.9903 },
  "Washington,DC": { lat: 38.9072, lon: -77.0369 },
  "Boston,MA": { lat: 42.3601, lon: -71.0589 },
  "El Paso,TX": { lat: 31.7619, lon: -106.4850 },
  "Nashville,TN": { lat: 36.1627, lon: -86.7816 },
  "Detroit,MI": { lat: 42.3314, lon: -83.0458 },
  "Oklahoma City,OK": { lat: 35.4676, lon: -97.5164 },
  "Portland,OR": { lat: 45.5152, lon: -122.6784 },
  "Las Vegas,NV": { lat: 36.1699, lon: -115.1398 },
  "Memphis,TN": { lat: 35.1495, lon: -90.0490 },
  "Louisville,KY": { lat: 38.2527, lon: -85.7585 },
  "Baltimore,MD": { lat: 39.2904, lon: -76.6122 },
  "Milwaukee,WI": { lat: 43.0389, lon: -87.9065 },
  "Albuquerque,NM": { lat: 35.0844, lon: -106.6504 },
  "Tucson,AZ": { lat: 32.2226, lon: -110.9747 },
  "Fresno,CA": { lat: 36.7378, lon: -119.7871 },
  "Mesa,AZ": { lat: 33.4152, lon: -111.8315 },
  "Sacramento,CA": { lat: 38.5816, lon: -121.4944 },
  "Atlanta,GA": { lat: 33.7490, lon: -84.3880 },
  "Kansas City,MO": { lat: 39.0997, lon: -94.5786 },
  "Colorado Springs,CO": { lat: 38.8339, lon: -104.8214 },
  "Raleigh,NC": { lat: 35.7796, lon: -78.6382 },
  "Omaha,NE": { lat: 41.2565, lon: -95.9345 },
  "Miami,FL": { lat: 25.7617, lon: -80.1918 },
  "Long Beach,CA": { lat: 33.7701, lon: -118.1937 },
  "Virginia Beach,VA": { lat: 36.8529, lon: -75.9780 },
  "Oakland,CA": { lat: 37.8044, lon: -122.2712 },
  "Minneapolis,MN": { lat: 44.9778, lon: -93.2650 },
  "Tulsa,OK": { lat: 36.1540, lon: -95.9928 },
  "Tampa,FL": { lat: 27.9506, lon: -82.4572 },
  "Arlington,TX": { lat: 32.7357, lon: -97.1081 },
  "New Orleans,LA": { lat: 29.9511, lon: -90.0715 },

  // California cities
  "Irvine,CA": { lat: 33.6846, lon: -117.8265 },
  "Milpitas,CA": { lat: 37.4323, lon: -121.8996 },
  "Santa Clara,CA": { lat: 37.3541, lon: -121.9552 },
  "Sunnyvale,CA": { lat: 37.3688, lon: -122.0363 },
  "Fremont,CA": { lat: 37.5485, lon: -121.9886 },
  "Riverside,CA": { lat: 33.9533, lon: -117.3962 },
  "Stockton,CA": { lat: 37.9577, lon: -121.2908 },
  "Bakersfield,CA": { lat: 35.3733, lon: -119.0187 },
  "Anaheim,CA": { lat: 33.8366, lon: -117.9143 },
  "Santa Ana,CA": { lat: 33.7455, lon: -117.8677 },
  "Chula Vista,CA": { lat: 32.6401, lon: -117.0842 },
  "Modesto,CA": { lat: 37.6391, lon: -120.9969 },
  "San Bernardino,CA": { lat: 34.1083, lon: -117.2898 },
  "Fontana,CA": { lat: 34.0922, lon: -117.4350 },
  "Moreno Valley,CA": { lat: 33.9425, lon: -117.2297 },
  "Glendale,CA": { lat: 34.1425, lon: -118.2551 },
  "Huntington Beach,CA": { lat: 33.6603, lon: -117.9992 },
  "Ontario,CA": { lat: 34.0633, lon: -117.6509 },
  "Rancho Cucamonga,CA": { lat: 34.1064, lon: -117.5931 },
  "Oceanside,CA": { lat: 33.1959, lon: -117.3795 },
  "Garden Grove,CA": { lat: 33.7739, lon: -117.9414 },
  "Santa Clarita,CA": { lat: 34.3917, lon: -118.5426 },
  "Salinas,CA": { lat: 36.6777, lon: -121.6555 },
  "Pomona,CA": { lat: 34.0551, lon: -117.7520 },
  "Corona,CA": { lat: 33.8753, lon: -117.5664 },
  "Hayward,CA": { lat: 37.6688, lon: -122.0808 },
  "Palmdale,CA": { lat: 34.5794, lon: -118.1165 },
  "Lancaster,CA": { lat: 34.6868, lon: -118.1542 },
  "Torrance,CA": { lat: 33.8358, lon: -118.3406 },

  // Ohio cities
  "Cleveland,OH": { lat: 41.4993, lon: -81.6944 },
  "Cincinnati,OH": { lat: 39.1031, lon: -84.5120 },
  "Toledo,OH": { lat: 41.6528, lon: -83.5379 },
  "Akron,OH": { lat: 41.0814, lon: -81.5190 },
  "Dayton,OH": { lat: 39.7589, lon: -84.1916 },

  // Other major metros
  "Pittsburgh,PA": { lat: 40.4406, lon: -79.9959 },
  "St. Louis,MO": { lat: 38.6270, lon: -90.1994 },
  "Orlando,FL": { lat: 28.5383, lon: -81.3792 },
  "San Juan,PR": { lat: 18.4655, lon: -66.1057 },
  "Honolulu,HI": { lat: 21.3099, lon: -157.8581 },
  "Anchorage,AK": { lat: 61.2181, lon: -149.9003 },

  // Kentucky cities
  "Eubank,KY": { lat: 37.2867, lon: -84.6530 },
  "Lexington,KY": { lat: 38.0406, lon: -84.5037 },
  "Bowling Green,KY": { lat: 36.9685, lon: -86.4808 },

  // Louisiana
  "Ponchatoula,LA": { lat: 30.4388, lon: -90.4412 },
  "Baton Rouge,LA": { lat: 30.4515, lon: -91.1871 },
  "Shreveport,LA": { lat: 32.5252, lon: -93.7502 },
};

// Helper function to normalize city/state for cache lookup
function normalizeCityState(city, state) {
  if (!city || !state) return null;
  return `${city.trim()},${state.trim().toUpperCase()}`;
}

// Get coordinates from cache
function getCachedCoordinates(city, state) {
  const key = normalizeCityState(city, state);
  return key ? CITY_STATE_CACHE[key] : null;
}

module.exports = {
  CITY_STATE_CACHE,
  normalizeCityState,
  getCachedCoordinates
};

// Mock data generator for testing when Metabase is unavailable
// Based on actual Perk client activity data patterns
export function generateMockActivityData(count = 50) {
  // Real activity templates from your actual Perk clients
  const activityTemplates = [
    // M&M'S Fun Club activities
    { name: "Monica B.", action: "earned 100 points for playing a game", program: "M&M'S Fun Club" },
    { name: "James W.", action: "earned 25 points for signing in", program: "M&M'S Fun Club" },
    { name: "Bania C.", action: "earned 200 points for finishing a quiz", program: "M&M'S Fun Club" },
    { name: "Carolyn J.", action: "earned 200 points for joining the program", program: "M&M'S Fun Club" },
    { name: "Gaige H.", action: "earned 100 points for playing a game", program: "M&M'S Fun Club" },
    { name: "mike e.", action: "earned 25 points for signing in", program: "M&M'S Fun Club" },
    { name: "Catherine J.", action: "earned 5 points for viewing a post from M&M'S", program: "M&M'S Fun Club" },
    { name: "Liz B.", action: "earned 200 points for joining the program", program: "M&M'S Fun Club" },
    { name: "James C.", action: "earned 5 points for viewing a post from M&M'S", program: "M&M'S Fun Club" },
    { name: "Roger S.", action: "earned 200 points for finishing a quiz", program: "M&M'S Fun Club" },
    { name: "Amy S.", action: "earned 200 points for finishing a quiz", program: "M&M'S Fun Club" },
    { name: "Melanie D.", action: "earned 5 points for viewing a post from M&M'S", program: "M&M'S Fun Club" },
    { name: "Takka C.", action: "earned 5 points for viewing a post from M&M'S", program: "M&M'S Fun Club" },
    { name: "Alex R.", action: "earned 150 points for completing a daily challenge", program: "M&M'S Fun Club" },
    { name: "Maya K.", action: "earned 300 points for sharing with friends", program: "M&M'S Fun Club" },
    { name: "Jordan L.", action: "earned 75 points for rating content", program: "M&M'S Fun Club" },
    { name: "Sam P.", action: "earned 50 points for watching a brand video", program: "M&M'S Fun Club" },
    { name: "Taylor D.", action: "earned 250 points for completing profile", program: "M&M'S Fun Club" },
    
    // Buckeye Nation Rewards activities  
    { name: "Kathleen P.", action: "earned 1,000 points for earning a reward", program: "Buckeye Nation Rewards" },
    { name: "Taylor G.", action: "earned 300 points for watching a video", program: "Buckeye Nation Rewards" },
    { name: "Zahra S.", action: "signed in", program: "Buckeye Nation Rewards" },
    { name: "Matthew T.", action: "earned 1,000 points for earning a reward", program: "Buckeye Nation Rewards" },
    { name: "Joey B.", action: "earned 1,000 points for earning a reward", program: "Buckeye Nation Rewards" },
    { name: "Chris M.", action: "earned 500 points for game day participation", program: "Buckeye Nation Rewards" },
    { name: "Ashley W.", action: "earned 250 points for social media engagement", program: "Buckeye Nation Rewards" },
    { name: "Derek K.", action: "earned 750 points for merchandise purchase", program: "Buckeye Nation Rewards" },
    { name: "Lauren S.", action: "earned 200 points for event check-in", program: "Buckeye Nation Rewards" },
    
    // CBJ Rush Rewards activities
    { name: "Parker B.", action: "earned 200 points for clicking a link", program: "CBJ Rush Rewards" },
    { name: "Journey M.", action: "earned 1,000 points for clicking a link", program: "CBJ Rush Rewards" },
    { name: "Cannon H.", action: "earned 200 points for clicking a link", program: "CBJ Rush Rewards" },
    { name: "Ryan C.", action: "earned 500 points for game attendance", program: "CBJ Rush Rewards" },
    { name: "Madison T.", action: "earned 300 points for jersey purchase", program: "CBJ Rush Rewards" },
    { name: "Brett L.", action: "earned 150 points for social sharing", program: "CBJ Rush Rewards" },
    { name: "Kaitlyn M.", action: "earned 400 points for season ticket renewal", program: "CBJ Rush Rewards" },
    
    // U of U Plus activities
    { name: "Taylor G.", action: "earned 250 points for reading an article", program: "U of U Plus" },
    { name: "Ryan W.", action: "earned 25 points for viewing a post", program: "U of U Plus" },
    { name: "Morgan H.", action: "earned 300 points for campus event attendance", program: "U of U Plus" },
    { name: "Casey B.", action: "earned 150 points for alumni engagement", program: "U of U Plus" },
    { name: "Skyler P.", action: "earned 200 points for merchandise purchase", program: "U of U Plus" },
    { name: "Jamie R.", action: "earned 100 points for game day check-in", program: "U of U Plus" },
    
    // Huskers Rewards activities
    { name: "Carissa D.", action: "earned 1,000 points for answering a profile question", program: "Huskers Rewards" },
    { name: "Derek H.", action: "earned 25 points for viewing a post", program: "Huskers Rewards" },
    { name: "Blake M.", action: "earned 500 points for season ticket purchase", program: "Huskers Rewards" },
    { name: "Alyssa K.", action: "earned 250 points for fan engagement", program: "Huskers Rewards" },
    { name: "Trevor S.", action: "earned 350 points for merchandise order", program: "Huskers Rewards" },
    
    // General Rewards activities
    { name: "Brooke G.", action: "earned 500 points for answering a profile question", program: "Rewards" },
    { name: "Nicole F.", action: "earned 300 points for completing survey", program: "Rewards" },
    { name: "Connor P.", action: "earned 200 points for first-time participation", program: "Rewards" },
    { name: "Emma L.", action: "earned 400 points for loyalty milestone", program: "Rewards" },
    
    // PEDIGREE® GoodPoints™ Mexico activities
    { name: "Ever T.", action: "spent 1 points to redeem Get $50MXN off your PEDIGREE® purchase", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Huert T.", action: "spent 1 points to redeem Get $50MXN off your PEDIGREE® purchase", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Olivia A.", action: "spent 1 points to redeem Help shelter dogs get cosy", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Diego R.", action: "spent 500 points to redeem pet food discount", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Maria S.", action: "earned 300 points for survey completion", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Carlos M.", action: "earned 200 points for product registration", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Ana L.", action: "earned 150 points for social media follow", program: "PEDIGREE® GoodPoints™ Mexico" },
    { name: "Roberto P.", action: "spent 250 points to redeem shelter donation", program: "PEDIGREE® GoodPoints™ Mexico" }
  ];
  
  // Realistic coordinates for major US metros and international locations
  const locationCoordinates = [
    // Major US Metropolitan Areas
    { lat: 40.7128, lng: -74.0060, city: "New York, NY" },
    { lat: 34.0522, lng: -118.2437, city: "Los Angeles, CA" },
    { lat: 41.8781, lng: -87.6298, city: "Chicago, IL" },
    { lat: 29.7604, lng: -95.3698, city: "Houston, TX" },
    { lat: 33.4484, lng: -112.0740, city: "Phoenix, AZ" },
    { lat: 39.9526, lng: -75.1652, city: "Philadelphia, PA" },
    { lat: 32.7767, lng: -96.7970, city: "Dallas, TX" },
    { lat: 37.7749, lng: -122.4194, city: "San Francisco, CA" },
    { lat: 30.2672, lng: -97.7431, city: "Austin, TX" },
    { lat: 32.7157, lng: -117.1611, city: "San Diego, CA" },
    { lat: 39.7392, lng: -104.9903, city: "Denver, CO" },
    { lat: 47.6062, lng: -122.3321, city: "Seattle, WA" },
    { lat: 25.7617, lng: -80.1918, city: "Miami, FL" },
    { lat: 33.7490, lng: -84.3880, city: "Atlanta, GA" },
    { lat: 42.3601, lng: -71.0589, city: "Boston, MA" },
    { lat: 36.1627, lng: -86.7816, city: "Nashville, TN" },
    { lat: 39.2904, lng: -76.6122, city: "Baltimore, MD" },
    { lat: 45.5152, lng: -122.6784, city: "Portland, OR" },
    { lat: 36.1699, lng: -115.1398, city: "Las Vegas, NV" },
    { lat: 35.2271, lng: -80.8431, city: "Charlotte, NC" },
    
    // Ohio (for Buckeye Nation)
    { lat: 39.9612, lng: -82.9988, city: "Columbus, OH" },
    { lat: 41.4993, lng: -81.6944, city: "Cleveland, OH" },
    { lat: 39.1031, lng: -84.5120, city: "Cincinnati, OH" },
    { lat: 40.4406, lng: -79.9959, city: "Pittsburgh, PA" },
    
    // Utah (for U of U Plus)
    { lat: 40.7608, lng: -111.8910, city: "Salt Lake City, UT" },
    { lat: 40.2338, lng: -111.6585, city: "Provo, UT" },
    { lat: 41.2230, lng: -111.9738, city: "Logan, UT" },
    
    // Nebraska (for Huskers)
    { lat: 40.8136, lng: -96.7026, city: "Lincoln, NE" },
    { lat: 41.2565, lng: -95.9345, city: "Omaha, NE" },
    
    // Alaska
    { lat: 61.2181, lng: -149.9003, city: "Anchorage, AK" },
    { lat: 64.8378, lng: -147.7164, city: "Fairbanks, AK" },
    { lat: 58.3019, lng: -134.4197, city: "Juneau, AK" },
    
    // Hawaii
    { lat: 21.3099, lng: -157.8581, city: "Honolulu, HI" },
    { lat: 19.8968, lng: -155.5828, city: "Hilo, HI" },
    { lat: 20.7984, lng: -156.3319, city: "Kahului, HI" },
    
    // Canada
    { lat: 43.6532, lng: -79.3832, city: "Toronto, ON" },
    { lat: 45.5017, lng: -73.5673, city: "Montreal, QC" },
    { lat: 49.2827, lng: -123.1207, city: "Vancouver, BC" },
    { lat: 51.0447, lng: -114.0719, city: "Calgary, AB" },
    { lat: 53.5461, lng: -113.4938, city: "Edmonton, AB" },
    { lat: 45.4215, lng: -75.6972, city: "Ottawa, ON" },
    
    // Mexico
    { lat: 19.4326, lng: -99.1332, city: "Mexico City, Mexico" },
    { lat: 25.6866, lng: -100.3161, city: "Monterrey, Mexico" },
    { lat: 20.6597, lng: -103.3496, city: "Guadalajara, Mexico" },
    { lat: 21.1619, lng: -86.8515, city: "Cancun, Mexico" },
    { lat: 32.6419, lng: -117.0382, city: "Tijuana, Mexico" }
  ];
  
  const data = [];
  const now = Date.now();
  let actionId = 15234567; // Starting action ID
  
  for (let i = 0; i < count; i++) {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const location = locationCoordinates[Math.floor(Math.random() * locationCoordinates.length)];
    
    // Generate timestamps over the past 8 hours for more spread
    const minutesAgo = Math.random() * 480; // 8 hours in minutes
    const timestamp = new Date(now - minutesAgo * 60 * 1000);
    
    // Random timezone offsets for different regions
    const timezones = ["-05:00", "-06:00", "-07:00", "-08:00", "-04:00", "-03:00"];
    const tzOffset = timezones[Math.floor(Math.random() * timezones.length)];
    const isoString = timestamp.toISOString().replace('Z', tzOffset);
    
    // Generate realistic IP addresses (mix with some nulls)
    const shouldHaveIP = Math.random() > 0.15; // 85% chance of having IP
    let ip = null;
    
    if (shouldHaveIP) {
      // Generate realistic IP ranges for different regions
      const ipRanges = [
        // US residential IPs
        `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254 + 1)}`,
        // IPv6 examples
        `2001:db8:${Math.floor(Math.random() * 9999).toString(16)}:${Math.floor(Math.random() * 9999).toString(16)}::${Math.floor(Math.random() * 9999).toString(16)}`,
        `2600:${Math.floor(Math.random() * 9999).toString(16)}:${Math.floor(Math.random() * 9999).toString(16)}:${Math.floor(Math.random() * 9999).toString(16)}::1`
      ];
      ip = ipRanges[Math.floor(Math.random() * ipRanges.length)];
    }
    
    data.push({
      sentence: `${template.name} ${template.action} in ${template.program}`,
      ip: ip,
      ts: isoString,
      action_id: actionId - i * 3, // Decrementing action IDs
      // Include coordinates directly for fallback
      _mockLat: location.lat + (Math.random() - 0.5) * 0.1, // Add slight randomness
      _mockLng: location.lng + (Math.random() - 0.5) * 0.1,
      _mockCity: location.city
    });
  }
  
  // Sort by timestamp descending (most recent first)
  return data.sort((a, b) => {
    const dateA = new Date(a.ts);
    const dateB = new Date(b.ts);
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    return b.action_id - a.action_id;
  });
}

export default generateMockActivityData;
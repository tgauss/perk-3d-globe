// Mock data generator for testing when Metabase is unavailable
// Enhanced with diverse activities and realistic US metro + international locations
export function generateMockActivityData(count = 50) {
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
    
    // Fitness activities
    { name: "Emery K.", action: "earned 100 points for workout completion", program: "Peloton Digital" },
    { name: "Finley L.", action: "earned 200 points for step goal achievement", program: "Fitbit Premium" },
    { name: "Rowan M.", action: "earned 150 points for nutrition tracking", program: "MyFitnessPal Premium" },
    
    // Entertainment
    { name: "Sage N.", action: "earned 75 points for watching a video", program: "Disney+ Rewards" },
    { name: "Blake O.", action: "earned 100 points for rating content", program: "Netflix Points" },
    { name: "Ellis P.", action: "earned 50 points for creating a playlist", program: "Spotify Premium" },
    
    // Travel activities
    { name: "Drew Q.", action: "earned 2,000 points for hotel booking", program: "Marriott Bonvoy" },
    { name: "Sage R.", action: "earned 1,500 points for flight booking", program: "Delta SkyMiles" },
    { name: "Lane S.", action: "earned 300 points for car rental", program: "Hertz Gold Plus" },
    
    // Food & Dining
    { name: "Harper T.", action: "earned 200 points for restaurant check-in", program: "OpenTable Points" },
    { name: "Reign U.", action: "earned 150 points for delivery order", program: "DoorDash DashPass" },
    { name: "Sage V.", action: "earned 100 points for coffee purchase", program: "Starbucks Rewards" },
    
    // Program activities
    { name: "River W.", action: "earned 200 points for joining the program", program: "CVS ExtraCare" },
    { name: "Phoenix X.", action: "earned 500 points for profile completion", program: "Walgreens myWalgreens" },
    { name: "Skylar Y.", action: "earned 1,000 points for birthday bonus", program: "Ulta Beauty Rewards" },
    
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
    { lat: 39.9612, lng: -82.9988, city: "Columbus, OH" },
    { lat: 43.0389, lng: -87.9065, city: "Milwaukee, WI" },
    { lat: 35.1495, lng: -90.0490, city: "Memphis, TN" },
    { lat: 44.9778, lng: -93.2650, city: "Minneapolis, MN" },
    { lat: 29.9511, lng: -90.0715, city: "New Orleans, LA" },
    { lat: 41.4993, lng: -81.6944, city: "Cleveland, OH" },
    { lat: 39.1031, lng: -84.5120, city: "Cincinnati, OH" },
    { lat: 40.4406, lng: -79.9959, city: "Pittsburgh, PA" },
    { lat: 38.9072, lng: -77.0369, city: "Washington, DC" },
    { lat: 43.6532, lng: -116.3113, city: "Boise, ID" },
    { lat: 47.0379, lng: -122.9007, city: "Olympia, WA" },
    
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
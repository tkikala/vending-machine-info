import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    // For now, we'll use fallback data since we don't have an OpenCage API key
    // In production, you would use: process.env.OPENCAGE_API_KEY
    const apiKey = process.env.OPENCAGE_API_KEY || 'demo';
    
    if (apiKey === 'demo') {
      // Return realistic fallback data for Bavaria locations
      const fallbackData = getFallbackLocationData(Number(lat), Number(lng));
      return res.json(fallbackData);
    }

    // Real API call (when you have an API key)
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=en&no_annotations=1`
    );

    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;
      
      const locationInfo = {
        city: components.city || components.town || components.village,
        state: components.state,
        country: components.country,
        postcode: components.postcode,
        road: components.road,
        suburb: components.suburb,
        neighbourhood: components.neighbourhood,
        population: estimatePopulation(components),
        traffic: estimateTraffic(components),
        amenities: getNearbyAmenities(components)
      };

      return res.json(locationInfo);
    } else {
      return res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Location data fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch location data' });
  }
}

// Fallback data for Bavaria locations
function getFallbackLocationData(lat: number, lng: number) {
  // Munich area
  if (lat >= 48.1 && lat <= 48.2 && lng >= 11.5 && lng <= 11.6) {
    return {
      city: 'Munich',
      state: 'Bavaria',
      country: 'Germany',
      postcode: '80331',
      road: 'Marienplatz',
      suburb: 'Altstadt',
      neighbourhood: 'City Center',
      population: 1500000,
      traffic: 3, // 3% of Munich population passes by Marienplatz daily
      amenities: ['shopping_center', 'university', 'hospital', 'public_transport', 'tourist_attractions']
    };
  }
  
  // BMW Headquarters area
  if (lat >= 48.17 && lat <= 48.18 && lng >= 11.56 && lng <= 11.57) {
    return {
      city: 'Munich',
      state: 'Bavaria',
      country: 'Germany',
      postcode: '80809',
      road: 'Petuelring',
      suburb: 'Schwabing-West',
      neighbourhood: 'BMW District',
      population: 25000,
      traffic: 4, // 4% of BMW district population passes by daily
      amenities: ['office_buildings', 'public_transport', 'restaurants']
    };
  }
  
  // Klinikum Großhadern area
  if (lat >= 48.10 && lat <= 48.11 && lng >= 11.47 && lng <= 11.48) {
    return {
      city: 'Munich',
      state: 'Bavaria',
      country: 'Germany',
      postcode: '81377',
      road: 'Marchioninistraße',
      suburb: 'Hadern',
      neighbourhood: 'Medical District',
      population: 15000,
      traffic: 5, // 5% of hospital district population passes by daily
      amenities: ['hospital', 'university', 'public_transport', 'pharmacies']
    };
  }
  
  // Olympia Einkaufszentrum area
  if (lat >= 48.13 && lat <= 48.14 && lng >= 11.58 && lng <= 11.59) {
    return {
      city: 'Munich',
      state: 'Bavaria',
      country: 'Germany',
      postcode: '80993',
      road: 'Hanauer Straße',
      suburb: 'Moosach',
      neighbourhood: 'Shopping District',
      population: 35000,
      traffic: 6, // 6% of shopping district population passes by daily
      amenities: ['shopping_center', 'public_transport', 'restaurants', 'entertainment']
    };
  }
  
  // Default Bavaria location
  return {
    city: 'Bavaria',
    state: 'Bavaria',
    country: 'Germany',
    postcode: '80331',
    road: 'Main Street',
    suburb: 'Central District',
    neighbourhood: 'Downtown',
          population: 50000,
      traffic: 2, // 2% of default location population passes by daily
    amenities: ['shopping_center', 'public_transport']
  };
}

// Helper functions for real API data
function estimatePopulation(components: any): number {
  if (components.city === 'Munich') {
    return 1500000;
  } else if (components.town) {
    return 75000; // Fixed value instead of random
  } else if (components.village) {
    return 5000; // Fixed value instead of random
  } else if (components.suburb) {
    return 30000; // Fixed value instead of random
  }
  return 15000; // Fixed default value
}

function estimateTraffic(components: any): number {
  // Realistic traffic: % of population that passes by this specific street daily
  let baseTraffic = 2; // Default: only 2% of population passes by
  
  if (components.city === 'Munich') {
    baseTraffic = 3; // Slightly higher for city areas
  } else if (components.town) {
    baseTraffic = 4; // Towns have more concentrated foot traffic
  } else if (components.village) {
    baseTraffic = 6; // Villages have very concentrated foot traffic
  } else if (components.suburb) {
    baseTraffic = 2.5; // Suburbs have moderate foot traffic
  }
  
  // Adjust based on road type
  if (components.road) {
    if (components.road.includes('platz') || components.road.includes('platz')) {
      baseTraffic += 2; // Squares are busier
    } else if (components.road.includes('straße') || components.road.includes('strasse')) {
      baseTraffic += 1; // Main streets
    } else if (components.road.includes('weg') || components.road.includes('gasse')) {
      baseTraffic -= 0.5; // Smaller streets
    }
  }
  
  return Math.min(10, Math.max(1, baseTraffic)); // Cap between 1% and 10%
}

function getNearbyAmenities(components: any): string[] {
  const amenities = [];
  
  if (components.city === 'Munich') {
    amenities.push('shopping_center', 'university', 'hospital', 'public_transport');
  } else if (components.suburb) {
    amenities.push('shopping_center', 'public_transport');
  } else if (components.road && components.road.includes('A')) {
    amenities.push('gas_station', 'restaurant');
  }
  
  return amenities;
}


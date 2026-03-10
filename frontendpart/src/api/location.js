// Location API for city autocomplete

// Popular cities that show up as default suggestions
const POPULAR_CITIES = [
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'New York, USA', 
  'Los Angeles, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan',
  'Singapore, Singapore', 'Dubai, UAE', 'Toronto, Canada', 'Sydney, Australia'
];

// Simple cities database for autocomplete (you can expand this)
const CITIES = [
  // India
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 'Chennai, India',
  'Kolkata, India', 'Pune, India', 'Ahmedabad, India', 'Surat, India', 'Jaipur, India',
  'Lucknow, India', 'Kanpur, India', 'Nagpur, India', 'Indore, India', 'Thane, India',
  'Bhopal, India', 'Visakhapatnam, India', 'Pimpri-Chinchwad, India', 'Patna, India', 'Vadodara, India',
  'Ghaziabad, India', 'Ludhiana, India', 'Coimbatore, India', 'Agra, India', 'Madurai, India',
  'Nashik, India', 'Faridabad, India', 'Meerut, India', 'Rajkot, India', 'Kalyan-Dombivli, India',
  'Vasai-Virar, India', 'Varanasi, India', 'Srinagar, India', 'Dhanbad, India', 'Jodhpur, India',
  'Amritsar, India', 'Raipur, India', 'Allahabad, India', 'Jabalpur, India', 'Gwalior, India',
  
  // USA
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA',
  'Philadelphia, USA', 'San Antonio, USA', 'San Diego, USA', 'Dallas, USA', 'San Jose, USA',
  'Austin, USA', 'Jacksonville, USA', 'Fort Worth, USA', 'Columbus, USA', 'San Francisco, USA',
  'Charlotte, USA', 'Indianapolis, USA', 'Seattle, USA', 'Denver, USA', 'Washington, USA',
  'Boston, USA', 'El Paso, USA', 'Detroit, USA', 'Nashville, USA', 'Portland, USA',
  'Memphis, USA', 'Oklahoma City, USA', 'Las Vegas, USA', 'Louisville, USA', 'Baltimore, USA',
  
  // UK
  'London, UK', 'Birmingham, UK', 'Glasgow, UK', 'Liverpool, UK', 'Bristol, UK',
  'Manchester, UK', 'Sheffield, UK', 'Leeds, UK', 'Edinburgh, UK', 'Leicester, UK',
  'Coventry, UK', 'Bradford, UK', 'Cardiff, UK', 'Belfast, UK', 'Nottingham, UK',
  
  // Canada
  'Toronto, Canada', 'Montreal, Canada', 'Vancouver, Canada', 'Calgary, Canada', 'Edmonton, Canada',
  'Ottawa, Canada', 'Winnipeg, Canada', 'Quebec City, Canada', 'Hamilton, Canada', 'Kitchener, Canada',
  
  // Australia
  'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia', 'Adelaide, Australia',
  'Gold Coast, Australia', 'Newcastle, Australia', 'Canberra, Australia', 'Sunshine Coast, Australia', 'Wollongong, Australia',
  
  // Germany
  'Berlin, Germany', 'Hamburg, Germany', 'Munich, Germany', 'Cologne, Germany', 'Frankfurt, Germany',
  'Stuttgart, Germany', 'Düsseldorf, Germany', 'Dortmund, Germany', 'Essen, Germany', 'Leipzig, Germany',
  
  // France
  'Paris, France', 'Marseille, France', 'Lyon, France', 'Toulouse, France', 'Nice, France',
  'Nantes, France', 'Strasbourg, France', 'Montpellier, France', 'Bordeaux, France', 'Lille, France',
  
  // Others
  'Tokyo, Japan', 'Beijing, China', 'Shanghai, China', 'Seoul, South Korea', 'Bangkok, Thailand',
  'Singapore, Singapore', 'Dubai, UAE', 'Hong Kong, Hong Kong', 'Kuala Lumpur, Malaysia', 'Jakarta, Indonesia'
];

// Get popular cities for initial display
export const getPopularCities = () => {
  return {
    success: true,
    data: POPULAR_CITIES
  };
};

// Search cities based on query
export const searchCities = async (query) => {
  try {
    if (!query || query.length < 1) {
      return { success: true, data: [] };
    }

    const searchQuery = query.toLowerCase().trim();
    
    // Filter cities that match the query (search in city name or country)
    const filteredCities = CITIES.filter(city => {
      const cityLower = city.toLowerCase();
      return cityLower.includes(searchQuery) || 
             cityLower.startsWith(searchQuery) ||
             cityLower.split(',')[0].trim().startsWith(searchQuery); // Search by city name start
    })
    .sort((a, b) => {
      // Prioritize exact matches and starts-with matches
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aCityName = aLower.split(',')[0].trim();
      const bCityName = bLower.split(',')[0].trim();
      
      // Exact city name match gets highest priority
      if (aCityName === searchQuery) return -1;
      if (bCityName === searchQuery) return 1;
      
      // City name starts with query gets next priority
      if (aCityName.startsWith(searchQuery) && !bCityName.startsWith(searchQuery)) return -1;
      if (bCityName.startsWith(searchQuery) && !aCityName.startsWith(searchQuery)) return 1;
      
      // Alphabetical order for the rest
      return a.localeCompare(b);
    })
    .slice(0, 8); // Limit to 8 results for better UX

    return {
      success: true,
      data: filteredCities
    };
  } catch (error) {
    console.error('City search error:', error);
    return {
      success: false,
      message: 'Failed to search cities',
      data: []
    };
  }
};

// Alternative: Use external API (uncomment if you want to use a real API)
/*
export const searchCitiesAPI = async (query) => {
  try {
    if (!query || query.length < 2) {
      return { success: true, data: [] };
    }

    // Using GeoNames API (free but requires registration)
    const response = await fetch(
      `http://api.geonames.org/searchJSON?name_startsWith=${query}&maxRows=10&username=YOUR_USERNAME`
    );
    
    const data = await response.json();
    
    const cities = data.geonames?.map(city => ({
      name: `${city.name}, ${city.countryName}`,
      lat: city.lat,
      lng: city.lng
    })) || [];

    return {
      success: true,
      data: cities
    };
  } catch (error) {
    console.error('GeoNames API error:', error);
    return {
      success: false,
      message: 'Failed to search cities',
      data: []
    };
  }
};
*/

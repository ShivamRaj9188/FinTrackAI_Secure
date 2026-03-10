import { useState, useRef, useEffect } from 'react';
import { searchCities } from '../api';

const LocationInput = ({ 
  value = '', 
  onChange, 
  placeholder = 'Enter location...', 
  className = '',
  id = 'location',
  ...props 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value && value.length >= 1) {
        setIsLoading(true);
        try {
          const result = await searchCities(value);
          if (result.success) {
            setSuggestions(result.data);
            setShowSuggestions(result.data.length > 0);
          }
        } catch (error) {
          console.error('Location search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange && onChange(e);
    
    if (!newValue) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    onChange && onChange({ target: { value: city } });
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`${className} ${isLoading ? 'pr-8' : ''}`}
        autoComplete="off"
        {...props}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((city, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(city)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <svg 
                  className="w-4 h-4 text-gray-400 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                <span className="text-gray-700">{city}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;

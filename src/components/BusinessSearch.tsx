import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from './ui/Button';
import { searchBusiness } from '../utils/geocoding';
import type { PlaceDetails } from '../types';

interface BusinessSearchProps {
  value: string;
  onSelect: (place: PlaceDetails) => void;
  onChange: (value: string) => void;
  className?: string;
}

export function BusinessSearch({ value, onSelect, onChange, className = '' }: BusinessSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceDetails[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchBusiness(value);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error searching business:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [value]);

  const handleSuggestionClick = (place: PlaceDetails) => {
    onSelect(place);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar establecimiento..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
          {suggestions.map((place) => (
            <button
              key={place.placeId}
              onClick={() => handleSuggestionClick(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-800 flex items-start space-x-3"
            >
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{place.name}</p>
                <p className="text-sm text-gray-400">{place.formattedAddress}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  rent: number;
  utilities: number;
  population: number;
  traffic: number;
  isOccupied: boolean;
  lat?: number;
  lng?: number;
}

interface RealBavariaMapProps {
  locations: Location[];
  darkMode: boolean;
  onLocationClick: (location: Location) => void;
}



const RealBavariaMap: React.FC<RealBavariaMapProps> = ({ locations, darkMode, onLocationClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  // Real coordinates for Bavaria locations
  const bavariaCoordinates = {
    munich: { lat: 48.1351, lng: 11.5820 },
    nuremberg: { lat: 49.4521, lng: 11.0767 },
    augsburg: { lat: 48.3705, lng: 10.8978 },
    regensburg: { lat: 49.0134, lng: 12.1016 },
    ingolstadt: { lat: 48.7644, lng: 11.4242 },
    wurzburg: { lat: 49.7913, lng: 9.9534 },
    bamberg: { lat: 49.8988, lng: 10.9027 },
    bayreuth: { lat: 49.9483, lng: 11.5783 },
    kempten: { lat: 47.7277, lng: 10.3137 },
    garmisch: { lat: 47.4927, lng: 11.0962 }
  };

  // Map locations to real coordinates
  const getLocationCoordinates = (location: Location) => {
    const coordMap: { [key: string]: { lat: number; lng: number } } = {
      '1': bavariaCoordinates.munich, // München Universität
      '2': { lat: 48.1351, lng: 11.5820 }, // Olympia Einkaufszentrum (Munich)
      '3': { lat: 48.1778, lng: 11.5617 }, // BMW Headquarters (Munich)
      '4': { lat: 48.1089, lng: 11.4708 }, // Klinikum Großhadern (Munich)
      '5': { lat: 48.1351, lng: 11.5820 }, // Aral Tankstelle (Munich area)
    };
    return coordMap[location.id] || bavariaCoordinates.munich;
  };





  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [48.7758, 11.4198], // Center of Bavaria
        zoom: 8,
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tiles
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      });
      tileLayer.addTo(map);

      // Add Bavaria boundary (simplified polygon)
      const bavariaBoundary = L.polygon([
        [50.5, 8.5],   // North
        [50.5, 13.5],  // Northeast
        [47.5, 13.5],  // Southeast
        [47.5, 8.5],   // Southwest
      ], {
        color: darkMode ? '#3b82f6' : '#1e40af',
        weight: 2,
        fillColor: darkMode ? '#1e3a8a' : '#dbeafe',
        fillOpacity: 0.1,
      });
      bavariaBoundary.addTo(map);

      // Add click handler for map taps
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        // Fetch location data for clicked point
        try {
          const response = await fetch(`/api/location-data?lat=${lat}&lng=${lng}`);
          if (response.ok) {
            const data = await response.json();
            
            // Create a temporary location object for the clicked point
            const tempLocation: Location = {
              id: `temp-${Date.now()}`,
              name: data.city || data.suburb || 'New Location',
              x: 0, y: 0,
              rent: calculateRentFromData(data),
              utilities: calculateUtilitiesFromData(data),
              population: data.population || 5000,
              traffic: data.traffic || 70,
              isOccupied: false,
              lat, lng
            };
            
            // Call the click handler with the temporary location
            onLocationClick(tempLocation);
          }
        } catch (error) {
          console.warn('Error fetching location data:', error);
        }
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers only (keep boundary and tiles)
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer || layer instanceof L.Polygon) return;
      map.removeLayer(layer);
    });

    // Add location markers
    const markers: L.Marker[] = [];
    locations.forEach((location) => {
      const coords = getLocationCoordinates(location);
      
      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${location.isOccupied ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            ${location.isOccupied ? '✓' : '📍'}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
      markers.push(marker);
      
      // Add popup with location info
      const popupContent = `
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">${location.name}</h3>
          <div style="font-size: 12px; color: #6b7280;">
            <div>💰 Rent: €${location.rent}/month</div>
            <div>⚡ Utilities: €${location.utilities}/month</div>
            <div>👥 Population: ${location.population.toLocaleString()}</div>
            <div>🚶 Traffic: ${location.traffic}%</div>
            <div style="margin-top: 8px; padding: 4px 8px; background: ${location.isOccupied ? '#dcfce7' : '#dbeafe'}; color: ${location.isOccupied ? '#166534' : '#1e40af'}; border-radius: 4px; font-weight: bold;">
              ${location.isOccupied ? 'Occupied' : 'Available'}
            </div>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        onLocationClick(location);
      });
    });

    // Fit map to show all markers (only if there are markers and map is not already positioned)
    if (markers.length > 0 && !(mapInstanceRef.current as any)._fittedBounds) {
      // Small delay to ensure map is fully loaded
      setTimeout(() => {
        const bounds = L.latLngBounds(markers.map(marker => marker.getLatLng()));
        map.fitBounds(bounds, { padding: [20, 20] });
        (mapInstanceRef.current as any)._fittedBounds = true;
      }, 100);
    }

    // Cleanup function
    return () => {
      // Don't remove the map instance here, just clean up markers
      markers.forEach(marker => {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      });
    };
  }, [locations, darkMode, onLocationClick]);

  // Helper functions for calculating rent and utilities
  const calculateRentFromData = (data: any): number => {
    let baseRent = 300;
    
    if (data.city === 'Munich') {
      baseRent += 500;
    } else if (data.suburb) {
      baseRent += 200;
    }
    
    if (data.amenities?.includes('shopping_center')) {
      baseRent += 300;
    }
    if (data.amenities?.includes('university')) {
      baseRent += 200;
    }
    if (data.amenities?.includes('hospital')) {
      baseRent += 250;
    }
    if (data.amenities?.includes('public_transport')) {
      baseRent += 150;
    }
    
    return Math.round(baseRent + (Math.random() * 200 - 100));
  };

  const calculateUtilitiesFromData = (data: any): number => {
    let baseUtilities = 50;
    
    if (data.city === 'Munich') {
      baseUtilities += 100;
    }
    
    if (data.amenities?.includes('shopping_center')) {
      baseUtilities += 50;
    }
    
    return Math.round(baseUtilities + (Math.random() * 50 - 25));
  };

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-xl overflow-hidden shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export default RealBavariaMap;

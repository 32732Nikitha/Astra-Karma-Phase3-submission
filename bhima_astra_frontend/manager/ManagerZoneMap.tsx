import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface WorkerMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
}

// Generate mock worker locations around Andheri West
const generateWorkerMarkers = (): WorkerMarker[] => {
  const baseLatitude = 19.1136;
  const baseLongitude = 72.8236;
  const markers: WorkerMarker[] = [];
  const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  for (let i = 0; i < 67; i++) {
    markers.push({
      id: `worker-${i + 1}`,
      lat: baseLatitude + (Math.random() - 0.5) * 0.05,
      lng: baseLongitude + (Math.random() - 0.5) * 0.05,
      name: `Worker ${i + 1}`,
      riskLevel: riskLevels[Math.floor(Math.random() * 3)],
      status: Math.random() > 0.15 ? 'active' : 'inactive',
    });
  }
  return markers;
};

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return '#7A9F8C';
    case 'medium':
      return '#8B7355';
    case 'high':
      return '#A55F4F';
    default:
      return '#999999';
  }
};

const ManagerZoneMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<(L.Marker | L.CircleMarker)[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([19.1136, 72.8236], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        tileSize: 256,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add zone center marker
      const zoneMarker = L.marker([19.1136, 72.8236], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="14" fill="%23f0f0f0" stroke="%23000000" stroke-width="2"/%3E%3Ccircle cx="16" cy="16" r="6" fill="%23000000"/%3E%3C/svg%3E',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(map);
      zoneMarker.bindPopup('<div style="font-weight: 700; font-size: 0.875rem;">Andheri West Zone Center</div>');

      // Add worker markers
      const workers = generateWorkerMarkers();
      workers.forEach((worker) => {
        const color = getRiskColor(worker.riskLevel);
        const opacity = worker.status === 'active' ? 1 : 0.5;
        
        const marker = L.circleMarker([worker.lat, worker.lng], {
          radius: 6,
          fillColor: color,
          color: worker.status === 'active' ? color : '#ccc',
          weight: 2,
          opacity: opacity,
          fillOpacity: opacity * 0.8,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-weight: 700; font-size: 0.875rem;">${worker.name}</div>
           <div style="font-size: 0.75rem; color: #666; margin-top: 4px;">
             Risk: <span style="color: ${color}">${worker.riskLevel.toUpperCase()}</span><br/>
             Status: ${worker.status === 'active' ? 'Active' : 'Inactive'}
           </div>`
        );

        markersRef.current.push(marker);
      });
    }

    // Cleanup
    return () => {
      // Keep map alive for component lifecycle
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg" style={{ border: '1px solid #e8e8e8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <h2 className="font-display mb-4" style={{ fontSize: '1.6875rem', fontWeight: 700, color: '#000000' }}>Zone Map</h2>
      
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="rounded-lg mb-4"
        style={{ height: '400px', backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8', zIndex: 0 }}
      />

      {/* Zone Info & Legend */}
      <div className="border-t" style={{ borderColor: '#e8e8e8', paddingTop: '1rem' }}>
        <p className="ui-text" style={{ color: '#000000', fontWeight: 700, marginBottom: '0.75rem' }}>Andheri West • 67 Active Workers</p>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7A9F8C' }}></div>
            <div>
              <p className="ui-label" style={{ color: '#666666' }}>Low Risk</p>
              <p className="ui-text" style={{ color: '#000000', fontWeight: 500 }}>34 workers</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B7355' }}></div>
            <div>
              <p className="ui-label" style={{ color: '#666666' }}>Med Risk</p>
              <p className="ui-text" style={{ color: '#000000', fontWeight: 500 }}>21 workers</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A55F4F' }}></div>
            <div>
              <p className="ui-label" style={{ color: '#666666' }}>High Risk</p>
              <p className="ui-text" style={{ color: '#000000', fontWeight: 500 }}>12 workers</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManagerZoneMap;

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * LiveZoneMap — Google Maps light-themed zone map
 * Default: Yanamalakuduru, Vijayawada, AP (16.5038° N, 80.6517° E)
 * Will be replaced with dynamic worker zone in future.
 */

const WORKER_LAT = 16.5038;
const WORKER_LNG = 80.6517;
const ZONE_RADIUS_METERS = 2500;

/* Google Maps light style array — typed as any for runtime-loaded SDK */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LIGHT_MAP_STYLES: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#f9fafb' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f9fafb' }] },
  // Administrative boundaries → soft grey stroke
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#9CA3AF' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#6B7280' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e9f5e9' }] },
  // Roads → soft grey geometry + grey stroke (not black)
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#9CA3AF' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#D1D5DB' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#9CA3AF' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0e7ff' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6366f1' }] },
];

/* Access the runtime-loaded Google Maps SDK via window */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const G = (): any => (window as any).google?.maps;

const LiveZoneMap: React.FC = () => {
  const mapRef  = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 40; // wait up to 10 s

    const init = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maps = G();
      if (maps) {
        try {
          const map = new maps.Map(mapRef.current!, {
            center: { lat: WORKER_LAT, lng: WORKER_LNG },
            zoom: 13,
            styles: LIGHT_MAP_STYLES,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: { position: maps.ControlPosition.RIGHT_BOTTOM },
            mapTypeId: 'roadmap',
            gestureHandling: 'cooperative',
          });

          /* Outer zone circle */
          new maps.Circle({
            map,
            center: { lat: WORKER_LAT, lng: WORKER_LNG },
            radius: ZONE_RADIUS_METERS,
            fillColor: '#FBBF24',
            fillOpacity: 0.06,
            strokeColor: '#FBBF24',
            strokeOpacity: 0.4,
            strokeWeight: 1.5,
          });

          /* Inner risk zone */
          new maps.Circle({
            map,
            center: { lat: WORKER_LAT, lng: WORKER_LNG },
            radius: 800,
            fillColor: '#FF5C5C',
            fillOpacity: 0.05,
            strokeColor: '#FF5C5C',
            strokeOpacity: 0.35,
            strokeWeight: 1,
          });

          /* Worker marker */
          const marker = new maps.Marker({
            position: { lat: WORKER_LAT, lng: WORKER_LNG },
            map,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#60A5FA',
              fillOpacity: 1,
              strokeColor: '#bfdbfe',
              strokeWeight: 3,
            },
            title: 'Worker Location · Yanamalakuduru',
          });

          /* Info window */
          const infoWindow = new maps.InfoWindow({
            content: `
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;font-family:'DM Mono',monospace;color:#111827;min-width:180px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#2563eb;margin-bottom:6px;">● LIVE LOCATION</div>
                <div style="font-size:12px;margin-bottom:4px;font-weight:600;">Raj Kumar</div>
                <div style="font-size:9px;color:#111827;">Yanamalakuduru · Zone A-7</div>
                <div style="font-size:9px;color:#d97706;margin-top:6px;">⚠ Risk Zone Active</div>
              </div>
            `,
          });
          marker.addListener('click', () => infoWindow.open(map, marker));

          setMapReady(true);
        } catch {
          setMapError(true);
        }
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(init, 250);
        } else {
          setMapError(true);
        }
      }
    };

    init();
  }, []);

  const mono = { fontFamily: 'DM Mono, monospace' } as React.CSSProperties;

  return (
    <motion.div
      style={{
        padding: 0,
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px 0px -30% 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Map header bar */}
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="pulse-dot" style={{
            width: 6, height: 6, background: '#FBBF24',
            borderRadius: '50%', color: '#FBBF24',
          }} />
          <span style={{ ...mono, fontSize: 12, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#111827' }}>
            Live Zone Map · Vijayawada
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {[
            { color: '#60A5FA', shape: 'circle', label: 'Worker' },
            { color: '#FBBF24', shape: 'square', label: 'Zone A-7' },
            { color: '#FF5C5C', shape: 'square', label: 'Risk Core' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: l.shape === 'circle' ? '50%' : 2,
                background: l.shape === 'circle' ? l.color : `${l.color}40`,
                border: l.shape !== 'circle' ? `1px solid ${l.color}` : 'none',
              }} />
              <span style={{ ...mono, fontSize: 8, color: '#111827' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="map-container" style={{ borderRadius: 0, position: 'relative', height: '450px' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Loading overlay */}
        {!mapReady && !mapError && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#f5f7fb', gap: 16,
          }}>
            <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="ripple-circle" style={{
                  width: i * 26, height: i * 26,
                  borderColor: `rgba(251,191,36,${0.4 / i})`,
                  animationDelay: `${(i - 1) * 0.5}s`,
                  animationDuration: '1.8s',
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                }} />
              ))}
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FBBF24', zIndex: 2 }} />
            </div>
            <span style={{ ...mono, fontSize: 11, color: '#111827', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Loading map…
            </span>
          </div>
        )}

        {/* Error / static fallback */}
        {mapError && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#ffffff',
            gap: 16,
          }}>
            <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.4 }}>
              <defs>
                <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="240" fill="url(#mapgrid)" />
              <circle cx="200" cy="120" r="60" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.5" />
              <circle cx="200" cy="120" r="25" fill="none" stroke="#FF5C5C" strokeWidth="1.5" opacity="0.5" />
              <circle cx="200" cy="120" r="8" fill="#3b82f6" opacity="0.8" />
            </svg>
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ ...mono, fontSize: 11, color: '#111827', letterSpacing: '0.18em', marginBottom: 6 }}>
                STATIC ZONE VIEW
              </div>
              <div style={{ ...mono, fontSize: 10, color: '#111827' }}>
                Yanamalakuduru · 16.5038°N, 80.6517°E
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer coordinates */}
      <div style={{
        padding: '10px 22px',
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ ...mono, fontSize: 10, color: '#111827', letterSpacing: '0.1em' }}>
          16.5038°N · 80.6517°E
        </span>
        <span style={{ ...mono, fontSize: 10, color: '#111827', letterSpacing: '0.1em' }}>
          Zone Radius: 2.5 km · Active Coverage
        </span>
      </div>
    </motion.div>
  );
};

export default LiveZoneMap;

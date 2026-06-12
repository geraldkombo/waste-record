import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import * as turf from '@turf/turf';

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

const PaintTraumaBrush = ({ isPainting, setTraumaPolygons }) => {
  useMapEvents({
    mousemove(e) {
      if (isPainting && e.originalEvent.buttons === 1) {
        const pt = turf.point([e.latlng.lng, e.latlng.lat]);
        const brushCircle = turf.buffer(pt, 0.012, { units: 'kilometers' });
        setTraumaPolygons(prev => {
          if (!prev) return brushCircle;
          try {
            return turf.union(prev, brushCircle);
          } catch (err) {
            return prev;
          }
        });
      }
    }
  });
  return null;
};

const MapViewer = ({ spatialData, isPainting, traumaPolygons, setTraumaPolygons, location }) => {
  if (!spatialData) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Parsing Earth Observation Geometry...
      </div>
    );
  }

  const mapCenter = location === 'mombasa' ? [-4.0530, 39.6728] : [-1.2490, 36.8962];

  const getBuildingStyle = (feature) => {
    const status = feature.properties.status;
    if (status === 'Zone 1') {
      return { color: '#ef4444', weight: 1.5, fillColor: '#ef4444', fillOpacity: 0.7 };
    }
    if (status === 'Zone 2') {
      return { color: '#f97316', weight: 1.5, fillColor: '#f97316', fillOpacity: 0.6 };
    }
    return { color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.4 };
  };

  return (
    <MapContainer center={mapCenter} zoom={15} className="h-full w-full relative z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <RecenterMap center={mapCenter} />

      <GeoJSON
        key={`b60-${location}`}
        data={spatialData.buffer60}
        style={{ color: '#fb923c', weight: 0, fillColor: '#fb923c', fillOpacity: 0.2 }}
      />

      <GeoJSON
        key={`b30-${location}`}
        data={spatialData.buffer30}
        style={{ color: '#f87171', weight: 0, fillColor: '#f87171', fillOpacity: 0.25 }}
      />

      <GeoJSON
        key={`hwm-${location}`}
        data={spatialData.hwmLine}
        style={{ color: '#0f172a', weight: 3, dashArray: '6, 6' }}
      />

      <GeoJSON
        key={`build-${location}-${spatialData.buildings.features.length}`}
        data={spatialData.buildings}
        style={getBuildingStyle}
      />

      {traumaPolygons && (
        <GeoJSON
          data={traumaPolygons}
          style={{ color: '#a855f7', weight: 0, fillColor: '#a855f7', fillOpacity: 0.5 }}
        />
      )}

      <PaintTraumaBrush isPainting={isPainting} setTraumaPolygons={setTraumaPolygons} />
    </MapContainer>
  );
};

export default MapViewer;

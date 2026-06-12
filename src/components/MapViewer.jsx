import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useTraumaBrush } from '../hooks/useTraumaBrush';
import LivedTraumaOverlay from './LivedTraumaOverlay';

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

const PaintTraumaBrush = ({ isPainting, addStroke }) => {
  useMapEvents({
    click(e) {
      if (!isPainting) return;
      const feature = {
        type: 'Feature',
        properties: { timestamp: Date.now(), type: 'trauma_mark' },
        geometry: { type: 'Point', coordinates: [e.latlng.lng, e.latlng.lat] }
      };
      addStroke(feature);
    }
  });
  return null;
};

const MapViewer = ({ spatialData, location, setLocation, handleFileUpload }) => {
  const { strokes, isPainting, setIsPainting, addStroke, undoStroke, clearStrokes } = useTraumaBrush();

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

  const strokeCollection = strokes.length > 0 ? {
    type: 'FeatureCollection',
    features: strokes
  } : null;

  return (
    <div className="relative h-full w-full">
      <LivedTraumaOverlay
        isPainting={isPainting}
        togglePainting={() => setIsPainting(!isPainting)}
        onUndo={undoStroke}
        onClear={clearStrokes}
        handleFileUpload={handleFileUpload}
        location={location}
        setLocation={setLocation}
      />

      <MapContainer center={mapCenter} zoom={15} className="h-full w-full relative z-0" style={{ cursor: isPainting ? 'crosshair' : 'default' }}>
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

        {strokeCollection && (
          <GeoJSON
            key={`strokes-${strokes.length}`}
            data={strokeCollection}
            pointToLayer={(feature, latlng) => {
              return L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#a855f7',
                color: '#7e22ce',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
              });
            }}
          />
        )}

        <PaintTraumaBrush isPainting={isPainting} addStroke={addStroke} />
      </MapContainer>
    </div>
  );
};

export default MapViewer;

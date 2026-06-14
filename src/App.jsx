import React, { useState, useEffect } from 'react';
import MapViewer from './components/MapViewer';
import LocalLedger from './components/LocalLedger';
import CollectionForm from './components/CollectionForm';
import CityDashboard from './components/CityDashboard';
import { generateGeospatialData, calculateLVS } from './utils/spatialEngine';
import { Recycle, BarChart3, Sliders } from 'lucide-react';
import * as turf from '@turf/turf';
import L from 'leaflet';
import db from './db/picketDb';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const WARDS = ['mathare', 'dandora', 'kibera', 'kawangware'];
const WARD_LABELS = { mathare: 'Mathare Valley', dandora: 'Dandora', kibera: 'Kibera', kawangware: 'Kawangware' };

const App = () => {
  const [spatialData, setSpatialData] = useState(null);
  const [price, setPrice] = useState(41);
  const [ward, setWard] = useState('mathare');
  const [stats, setStats] = useState({ zone1: 0, zone2: 0, safe: 0, totalValue: 0, totalPoints: 0 });
  const [placingCollection, setPlacingCollection] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);

  useEffect(() => {
    const data = generateGeospatialData(ward);
    setSpatialData(data);
    calculateStats(data.buildings);
  }, [ward]);

  const calculateStats = (buildings) => {
    let z1 = 0, z2 = 0, safe = 0, val = 0, count = 0;
    turf.featureEach(buildings, (feature) => {
      const props = feature.properties;
      count++;
      if (props.status === 'Zone 1') z1++;
      else if (props.status === 'Zone 2') z2++;
      else safe++;
      if (props.status !== 'Safe') val += props.dailyValue;
    });
    setStats({ zone1: z1, zone2: z2, safe, totalValue: val, totalPoints: count });
  };

  const cycleWard = () => {
    const idx = WARDS.indexOf(ward);
    setWard(WARDS[(idx + 1) % WARDS.length]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geoJSON = JSON.parse(event.target.result);
        if (geoJSON.type === 'FeatureCollection') {
          setSpatialData(prev => ({ ...prev, buildings: geoJSON }));
          calculateStats(geoJSON);
        }
      } catch (error) {
        alert("Invalid GeoJSON file formatting");
      }
    };
    reader.readAsText(file);
  };

  const handleSliderChange = (e) => {
    const pValue = parseFloat(e.target.value);
    setPrice(pValue);
    if (!spatialData) return;

    const updatedBuildings = { ...spatialData.buildings };
    turf.featureEach(updatedBuildings, (feature) => {
      feature.properties.dailyValue = feature.properties.volume * pValue;
    });

    setSpatialData(prev => ({ ...prev, buildings: updatedBuildings }));
  };

  const handlePlaceRequest = () => {
    setPendingCoords(null);
    setPlacingCollection(true);
  };

  const handleCollectionCoords = (coords) => {
    setPendingCoords(coords);
    setPlacingCollection(false);
  };

  const handleCollectionSave = async (feature, photoBlob) => {
    const featureId = await db.features.add(feature);
    if (photoBlob) {
      await db.media.add({ featureId, blob: photoBlob });
    }
    setPendingCoords(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <div className="w-[420px] p-6 flex flex-col gap-5 overflow-y-auto border-r border-slate-800 bg-slate-900 bg-opacity-40">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Recycle className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-400">
              PICKet
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Waste Picker Spatial Organizing Toolkit
          </p>
          <p className="text-[10px] mt-1 italic text-slate-500">
            Build your own data — counter the Ghana formula
          </p>
        </div>

        <div className="bg-slate-800 bg-opacity-50 border border-slate-800 p-5 rounded-lg flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Dumpsite Proximity
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-950 bg-opacity-45 border border-red-900 p-3 rounded-lg text-center">
              <span className="block text-2xl font-bold font-mono text-red-400">{stats.zone1}</span>
              <span className="text-[10px] text-red-300 uppercase tracking-wider block mt-1">Hot Zone (30m)</span>
            </div>
            <div className="bg-orange-950 bg-opacity-45 border border-orange-900 p-3 rounded-lg text-center">
              <span className="block text-2xl font-bold font-mono text-orange-400">{stats.zone2}</span>
              <span className="text-[10px] text-orange-300 uppercase tracking-wider block mt-1">Buffer (60m)</span>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
            <span className="text-xs text-slate-400">Collection Points:</span>
            <span className="text-sm font-mono font-bold text-slate-200">{stats.totalPoints}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Affected Value (KES/day):</span>
            <span className="text-sm font-mono font-bold text-amber-400">
              KES {stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="bg-slate-800 bg-opacity-50 border border-slate-800 p-5 rounded-lg flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" /> Collection Pricing
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Price per kg (KES):</span>
              <span className="font-mono text-amber-400 font-bold">KES {price}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={price}
              onChange={handleSliderChange}
              className="w-full accent-amber-400 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
            />
          </div>
        </div>

        <CollectionForm
          placing={placingCollection}
          onPlaceRequest={handlePlaceRequest}
          pendingCoords={pendingCoords}
          onSave={handleCollectionSave}
        />

        <CityDashboard />

        <LocalLedger buffer60={spatialData?.buffer60} />
      </div>

      <div className="flex-1 relative">
        <MapViewer
          spatialData={spatialData}
          ward={ward}
          wardLabel={WARD_LABELS[ward]}
          cycleWard={cycleWard}
          handleFileUpload={handleFileUpload}
          placingCollection={placingCollection}
          onCollectionCoords={handleCollectionCoords}
        />
      </div>
    </div>
  );
};

export default App;

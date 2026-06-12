import React, { useState, useEffect } from 'react';
import MapViewer from './components/MapViewer';
import LivedTraumaOverlay from './components/LivedTraumaOverlay';
import LocalLedger from './components/LocalLedger';
import { generateGeospatialData, calculateRunoff, calculateLVS } from './utils/spatialEngine';
import { Shield, Compass, BarChart3, Sliders } from 'lucide-react';
import * as turf from '@turf/turf';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const App = () => {
  const [spatialData, setSpatialData] = useState(null);
  const [isPainting, setIsPainting] = useState(false);
  const [traumaPolygons, setTraumaPolygons] = useState(null);
  const [precip, setPrecip] = useState(112);
  const [location, setLocation] = useState('nairobi');
  const [stats, setStats] = useState({ zone1: 0, zone2: 0, safe: 0, totalVolume: 0 });

  useEffect(() => {
    const data = generateGeospatialData(location);
    setSpatialData(data);
    calculateStats(data.buildings);
  }, [location]);

  const calculateStats = (buildings) => {
    let z1 = 0, z2 = 0, safe = 0, vol = 0;
    turf.featureEach(buildings, (feature) => {
      const props = feature.properties;
      if (props.status === 'Zone 1') z1++;
      else if (props.status === 'Zone 2') z2++;
      else safe++;
      if (props.status !== 'Safe') vol += props.volume;
    });
    setStats({ zone1: z1, zone2: z2, safe, totalVolume: vol });
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
    setPrecip(pValue);
    if (!spatialData) return;

    const updatedBuildings = { ...spatialData.buildings };
    turf.featureEach(updatedBuildings, (feature) => {
      const props = feature.properties;
      const s = 1000 / (10 + props.lvs) - 10;
      props.runoff = calculateRunoff(pValue, s);
      props.lvs = calculateLVS(
        props.distToRiver <= 30 ? 10 : props.distToRiver <= 60 ? 5 : 1,
        props.lhi,
        props.gsc
      );
    });

    setSpatialData(prev => ({ ...prev, buildings: updatedBuildings }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <div className="w-[420px] p-6 flex flex-col gap-5 overflow-y-auto border-r border-slate-800 bg-slate-900 bg-opacity-40">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-8 h-8 text-sky-400" />
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-400">
              Santiago-LivedLines
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Participatory Urban Loss & Damage Auditing Platform
          </p>
          <p className="text-[10px] mt-1 italic text-slate-500">
            Mission: Accelerate climate action with data-driven solutions
          </p>
        </div>

        <div className="bg-slate-800 bg-opacity-50 border border-slate-800 p-5 rounded-lg flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-sky-400" /> Riparian Encroachment
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-950 bg-opacity-45 border border-red-900 p-3 rounded-lg text-center">
              <span className="block text-2xl font-bold font-mono text-red-400">{stats.zone1}</span>
              <span className="text-[10px] text-red-300 uppercase tracking-wider block mt-1">Zone 1 (30m)</span>
            </div>
            <div className="bg-orange-950 bg-opacity-45 border border-orange-900 p-3 rounded-lg text-center">
              <span className="block text-2xl font-bold font-mono text-orange-400">{stats.zone2}</span>
              <span className="text-[10px] text-orange-300 uppercase tracking-wider block mt-1">Zone 2 (60m)</span>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
            <span className="text-xs text-slate-400">Volumetric Risk Target:</span>
            <span className="text-sm font-mono font-bold text-slate-200">
              {stats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })} m&sup3;
            </span>
          </div>
        </div>

        <div className="bg-slate-800 bg-opacity-50 border border-slate-800 p-5 rounded-lg flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-400" /> SCS Runoff Simulation
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Precipitation (P):</span>
              <span className="font-mono text-sky-400 font-bold">{precip}mm</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              value={precip}
              onChange={handleSliderChange}
              className="w-full accent-sky-400 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
            />
          </div>
        </div>

        <LocalLedger buffer60={spatialData?.buffer60} />
      </div>

      <div className="flex-1 relative">
        <LivedTraumaOverlay
          isPainting={isPainting}
          setIsPainting={setIsPainting}
          handleFileUpload={handleFileUpload}
          location={location}
          setLocation={setLocation}
        />
        <MapViewer
          spatialData={spatialData}
          isPainting={isPainting}
          traumaPolygons={traumaPolygons}
          setTraumaPolygons={setTraumaPolygons}
          location={location}
        />
      </div>
    </div>
  );
};

export default App;

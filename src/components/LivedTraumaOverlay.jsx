import React from 'react';
import { Shield, UploadCloud, Paintbrush, RefreshCw } from 'lucide-react';

const LivedTraumaOverlay = ({ isPainting, setIsPainting, handleFileUpload, location, setLocation }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <div className="bg-slate-900 bg-opacity-90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-2xl w-56">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ground Spatial Toolkit</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Observation Site</span>
            <button
              onClick={() => setLocation(location === 'nairobi' ? 'mombasa' : 'nairobi')}
              className="flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-sky-400 font-semibold hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              {location === 'mombasa' ? 'Mombasa (Tudor Creek)' : 'Nairobi (Mathare)'}
            </button>
          </div>

          <button
            onClick={() => setIsPainting(!isPainting)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-colors w-full ${isPainting ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            {isPainting ? 'Stop Painting Trauma' : 'Paint Lived Heat Trauma'}
          </button>

          <div className="border border-dashed border-slate-700 rounded p-3 text-center transition hover:bg-slate-800">
            <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <UploadCloud className="w-5 h-5 text-sky-400" />
              <span>Upload Custom GeoJSON</span>
              <input type="file" accept=".geojson,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivedTraumaOverlay;

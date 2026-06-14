import React from 'react';
import { Shield, UploadCloud, Paintbrush, RefreshCw, Undo2, Trash2, Download } from 'lucide-react';
import { generateAuditExport } from '../utils/exportUtils';
import db from '../db/picketDb';

const PICKetOverlay = ({ isPainting, togglePainting, onUndo, onClear, handleFileUpload, ward, wardLabel, cycleWard }) => {
  const handleExport = async () => {
    const strokes = await db.features.toArray();
    const visits = await db.visits.toArray();
    generateAuditExport(strokes, visits);
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <div className="bg-slate-900 bg-opacity-90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-2xl w-56">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Field Toolkit</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Ward</span>
            <button
              onClick={cycleWard}
              className="flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-emerald-400 font-semibold hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              {wardLabel}
            </button>
          </div>

          <button
            onClick={togglePainting}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-colors w-full ${isPainting ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            {isPainting ? 'Stop Tagging' : 'Tag Hazard / Incident'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onUndo}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-semibold bg-yellow-700 hover:bg-yellow-600 text-white transition-colors flex-1"
            >
              <Undo2 className="w-3 h-3" /> Undo
            </button>
            <button
              onClick={onClear}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-semibold bg-red-800 hover:bg-red-700 text-white transition-colors flex-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="border border-dashed border-slate-700 rounded p-3 text-center transition hover:bg-slate-800">
            <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Upload GeoJSON (Collection Data)</span>
              <input type="file" accept=".geojson,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors w-full"
          >
            <Download className="w-3.5 h-3.5" /> Download EPR Evidence Pack
          </button>
        </div>
      </div>
    </div>
  );
};

export default PICKetOverlay;
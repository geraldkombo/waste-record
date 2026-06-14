import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/picketDb';
import { MATERIAL_HEURISTICS } from '../utils/heuristicsEngine';
import { BarChart3, MapPin, ShieldAlert, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const CityDashboard = () => {
  const [expanded, setExpanded] = useState(false);

  const features = useLiveQuery(() => db.features.toArray()) || [];
  const visits = useLiveQuery(() => db.visits.toArray()) || [];

  const collections = features.filter(f => f.properties?.type === 'collection_log');
  const hazards = features.filter(f => f.properties?.type === 'hazard_mark');
  const totalKg = collections.reduce((sum, c) => sum + (c.properties?.estimatedWeight || 0), 0);
  const verifiedVisits = visits.filter(v => v.verified).length;

  const materialBreakdown = {};
  collections.forEach(c => {
    const mat = c.properties?.materialType || 'mixed';
    materialBreakdown[mat] = (materialBreakdown[mat] || 0) + (c.properties?.estimatedWeight || 0);
  });

  return (
    <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
      >
        <span className="flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-emerald-400" /> City Dashboard
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 border border-slate-700 p-3 rounded text-center">
              <span className="block text-xl font-bold font-mono text-emerald-400">{features.length}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Total Data Points</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 rounded text-center">
              <span className="block text-xl font-bold font-mono text-amber-400">{totalKg.toFixed(0)}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Est. kg Collected</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 rounded text-center">
              <span className="block text-xl font-bold font-mono text-purple-400">{hazards.length}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Hazards Tagged</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 rounded text-center">
              <span className="block text-xl font-bold font-mono text-sky-400">{visits.length}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Site Visits</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] bg-slate-900 border border-slate-700 rounded p-2">
            <span className="text-slate-400 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Verified</span>
            <span className="font-mono text-emerald-400 font-bold">{verifiedVisits}</span>
            <span className="text-slate-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> Unverified</span>
            <span className="font-mono text-red-400 font-bold">{visits.length - verifiedVisits}</span>
          </div>

          {Object.keys(materialBreakdown).length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded p-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Material Breakdown</span>
              <div className="flex flex-col gap-1.5">
                {Object.entries(materialBreakdown).sort((a, b) => b[1] - a[1]).map(([key, kg]) => (
                  <div key={key} className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{MATERIAL_HEURISTICS[key]?.label || key}</span>
                    <span className="font-mono text-slate-400">{kg.toFixed(1)} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-600 text-center italic">
            Data lives on-device. Export via EPR Evidence Pack to share with county.
          </div>
        </div>
      )}
    </div>
  );
};

export default CityDashboard;

import React, { useState } from 'react';
import * as turf from '@turf/turf';
import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/pimaDb';

export const saveToLedger = (key, data) => {
  try {
    const serialized = JSON.stringify({ data, timestamp: Date.now() });
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.error("Storage full or quota exceeded", e);
  }
};

export const getFromLedger = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item).data : null;
  } catch (e) {
    return null;
  }
};

const LocalLedger = ({ buffer60 }) => {
  const [status, setStatus] = useState('');

  const ledger = useLiveQuery(() => db.visits.orderBy('id').reverse().toArray()) || [];

  const verifyLocation = async () => {
    if (!navigator.geolocation) {
      setStatus('GPS hardware unavailable.');
      return;
    }

    setStatus('Acquiring GPS...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const pt = turf.point([longitude, latitude]);

        const isVerified = buffer60 ? turf.booleanPointInPolygon(pt, buffer60) : false;

        const record = {
          visitId: 'WR-' + Math.floor(10000 + Math.random() * 90000),
          coords: [latitude.toFixed(5), longitude.toFixed(5)],
          timestamp: new Date().toISOString(),
          verified: isVerified
        };

        await db.visits.add(record);
        setStatus(isVerified ? 'Site visit verified.' : 'Location outside dumpsite buffer.');
      },
      (error) => {
        setStatus('GPS Error: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex flex-col gap-3">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-emerald-400" /> Baze Route Ledger
      </h3>
      <button
        onClick={verifyLocation}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition-colors"
      >
        Log Site Visit
      </button>
      {status && <p className="text-[11px] italic text-slate-300">{status}</p>}

      <div className="max-h-40 overflow-y-auto bg-slate-900 p-2 rounded border border-slate-700">
        {ledger.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-2">No visits logged.</p>
        )}
        {ledger.map((task) => (
          <div key={task.id} className="text-[11px] border-b border-slate-800 py-2 last:border-0">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-emerald-400 font-bold">{task.visitId}</span>
              <span className="flex items-center gap-1 text-[10px]">
                {task.verified ? (
                  <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Verified</span>
                ) : (
                  <span className="text-red-400 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Unverified</span>
                )}
              </span>
            </div>
            <span className="text-slate-400 font-mono">[{task.coords[0]}, {task.coords[1]}]</span>
            <span className="text-slate-500 block text-[9px] mt-0.5">{new Date(task.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalLedger;

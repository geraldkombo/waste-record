import React, { useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

const LocalLedger = ({ buffer60 }) => {
  const [ledger, setLedger] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('santiago_ledger');
    if (stored) setLedger(JSON.parse(stored));
  }, []);

  const saveLedger = (newLedger) => {
    setLedger(newLedger);
    localStorage.setItem('santiago_ledger', JSON.stringify(newLedger));
  };

  const verifyLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Local GPS hardware unavailable.');
      return;
    }

    setStatus('Acquiring active satellite locks...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pt = turf.point([longitude, latitude]);

        const isVerified = buffer60 ? turf.booleanPointInPolygon(pt, buffer60) : false;

        const record = {
          id: 'CWX-NYS-' + Math.floor(10000 + Math.random() * 90000),
          coords: [latitude.toFixed(5), longitude.toFixed(5)],
          timestamp: new Date().toISOString(),
          verified: isVerified
        };

        saveLedger([record, ...ledger]);
        setStatus(isVerified ? 'Verification passed.' : 'Coordinates outside dynamic SPA buffer.');
      },
      (error) => {
        setStatus('GPS Signal Error: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex flex-col gap-3">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-emerald-400" /> Climate WorX Task Ledger
      </h3>
      <button
        onClick={verifyLocation}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition-colors"
      >
        Execute Local Geofenced Verification
      </button>
      {status && <p className="text-[11px] italic text-slate-300">{status}</p>}

      <div className="max-h-40 overflow-y-auto bg-slate-900 p-2 rounded border border-slate-700">
        {ledger.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-2">No verifications logged.</p>
        )}
        {ledger.map((task, idx) => (
          <div key={idx} className="text-[11px] border-b border-slate-800 py-2 last:border-0">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-emerald-400 font-bold">{task.id}</span>
              <span className="flex items-center gap-1 text-[10px]">
                {task.verified ? (
                  <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Payout Approved</span>
                ) : (
                  <span className="text-red-400 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Out of Buffer</span>
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

import { useState, useEffect } from 'react';
import { saveToLedger, getFromLedger } from '../components/LocalLedger';

export const useTraumaBrush = () => {
  const [strokes, setStrokes] = useState(() => getFromLedger('trauma_strokes') || []);
  const [isPainting, setIsPainting] = useState(false);

  useEffect(() => {
    saveToLedger('trauma_strokes', strokes);
  }, [strokes]);

  const addStroke = (geoJson) => setStrokes(prev => [...prev, geoJson]);
  const undoStroke = () => setStrokes(prev => prev.slice(0, -1));
  const clearStrokes = () => setStrokes([]);

  return { strokes, isPainting, setIsPainting, addStroke, undoStroke, clearStrokes };
};

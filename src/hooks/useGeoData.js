import { useState, useEffect } from 'react';
import { getFromLedger, saveToLedger } from '../components/LocalLedger';

export const useGeoData = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const cached = getFromLedger('geo_cache');
    if (cached) {
      setData(cached);
    } else {
      fetch(url)
        .then(res => res.json())
        .then(json => {
          saveToLedger('geo_cache', json);
          setData(json);
        });
    }
  }, [url]);

  return data;
};

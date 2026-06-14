import * as turf from '@turf/turf';

export const calculateBuffer = (geojson, meters) => {
  return turf.buffer(geojson, meters / 1000, { units: 'kilometers' });
};

export const validateGeoJSON = (data) => {
  if (!data || !data.type) throw new Error('Invalid GeoJSON: missing type');
  if (data.type === 'Point') {
    const coords = data.coordinates;
    if (!Array.isArray(coords) || coords.length < 2 || coords.some(c => c === null || c === undefined || isNaN(c))) {
      throw new Error('Invalid GeoJSON: malformed coordinates');
    }
  }
  return true;
};

export const calculateVolume = (area, height, rs = 1.0) => {
  return area * height * rs;
};

export const generateGeospatialData = (ward) => {
  const wardConfig = {
    mathare: {
      center: [-1.2567, 36.8571],
      boundaryCoords: [[36.8520, -1.2530], [36.8550, -1.2555], [36.8571, -1.2567], [36.8600, -1.2575], [36.8630, -1.2590]],
      label: 'Mathare Valley Dumpsite Boundary'
    },
    dandora: {
      center: [-1.2527, 36.8805],
      boundaryCoords: [[36.8755, -1.2490], [36.8780, -1.2510], [36.8805, -1.2527], [36.8830, -1.2540], [36.8860, -1.2560]],
      label: 'Dandora Dumpsite Boundary'
    },
    kibera: {
      center: [-1.3155, 36.7667],
      boundaryCoords: [[36.7610, -1.3120], [36.7640, -1.3140], [36.7667, -1.3155], [36.7690, -1.3170], [36.7720, -1.3190]],
      label: 'Kibera Dumpsite Boundary'
    },
    kawangware: {
      center: [-1.2745, 36.7196],
      boundaryCoords: [[36.7140, -1.2710], [36.7170, -1.2730], [36.7196, -1.2745], [36.7220, -1.2760], [36.7250, -1.2780]],
      label: 'Kawangware Dumpsite Boundary'
    }
  };

  const config = wardConfig[ward] || wardConfig.mathare;
  const [centerLat, centerLng] = config.center;

  const dumpsiteLine = turf.lineString(config.boundaryCoords, { name: config.label });
  const buffer30 = turf.buffer(dumpsiteLine, 0.03, { units: 'kilometers' });
  const buffer60 = turf.buffer(dumpsiteLine, 0.06, { units: 'kilometers' });

  const points = [];
  for (let i = 0; i < 50; i++) {
    const lng = centerLng + (Math.random() - 0.5) * 0.015;
    const lat = centerLat + (Math.random() - 0.5) * 0.008;
    const pt = turf.point([lng, lat]);

    const radius = 0.002 + (Math.random() * 0.003);
    const pointPoly = turf.buffer(pt, radius, { units: 'kilometers' });

    const height = 3 + Math.random() * 12;
    const area = turf.area(pointPoly);
    const volume = calculateVolume(area, height);

    const distToDumpsite = turf.pointToLineDistance(pt, dumpsiteLine, { units: 'kilometers' }) * 1000;

    let status = 'Safe';
    if (turf.booleanIntersects(pointPoly, buffer30)) {
      status = 'Zone 1';
    } else if (turf.booleanIntersects(pointPoly, buffer60)) {
      status = 'Zone 2';
    }

    pointPoly.properties = {
      id: `COL-${1000 + i}`,
      height,
      area,
      volume,
      status,
      distToDumpsite,
      dailyValue: volume * 41
    };
    points.push(pointPoly);
  }

  return {
    dumpsiteLine,
    buffer30,
    buffer60,
    buildings: turf.featureCollection(points)
  };
};

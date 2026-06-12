import * as turf from '@turf/turf';

export const calculateVolume = (area, height, rs = 1.0) => {
  return area * height * rs;
};

export const calculateRunoff = (p, s) => {
  const ia = 0.2 * s;
  if (p <= ia) return 0;
  return Math.pow(p - ia, 2) / ((p - ia) + s);
};

export const calculateLVS = (fri, lhi, gsc, wf = 0.4, wh = 0.4, wg = 0.2) => {
  return (wf * fri) + (wh * lhi) - (wg * gsc);
};

export const generateGeospatialData = (location) => {
  const isMombasa = location === 'mombasa';
  const hwmCoords = isMombasa
    ? [[39.6600, -4.0480], [39.6650, -4.0500], [39.6700, -4.0520], [39.6728, -4.0530], [39.6780, -4.0550]]
    : [[36.8920, -1.2470], [36.8940, -1.2485], [36.8962, -1.2490], [36.8980, -1.2495], [36.9020, -1.2512]];

  const hwmLine = turf.lineString(hwmCoords, { name: isMombasa ? 'Tudor Creek HWM' : 'Mathare River HWM' });
  const buffer30 = turf.buffer(hwmLine, 0.03, { units: 'kilometers' });
  const buffer60 = turf.buffer(hwmLine, 0.06, { units: 'kilometers' });

  const buildings = [];
  const centerLng = isMombasa ? 39.6700 : 36.8962;
  const centerLat = isMombasa ? -4.0530 : -1.2490;

  for (let i = 0; i < 50; i++) {
    const lng = centerLng + (Math.random() - 0.5) * 0.015;
    const lat = centerLat + (Math.random() - 0.5) * 0.008;
    const pt = turf.point([lng, lat]);

    const radius = 0.002 + (Math.random() * 0.003);
    const buildingPoly = turf.buffer(pt, radius, { units: 'kilometers' });

    const height = 3 + Math.random() * 12;
    const area = turf.area(buildingPoly);
    const volume = calculateVolume(area, height);

    const s = 40 + Math.random() * 110;
    const runoff = calculateRunoff(112, s);

    const lhi = Math.random() * 10;
    const gsc = Math.random() * 4;

    const distToRiver = turf.pointToLineDistance(pt, hwmLine, { units: 'kilometers' }) * 1000;

    let fri = 1;
    if (distToRiver <= 30) fri = 10;
    else if (distToRiver <= 60) fri = 5;

    const lvs = calculateLVS(fri, lhi, gsc);

    let status = 'Safe';
    if (turf.booleanIntersects(buildingPoly, buffer30)) {
      status = 'Zone 1';
    } else if (turf.booleanIntersects(buildingPoly, buffer60)) {
      status = 'Zone 2';
    }

    buildingPoly.properties = {
      id: `STRUC-${1000 + i}`,
      height,
      area,
      volume,
      runoff,
      lhi,
      gsc,
      lvs,
      status,
      distToRiver
    };
    buildings.push(buildingPoly);
  }

  return {
    hwmLine,
    buffer30,
    buffer60,
    buildings: turf.featureCollection(buildings)
  };
};

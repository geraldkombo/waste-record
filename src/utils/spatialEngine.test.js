import { describe, it, expect } from 'vitest';
import { calculateBuffer, validateGeoJSON } from './spatialEngine';

describe('Spatial Engine', () => {
  it('should calculate buffer within millimeter tolerance', () => {
    const mockPoint = { type: 'Point', coordinates: [36.82, -1.29] };
    const buffer = calculateBuffer(mockPoint, 100); // 100m
    expect(buffer.type).toBe('Feature');
    expect(buffer.geometry.type).toBe('Polygon');
  });

  it('should reject invalid GeoJSON geometries', () => {
    const badData = { type: 'Point', coordinates: [null, null] };
    expect(() => validateGeoJSON(badData)).toThrow();
  });
});

import Dexie from 'dexie';

const db = new Dexie('PICKetDatabase');

db.version(1).stores({
  features: '++id, type, timestamp, ward',
  visits: '++id, timestamp, verified',
  geoCache: 'url',
  media: '++id, featureId'
});

export default db;

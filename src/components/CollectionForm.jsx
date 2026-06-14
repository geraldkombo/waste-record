import React, { useState, useRef } from 'react';
import { MATERIAL_HEURISTICS, CONTAINER_VOLUMES, estimateWeight } from '../utils/heuristicsEngine';
import { Scale, MapPin, Crosshair, Camera, Trash2 } from 'lucide-react';
import Pica from 'pica';

const MAX_IMAGE_DIM = 800;
const JPEG_QUALITY = 0.6;

const pica = new Pica();

const compressImage = async (file) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  let { width, height } = img;
  if (width > height && width > MAX_IMAGE_DIM) {
    height = Math.round((height / width) * MAX_IMAGE_DIM);
    width = MAX_IMAGE_DIM;
  } else if (height > MAX_IMAGE_DIM) {
    width = Math.round((width / height) * MAX_IMAGE_DIM);
    height = MAX_IMAGE_DIM;
  }

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = img.naturalWidth;
  srcCanvas.height = img.naturalHeight;
  srcCanvas.getContext('2d').drawImage(img, 0, 0);

  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = width;
  dstCanvas.height = height;

  const resized = await pica.resize(srcCanvas, dstCanvas, { quality: 1 });
  const blob = await pica.toBlob(resized, 'image/jpeg', JPEG_QUALITY);
  URL.revokeObjectURL(img.src);
  return blob;
};

const CollectionForm = ({ placing, onPlaceRequest, pendingCoords, onSave }) => {
  const [material, setMaterial] = useState('PET');
  const [container, setContainer] = useState('GUNIA');
  const [fullness, setFullness] = useState(100);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const cameraRef = useRef(null);

  const estimatedKg = estimateWeight(material, container, fullness);

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const blob = await compressImage(file);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Image compression failed', err);
    }
    setCompressing(false);
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoBlob(null);
    setPhotoPreview(null);
  };

  const handleSave = () => {
    if (!pendingCoords) return;
    onSave({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [pendingCoords.lng, pendingCoords.lat]
      },
      properties: {
        timestamp: Date.now(),
        type: 'collection_log',
        ward: '',
        materialType: material,
        container: container,
        fullness: fullness,
        estimatedWeight: estimatedKg,
        eprCategory: MATERIAL_HEURISTICS[material].eprCategory
      }
    }, photoBlob);
  };

  return (
    <div className="bg-slate-800 bg-opacity-50 border border-slate-700 p-4 rounded-lg flex flex-col gap-3">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        <Scale className="w-4 h-4 text-amber-400" /> Log Collection
      </h2>

      <select
        value={material}
        onChange={(e) => setMaterial(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-slate-200 font-medium"
      >
        {Object.entries(MATERIAL_HEURISTICS).map(([key, data]) => (
          <option key={key} value={key}>{data.label}</option>
        ))}
      </select>

      <select
        value={container}
        onChange={(e) => setContainer(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-slate-200 font-medium"
      >
        {Object.entries(CONTAINER_VOLUMES).map(([key, data]) => (
          <option key={key} value={key}>{data.label}</option>
        ))}
      </select>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-400">Fullness</span>
          <span className="font-mono text-amber-400 font-bold">{fullness}%</span>
        </div>
        <input
          type="range"
          min="25"
          max="100"
          step="25"
          value={fullness}
          onChange={(e) => setFullness(Number(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded p-3 text-center">
        <span className="block text-lg font-bold font-mono text-emerald-400">{estimatedKg} kg</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Estimated Weight</span>
      </div>

      <div className="flex flex-col gap-2">
        {photoPreview ? (
          <div className="relative">
            <img src={photoPreview} alt="Evidence" className="w-full h-24 object-cover rounded border border-slate-700" />
            <button onClick={clearPhoto} className="absolute top-1 right-1 bg-red-800 rounded p-1">
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={compressing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors w-full"
          >
            <Camera className="w-3.5 h-3.5" />
            {compressing ? 'Compressing...' : 'Capture Photo Evidence'}
          </button>
        )}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
      </div>

      {!pendingCoords ? (
        <button
          onClick={onPlaceRequest}
          disabled={placing}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-colors w-full ${placing ? 'bg-sky-700 text-white animate-pulse' : 'bg-sky-700 hover:bg-sky-600 text-white'}`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          {placing ? 'Tap Map to Place...' : 'Place on Map'}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="bg-slate-900 border border-emerald-700 rounded p-2 text-center">
            <span className="text-[10px] text-emerald-400 font-mono">
              <MapPin className="w-3 h-3 inline mr-1" />
              [{pendingCoords.lat.toFixed(5)}, {pendingCoords.lng.toFixed(5)}]
            </span>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors w-full"
          >
            <Scale className="w-3.5 h-3.5" /> Log Collection
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionForm;

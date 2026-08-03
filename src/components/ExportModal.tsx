import React, { useState } from 'react';
import * as THREE from 'three';
import { ModelTelemetry } from '../types';

interface ExportModalProps {
  telemetry: ModelTelemetry;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ telemetry, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'STL' | '3MF' | 'GCODE' | 'OBJ'>('STL');
  const [slicerPreset, setSlicerPreset] = useState<string>('Bambu Studio (Bambu Lab A1)');
  const [layerHeight, setLayerHeight] = useState<number>(telemetry.layerHeight || 0.20);
  const [infill, setInfill] = useState<number>(telemetry.infill || 20);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Generate real 3D geometry buffer for STL export
  const generateMeshGeometry = (): THREE.BufferGeometry => {
    switch (telemetry.shapeType) {
      case 'gear': {
        const shape = new THREE.Shape();
        const teeth = 12;
        const outer = 2.5;
        const inner = 1.8;
        for (let i = 0; i < teeth; i++) {
          const a1 = (i / teeth) * Math.PI * 2;
          const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
          const a3 = ((i + 0.6) / teeth) * Math.PI * 2;
          const a4 = ((i + 0.9) / teeth) * Math.PI * 2;
          if (i === 0) shape.moveTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
          shape.lineTo(Math.cos(a2) * outer, Math.sin(a2) * outer);
          shape.lineTo(Math.cos(a3) * outer, Math.sin(a3) * outer);
          shape.lineTo(Math.cos(a4) * inner, Math.sin(a4) * inner);
        }
        const hole = new THREE.Path();
        hole.absarc(0, 0, 0.8, 0, Math.PI * 2, true);
        shape.holes.push(hole);
        return new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true });
      }
      case 'vase': {
        const points = [];
        for (let i = 0; i < 16; i++) {
          const y = (i / 16) * 4 - 2;
          const r = 1.2 + Math.sin(i * 0.5) * 0.5;
          points.push(new THREE.Vector2(r, y));
        }
        return new THREE.LatheGeometry(points, 24);
      }
      case 'bracket': {
        const shape = new THREE.Shape();
        shape.moveTo(-1.5, -1.5);
        shape.lineTo(1.5, -1.5);
        shape.lineTo(1.5, -0.8);
        shape.lineTo(-0.8, -0.8);
        shape.lineTo(-0.8, 1.5);
        shape.lineTo(-1.5, 1.5);
        shape.closePath();
        return new THREE.ExtrudeGeometry(shape, { depth: 1.2 });
      }
      case 'torus': {
        return new THREE.TorusGeometry(1.8, 0.6, 12, 32);
      }
      default: {
        return new THREE.BoxGeometry(2.5, 2.5, 2.5);
      }
    }
  };

  // Build ASCII STL string from BufferGeometry
  const generateAsciiStl = (geometry: THREE.BufferGeometry, modelName: string): string => {
    const pos = geometry.attributes.position;
    let stl = `solid ${modelName.replace(/\s+/g, '_')}\n`;

    const count = pos.count;
    for (let i = 0; i < count; i += 3) {
      const v1 = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      const v2 = new THREE.Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1));
      const v3 = new THREE.Vector3(pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2));

      // Calculate Normal
      const cb = new THREE.Vector3().subVectors(v3, v2);
      const ab = new THREE.Vector3().subVectors(v1, v2);
      const normal = cb.cross(ab).normalize();

      stl += `  facet normal ${normal.x.toFixed(6)} ${normal.y.toFixed(6)} ${normal.z.toFixed(6)}\n`;
      stl += `    outer loop\n`;
      stl += `      vertex ${(v1.x * 10).toFixed(4)} ${(v1.y * 10).toFixed(4)} ${(v1.z * 10).toFixed(4)}\n`;
      stl += `      vertex ${(v2.x * 10).toFixed(4)} ${(v2.y * 10).toFixed(4)} ${(v2.z * 10).toFixed(4)}\n`;
      stl += `      vertex ${(v3.x * 10).toFixed(4)} ${(v3.y * 10).toFixed(4)} ${(v3.z * 10).toFixed(4)}\n`;
      stl += `    endloop\n`;
      stl += `  endfacet\n`;
    }
    stl += `endsolid ${modelName.replace(/\s+/g, '_')}\n`;
    return stl;
  };

  // Generate G-Code text file string
  const generateGCode = (modelName: string): string => {
    return `; FORGE AI SLICER - GENERATED FOR ${modelName.toUpperCase()}
; TARGET PRINTER: ${slicerPreset}
; LAYER HEIGHT: ${layerHeight}mm
; INFILL: ${infill}%
; RECOMMENDED MATERIAL: ${telemetry.recommendedMaterial}
; ESTIMATED PRINT TIME: ${telemetry.printTime}

M73 P0 R0
M104 S220 ; Set nozzle temperature
M140 S65 ; Set bed temperature
G28 ; Home all axes
G29 ; Auto bed leveling
M109 S220 ; Wait for nozzle temp
M190 S65 ; Wait for bed temp

; LAYER: 0
G1 Z${layerHeight} F1200
G1 X10.0 Y10.0 E0.5 F1800
G1 X100.0 Y10.0 E5.0 F1800
G1 X100.0 Y100.0 E9.5 F1800
G1 X10.0 Y100.0 E14.0 F1800
G1 X10.0 Y10.0 E18.5 F1800

; FORGE AI POLYGON LOOP START
; Layer height step: ${layerHeight}mm
; Wall thickness: ${telemetry.wallThickness}mm
; Dimensions X:${telemetry.dimensions.x}mm Y:${telemetry.dimensions.y}mm Z:${telemetry.dimensions.z}mm

M106 S255 ; Fan 100%
G1 X50.0 Y50.0 E25.0 F2400

M104 S0 ; Turn off nozzle
M140 S0 ; Turn off bed
M84 ; Disable motors
; FORGE AI G-CODE END
`;
  };

  // Generate OBJ file string
  const generateObj = (geometry: THREE.BufferGeometry, modelName: string): string => {
    const pos = geometry.attributes.position;
    let obj = `# Forge AI 3D OBJ Export - ${modelName}\n`;
    obj += `o ${modelName.replace(/\s+/g, '_')}\n`;

    for (let i = 0; i < pos.count; i++) {
      obj += `v ${(pos.getX(i) * 10).toFixed(4)} ${(pos.getY(i) * 10).toFixed(4)} ${(pos.getZ(i) * 10).toFixed(4)}\n`;
    }

    for (let i = 1; i <= pos.count; i += 3) {
      obj += `f ${i} ${i + 1} ${i + 2}\n`;
    }

    return obj;
  };

  const handleDownloadFile = () => {
    setIsExporting(true);
    setDownloadSuccess(null);

    setTimeout(() => {
      const geometry = generateMeshGeometry();
      const sanitizedName = (telemetry.modelName || 'Forge_Model').replace(/[^a-zA-Z0-9_-]/g, '_');

      let fileContent: string;
      let fileExtension: string;
      let mimeType: string;

      if (selectedFormat === 'STL') {
        fileContent = generateAsciiStl(geometry, sanitizedName);
        fileExtension = 'stl';
        mimeType = 'model/stl';
      } else if (selectedFormat === 'GCODE') {
        fileContent = generateGCode(sanitizedName);
        fileExtension = 'gcode';
        mimeType = 'text/plain';
      } else if (selectedFormat === 'OBJ') {
        fileContent = generateObj(geometry, sanitizedName);
        fileExtension = 'obj';
        mimeType = 'model/obj';
      } else {
        // 3MF fallback container string
        fileContent = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n <metadata name="Title">${sanitizedName}</metadata>\n <metadata name="Application">Forge AI 3D</metadata>\n</model>`;
        fileExtension = '3mf';
        mimeType = 'application/vnd.ms-package.3dmanufacturing-3mf';
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizedName}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setDownloadSuccess(`¡Archivo ${sanitizedName}.${fileExtension} descargado con éxito!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#171f33] border border-[#00e5ff]/40 rounded-2xl p-6 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00e5ff] text-xl">download</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Exportar Modelo 3D / STL</h2>
              <p className="text-xs text-[#bac9cc] font-mono-tech">{telemetry.modelName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2d3449] flex items-center justify-center text-[#bac9cc] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-mono-tech uppercase text-[#bac9cc] font-bold">
            Formato de Exportación
          </label>

          <div className="grid grid-cols-4 gap-2">
            {(['STL', '3MF', 'GCODE', 'OBJ'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`py-3 px-2 rounded-xl text-xs font-mono-tech font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                  selectedFormat === fmt
                    ? 'bg-[#00e5ff] text-[#00363d] border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : 'bg-[#131b2e] text-[#bac9cc] border-white/10 hover:border-[#00e5ff]/40'
                }`}
              >
                <span className="text-sm font-extrabold">{fmt}</span>
                <span className="text-[9px] opacity-80 font-normal">
                  {fmt === 'STL'
                    ? 'Slicer Standard'
                    : fmt === '3MF'
                    ? 'Bambu / Prusa'
                    : fmt === 'GCODE'
                    ? 'Direct Code'
                    : '3D Mesh'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Model Dimensions & Slicer Summary */}
        <section className="bg-[#131b2e] rounded-xl p-4 border border-white/10 font-mono-tech text-xs space-y-2.5">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[#849396]">Dimensiones Reales</span>
            <span className="text-[#cdff13] font-bold">
              {telemetry.dimensions.x.toFixed(1)} x {telemetry.dimensions.y.toFixed(1)} x {telemetry.dimensions.z.toFixed(1)} mm
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[#849396]">Tiempo Estimado Impresión</span>
            <span className="text-[#00e5ff] font-bold">{telemetry.printTime}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#849396]">Material Recomendado</span>
            <span className="text-white font-semibold">{telemetry.recommendedMaterial}</span>
          </div>
        </section>

        {/* Slicer Presets & Options */}
        <div className="space-y-4 font-mono-tech text-xs">
          <div>
            <label className="block text-[#bac9cc] mb-1.5 font-bold">Perfil de Slicer / Impresora Target</label>
            <select
              value={slicerPreset}
              onChange={(e) => setSlicerPreset(e.target.value)}
              className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#00e5ff]"
            >
              <option value="Bambu Studio (Bambu Lab A1)">Bambu Studio (Bambu Lab A1 / A1 Mini)</option>
              <option value="OrcaSlicer (Voron / Bambu / Creality)">OrcaSlicer (Universal Pro)</option>
              <option value="PrusaSlicer (Prusa MK4 / XL)">PrusaSlicer (Prusa i3 / MK4)</option>
              <option value="Ultimaker Cura (Ender 3 / CR-10)">Ultimaker Cura (Creality / Anycubic)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#bac9cc] mb-1.5 font-bold">Altura de Capa (mm)</label>
              <select
                value={layerHeight}
                onChange={(e) => setLayerHeight(parseFloat(e.target.value))}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-2.5 text-white outline-none"
              >
                <option value={0.12}>0.12 mm (Alta Detalle)</option>
                <option value={0.16}>0.16 mm (Óptimo)</option>
                <option value={0.20}>0.20 mm (Estándar)</option>
                <option value={0.28}>0.28 mm (Borrador Rápido)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#bac9cc] mb-1.5 font-bold">Relleno (Infill %)</label>
              <input
                type="number"
                min={5}
                max={100}
                value={infill}
                onChange={(e) => setInfill(parseInt(e.target.value) || 20)}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-2.5 text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Download Alert Banner */}
        {downloadSuccess && (
          <div className="p-3 bg-[#cdff13]/10 border border-[#cdff13]/40 rounded-xl text-xs font-mono-tech text-[#cdff13] flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {downloadSuccess}
          </div>
        )}

        {/* Download Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#2d3449] text-white text-xs font-semibold hover:bg-[#3b494c] transition-colors"
          >
            Cerrar
          </button>

          <button
            onClick={handleDownloadFile}
            disabled={isExporting}
            className="flex-1 py-3 rounded-xl bg-[#cdff13] text-[#283500] text-xs font-bold hover:brightness-110 active:scale-95 transition-all glow-lime flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <span className="w-4 h-4 border-2 border-[#283500] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">download_for_offline</span>
                DESCARGAR {selectedFormat}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

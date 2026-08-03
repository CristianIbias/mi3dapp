import React, { useState } from 'react';
import { PrinterState } from '../types';

interface SettingsModalProps {
  printerState: PrinterState;
  onClose: () => void;
  onUpdateState: (fn: (prev: PrinterState) => PrinterState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  printerState,
  onClose,
  onUpdateState,
}) => {
  const [targetNozzle, setTargetNozzle] = useState<number>(printerState.targetNozzleTemp);
  const [targetBed, setTargetBed] = useState<number>(printerState.targetBedTemp);
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.144');
  const [aiOverwatch, setAiOverwatch] = useState<boolean>(true);

  const handleSave = () => {
    onUpdateState((prev) => ({
      ...prev,
      targetNozzleTemp: targetNozzle,
      targetBedTemp: targetBed,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#171f33] border border-[#00e5ff]/30 rounded-2xl p-6 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00e5ff]">precision_manufacturing</span>
            <h2 className="text-xl font-bold text-white">Configuración de Impresora</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2d3449] flex items-center justify-center text-[#bac9cc] hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* System Architecture Banner Card */}
        <section className="bg-[#131b2e] rounded-xl p-5 border border-[#cdff13]/30 shadow-lg glow-lime">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] text-[#bac9cc] font-mono-tech uppercase tracking-widest mb-1 font-semibold">
                System Architecture
              </p>
              <h3 className="text-lg font-bold text-[#cdff13]">Printer: Online / Healthy</h3>
            </div>
            <div className="w-3.5 h-3.5 bg-[#cdff13] rounded-full shadow-[0_0_12px_#ccff00] animate-pulse"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono-tech">
            <div className="bg-[#060e20]/60 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-[#849396] uppercase font-bold mb-1">Internal Temp</p>
              <p className="text-sm font-bold text-[#9cf0ff]">245.5°C</p>
            </div>
            <div className="bg-[#060e20]/60 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-[#849396] uppercase font-bold mb-1">Fan RPM</p>
              <p className="text-sm font-bold text-[#9cf0ff]">4,200</p>
            </div>
          </div>
        </section>

        {/* Settings Form Controls */}
        <div className="space-y-4 font-mono-tech text-xs">
          <div>
            <label className="block text-[#bac9cc] mb-1.5 font-bold">Dirección IP de la Impresora</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#00e5ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#bac9cc] mb-1.5 font-bold">Temperatura Objetivo Extrusor (°C)</label>
              <input
                type="number"
                value={targetNozzle}
                onChange={(e) => setTargetNozzle(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[#bac9cc] mb-1.5 font-bold">Temperatura Cama Caliente (°C)</label>
              <input
                type="number"
                value={targetBed}
                onChange={(e) => setTargetBed(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#131b2e] rounded-xl border border-white/10">
            <div>
              <p className="text-white font-bold font-sans text-sm">AI Overwatch (Visión por Computadora)</p>
              <p className="text-[10px] text-[#849396]">Detención automática ante "espagueti" o pérdida de adherencia.</p>
            </div>
            <button
              onClick={() => setAiOverwatch(!aiOverwatch)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                aiOverwatch ? 'bg-[#cdff13]' : 'bg-[#3b494c]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#171f33] transition-transform ${
                  aiOverwatch ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#2d3449] text-white text-xs font-semibold hover:bg-[#3b494c]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#00e5ff] text-[#00363d] text-xs font-bold hover:brightness-110 glow-cyan"
          >
            GUARDAR CONFIGURACIÓN
          </button>
        </div>
      </div>
    </div>
  );
};

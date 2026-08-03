import React, { useState, useEffect } from 'react';
import { PrinterState } from '../types';

interface LiveMonitorViewProps {
  printerState: PrinterState;
  onUpdateState: (fn: (prev: PrinterState) => PrinterState) => void;
  onCloseMonitor?: () => void;
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({
  printerState,
  onUpdateState,
  onCloseMonitor,
}) => {
  const [lightOn, setLightOn] = useState<boolean>(printerState.chamberLight);
  const [isPaused, setIsPaused] = useState<boolean>(printerState.status === 'PAUSED');
  const [mcuTempJitter, setMcuTempJitter] = useState<number>(printerState.mcuTemp);
  const [showStopModal, setShowStopModal] = useState<boolean>(false);

  // Temperature jitter simulation for technical realism
  useEffect(() => {
    const interval = setInterval(() => {
      setMcuTempJitter((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Number((prev + delta).toFixed(1));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLight = () => {
    const nextState = !lightOn;
    setLightOn(nextState);
    onUpdateState((prev) => ({ ...prev, chamberLight: nextState }));
  };

  const handleTogglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    onUpdateState((prev) => ({
      ...prev,
      status: nextState ? 'PAUSED' : 'PRINTING',
    }));
  };

  const handleEmergencyStop = () => {
    setShowStopModal(false);
    onUpdateState((prev) => ({
      ...prev,
      status: 'IDLE',
      progressPercentage: 0,
    }));
  };

  const liveCameraImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPNACAhfCP6yB1bzzpjZTdBFP40Oqwg-assVtSYbjniLC6Q3Yh2FUiOprgCrp6coGEQBEvyyTZoCGT66cREsVMnkBe4TY6yv0XEY1hrUnDxWITlFgQsbpsAtB5NjI34ZSmjW4_VI7RKQrWsxHttQq82eSjoOlS93kHD4JGdkZ8xcYSuJczxfDcGDhaXS_MdS1FYMyC1zmYV0-9LLRaKBxtxJFT8JRVufr97H15Nqx3G7R7eAN0BFm-XA';

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Header if subview */}
      {onCloseMonitor && (
        <div className="flex justify-between items-center bg-[#171f33]/60 backdrop-blur-glass p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00e5ff]">videocam</span>
            <span className="font-bold text-sm text-[#c3f5ff]">Cámara de Monitoreo en Vivo</span>
          </div>
          <button
            onClick={onCloseMonitor}
            className="text-xs font-mono-tech text-[#bac9cc] hover:text-[#00e5ff] px-3 py-1 bg-[#222a3d] rounded-lg border border-white/10"
          >
            Volver a 3D
          </button>
        </div>
      )}

      {/* Live Monitor Video Feed Card */}
      <section className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden glass-card shadow-2xl group border border-[#00e5ff]/20">
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${liveCameraImg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326]/90 via-transparent to-[#0b1326]/40 pointer-events-none"></div>

        {/* Overlay: Live Telemetry Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-3 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171f33]/80 backdrop-blur-glass border border-[#00e5ff]/30 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse glow-cyan"></span>
            <span className="font-mono-tech text-xs text-[#00e5ff] uppercase tracking-widest font-semibold">
              Live Feed
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171f33]/80 backdrop-blur-glass border border-white/10 shadow-lg">
            <span className="material-symbols-outlined text-sm text-[#bac9cc]">precision_manufacturing</span>
            <span className="font-mono-tech text-xs text-[#dae2fd]">{printerState.printerName}</span>
          </div>
        </div>

        {/* Overlay: Live Sensor Data & Circular Progress */}
        <div className="absolute bottom-5 left-5 right-5 flex flex-col md:flex-row justify-between items-end md:items-center gap-4 z-10">
          <div className="grid grid-cols-3 gap-6 font-mono-tech">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#bac9cc] uppercase tracking-tighter mb-1">Nozzle</span>
              <span className="text-xl sm:text-2xl font-bold text-[#00e5ff]">{printerState.nozzleTemp}°C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#bac9cc] uppercase tracking-tighter mb-1">Bed</span>
              <span className="text-xl sm:text-2xl font-bold text-[#00e5ff]">{printerState.bedTemp}°C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#bac9cc] uppercase tracking-tighter mb-1">Speed</span>
              <span className="text-xl sm:text-2xl font-bold text-[#00e5ff]">{printerState.speedPercentage}%</span>
            </div>
          </div>

          {/* Progress Ring SVG */}
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 sm:w-24 sm:h-24">
              <circle
                className="text-white/10"
                cx="48"
                cy="48"
                r="38"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="5"
              />
              <circle
                className="text-[#00e5ff] transition-all duration-500"
                cx="48"
                cy="48"
                r="38"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray="238.7"
                strokeDashoffset={238.7 - (238.7 * printerState.progressPercentage) / 100}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono-tech text-base sm:text-lg font-bold text-[#00e5ff]">
                {printerState.progressPercentage}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Pause / Resume Button */}
        <button
          onClick={handleTogglePause}
          className={`flex items-center justify-between p-5 rounded-2xl glass-card transition-all active:scale-95 border-l-4 ${
            isPaused ? 'border-l-amber-400 bg-amber-400/10' : 'border-l-[#cdff13] hover:bg-[#00e5ff]/5'
          }`}
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-xs text-[#bac9cc] uppercase font-mono-tech mb-1">Current State</span>
            <span className="text-xl font-bold text-white">{isPaused ? 'Reanudar' : 'Pause'}</span>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#cdff13]">
            {isPaused ? 'play_circle' : 'pause_circle'}
          </span>
        </button>

        {/* Chamber Light Toggle */}
        <button
          onClick={handleToggleLight}
          className={`flex items-center justify-between p-5 rounded-2xl glass-card transition-all active:scale-95 border ${
            lightOn ? 'border-[#cdff13]/40 bg-[#cdff13]/10' : 'border-white/10 hover:bg-[#00e5ff]/5'
          }`}
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-xs text-[#bac9cc] uppercase font-mono-tech mb-1">Chamber Light</span>
            <span className="text-xl font-bold text-white">{lightOn ? 'Encendida' : 'Apagada'}</span>
          </div>
          <span className={`material-symbols-outlined text-4xl ${lightOn ? 'text-[#cdff13]' : 'text-[#bac9cc]'}`}>
            {lightOn ? 'lightbulb' : 'light_mode'}
          </span>
        </button>

        {/* Emergency Stop Button */}
        <button
          onClick={() => setShowStopModal(true)}
          className="flex items-center justify-between p-5 rounded-2xl glass-card hover:bg-red-500/10 hover:border-red-500/40 transition-all active:scale-95 group border border-red-500/20"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-xs text-red-400 font-bold uppercase font-mono-tech mb-1">Emergency</span>
            <span className="text-xl font-bold text-red-400">Stop</span>
          </div>
          <span className="material-symbols-outlined text-4xl text-red-400 group-hover:scale-110 transition-transform">
            cancel
          </span>
        </button>
      </section>

      {/* Technical Telemetry Bento */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="md:col-span-2 p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-xs font-mono-tech text-[#bac9cc] uppercase tracking-widest flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-base">history</span> Job Details
          </h3>
          <div className="space-y-3 font-mono-tech text-xs">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[#bac9cc]">File Name</span>
              <span className="text-[#00e5ff] font-semibold">{printerState.fileName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[#bac9cc]">Time Remaining</span>
              <span className="text-[#00e5ff] font-semibold">{printerState.timeRemaining}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#bac9cc]">Filament Used</span>
              <span className="text-[#00e5ff] font-semibold">{printerState.filamentUsedGrams}g / PLA</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[#00daf3] text-3xl mb-2">device_thermostat</span>
          <span className="text-xs text-[#bac9cc] font-mono-tech uppercase mb-1">MCU Temp</span>
          <span className="font-mono-tech text-2xl font-bold text-[#00e5ff]">{mcuTempJitter}°C</span>
        </div>

        <div className="p-6 rounded-2xl glass-card flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[#abd600] text-3xl mb-2">air</span>
          <span className="text-xs text-[#bac9cc] font-mono-tech uppercase mb-1">Fan Speed</span>
          <span className="font-mono-tech text-2xl font-bold text-[#00e5ff]">{printerState.fanSpeedPercentage}%</span>
        </div>
      </section>

      {/* Emergency Stop Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#171f33] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <span className="material-symbols-outlined text-5xl text-red-500 animate-bounce">warning</span>
            <h3 className="text-xl font-bold text-white">¿Detener Impresión?</h3>
            <p className="text-xs text-[#bac9cc]">
              Esta acción abortará la impresión de forma inmediata y enfriará la boquilla para evitar atascos.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowStopModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2d3449] text-white text-xs font-semibold hover:bg-[#3b494c]"
              >
                Cancelar
              </button>
              <button
                onClick={handleEmergencyStop}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 glow-cyan"
              >
                CONFIRMAR PARADA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

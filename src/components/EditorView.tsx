import React, { useState } from 'react';
import { ModelTelemetry } from '../types';
import { ThreeCanvas } from './ThreeCanvas';

interface EditorViewProps {
  telemetry: ModelTelemetry;
  onUpdateTelemetry: (updated: Partial<ModelTelemetry>) => void;
  onExecuteEdit: (instruction: string) => Promise<void>;
}

export const EditorView: React.FC<EditorViewProps> = ({
  telemetry,
  onUpdateTelemetry,
  onExecuteEdit,
}) => {
  const [scaleValue, setScaleValue] = useState<number>(telemetry.scale || 1.2);
  const [aiInstruction, setAiInstruction] = useState<string>('Aumenta el grosor de las paredes en 2mm');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeModuleModal, setActiveModuleModal] = useState<string | null>(null);

  const handleScaleChange = (val: number) => {
    setScaleValue(val);
    onUpdateTelemetry({
      scale: val,
      dimensions: {
        x: Number((telemetry.dimensions.x * (val / (telemetry.scale || 1.2))).toFixed(2)),
        y: Number((telemetry.dimensions.y * (val / (telemetry.scale || 1.2))).toFixed(2)),
        z: Number((telemetry.dimensions.z * (val / (telemetry.scale || 1.2))).toFixed(2)),
      },
    });
  };

  const handleRunEdit = async () => {
    if (!aiInstruction.trim() || isExecuting) return;
    setIsExecuting(true);
    try {
      await onExecuteEdit(aiInstruction);
    } finally {
      setIsExecuting(false);
    }
  };

  const configurationModules = [
    {
      id: 'vibration',
      title: 'Vibration Compensation',
      desc: 'Calibrate ADXL345 resonance sensors',
      icon: 'vibration',
    },
    {
      id: 'flow',
      title: 'Flow Rate Calibration',
      desc: 'Extrusion multiplier & volumetric speed',
      icon: 'water_drop',
    },
    {
      id: 'network',
      title: 'Network Status',
      desc: 'IP: 192.168.1.144 | Signal: 98%',
      badge: '5GHz',
      icon: 'router',
    },
    {
      id: 'maintenance',
      title: 'Maintenance Log',
      desc: 'Bearing lubrication due in 48h',
      icon: 'history_edu',
    },
  ];

  return (
    <main className="relative w-full min-h-screen pt-20 pb-32 px-6 max-w-5xl mx-auto space-y-8">
      {/* 3D Visualizer & Measurement Hero Container */}
      <section className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden glass-card border border-[#00e5ff]/20 shadow-2xl">
        <ThreeCanvas telemetry={telemetry} showStatusOverlay={false} />

        {/* Top Right: Real-time Dimensions Floating Panel */}
        <div className="absolute top-4 right-4 z-20 w-64 sm:w-72 pointer-events-auto">
          <div className="glass-panel p-4 rounded-xl backdrop-blur-glass border border-[#3b494c]/40 shadow-xl">
            <h3 className="text-[10px] text-[#00e5ff] font-mono-tech uppercase tracking-widest font-semibold mb-3">
              Dimensiones en tiempo real
            </h3>
            <div className="grid grid-cols-1 gap-1.5 font-mono-tech text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#bac9cc]">Alto (Z)</span>
                <span className="text-[#cdff13] font-bold">{telemetry.dimensions.z.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#bac9cc]">Ancho (X)</span>
                <span className="text-[#cdff13] font-bold">{telemetry.dimensions.x.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[#bac9cc]">Prof. (Y)</span>
                <span className="text-[#cdff13] font-bold">{telemetry.dimensions.y.toFixed(2)} mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Left: Geometry Analysis Progress */}
        <div className="absolute top-4 left-4 z-20 w-60 sm:w-64 pointer-events-auto">
          <div className="glass-panel p-3.5 rounded-xl backdrop-blur-glass border border-[#3b494c]/40 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] glow-cyan animate-pulse"></span>
              <span className="text-xs text-[#dae2fd] font-medium">Analizando geometría...</span>
            </div>
            <div className="h-1.5 bg-[#2d3449] rounded-full overflow-hidden">
              <div className="h-full bg-[#00e5ff] w-3/4 shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls & AI Technical Input Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Left: Object Scaling Slider */}
        <div className="glass-panel p-5 rounded-xl backdrop-blur-glass border border-[#3b494c]/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-[#dae2fd] font-medium">Escalar Objeto</span>
            <span className="font-mono-tech text-sm text-[#cdff13] font-bold">{scaleValue.toFixed(1)}x</span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={scaleValue}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#2d3449] rounded-lg appearance-none cursor-pointer accent-[#cdff13] mb-3"
          />

          <div className="flex justify-between text-[10px] text-[#849396] font-mono-tech">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Right: AI Technical Command Prompt Input */}
        <div className="md:col-span-2 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00e5ff]/30 to-[#cdff13]/30 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>

          <div className="relative flex items-center bg-[#131b2e]/90 backdrop-blur-glass rounded-xl border border-[#3b494c]/40 overflow-hidden shadow-2xl p-1.5">
            <div className="pl-3.5 text-[#00e5ff]">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>

            <input
              type="text"
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder="Ej: Aumenta el grosor de las paredes en 2mm"
              className="w-full bg-transparent border-none focus:ring-0 text-[#dae2fd] py-3.5 px-3 font-body-md text-sm sm:text-base placeholder:text-[#849396] outline-none"
            />

            <button
              onClick={handleRunEdit}
              disabled={isExecuting}
              className="bg-[#cdff13] text-[#283500] px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              {isExecuting ? (
                <span className="w-4 h-4 border-2 border-[#283500] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'EJECUTAR'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Printer Configuration Modules */}
      <section className="space-y-4 pt-4">
        <p className="text-xs font-mono-tech text-[#bac9cc] uppercase tracking-widest px-1 font-semibold">
          Configuration Modules
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {configurationModules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => setActiveModuleModal(mod.title)}
              className="group cursor-pointer bg-[#222a3d]/40 hover:bg-[#222a3d]/70 backdrop-blur-glass p-4 rounded-xl border border-white/10 flex items-center justify-between transition-all active:scale-[0.98] shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center group-hover:bg-[#00e5ff]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#00e5ff] text-2xl">{mod.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-[#dae2fd]">{mod.title}</h3>
                    {mod.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#cdff13]/20 text-[#cdff13] font-mono-tech font-bold">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#bac9cc] mt-0.5">{mod.desc}</p>
                </div>
              </div>

              <span className="material-symbols-outlined text-[#bac9cc] group-hover:text-[#00e5ff] transition-colors">
                chevron_right
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Telemetry Feed Bento */}
      <section className="p-6 rounded-2xl bg-[#2d3449]/20 border border-[#3b494c]/20 shadow-xl space-y-4">
        <h4 className="text-xs font-mono-tech text-[#bac9cc] uppercase tracking-widest flex items-center gap-2 font-semibold">
          <span className="material-symbols-outlined text-base">analytics</span>
          Real-Time Precision Feed
        </h4>

        <div className="space-y-3 font-mono-tech text-xs text-[#bac9cc]">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>X-AXIS RMS</span>
            <span className="text-[#9cf0ff] font-semibold">0.0024 mm</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Y-AXIS RMS</span>
            <span className="text-[#9cf0ff] font-semibold">0.0031 mm</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>NOZZLE PRESSURE</span>
            <span className="text-[#cdff13] font-bold">STABLE</span>
          </div>
          <div className="flex justify-between">
            <span>AI OVERWATCH</span>
            <span className="text-[#cdff13] font-bold">ACTIVE</span>
          </div>
        </div>
      </section>

      {/* Module Click Feedback Modal */}
      {activeModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#171f33] border border-[#00e5ff]/40 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <span className="material-symbols-outlined text-4xl text-[#00e5ff]">settings_suggest</span>
            <h3 className="text-lg font-bold text-white">{activeModuleModal}</h3>
            <p className="text-xs text-[#bac9cc]">
              Módulo de calibración en ejecución automática por Forge AI. Sensores sincronizados correctamente.
            </p>
            <button
              onClick={() => setActiveModuleModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#cdff13] text-[#283500] text-xs font-bold hover:brightness-110"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

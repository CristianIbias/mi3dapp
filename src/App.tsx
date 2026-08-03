import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ThreeCanvas } from './components/ThreeCanvas';
import { LiveMonitorView } from './components/LiveMonitorView';
import { EditorView } from './components/EditorView';
import { FilesAMSView } from './components/FilesAMSView';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { ModelTelemetry, PrinterState, TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [viewSubMode, setViewSubMode] = useState<'3d' | 'camera'>('3d');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Printer State
  const [printerState, setPrinterState] = useState<PrinterState>({
    status: 'PRINTING',
    printerName: 'Bambu Lab A1',
    nozzleTemp: 210,
    targetNozzleTemp: 220,
    bedTemp: 65,
    targetBedTemp: 65,
    speedPercentage: 100,
    progressPercentage: 64,
    timeRemaining: '01:14:22',
    fileName: 'Voron_Cube_V2.gcode',
    filamentUsedGrams: 42.5,
    mcuTemp: 41.0,
    fanSpeedPercentage: 80,
    chamberLight: true,
    amsHumidity: 'Level 1 - Optimal',
    storageTemp: 22.4,
  });

  // Current Active 3D Model Telemetry
  const [currentModel, setCurrentModel] = useState<ModelTelemetry>({
    modelName: 'Pieza de prueba Forge',
    dimensions: {
      x: 142.04,
      y: 89.12,
      z: 210.55,
    },
    wallThickness: 2.0,
    infill: 20,
    recommendedMaterial: 'PLA Basic (Jade White)',
    printTime: '01:24:00',
    layerHeight: 0.2,
    shapeType: 'vase',
    summary: 'Modelo generado exitosamente por Forge AI',
    wireframe: false,
    scale: 1.2,
  });

  // Call Express backend Gemini prompt API
  const handleSelectPrompt = async (promptText: string, imageBase64?: string) => {
    try {
      const res = await fetch('/api/forge/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, imageBase64 }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentModel((prev) => ({
          ...prev,
          modelName: data.modelName || promptText || 'Modelo 3D de Foto',
          dimensions: data.dimensions || prev.dimensions,
          wallThickness: data.wallThickness || prev.wallThickness,
          infill: data.infill || prev.infill,
          recommendedMaterial: data.recommendedMaterial || prev.recommendedMaterial,
          printTime: data.printTime || prev.printTime,
          shapeType: data.shapeType || 'vase',
          summary: data.summary || `Modelo listo para vista 3D.`,
        }));
      }
    } catch (err) {
      console.error('Error fetching prompt telemetry:', err);
    }
  };

  // Call Express backend Gemini edit API
  const handleExecuteEditInstruction = async (instruction: string) => {
    try {
      const res = await fetch('/api/forge/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editInstruction: instruction,
          currentModel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentModel((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (err) {
      console.error('Error executing edit instruction:', err);
    }
  };

  const handleStartPrint = () => {
    setPrinterState((prev) => ({
      ...prev,
      status: 'PRINTING',
      progressPercentage: 1,
      fileName: `${currentModel.modelName.replace(/\s+/g, '_')}.gcode`,
      timeRemaining: currentModel.printTime,
    }));
    setActiveTab('view');
    setViewSubMode('camera');
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] min-h-screen font-sans selection:bg-[#00e5ff]/20 selection:text-[#00e5ff] overflow-x-hidden">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content View Container based on Active Tab */}
      {activeTab === 'home' && (
        <HomeView
          printerState={printerState}
          onSelectPrompt={handleSelectPrompt}
          onNavigateTab={setActiveTab}
          onLoadPredefinedModel={(partialModel) => {
            setCurrentModel((prev) => ({ ...prev, ...partialModel }));
          }}
        />
      )}

      {activeTab === 'view' && (
        <main className="relative w-full min-h-screen pt-16 pb-24 overflow-hidden flex flex-col">
          {/* Submode Switcher: 3D Visualizer vs Live Camera Feed */}
          <div className="pt-3 px-6 max-w-5xl mx-auto w-full flex justify-center z-30">
            <div className="bg-[#171f33]/90 backdrop-blur-glass p-1 rounded-full border border-white/10 flex items-center gap-1 shadow-xl">
              <button
                onClick={() => setViewSubMode('3d')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewSubMode === '3d'
                    ? 'bg-[#00e5ff] text-[#00363d] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'text-[#bac9cc] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">view_in_ar</span>
                Visor 3D
              </button>

              <button
                onClick={() => setViewSubMode('camera')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewSubMode === 'camera'
                    ? 'bg-[#00e5ff] text-[#00363d] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'text-[#bac9cc] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">videocam</span>
                Cámara en Vivo
              </button>
            </div>
          </div>

          {viewSubMode === '3d' ? (
            <div className="relative w-full h-[calc(100vh-140px)] flex-1">
              <ThreeCanvas
                telemetry={currentModel}
                onPrintClick={handleStartPrint}
                onExportClick={() => setIsExportOpen(true)}
                showStatusOverlay={true}
              />
            </div>
          ) : (
            <div className="px-6 max-w-5xl mx-auto w-full pt-4">
              <LiveMonitorView
                printerState={printerState}
                onUpdateState={setPrinterState}
                onCloseMonitor={() => setViewSubMode('3d')}
              />
            </div>
          )}
        </main>
      )}

      {activeTab === 'edit' && (
        <EditorView
          telemetry={currentModel}
          onUpdateTelemetry={(updated) => setCurrentModel((prev) => ({ ...prev, ...updated }))}
          onExecuteEdit={handleExecuteEditInstruction}
        />
      )}

      {activeTab === 'files' && <FilesAMSView />}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          printerState={printerState}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateState={setPrinterState}
        />
      )}

      {/* Export STL Modal */}
      {isExportOpen && (
        <ExportModal
          telemetry={currentModel}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

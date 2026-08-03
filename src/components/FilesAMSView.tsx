import React, { useState } from 'react';
import { AMSSlot, FilamentItem } from '../types';

export const FilesAMSView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [amsSlots, setAmsSlots] = useState<AMSSlot[]>([
    {
      id: 1,
      slotName: 'SLOT 01',
      material: 'PLA Basic',
      colorName: 'Jade White',
      colorHex: '#ffffff',
      remainingPercentage: 82,
      status: 'READY',
      isActive: true,
    },
    {
      id: 2,
      slotName: 'SLOT 02',
      material: 'PETG Trans.',
      colorName: 'Deep Blue',
      colorHex: '#00e5ff',
      remainingPercentage: 45,
      status: 'IDLE',
    },
    {
      id: 3,
      slotName: 'SLOT 03',
      material: 'PLA Matte',
      colorName: 'Forge Neon',
      colorHex: '#cdff13',
      remainingPercentage: 91,
      status: 'IDLE',
    },
    {
      id: 4,
      slotName: 'SLOT 04',
      material: 'Vacío',
      colorName: 'Añadir carrete',
      colorHex: 'transparent',
      remainingPercentage: 0,
      status: 'EMPTY',
    },
  ]);

  const [materials, setMaterials] = useState<FilamentItem[]>([
    {
      id: 'f1',
      name: 'PLA Basic Jade White',
      type: 'PLA',
      colorHex: '#ffffff',
      ref: 'PL-BS-JW',
      remainingGrams: 820,
      totalGrams: 1000,
    },
    {
      id: 'f2',
      name: 'PETG Translucent Blue',
      type: 'PETG',
      colorHex: '#00e5ff',
      ref: 'PT-TR-BL',
      remainingGrams: 450,
      totalGrams: 1000,
    },
    {
      id: 'f3',
      name: 'PLA Matte Charcoal',
      type: 'PLA',
      colorHex: '#333333',
      ref: 'PL-MA-CH',
      remainingGrams: 120,
      totalGrams: 1000,
      isLowStock: true,
    },
    {
      id: 'f4',
      name: 'PLA Basic Neon Green',
      type: 'PLA',
      colorHex: '#cdff13',
      ref: 'PL-BS-NG',
      remainingGrams: 950,
      totalGrams: 1000,
    },
  ]);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'ALL' || m.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAddNewFilament = () => {
    const newMaterial: FilamentItem = {
      id: `f${Date.now()}`,
      name: 'TPU 95A Flexible Orange',
      type: 'TPU',
      colorHex: '#ff9800',
      ref: 'TP-FL-OR',
      remainingGrams: 1000,
      totalGrams: 1000,
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    setShowAddModal(false);
  };

  return (
    <main className="pt-20 pb-32 px-6 max-w-5xl mx-auto space-y-8">
      {/* AMS Lite System Header */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#c3f5ff] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00e5ff]">account_tree</span>
            AMS Lite
          </h2>

          <span className="px-3 py-1 bg-[#00e5ff]/10 text-[#00daf3] rounded-full text-xs font-mono-tech font-bold tracking-wider flex items-center gap-2 border border-[#00e5ff]/30">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
            SYNCED
          </span>
        </div>

        {/* AMS 4-Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {amsSlots.map((slot) => {
            if (slot.status === 'EMPTY') {
              return (
                <div
                  key={slot.id}
                  onClick={() => setShowAddModal(true)}
                  className="border-2 border-dashed border-[#3b494c]/50 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-[#00e5ff]/60 transition-colors group bg-[#131b2e]/30"
                >
                  <span className="material-symbols-outlined text-[#849396] group-hover:text-[#00e5ff] text-3xl">
                    add_circle
                  </span>
                  <p className="text-xs text-[#849396] font-bold font-mono-tech">EMPTY SLOT</p>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className={`relative filament-card-gradient p-4 rounded-xl border transition-all ${
                  slot.isActive
                    ? 'border-[#00e5ff]/50 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                    : 'border-white/5 opacity-85'
                }`}
              >
                <div className="absolute top-3 right-3 flex items-center gap-1 font-mono-tech">
                  <span className={`text-[10px] font-bold ${slot.isActive ? 'text-[#00e5ff]' : 'text-[#849396]'}`}>
                    {slot.slotName}
                  </span>
                  {slot.isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] glow-cyan"></div>}
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-[#2d3449] shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full" style={{ backgroundColor: slot.colorHex }}></div>
                  </div>

                  <div>
                    <p className="font-bold text-sm text-[#dae2fd] truncate">{slot.material}</p>
                    <p className="text-xs text-[#bac9cc]">{slot.colorName}</p>
                  </div>

                  <div className="space-y-1 font-mono-tech">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#849396]">{slot.status}</span>
                      <span className={slot.isActive ? 'text-[#00e5ff]' : 'text-[#dae2fd]'}>
                        {slot.remainingPercentage}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-[#2d3449] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${slot.isActive ? 'bg-[#00e5ff]' : 'bg-[#bec6e0]'}`}
                        style={{ width: `${slot.remainingPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filament Materials Library */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Inventario de Filamentos</h2>

          <div className="flex items-center gap-2">
            <div className="relative flex-grow sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bac9cc] text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar materiales..."
                className="w-full bg-[#131b2e] border-b-2 border-[#3b494c] focus:border-[#00e5ff] outline-none py-2 pl-9 pr-3 text-sm text-[#dae2fd] transition-all"
              />
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-[#222a3d] border border-white/10 rounded-lg py-2 px-3 text-xs text-[#dae2fd] outline-none"
            >
              <option value="ALL">Todos</option>
              <option value="PLA">PLA</option>
              <option value="PETG">PETG</option>
              <option value="TPU">TPU</option>
            </select>
          </div>
        </div>

        {/* Material Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => {
            const percentage = Math.round((mat.remainingGrams / mat.totalGrams) * 100);

            return (
              <div
                key={mat.id}
                className="filament-card-gradient rounded-xl border border-white/10 overflow-hidden flex hover:border-[#00e5ff]/30 transition-all group shadow-lg"
              >
                <div className="w-24 sm:w-28 h-full relative overflow-hidden bg-[#060e20] flex items-center justify-center p-3">
                  <div className="w-16 h-16 rounded-full border-4 border-[#2d3449] flex items-center justify-center shadow-2xl relative z-10" style={{ backgroundColor: mat.colorHex }}>
                    <div className="w-4 h-4 rounded-full bg-[#060e20]"></div>
                  </div>
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-[#2d3449]/60 rounded text-[10px] font-mono-tech font-bold text-[#bac9cc] uppercase">
                        {mat.type}
                      </span>
                      <span className="material-symbols-outlined text-sm text-[#bac9cc]">more_vert</span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-white mt-1 line-clamp-1">{mat.name}</h3>
                    <p className="text-xs font-mono-tech text-[#849396]">Ref: {mat.ref}</p>
                  </div>

                  <div className="mt-4 flex items-end justify-between font-mono-tech">
                    <div>
                      <p className={`text-lg font-bold ${mat.isLowStock ? 'text-red-400' : 'text-[#00e5ff]'}`}>
                        {mat.remainingGrams}g
                      </p>
                      <p className={`text-[10px] uppercase font-semibold ${mat.isLowStock ? 'text-red-400' : 'text-[#849396]'}`}>
                        {mat.isLowStock ? 'LOW STOCK' : 'Restante'}
                      </p>
                    </div>

                    <div className="w-16 sm:w-20">
                      <div className="h-1.5 w-full bg-[#2d3449] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${mat.isLowStock ? 'bg-red-500' : 'bg-[#00e5ff]'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Material Card */}
          <div
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-[#3b494c]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/5 transition-all cursor-pointer group bg-[#131b2e]/20"
          >
            <div className="w-12 h-12 rounded-full bg-[#222a3d] flex items-center justify-center group-hover:bg-[#00e5ff] group-hover:text-[#00363d] transition-colors">
              <span className="material-symbols-outlined text-xl">add</span>
            </div>
            <p className="font-bold text-sm text-white">Añadir Nuevo Material</p>
            <p className="text-xs text-[#849396]">Escanear QR o entrada manual</p>
          </div>
        </div>
      </section>

      {/* Analytics & Maintenance Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="md:col-span-2 filament-card-gradient p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xs text-[#bac9cc] font-mono-tech uppercase tracking-widest font-bold mb-3">
              Eficiencia de Materiales
            </h3>
            <div className="flex items-end gap-3 mb-2 font-mono-tech">
              <span className="text-3xl sm:text-4xl font-bold text-white">94.2%</span>
              <span className="text-[#cdff13] text-sm font-bold flex items-center mb-1">
                <span className="material-symbols-outlined text-base">trending_up</span>
                +2.1%
              </span>
            </div>
            <p className="text-xs text-[#bac9cc]">
              Residuo reducido mediante transiciones AMS optimizadas en los últimos 30 días.
            </p>
          </div>

          <div className="flex gap-1.5 h-12 items-end mt-6">
            <div className="flex-1 bg-[#00e5ff]/20 h-[40%] rounded-t"></div>
            <div className="flex-1 bg-[#00e5ff]/20 h-[60%] rounded-t"></div>
            <div className="flex-1 bg-[#00e5ff]/40 h-[50%] rounded-t"></div>
            <div className="flex-1 bg-[#00e5ff] h-[80%] rounded-t glow-cyan"></div>
            <div className="flex-1 bg-[#00e5ff]/30 h-[45%] rounded-t"></div>
            <div className="flex-1 bg-[#00e5ff]/20 h-[70%] rounded-t"></div>
            <div className="flex-1 bg-[#00e5ff] h-[95%] rounded-t glow-cyan"></div>
          </div>
        </div>

        <div className="filament-card-gradient p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-xs text-[#bac9cc] font-mono-tech uppercase tracking-widest font-bold">
            Mantenimiento
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#171f33] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00e5ff]">humidity_mid</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Humedad AMS</p>
                <p className="text-xs text-[#bac9cc]">Nivel 1 - Óptimo (&lt;10%)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#171f33] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#cdff13]">device_thermostat</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Temp. Almacenamiento</p>
                <p className="text-xs text-[#bac9cc]">22.4°C - Estable</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button: QR Code Scanner */}
      <button
        onClick={() => setShowQRScanner(true)}
        className="fixed right-6 bottom-24 w-14 h-14 bg-[#cdff13] text-[#283500] rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all glow-lime z-40 hover:scale-105"
        title="Escanear Código QR de Filamento"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          qr_code_scanner
        </span>
      </button>

      {/* QR Scanner Simulation Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#171f33] border border-[#00e5ff]/40 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="relative w-48 h-48 mx-auto border-2 border-[#00e5ff] rounded-xl overflow-hidden flex items-center justify-center bg-black/50">
              <div className="scanline" />
              <span className="material-symbols-outlined text-6xl text-[#00e5ff]/40">qr_code_2</span>
            </div>
            <p className="text-sm font-bold text-white">Apunta al código QR del carrete Bambu Lab</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQRScanner(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2d3449] text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowQRScanner(false);
                  handleAddNewFilament();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#cdff13] text-[#283500] text-xs font-bold"
              >
                SIMULAR ESCANEO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Filament Manual Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#171f33] border border-[#00e5ff]/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00e5ff]">add_box</span>
              Añadir Carrete de Filamento
            </h3>
            <p className="text-xs text-[#bac9cc]">
              Registra un nuevo material en tu inventario para sincronizar con AMS Lite.
            </p>

            <div className="space-y-3 font-mono-tech text-xs">
              <div>
                <label className="block text-[#bac9cc] mb-1">Nombre Material</label>
                <input
                  type="text"
                  defaultValue="Bambu TPU 95A Flexible Orange"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-[#00e5ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#bac9cc] mb-1">Tipo</label>
                  <select className="w-full bg-[#131b2e] border border-white/10 rounded-lg p-2.5 text-white outline-none">
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="TPU">TPU</option>
                    <option value="ABS">ABS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#bac9cc] mb-1">Peso (Gramos)</label>
                  <input
                    type="number"
                    defaultValue={1000}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-lg p-2.5 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2d3449] text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNewFilament}
                className="flex-1 py-2.5 rounded-xl bg-[#cdff13] text-[#283500] text-xs font-bold"
              >
                REGISTRAR MATERIAL
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

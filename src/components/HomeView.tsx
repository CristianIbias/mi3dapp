import React, { useState, useRef } from 'react';
import { ModelTelemetry, PrinterState, TabType } from '../types';

interface HomeViewProps {
  printerState: PrinterState;
  onSelectPrompt: (promptText: string, imageBase64?: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onLoadPredefinedModel: (telemetry: Partial<ModelTelemetry>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  printerState,
  onSelectPrompt,
  onNavigateTab,
  onLoadPredefinedModel,
}) => {
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const promptSuggestions = [
    { label: 'Soporte para cables', icon: 'electrical_services', shape: 'bracket' },
    { label: 'Maceta geométrica', icon: 'pentagon', shape: 'vase' },
    { label: 'Engranaje helicoidal', icon: 'precision_manufacturing', shape: 'gear' },
    { label: 'Adaptador GoPro', icon: 'settings_input_component', shape: 'drone' },
  ];

  const recentCreations = [
    {
      id: '1',
      title: 'Maceta Voronoi v2',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5j3aDi5LL7pjNQCLHhH109irxPpLDLdFOV9SoNSf7mFjgfYo8yLgFAdlMY7JhU56cnHUDIXRIoeCHp0c70NHjErAXnMpRZQyYQk80Q47cE4AXT3bD7ph4wYW9Xks154UjqGS-KCmk612pLgJaEqLMXfVwws2q66qIt5rA1NFg4G6_c-IH4j6KjVqMDVvqGniH3qoVABAss-KFHAXizazrCFndDtzNpCBg3-MeWEeeticiPkdJrKf6rA',
      shapeType: 'vase' as const,
      dims: { x: 120, y: 120, z: 160 },
    },
    {
      id: '2',
      title: 'Gear Assembly Kit',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsJh-o0eP97FvPAIEc6GXkTRmIfqWC5BoAQKFIi413fWXGqrro0toCPJ7T15HWIKluW6j5K4owvJI8sIxv6XJranKVQwhhhc543IU5SdE9wbEGKNQvlOW4qrGG_1m7OEKsCFRZ4rvNsQoCLrtSm2RU8MHv7ETpDS7xB3QiaOC07jfJhV_g-nDa5huhPEFnXXg8Iq5pFlSZlnkEm0UZdWwgrsnBELl8PTMiis8vsaMHdi7d5BeREDi3UQ',
      shapeType: 'gear' as const,
      dims: { x: 95, y: 95, z: 25 },
    },
    {
      id: '3',
      title: 'Art Piece #04',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIUs5MJy7kE1ptwQpwDWFiCfFuPNlD9XD4F5efe0BrgCnm1B-diselRJrnm3w5TzBLGJc-UYqNwGgHTHY5SlFVN54OyP2dwpmY3aXa2tyngmYUKeEaJQVtIOCy18IcZXGSC4xZhImnBdP-hyujSD4tkmWvtsTeXHHL_4WdBumYTeQrFDbDLzstFPqD8ewRm4_AHMazlgm6EZYYjkD13UfT-KtretcR8oRikRG4Xo2JHRPnIcwrDJN5g',
      shapeType: 'torus' as const,
      dims: { x: 110, y: 110, z: 140 },
    },
    {
      id: '4',
      title: 'Drone Frame X1',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdQCLGGF6EJJUoGeaHfXDPB00NUfQTkm8llHO51zoeil6ocrdMyPd-V26anX4E-b4XGAn2UK-N_KsC3pnebAJdpaYw-225wpIQfN0pjOivgG_D3WVsU6AKxxuQB9Mm8eggu1vsxvOE2-gYH_ZLEBWacczzYY5AGq9Qp_00ZdAhqb2Jvy_5EreEgT2Fz-kPSCE8dL99trviqX7GWhJmzcMKW4pjezl-VIQ2KrXSPcJ3YQt_F7iYbH3HBA',
      shapeType: 'drone' as const,
      dims: { x: 180, y: 180, z: 45 },
    },
  ];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setAttachedImage(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() && !attachedImage) return;

    setIsLoading(true);
    onSelectPrompt(inputPrompt, attachedImage || undefined);
    setTimeout(() => {
      setIsLoading(false);
      onNavigateTab('view');
    }, 800);
  };

  const handleChipClick = (label: string) => {
    setInputPrompt(label);
    setIsLoading(true);
    onSelectPrompt(label);
    setTimeout(() => {
      setIsLoading(false);
      onNavigateTab('view');
    }, 600);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech recognition
      setTimeout(() => {
        setInputPrompt('Maceta geométrica con acabado Voronoi');
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <main className="pt-20 pb-32 px-6 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Neural Engine Header Badge */}
      <section className="flex flex-col items-center text-center pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#222a3d] border border-[#00e5ff]/20 mb-6 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
          <span className="font-mono-tech text-xs text-[#00e5ff] uppercase tracking-widest font-semibold">
            Neural Engine Online
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-8 max-w-2xl glow-text leading-tight tracking-tight">
          ¿Qué quieres imprimir hoy?
        </h2>

        {/* Input Prompt Box & Image Attachment */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00e5ff] to-[#cdff13] rounded-2xl blur opacity-25 group-focus-within:opacity-60 transition duration-500 pointer-events-none"></div>

          <div className="relative bg-[#171f33]/90 backdrop-blur-glass border border-[#3b494c]/40 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-2xl">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl sm:text-3xl pl-1 sm:pl-2">
              auto_awesome
            </span>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={attachedImage ? "Añade detalles o deja en blanco..." : "Describe tu idea o sube una foto de objeto..."}
              className="bg-transparent border-none focus:ring-0 text-base sm:text-xl text-[#dae2fd] placeholder:text-[#849396] w-full font-light outline-none"
            />

            {/* Attach Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center flex-shrink-0 ${
                attachedImage
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/50'
                  : 'bg-[#222a3d] text-[#bac9cc] hover:text-white border-white/10 hover:border-[#00e5ff]/40'
              }`}
              title="Adjuntar foto de objeto 3D"
            >
              <span className="material-symbols-outlined text-xl">add_a_photo</span>
            </button>

            {isLoading ? (
              <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-[#222a3d] text-[#bac9cc] hover:text-[#cdff13] hover:bg-[#2d3449] border border-white/10'
                  }`}
                  title={isRecording ? 'Escuchando...' : 'Dictar por voz'}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isRecording ? 'graphic_eq' : 'mic'}
                  </span>
                </button>

                <button
                  type="submit"
                  className="w-11 h-11 sm:w-12 sm:h-12 bg-[#cdff13] text-[#283500] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 glow-lime transition-all"
                  title="Generar Modelo 3D"
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl font-bold">arrow_forward</span>
                </button>
              </div>
            )}
          </div>

          {/* Attached Image Preview Chip */}
          {attachedImage && (
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-[#131b2e] border border-[#00e5ff]/40 text-xs font-mono-tech shadow-xl animate-fade-in">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#00e5ff]/40 flex-shrink-0 relative">
                  <img src={attachedImage} alt="Uploaded 3D target" className="w-full h-full object-cover" />
                  {isLoading && <div className="scanline" />}
                </div>
                <div className="truncate">
                  <p className="text-white font-bold truncate">{imageName || 'Foto adjunta'}</p>
                  <p className="text-[10px] text-[#00e5ff]">
                    {isLoading ? 'Escaneando geometría...' : 'Listo para reconstrucción 3D'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-7 h-7 rounded-full bg-[#222a3d] flex items-center justify-center text-[#bac9cc] hover:text-white flex-shrink-0"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Suggestion Chips */}
      <section className="flex flex-col items-center">
        <h3 className="text-xs text-[#849396] uppercase tracking-widest mb-4 font-mono-tech">
          Inspiración técnica
        </h3>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {promptSuggestions.map((item) => (
            <button
              key={item.label}
              onClick={() => handleChipClick(item.label)}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#131b2e] border border-[#3b494c]/40 text-[#bac9cc] hover:text-[#c3f5ff] hover:bg-[#222a3d] hover:border-[#00e5ff]/50 transition-all flex items-center gap-2 group text-xs sm:text-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-base sm:text-lg group-hover:text-[#00e5ff]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Bento Grid: Telemetry & Active Status */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Active Print Status */}
        <div className="md:col-span-2 bg-[#171f33]/60 backdrop-blur-glass rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-xl">
          <div className="scanline"></div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h4 className="text-xs text-[#00e5ff] font-mono-tech uppercase tracking-wider mb-1 font-semibold">
                Estado de Impresora
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-white">{printerState.printerName}</p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-[#00e5ff]/20 text-[#00daf3] font-mono-tech text-xs font-bold flex items-center gap-2 border border-[#00e5ff]/30">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping"></span>
              {printerState.status}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 relative z-10 font-mono-tech">
            <div className="flex flex-col">
              <span className="text-[#849396] text-xs uppercase font-semibold mb-1">Nozzle Temp</span>
              <span className="text-lg sm:text-xl font-bold text-white">{printerState.nozzleTemp}°C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#849396] text-xs uppercase font-semibold mb-1">Heatbed</span>
              <span className="text-lg sm:text-xl font-bold text-white">{printerState.bedTemp}°C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#849396] text-xs uppercase font-semibold mb-1">Progress</span>
              <span className="text-lg sm:text-xl font-bold text-[#00e5ff]">
                {printerState.progressPercentage}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#849396] text-xs uppercase font-semibold mb-1">Remaining</span>
              <span className="text-lg sm:text-xl font-bold text-white">{printerState.timeRemaining}</span>
            </div>
          </div>

          <div className="mt-6 h-2.5 bg-[#2d3449] rounded-full overflow-hidden relative z-10">
            <div
              className="h-full bg-gradient-to-r from-[#00e5ff] to-[#cdff13] shadow-[0_0_12px_rgba(0,229,255,0.6)] transition-all duration-500 rounded-full"
              style={{ width: `${printerState.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Material AMS Quick Card */}
        <div className="bg-[#171f33]/60 backdrop-blur-glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <h4 className="text-xs text-[#cdff13] font-mono-tech uppercase tracking-wider mb-4 font-semibold">
              AMS Slot 1 (Active)
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#cdff13] flex items-center justify-center p-1 shadow-inner bg-[#ffffff]">
                <div className="w-full h-full rounded-full bg-[#f5f5f5]"></div>
              </div>
              <div>
                <p className="text-white font-bold text-base">PLA Basic Jade White</p>
                <p className="text-[#849396] text-xs font-mono-tech">Restante: 820g (~82%)</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('files')}
            className="w-full py-2.5 bg-[#2d3449] text-[#dae2fd] hover:text-white hover:bg-[#3b494c] rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">inventory_2</span>
            Gestionar Materiales AMS
          </button>
        </div>
      </section>

      {/* Quick Gallery / Últimas Creaciones */}
      <section className="mt-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Últimas Creaciones</h3>
          <button
            onClick={() => onNavigateTab('view')}
            className="text-[#00e5ff] text-xs font-semibold hover:underline flex items-center gap-1"
          >
            Ver visor 3D <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
          {recentCreations.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onLoadPredefinedModel({
                  modelName: item.title,
                  shapeType: item.shapeType,
                  dimensions: item.dims,
                  summary: `Cargado modelo ${item.title} desde biblioteca local.`,
                });
                onNavigateTab('view');
              }}
              className="min-w-[200px] sm:min-w-[220px] aspect-square rounded-2xl bg-[#171f33] border border-white/10 overflow-hidden group relative cursor-pointer hover:border-[#00e5ff]/50 transition-all shadow-xl"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">
                <p className="text-xs sm:text-sm font-bold text-white truncate">{item.title}</p>
                <p className="text-[10px] text-[#00e5ff] font-mono-tech mt-0.5">
                  {item.dims.x}x{item.dims.y}x{item.dims.z} mm
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

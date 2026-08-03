import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ModelTelemetry } from '../types';

interface ThreeCanvasProps {
  telemetry: ModelTelemetry;
  onSelectInspect?: (data: string) => void;
  onPrintClick?: () => void;
  onExportClick?: () => void;
  showStatusOverlay?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  telemetry,
  onPrintClick,
  onExportClick,
  showStatusOverlay = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState<boolean>(telemetry.wireframe || false);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [inspectInfo, setInspectInfo] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);

  // Generate 3D geometry based on shapeType
  const createGeometry = (shapeType: string): THREE.BufferGeometry => {
    switch (shapeType) {
      case 'gear': {
        const shape = new THREE.Shape();
        const teeth = 12;
        const outerRadius = 2.5;
        const innerRadius = 1.8;
        for (let i = 0; i < teeth; i++) {
          const angle1 = (i / teeth) * Math.PI * 2;
          const angle2 = ((i + 0.3) / teeth) * Math.PI * 2;
          const angle3 = ((i + 0.6) / teeth) * Math.PI * 2;
          const angle4 = ((i + 0.9) / teeth) * Math.PI * 2;

          if (i === 0) shape.moveTo(Math.cos(angle1) * innerRadius, Math.sin(angle1) * innerRadius);
          shape.lineTo(Math.cos(angle2) * outerRadius, Math.sin(angle2) * outerRadius);
          shape.lineTo(Math.cos(angle3) * outerRadius, Math.sin(angle3) * outerRadius);
          shape.lineTo(Math.cos(angle4) * innerRadius, Math.sin(angle4) * innerRadius);
        }
        const hole = new THREE.Path();
        hole.absarc(0, 0, 0.8, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        return new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05 });
      }
      case 'vase': {
        const points = [];
        for (let i = 0; i < 20; i++) {
          const y = (i / 20) * 4 - 2;
          const radius = 1.2 + Math.sin(i * 0.5) * 0.5 + Math.cos(i * 0.2) * 0.3;
          points.push(new THREE.Vector2(radius, y));
        }
        return new THREE.LatheGeometry(points, 32);
      }
      case 'drone': {
        // Frame shape with central hub & 4 arms
        const groupGeo = new THREE.BoxGeometry(1.2, 0.4, 1.2);
        return groupGeo;
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
        return new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.05 });
      }
      case 'torus': {
        return new THREE.TorusGeometry(1.8, 0.6, 16, 100);
      }
      default: {
        return new THREE.BoxGeometry(2.5, 2.5, 2.5);
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.5);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xcdff13, 0.8);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x00e5ff, 0x1f293d);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Main 3D Group
    const group = new THREE.Group();
    meshGroupRef.current = group;
    scene.add(group);

    const geometry = createGeometry(telemetry.shapeType);
    const material = new THREE.MeshStandardMaterial({
      color: wireframe ? 0x00e5ff : 0x1e3a8a,
      roughness: 0.3,
      metalness: 0.6,
      wireframe: wireframe,
      emissive: wireframe ? 0x00e5ff : 0x002b36,
      emissiveIntensity: wireframe ? 0.4 : 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    geometry.center();
    group.add(mesh);

    // Outer glow edges wireframe
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 1.5 });
    const lineSegments = new THREE.LineSegments(edges, lineMat);
    group.add(lineSegments);

    // Scale
    const currentScale = telemetry.scale || 1.2;
    group.scale.set(currentScale, currentScale, currentScale);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (meshGroupRef.current && isRotating) {
        meshGroupRef.current.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [telemetry.shapeType, wireframe, telemetry.scale]);

  // Handle Rotation Toggle
  const handleToggleRotate = () => {
    setIsRotating((prev) => !prev);
  };

  // Handle Zoom
  const handleZoom = () => {
    if (cameraRef.current) {
      const nextZoom = zoomLevel >= 1.6 ? 0.8 : zoomLevel + 0.3;
      setZoomLevel(nextZoom);
      cameraRef.current.position.set(0, 3 / nextZoom, 7 / nextZoom);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  // Handle Wireframe Toggle
  const handleToggleWireframe = () => {
    setWireframe((prev) => !prev);
  };

  // Handle Inspection
  const handleInspect = () => {
    const info = `Geometría: ${telemetry.shapeType.toUpperCase()} | Infill: ${telemetry.infill}% | Grosor pared: ${telemetry.wallThickness}mm | Capa: ${telemetry.layerHeight}mm`;
    setInspectInfo(info);
    setTimeout(() => setInspectInfo(null), 4000);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Scanline FX */}
      <div className="scanline" />

      {/* WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Telemetry Overlay Top Left */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-[#171f33]/80 backdrop-blur-glass p-3.5 rounded-xl border border-[#3b494c]/40 shadow-xl">
          <p className="text-[10px] text-[#00e5ff] font-bold uppercase tracking-widest mb-1.5 font-mono-tech">
            Telemetry
          </p>
          <div className="font-mono-tech text-xs text-[#dae2fd] flex flex-col gap-1">
            <span className="flex justify-between gap-4">
              <span className="text-[#bac9cc]">X:</span>
              <span className="text-[#00e5ff] font-semibold">{telemetry.dimensions.x.toFixed(2)}mm</span>
            </span>
            <span className="flex justify-between gap-4">
              <span className="text-[#bac9cc]">Y:</span>
              <span className="text-[#00e5ff] font-semibold">{telemetry.dimensions.y.toFixed(2)}mm</span>
            </span>
            <span className="flex justify-between gap-4">
              <span className="text-[#bac9cc]">Z:</span>
              <span className="text-[#00e5ff] font-semibold">{telemetry.dimensions.z.toFixed(2)}mm</span>
            </span>
          </div>
        </div>

        {inspectInfo && (
          <div className="bg-[#00e5ff]/10 backdrop-blur-glass p-2.5 rounded-lg border border-[#00e5ff]/40 text-[11px] font-mono-tech text-[#c3f5ff] max-w-xs animate-fade-in">
            {inspectInfo}
          </div>
        )}
      </div>

      {/* Live View Status Badge Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-[#171f33]/80 backdrop-blur-glass px-3.5 py-2 rounded-xl border border-[#3b494c]/40 flex items-center gap-2 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] glow-cyan animate-pulse"></span>
          <span className="font-mono-tech text-xs text-[#00e5ff] font-semibold tracking-wider">LIVE VIEW</span>
        </div>
      </div>

      {/* Floating Action Toolbars Right Side */}
      <div className="absolute right-4 top-20 flex flex-col gap-3 z-20">
        <button
          onClick={handleToggleRotate}
          className={`w-11 h-11 backdrop-blur-glass border rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
            isRotating
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
              : 'bg-[#171f33]/80 border-[#3b494c]/40 text-[#bac9cc] hover:text-[#c3f5ff]'
          }`}
          title="Autorotación"
        >
          <span className="material-symbols-outlined text-[20px]">rotate_right</span>
        </button>

        <button
          onClick={handleZoom}
          className="w-11 h-11 bg-[#171f33]/80 backdrop-blur-glass border border-[#3b494c]/40 rounded-full flex items-center justify-center text-[#bac9cc] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all active:scale-90 shadow-lg"
          title="Zoom In/Out"
        >
          <span className="material-symbols-outlined text-[20px]">zoom_in</span>
        </button>

        <button
          onClick={handleToggleWireframe}
          className={`w-11 h-11 backdrop-blur-glass border rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
            wireframe
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
              : 'bg-[#171f33]/80 border-[#3b494c]/40 text-[#bac9cc] hover:text-[#c3f5ff]'
          }`}
          title="Modo Wireframe"
        >
          <span className="material-symbols-outlined text-[20px]">grid_4x4</span>
        </button>

        <button
          onClick={handleInspect}
          className="w-11 h-11 bg-[#171f33]/80 backdrop-blur-glass border border-[#3b494c]/40 rounded-full flex items-center justify-center text-[#bac9cc] hover:text-[#cdff13] hover:bg-[#cdff13]/10 transition-all active:scale-90 shadow-lg"
          title="Inspeccionar Geometría"
        >
          <span className="material-symbols-outlined text-[20px]">biotech</span>
        </button>
      </div>

      {/* Bottom Status Sheet Overlay */}
      {showStatusOverlay && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-[94%] max-w-lg z-30">
          <div className="bg-[#222a3d]/90 backdrop-blur-glass border border-[#00e5ff]/30 rounded-full px-4 sm:px-5 py-3 flex items-center justify-between shadow-2xl gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="bg-[#cdff13]/20 p-2 rounded-full flex-shrink-0">
                <span className="material-symbols-outlined text-[#cdff13] text-lg sm:text-xl">check_circle</span>
              </div>
              <div className="truncate">
                <p className="text-[10px] text-[#bac9cc] font-medium leading-tight font-mono-tech">Geometría Lista</p>
                <p className="text-xs sm:text-sm text-[#c3f5ff] font-semibold truncate">
                  {telemetry.modelName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {onExportClick && (
                <button
                  onClick={onExportClick}
                  className="bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 hover:bg-[#00e5ff]/30 font-bold text-xs px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full transition-all active:scale-95 flex items-center gap-1"
                  title="Exportar STL"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span className="hidden xs:inline">STL</span>
                </button>
              )}

              <button
                onClick={onPrintClick}
                className="bg-[#cdff13] text-[#283500] font-bold text-xs px-4 py-2 sm:px-5 sm:py-2.5 rounded-full hover:brightness-110 active:scale-95 transition-all glow-lime flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">print</span>
                PRINT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

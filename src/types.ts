export type TabType = 'home' | 'view' | 'edit' | 'files';

export interface ModelTelemetry {
  modelName: string;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  wallThickness: number;
  infill: number;
  recommendedMaterial: string;
  printTime: string;
  layerHeight: number;
  shapeType: 'gear' | 'vase' | 'drone' | 'bracket' | 'cube' | 'torus' | 'cylinder';
  summary: string;
  technicalNotes?: string;
  wireframe?: boolean;
  scale?: number;
}

export interface AMSSlot {
  id: number;
  slotName: string;
  material: string;
  colorName: string;
  colorHex: string;
  remainingPercentage: number;
  status: 'READY' | 'IDLE' | 'EMPTY';
  isActive?: boolean;
}

export interface FilamentItem {
  id: string;
  name: string;
  type: string;
  colorHex: string;
  ref: string;
  remainingGrams: number;
  totalGrams: number;
  isLowStock?: boolean;
}

export interface PrinterState {
  status: 'PRINTING' | 'PAUSED' | 'IDLE' | 'COMPLETED';
  printerName: string;
  nozzleTemp: number;
  targetNozzleTemp: number;
  bedTemp: number;
  targetBedTemp: number;
  speedPercentage: number;
  progressPercentage: number;
  timeRemaining: string;
  fileName: string;
  filamentUsedGrams: number;
  mcuTemp: number;
  fanSpeedPercentage: number;
  chamberLight: boolean;
  amsHumidity: string;
  storageTemp: number;
}

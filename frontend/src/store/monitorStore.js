import { create } from "zustand";

const useMonitorStore = create((set, get) => ({
  // ECG / Cardiac
  rhythm: "Sinus Rhythm",
  extrasystole: "None",
  artifact_50_60hz: false,
  artifact_muscular: false,
  emd_pea: false,
  HR: 80,

  // Vitals
  SpO2: 98,
  cyanosis_start: 90,
  cyanosis_severe: 70,
  Tperi: 37.0,
  Tblood: 37.0,

  // Arterial BP
  ABP_sys: 120,
  ABP_dia: 80,

  // Pulmonary BP
  PAP_sys: 20,
  PAP_dia: 10,
  PAP_wedge: 10,

  // Cardiac Output
  CO: 5.0,

  // Respiratory
  avRR: 14,
  etCO2: 35,
  inCO2: 0,
  etN2O: 0,
  etO2: 21,
  inN2O: 0,
  inO2: 21,

  // Non-invasive BP
  NBP_sys: 120,
  NBP_dia: 80,

  // TOF
  TOF_pct: 100,
  TOF_count: 4,

  // Eyes
  eyes_state: "Closed",
  eyes_look: "Normal",

  // Alarms
  alarms: [],

  // Tracking
  last_updated: null,
  updated_by: "",

  // Actions
  setFullState: (state) => set({ ...state }),
  updateField: (field, value) => set({ [field]: value }),
}));

export default useMonitorStore;

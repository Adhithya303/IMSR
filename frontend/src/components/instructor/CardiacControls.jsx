import { useState } from "react";
import socket from "../../socket";

const RHYTHMS = [
  "Sinus Rhythm",
  "Sinus Bradycardia",
  "Sinus Tachycardia",
  "AF",
  "Atrial Flutter",
  "SVT",
  "VT",
  "VF",
  "Asystole",
  "Ventricular Standstill",
  "AV Block 1°",
  "AV Block 2° Type 1",
  "AV Block 2° Type 2",
  "AV Block 3°",
  "LBBB",
  "RBBB",
  "ST Elevation",
  "ST Depression",
  "Junctional",
  "Paced Rhythm",
];

const EXTRASYSTOLES = [
  "None",
  "VES Unifocal",
  "VES Multifocal",
  "SVES",
  "Couplets",
  "Bigeminy",
];

export default function CardiacControls({ sessionCode, currentState, onClose }) {
  const [selectedRhythm, setSelectedRhythm] = useState(currentState?.rhythm || "Sinus Rhythm");
  const [selectedExtrasystole, setSelectedExtrasystole] = useState(currentState?.extrasystole || "None");
  const [hr, setHr] = useState(currentState?.HR || 80);
  const [artifact5060, setArtifact5060] = useState(currentState?.artifact_50_60hz || false);
  const [artifactMuscular, setArtifactMuscular] = useState(currentState?.artifact_muscular || false);
  const [emdPea, setEmdPea] = useState(currentState?.emd_pea || false);

  const handleApply = () => {
    socket.emit("update_rhythm", {
      session_code: sessionCode,
      rhythm: selectedRhythm,
      extrasystole: selectedExtrasystole,
      HR: hr,
      artifact_50_60hz: artifact5060,
      artifact_muscular: artifactMuscular,
      emd_pea: emdPea,
    });
  };

  const handleOk = () => {
    handleApply();
    if (onClose) onClose();
  };

  return (
    <div className="cardiac-controls">
      <div className="cardiac-header">Cardiac / Rhythm Controls</div>

      <div className="cardiac-body">
        {/* Rhythm List */}
        <div className="cardiac-section">
          <div className="cardiac-section-title">Rhythm</div>
          <div className="rhythm-list">
            {RHYTHMS.map((r) => (
              <div
                key={r}
                className={`rhythm-item ${selectedRhythm === r ? "rhythm-selected" : ""}`}
                onClick={() => setSelectedRhythm(r)}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Extrasystole */}
        <div className="cardiac-section">
          <div className="cardiac-section-title">Extrasystole</div>
          <div className="rhythm-list small-list">
            {EXTRASYSTOLES.map((e) => (
              <div
                key={e}
                className={`rhythm-item ${selectedExtrasystole === e ? "rhythm-selected" : ""}`}
                onClick={() => setSelectedExtrasystole(e)}
              >
                {e}
              </div>
            ))}
          </div>
        </div>

        {/* Heart Rate */}
        <div className="cardiac-section">
          <div className="cardiac-section-title">Heart Rate</div>
          <div className="hr-control">
            <input
              type="range"
              min={20}
              max={250}
              value={hr}
              onChange={(e) => setHr(Number(e.target.value))}
              className="hr-slider"
            />
            <input
              type="number"
              min={20}
              max={250}
              value={hr}
              onChange={(e) => setHr(Number(e.target.value))}
              className="hr-input"
            />
            <span className="hr-unit">bpm</span>
          </div>
        </div>

        {/* Artifacts */}
        <div className="cardiac-section">
          <div className="cardiac-section-title">Artifacts</div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={artifact5060}
              onChange={(e) => setArtifact5060(e.target.checked)}
            />
            50/60 Hz Artifact
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={artifactMuscular}
              onChange={(e) => setArtifactMuscular(e.target.checked)}
            />
            Muscular Artifact
          </label>
        </div>

        {/* EMD/PEA */}
        <div className="cardiac-section">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={emdPea}
              onChange={(e) => setEmdPea(e.target.checked)}
            />
            EMD / PEA
          </label>
        </div>
      </div>

      <div className="cardiac-footer">
        <button className="btn-classic btn-apply" onClick={handleApply}>Apply</button>
        <button className="btn-classic btn-ok" onClick={handleOk}>OK</button>
        <button className="btn-classic btn-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import useMonitorStore from "../store/monitorStore";
import WaveformCanvas from "../components/monitor/WaveformCanvas";
import VitalsPanel from "../components/monitor/VitalsPanel";
import AlarmBar from "../components/monitor/AlarmBar";
import EyesPanel from "../components/monitor/EyesPanel";
import CardiacControls from "../components/instructor/CardiacControls";
import SimulationControl from "../components/instructor/SimulationControl";
import BodyDiagram from "../components/instructor/BodyDiagram";
import SetArterialBP from "../components/dialogs/SetArterialBP";
import SetSpO2 from "../components/dialogs/SetSpO2";
import SetTemperature from "../components/dialogs/SetTemperature";
import SetPulmonaryBP from "../components/dialogs/SetPulmonaryBP";
import SetRespiratoryRate from "../components/dialogs/SetRespiratoryRate";
import SetCO2 from "../components/dialogs/SetCO2";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function InstructorDashboard() {
  const [sessionCode, setSessionCode] = useState("");
  const [activeTab, setActiveTab] = useState("monitor");
  const [openDialog, setOpenDialog] = useState(null);
  const setFullState = useMonitorStore((s) => s.setFullState);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "instructor") {
      navigate("/");
      return;
    }

    // Create or get session
    const initSession = async () => {
      const res = await fetch(`${API}/session/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSessionCode(data.session_code);
      localStorage.setItem("session_code", data.session_code);

      // Connect socket
      if (!socket.connected) socket.connect();
      socket.emit("join_session", { session_code: data.session_code, token });
    };

    initSession();

    const handleState = (state) => setFullState(state);
    const handleAlarm = (data) => useMonitorStore.setState({ alarms: data.alarms });

    socket.on("state_update", handleState);
    socket.on("alarm_update", handleAlarm);
    socket.on("rhythm_change", (data) => setFullState(data));

    return () => {
      socket.off("state_update", handleState);
      socket.off("alarm_update", handleAlarm);
      socket.off("rhythm_change");
    };
  }, [navigate, setFullState]);

  const handleVitalClick = (key) => {
    const dialogMap = {
      HR: "cardiac",
      ABP_sys: "abp",
      ABP_dia: "abp",
      SpO2: "spo2",
      Tperi: "temp",
      Tblood: "temp",
      PAP_sys: "pap",
      PAP_dia: "pap",
      PAP_wedge: "pap",
      etCO2: "co2",
      inCO2: "co2",
      avRR: "rr",
      CO: "abp",
    };
    setOpenDialog(dialogMap[key] || null);
  };

  const currentState = useMonitorStore.getState();

  return (
    <div className="instructor-dashboard">
      {/* Top bar */}
      <div className="instructor-topbar">
        <div className="topbar-left">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <rect x="2" y="2" width="44" height="44" rx="4" stroke="#00FF44" strokeWidth="2" fill="none" />
            <polyline points="8,28 14,28 17,16 20,36 23,24 26,30 29,22 32,28 38,28"
              stroke="#00FF44" strokeWidth="2" fill="none" />
          </svg>
          <span className="topbar-title">AI Simulation Monitor</span>
          <span className="topbar-role">INSTRUCTOR</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-session">Session: <strong>{sessionCode}</strong></span>
          <button className="btn-classic btn-sm" onClick={() => {
            localStorage.clear();
            navigate("/");
          }}>Logout</button>
        </div>
      </div>

      {/* Main layout */}
      <div className="instructor-body">
        {/* Left column */}
        <div className="instructor-left">
          <SimulationControl sessionCode={sessionCode} />
        </div>

        {/* Center column */}
        <div className="instructor-center">
          <BodyDiagram />
          <EyesPanel editable={true} sessionCode={sessionCode} />
        </div>

        {/* Right column — tabbed */}
        <div className="instructor-right">
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === "monitor" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("monitor")}
            >
              Patient Monitor
            </button>
            <button
              className={`tab-btn ${activeTab === "cardiac" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("cardiac")}
            >
              Cardiac Controls
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "monitor" && (
              <div className="mini-monitor">
                <AlarmBar />
                <div className="mini-monitor-body">
                  <div className="mini-waveforms">
                    <WaveformCanvas />
                  </div>
                  <div className="mini-vitals">
                    <VitalsPanel onVitalClick={handleVitalClick} />
                  </div>
                </div>
              </div>
            )}
            {activeTab === "cardiac" && (
              <CardiacControls
                sessionCode={sessionCode}
                currentState={currentState}
                onClose={() => setActiveTab("monitor")}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SetArterialBP isOpen={openDialog === "abp"} onClose={() => setOpenDialog(null)} sessionCode={sessionCode} />
      <SetSpO2 isOpen={openDialog === "spo2"} onClose={() => setOpenDialog(null)} sessionCode={sessionCode} />
      <SetTemperature isOpen={openDialog === "temp"} onClose={() => setOpenDialog(null)} sessionCode={sessionCode} />
      <SetPulmonaryBP isOpen={openDialog === "pap"} onClose={() => setOpenDialog(null)} sessionCode={sessionCode} />
      <SetRespiratoryRate isOpen={openDialog === "rr"} onClose={() => setOpenDialog(null)} sessionCode={sessionCode} />
      <SetCO2 isOpen={openDialog === "co2"} onClose={() => setOpenDialog(null)} sessionCode={sessionCode} />
    </div>
  );
}

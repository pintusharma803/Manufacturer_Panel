import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Zap,
  Thermometer,
  Radio,
  Play,
  Pause,
  Sliders,
  RefreshCw,
  ShieldCheck,
  Power,
  BarChart3
} from 'lucide-react';
import { api } from '../api/client';

export default function DashboardsPage() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isSimulating, setIsSimulating] = useState(true);

  // Real-time telemetry state
  const [voltage, setVoltage] = useState(3.42);
  const [frequency, setFrequency] = useState(124.6);
  const [intensity, setIntensity] = useState(88.4);
  const [temperature, setTemperature] = useState(26.2);
  const [pulseWave, setPulseWave] = useState([30, 45, 60, 20, 75, 90, 40, 65, 85, 50, 95, 35, 70, 80, 60]);

  // Actuator controls
  const [pulseGeneratorActive, setPulseGeneratorActive] = useState(true);
  const [highFreqMode, setHighFreqMode] = useState(false);
  const [relayState, setRelayState] = useState(true);

  useEffect(() => {
    async function loadDevices() {
      try {
        const res = await api.getDevices();
        const devList = res.devices || [];
        setDevices(devList);
        if (devList.length > 0) {
          setSelectedDeviceId(devList[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDevices();
  }, []);

  // Telemetry simulation tick loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const baseV = pulseGeneratorActive ? (highFreqMode ? 4.1 : 3.3) : 0.2;
      const newV = parseFloat((baseV + (Math.random() * 0.4 - 0.2)).toFixed(2));
      const newFreq = parseFloat((120 + Math.sin(Date.now() / 1000) * 15 + (Math.random() * 4)).toFixed(1));
      const newIntensity = parseFloat((80 + Math.random() * 18).toFixed(1));
      const newTemp = parseFloat((25 + Math.random() * 2).toFixed(1));

      setVoltage(newV);
      setFrequency(newFreq);
      setIntensity(newIntensity);
      setTemperature(newTemp);

      setPulseWave((prev) => {
        const nextVal = Math.floor(20 + Math.random() * 75);
        return [...prev.slice(1), nextVal];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, pulseGeneratorActive, highFreqMode]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Piezo Pulse Telemetry Live</h2>
              {/* <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isSimulating
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                <span>{isSimulating ? 'STREAMING 1.2s' : 'PAUSED'}</span>
              </span> */}
            </div>
            {/* <p className="text-xs text-slate-500 dark:text-slate-400">High-resolution piezo transducer & sensor harmonics</p> */}
          </div>
        </div>

        {/* Device Selector & Stream Controller */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-blue-500 transition"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.model} ({d.unique_id})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${isSimulating
              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-glow'
              }`}
          >
            {isSimulating ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Top 4 Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Piezo Voltage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 relative overflow-hidden shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Piezo Voltage</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{voltage}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">V (RMS)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (voltage / 5.0) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Operational range: 0.5V - 4.8V</p>
        </div>

        {/* Pulse Frequency */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 relative overflow-hidden shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pulse Frequency</span>
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{frequency}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hz</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 dark:bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (frequency / 150) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Transducer resonance lock</p>
        </div>

        {/* Pulse Intensity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 relative overflow-hidden shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pulse Intensity</span>
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{intensity}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kPa</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (intensity / 120) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Acoustic pressure peak</p>
        </div>

        {/* Temperature */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 relative overflow-hidden shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Core Temperature</span>
            <Thermometer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{temperature}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">°C</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 dark:bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (temperature / 60) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Optimal thermal threshold</p>
        </div>
      </div>

      {/* Real-time Waveform Canvas Visualizer */}
      {/* <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Piezo Frequency Waveform Oscilloscope</h3>
          </div>
          <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">15 Sample Windows</span>
        </div> */}

      {/* Bar Waveform representation */}
      {/* <div className="h-44 bg-slate-50 dark:bg-slate-950 rounded-xl p-4 flex items-end justify-between gap-1 sm:gap-1.5 border border-slate-200 dark:border-slate-800/80">
          {pulseWave.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-blue-600 via-cyan-400 to-indigo-400 transition-all duration-300 group-hover:brightness-110"
                style={{ height: `${val}%` }}
              ></div>
              <span className="text-[9px] font-mono text-slate-400 hidden sm:block">{val}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* ThingsBoard Interactive Actuators & Remote Control Panel */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>ThingsBoard Remote Device Actuation & RPC Controls</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Hardware command dispatch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Actuator 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Piezo Pulse Generator</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Master pulse driver circuit</span>
            </div>
            <button
              onClick={() => setPulseGeneratorActive(!pulseGeneratorActive)}
              className={`w-12 h-6 rounded-full transition-colors relative ${pulseGeneratorActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'
                }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${pulseGeneratorActive ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
            </button>
          </div>

          {/* Actuator 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">High-Frequency Mode</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Boost transducer sampling</span>
            </div>
            <button
              onClick={() => setHighFreqMode(!highFreqMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${highFreqMode ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-800'
                }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${highFreqMode ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
            </button>
          </div>

          {/* Actuator 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Output Protection Relay</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Over-voltage protection</span>
            </div>
            <button
              onClick={() => setRelayState(!relayState)}
              className={`w-12 h-6 rounded-full transition-colors relative ${relayState ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${relayState ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

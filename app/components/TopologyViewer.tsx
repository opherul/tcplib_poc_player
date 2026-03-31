import React, { useState, useEffect } from 'react';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const NODES = {
  "eth0": { x: 100, y: 200, label: "Host A" },
  "switch": { x: 400, y: 200, label: "Switch" },
  "eth1": { x: 700, y: 100, label: "Host B" },
  "eth2": { x: 700, y: 300, label: "Host C" },
};

export default function TopologyViewer() {
  const [report, setReport] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [packets, setPackets] = useState<Array<{ id: string, x: number, y: number, opacity: number }>>([]);
  const [displayedTable, setDisplayedTable] = useState<any>({});
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await import('../data/react_frontend_data.json');
      setReport(data.default || data);
    };
    loadData();
  }, []);

  const runAnimationSequence = async (stepIndex: number) => {
    if (!report || isPlaying) return;
    setIsPlaying(true);
    
    const event = report.events[stepIndex];
    const sender = NODES[event.sender_port as keyof typeof NODES];
    const sw = NODES["switch"];
    
    // IMPORTANT FOR REPLAY: Reset table to the "Before" state at the start of the animation
    setDisplayedTable(event.state.table_before);

    // --- PHASE 1: INGRESS ---
    setPackets([{ id: "p-ingress", x: sender.x, y: sender.y, opacity: 1 }]);
    await sleep(50); 
    setPackets([{ id: "p-ingress", x: sw.x, y: sw.y, opacity: 1 }]);
    await sleep(800); 

    // --- PHASE 2: PROCESSING ---
    setPackets([]);
    // Packet hits the switch: Update to the "After" state
    setDisplayedTable(event.state.table_after);
    await sleep(500);

    // --- PHASE 3: EGRESS ---
    const egressPackets = event.evaluation.actual.map((port: string, i: number) => ({
      id: `p-egress-${i}`,
      x: sw.x, y: sw.y, opacity: 1
    }));
    setPackets(egressPackets);
    await sleep(50);

    const finalPackets = event.evaluation.actual.map((port: keyof typeof NODES, i: number) => ({
      id: `p-egress-${i}`,
      x: NODES[port].x, y: NODES[port].y, opacity: 1
    }));
    setPackets(finalPackets);
    
    await sleep(800);
    setPackets(finalPackets.map(p => ({ ...p, opacity: 0 })));
    
    setIsPlaying(false);
  };

  useEffect(() => {
    if (report && report.events.length > 0) {
      runAnimationSequence(currentIndex);
    }
  }, [currentIndex, report]);

  if (!report) return <div className="p-8 text-center text-xl">Loading Lab...</div>;

  const currentEvent = report.events[currentIndex];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 rounded-xl shadow-lg border border-slate-200">
      
      {/* CONTROLS */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-200">
        <button 
          disabled={currentIndex === 0 || isPlaying}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded disabled:bg-slate-300 transition-colors"
        >
          &larr; Prev
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <h2 className="font-bold text-slate-800">Step {currentIndex + 1} of {report.events.length}</h2>
            <p className="text-sm text-slate-500">{currentEvent.packet_summary.type}</p>
          </div>
          
          {/* THE NEW REPLAY BUTTON */}
          <button 
            disabled={isPlaying}
            onClick={() => runAnimationSequence(currentIndex)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center disabled:bg-slate-300 transition-colors"
            title="Replay Animation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>

        <button 
          disabled={currentIndex === report.events.length - 1 || isPlaying}
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded disabled:bg-slate-300 transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {/* THE PACKET TRACER CANVAS */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-inner mb-6 overflow-hidden relative" style={{ height: '350px' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 350" className="bg-slate-50">
          <line x1={NODES.eth0.x} y1={NODES.eth0.y} x2={NODES.switch.x} y2={NODES.switch.y} stroke="#cbd5e1" strokeWidth="4" />
          <line x1={NODES.eth1.x} y1={NODES.eth1.y} x2={NODES.switch.x} y2={NODES.switch.y} stroke="#cbd5e1" strokeWidth="4" />
          <line x1={NODES.eth2.x} y1={NODES.eth2.y} x2={NODES.switch.x} y2={NODES.switch.y} stroke="#cbd5e1" strokeWidth="4" />

          {packets.map(p => (
            <circle key={p.id} cx={p.x} cy={p.y} r="12" fill="#f59e0b" opacity={p.opacity} style={{ transition: 'all 0.8s ease-in-out' }} />
          ))}

          {Object.entries(NODES).map(([port, coords]) => (
            <g key={port} transform={`translate(${coords.x}, ${coords.y})`}>
              <rect x="-40" y="-30" width="80" height="60" rx="8" fill={port === 'switch' ? '#1e293b' : '#3b82f6'} />
              <text x="0" y="0" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14" dy=".3em">{coords.label}</text>
              <text x="0" y="45" textAnchor="middle" fill="#64748b" fontSize="12">{port}</text>
            </g>
          ))}
        </svg>

        {/* FLOATING CAM TABLE */}
        <div className="absolute bottom-4 left-4 bg-slate-900 text-emerald-400 p-4 rounded shadow-lg font-mono text-xs w-64 opacity-95">
          <h3 className="text-white border-b border-slate-700 pb-2 mb-2 font-semibold">Switch CAM Table</h3>
          {Object.keys(displayedTable).length === 0 ? (
            <span className="text-slate-500 italic">Table is empty...</span>
          ) : (
            <ul>
              {Object.entries(displayedTable).map(([mac, port]) => (
                <li key={mac} className="flex justify-between">
                  <span>{mac.substring(0, 8)}...</span> 
                  <span className="text-amber-300">{String(port)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* BOTTOM INFO GRID */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Left: Narrative & Evaluation */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xs uppercase font-bold text-slate-500 mb-1">Scenario Description</h2>
            <p className="text-slate-800">{currentEvent.description}</p>
          </div>
          <div className={`p-4 rounded-lg shadow-sm border-l-4 ${currentEvent.evaluation.passed ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'}`}>
            <span className="font-bold mr-2">Evaluation:</span> {currentEvent.evaluation.feedback}
          </div>
        </div>

        {/* Right: THE NEW PACKET INSPECTOR */}
        <div className="bg-white p-0 rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-800 text-white p-2 px-4 text-sm font-bold flex justify-between items-center">
            <span>Frame Inspector</span>
            <span className="bg-indigo-500 text-xs px-2 py-1 rounded">Ethernet II</span>
          </div>
          <div className="p-4 font-mono text-sm space-y-3 flex-grow bg-slate-50">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Destination MAC:</span>
              <span className="font-bold text-slate-800">{currentEvent.packet_summary.dst}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Source MAC:</span>
              <span className="font-bold text-slate-800">{currentEvent.packet_summary.src}</span>
            </div>
            <div className="flex flex-col pt-1">
              <span className="text-slate-500 mb-1">Frame Payload (Decoded):</span>
              <div className="bg-slate-200 p-2 rounded text-slate-700 italic break-words">
                "{currentEvent.packet_summary.payload}"
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
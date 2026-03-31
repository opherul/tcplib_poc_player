import React, { useState, useEffect } from 'react';

const NetworkLabViewer = () => {
  const [report, setReport] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Dynamically import the local JSON file
    const loadData = async () => {
      const data = await import('../data/react_frontend_data.json');
      // The imported JSON usually comes attached to a 'default' property in modern bundlers
      setReport(data.default || data);
    };
    loadData();
  }, []);

  if (!report) return <div className="p-8 text-center text-xl">Loading simulation data...</div>;

  const currentEvent = report.events[currentStepIndex];
  const isLastStep = currentStepIndex === report.events.length - 1;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 rounded-xl shadow-lg font-sans border border-slate-200">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-300">
        <h1 className="text-3xl font-extrabold text-slate-800">L2 Switch Simulation</h1>
        <div className={`px-4 py-2 rounded-md font-bold text-white tracking-wide shadow-sm ${report.lab_status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          Status: {report.lab_status}
        </div>
      </div>

      {/* --- THE PLAYER CONTROLS --- */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-200">
        <button 
          disabled={currentStepIndex === 0}
          onClick={() => setCurrentStepIndex(prev => prev - 1)}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Previous
        </button>
        <span className="font-bold text-slate-700">
          Step {currentEvent.step} of {report.events.length}
        </span>
        <button 
          disabled={isLastStep}
          onClick={() => setCurrentStepIndex(prev => prev + 1)}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {/* --- THE MAIN STAGE --- */}
      <div className="grid grid-cols-2 gap-8">
        
        {/* Left Column: The Narrative & Feedback */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-2">Action</h2>
            <p className="text-lg text-slate-800">{currentEvent.description}</p>
          </div>

          <div className={`p-5 rounded-lg shadow-sm border-l-4 ${currentEvent.evaluation.passed ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
            <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-2">Evaluation</h2>
            <p className="text-lg text-slate-800">{currentEvent.evaluation.feedback}</p>
          </div>
        </div>

        {/* Right Column: The Switch Internal State */}
        <div className="bg-slate-900 text-emerald-400 p-5 rounded-lg shadow-inner font-mono text-sm overflow-x-auto">
          <h2 className="text-slate-100 border-b border-slate-700 pb-3 mb-3 font-semibold tracking-wide">Switch CAM Table (Live)</h2>
          {Object.keys(currentEvent.state.table_after).length === 0 ? (
            <span className="text-slate-500 italic">Table is empty...</span>
          ) : (
            <ul className="space-y-2">
              {Object.entries(currentEvent.state.table_after).map(([mac, port]) => (
                <li key={mac} className="flex gap-4">
                  <span className="text-sky-300">{mac}</span> 
                  <span className="text-slate-400">&rarr;</span> 
                  <span className="text-amber-300">{String(port)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default NetworkLabViewer;
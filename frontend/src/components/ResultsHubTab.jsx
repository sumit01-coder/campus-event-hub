import React, { useState } from 'react';
import { Trophy, Plus, Save, Trash2, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResultsHubTab({ event, setEvent, registrations }) {
  const [winners, setWinners] = useState(event.results?.winners || []);
  const [isReleased, setIsReleased] = useState(event.results?.isReleased || false);
  const [saving, setSaving] = useState(false);

  const handleAddWinner = () => {
    setWinners([...winners, { position: '', registrationId: '' }]);
  };

  const handleUpdateWinner = (index, field, value) => {
    const newWinners = [...winners];
    newWinners[index][field] = value;
    setWinners(newWinners);
  };

  const handleRemoveWinner = (index) => {
    const newWinners = winners.filter((_, i) => i !== index);
    setWinners(newWinners);
  };

  const handleSaveResults = async (release = false) => {
    // Validate
    const invalid = winners.some(w => !w.position.trim() || !w.registrationId);
    if (invalid) {
      toast.error('Please fill out all positions and select a participant for each winner.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/events/${event._id}/results`, {
        winners,
        isReleased: release
      });
      setEvent(res.data);
      setIsReleased(release);
      toast.success(release ? 'Results have been released publicly!' : 'Results drafted successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 flex flex-col md:flex-row items-center gap-6 justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 border border-amber-100">
            <Trophy className="text-amber-500" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-900">Event Results & Winners</h2>
            <p className="text-amber-700/80 font-medium text-sm mt-1">Assign winners and publish results to the participants dashboard.</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {isReleased && (
            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-sm border border-green-200">
              <CheckCircle size={16} /> Results Published
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {winners.map((winner, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-start relative group">
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Position / Title</label>
                <input 
                  type="text" 
                  value={winner.position}
                  onChange={e => handleUpdateWinner(index, 'position', e.target.value)}
                  placeholder="e.g. 1st Place, Best UI Design"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Winner</label>
                <select 
                  value={winner.registrationId}
                  onChange={e => handleUpdateWinner(index, 'registrationId', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-700"
                >
                  <option value="">-- Choose Participant / Team --</option>
                  {registrations.filter(r => r.participationType === 'individual' || r.isTeamLeader).map(reg => (
                    <option key={reg._id} value={reg._id}>
                      {reg.participationType === 'group' ? `Team: ${reg.teamCode}` : reg.participantName} ({reg.email})
                    </option>
                  ))}
                </select>
                
                {/* Show project submission links if available */}
                {(() => {
                  const selectedReg = registrations.find(r => r._id === winner.registrationId);
                  if (selectedReg?.projectSubmission?.githubLink) {
                    return (
                      <div className="mt-3 flex gap-2">
                        <a href={selectedReg.projectSubmission.githubLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 hover:underline">
                          <ExternalLink size={10} /> GitHub
                        </a>
                        {selectedReg.projectSubmission.liveDemoLink && (
                          <a href={selectedReg.projectSubmission.liveDemoLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1 hover:underline">
                            <ExternalLink size={10} /> Live Demo
                          </a>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <button 
              onClick={() => handleRemoveWinner(index)}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Remove Winner"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleAddWinner}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition-colors"
      >
        <Plus size={20} /> Add Winner
      </button>

      <div className="flex gap-4 pt-4">
        <button 
          onClick={() => handleSaveResults(false)}
          disabled={saving}
          className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save size={18} /> Save Draft
        </button>
        <button 
          onClick={() => handleSaveResults(true)}
          disabled={saving}
          className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-amber-600 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Trophy size={18} /> Publish Results
        </button>
      </div>

    </div>
  );
}

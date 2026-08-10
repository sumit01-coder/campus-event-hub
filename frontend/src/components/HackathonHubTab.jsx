import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, FileText, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function HackathonHubTab({ event, setEvent, registrations, setRegistrations }) {
  const [isEditing, setIsEditing] = useState(false);
  const [problemStatements, setProblemStatements] = useState(event.problemStatements || []);

  const handleSaveProblemStatements = async () => {
    try {
      const res = await api.put(`/events/${event._id}`, { ...event, problemStatements });
      setEvent(res.data);
      toast.success('Problem statements updated!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update problem statements');
    }
  };

  const handleAddStatement = () => {
    setProblemStatements([...problemStatements, { title: '', description: '', maxTeams: 0 }]);
  };

  const handleUpdateStatement = (index, field, value) => {
    const updated = [...problemStatements];
    updated[index][field] = value;
    setProblemStatements(updated);
  };

  const handleRemoveStatement = (index) => {
    const updated = problemStatements.filter((_, i) => i !== index);
    setProblemStatements(updated);
  };

  const handleAssignProblem = async (registrationId, problemId) => {
    try {
      const res = await api.put(`/registrations/${registrationId}/assign`, { assignedProblemId: problemId });
      setRegistrations(registrations.map(r => r._id === registrationId ? res.data : r));
      toast.success('Problem assigned successfully!');
    } catch (error) {
      toast.error('Failed to assign problem');
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 flex flex-col gap-8">
      {/* Settings Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Problem Statements</h2>
            <p className="text-gray-500 text-sm">Define the challenges for your hackathon</p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
              <Edit2 size={16} /> Edit Problems
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setProblemStatements(event.problemStatements || []); setIsEditing(false); }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveProblemStatements} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {problemStatements.length === 0 && !isEditing ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              No problem statements defined yet.
            </div>
          ) : (
            problemStatements.map((ps, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4">
                <div className="flex-1 space-y-3">
                  {isEditing ? (
                    <>
                      <input 
                        type="text" 
                        value={ps.title} 
                        onChange={e => handleUpdateStatement(index, 'title', e.target.value)}
                        placeholder="Problem Title"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                      <textarea 
                        value={ps.description} 
                        onChange={e => handleUpdateStatement(index, 'description', e.target.value)}
                        placeholder="Problem Description / Rules"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 text-sm h-20 resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Max Teams Allowed:</span>
                        <input 
                          type="number" 
                          value={ps.maxTeams} 
                          onChange={e => handleUpdateStatement(index, 'maxTeams', Number(e.target.value))}
                          className="w-24 px-3 py-1 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                        <span className="text-xs text-gray-500">(0 = unlimited)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-gray-900">{ps.title}</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{ps.description}</p>
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-100 inline-block px-2 py-1 rounded-md mt-2">
                        Limit: {ps.maxTeams === 0 ? 'Unlimited' : `${ps.maxTeams} Teams`}
                      </div>
                    </>
                  )}
                </div>
                {isEditing && (
                  <button onClick={() => handleRemoveStatement(index)} className="text-red-500 hover:text-red-700 p-2 h-fit rounded-lg hover:bg-red-50">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))
          )}
          {isEditing && (
            <button onClick={handleAddStatement} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
              <Plus size={20} /> Add Problem Statement
            </button>
          )}
        </div>
      </div>

      {/* Team Assignments Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Team Assignments & Submissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-xs">
                <th className="px-4 py-3 rounded-tl-lg">Team/Participant</th>
                <th className="px-4 py-3">Preferences</th>
                <th className="px-4 py-3">Assigned Problem</th>
                <th className="px-4 py-3 rounded-tr-lg">Project Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.filter(r => r.participationType === 'individual' || r.isTeamLeader).map(reg => (
                <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-bold text-gray-900">
                    {reg.participationType === 'group' ? `Team: ${reg.teamCode}` : reg.participantName}
                    <div className="text-xs text-gray-500 font-normal">{reg.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    {reg.preferences && reg.preferences.length > 0 ? (
                      <div className="space-y-1">
                        {reg.preferences.map((prefId, idx) => {
                          const ps = event.problemStatements?.find(p => p._id === prefId);
                          return <div key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 truncate max-w-[200px]">{idx + 1}. {ps?.title || 'Unknown'}</div>;
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">No preferences selected</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <select 
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 bg-white"
                      value={reg.assignedProblemId || ''}
                      onChange={(e) => handleAssignProblem(reg._id, e.target.value)}
                    >
                      <option value="">-- Assign Problem --</option>
                      {event.problemStatements?.map(ps => (
                        <option key={ps._id} value={ps._id}>{ps.title}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    {reg.projectSubmission && reg.projectSubmission.submittedAt ? (
                      <div className="flex flex-col gap-1">
                        {reg.projectSubmission.githubLink && (
                          <a href={reg.projectSubmission.githubLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><FileText size={12}/> GitHub Repo</a>
                        )}
                        {reg.projectSubmission.liveDemoLink && (
                          <a href={reg.projectSubmission.liveDemoLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Eye size={12}/> Live Demo</a>
                        )}
                        <span className="text-[10px] text-gray-500">Submitted: {new Date(reg.projectSubmission.submittedAt).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs flex items-center gap-1"><Clock size={12}/> Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

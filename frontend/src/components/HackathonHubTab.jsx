import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, FileText, CheckCircle2, Clock, FileUp, Loader2, Info, Code, ExternalLink } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function HackathonHubTab({ event, setEvent, registrations, setRegistrations }) {
  const [isEditing, setIsEditing] = useState(false);
  const [problemStatements, setProblemStatements] = useState(event.problemStatements || []);
  const [maxPreferences, setMaxPreferences] = useState(event.maxPreferences || 3);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [expandedProblems, setExpandedProblems] = useState({});
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [unlockedAssignments, setUnlockedAssignments] = useState({});
  const [isProblemStatementsOpen, setIsProblemStatementsOpen] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    setIsUploadingPdf(true);
    try {
      const res = await api.post('/events/extract-problems', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data && res.data.length > 0) {
        setProblemStatements(prev => [...prev, ...res.data]);
        toast.success(`Successfully extracted ${res.data.length} problem statements!`);
      } else {
        toast.error('No problem statements found in the PDF.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to extract PDF data');
    } finally {
      setIsUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const toggleExpand = (index) => {
    setExpandedProblems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSaveProblemStatements = async () => {
    try {
      const res = await api.put(`/events/${event._id}`, { ...event, problemStatements, maxPreferences });
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
    if (!problemId) {
      toast.error('Please select a problem statement first');
      return;
    }
    try {
      const res = await api.put(`/registrations/${registrationId}/assign`, { assignedProblemId: problemId });
      setRegistrations(registrations.map(r => r._id === registrationId ? res.data : r));
      
      // Clear pending and unlocked states for this registration
      setPendingAssignments(prev => {
        const next = { ...prev };
        delete next[registrationId];
        return next;
      });
      setUnlockedAssignments(prev => {
        const next = { ...prev };
        delete next[registrationId];
        return next;
      });
      
      toast.success('Problem assigned and locked successfully!');
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
              <button onClick={() => { 
                setProblemStatements(event.problemStatements || []); 
                setMaxPreferences(event.maxPreferences || 3);
                setIsEditing(false); 
              }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveProblemStatements} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Global Problem Statement Settings */}
        <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-indigo-900 text-sm">Max Preferences per Participant</h3>
            <p className="text-xs text-indigo-700 mt-0.5">How many problem statements can each student select? (0 = unlimited)</p>
          </div>
          {isEditing ? (
            <input 
              type="number" 
              value={maxPreferences} 
              onChange={e => setMaxPreferences(Number(e.target.value))}
              min="0"
              className="w-20 px-3 py-1.5 rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-500 text-sm font-bold text-center"
            />
          ) : (
            <div className="bg-white px-4 py-1.5 rounded-lg border border-indigo-200 font-bold text-indigo-700">
              {maxPreferences}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <button
            onClick={() => setIsProblemStatementsOpen(prev => !prev)}
            className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Problem Statements</h2>
                <p className="text-sm font-medium text-gray-500">Manage {problemStatements.length} statements</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 transition-transform duration-300 group-hover:bg-gray-100 ${isProblemStatementsOpen ? 'rotate-180' : 'rotate-0'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </button>
          
          <div className={`transition-all duration-500 ease-in-out ${isProblemStatementsOpen ? 'max-h-[2000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="px-6 md:px-8 pb-8 border-t border-gray-50 pt-6 space-y-4">
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
                      <div className="mt-1">
                        <p className={`text-sm text-gray-600 whitespace-pre-wrap ${!expandedProblems[index] ? 'line-clamp-2' : ''}`}>
                          {ps.description}
                        </p>
                        {ps.description && ps.description.length > 120 && (
                          <button 
                            onClick={() => toggleExpand(index)}
                            className="text-indigo-600 text-xs font-bold mt-1 hover:underline focus:outline-none"
                          >
                            {expandedProblems[index] ? 'Show Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                      <div 
                        className="text-xs font-bold text-indigo-600 bg-indigo-100 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md mt-2 cursor-help"
                        title={ps.maxTeams === 0 ? "Unlimited: Any number of teams can choose this problem" : `Limit: Only ${ps.maxTeams} teams can choose this problem`}
                      >
                        Limit: {ps.maxTeams === 0 ? 'Unlimited' : `${ps.maxTeams} Teams`}
                        <Info size={14} className="opacity-70" />
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
            <div className="flex gap-4">
              <button onClick={handleAddStatement} className="flex-1 py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                <Plus size={20} /> Add Problem Statement
              </button>
              
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploadingPdf}
                className="flex-1 py-3 bg-indigo-50 border-2 border-dashed border-indigo-200 text-indigo-700 font-bold rounded-xl hover:border-indigo-400 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isUploadingPdf ? <Loader2 className="animate-spin" size={20} /> : <FileUp size={20} />}
                {isUploadingPdf ? 'Extracting Data...' : 'Upload PDF'}
              </button>
            </div>
          )}
            </div>
          </div>
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
                      <div className="flex flex-col gap-2">
                        {reg.preferences.map((prefId, idx) => {
                          const ps = event.problemStatements?.find(p => p._id === prefId);
                          return (
                            <div key={idx} className="flex items-center gap-2 max-w-[220px]">
                              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="text-xs text-gray-700 truncate font-medium" title={ps?.title}>
                                {ps?.title || 'Unknown'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">No preferences selected</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {reg.assignedProblemId && !unlockedAssignments[reg._id] ? (
                      <div className="flex items-center justify-between bg-green-50/80 border border-green-200 rounded-lg p-2 gap-3 min-w-[240px]">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                          <span className="text-sm font-bold text-green-800 truncate" title={event.problemStatements?.find(p => p._id === reg.assignedProblemId)?.title}>
                            {event.problemStatements?.find(p => p._id === reg.assignedProblemId)?.title || 'Assigned'}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setUnlockedAssignments(prev => ({ ...prev, [reg._id]: true }));
                            setPendingAssignments(prev => ({ ...prev, [reg._id]: reg.assignedProblemId }));
                          }}
                          className="flex-shrink-0 bg-white border border-green-200 text-[10px] uppercase tracking-wider text-green-700 font-bold px-2 py-1 hover:bg-green-100 rounded transition-colors shadow-sm"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 bg-white flex-1 min-w-[200px]"
                          value={pendingAssignments[reg._id] !== undefined ? pendingAssignments[reg._id] : (reg.assignedProblemId || '')}
                          onChange={(e) => setPendingAssignments(prev => ({ ...prev, [reg._id]: e.target.value }))}
                        >
                          <option value="">-- Select Problem --</option>
                          {event.problemStatements?.map(ps => (
                            <option key={ps._id} value={ps._id}>{ps.title}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssignProblem(reg._id, pendingAssignments[reg._id] !== undefined ? pendingAssignments[reg._id] : reg.assignedProblemId)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Save size={14} /> Save
                        </button>
                        {unlockedAssignments[reg._id] && (
                          <button 
                            onClick={() => {
                              setUnlockedAssignments(prev => {
                                const next = { ...prev };
                                delete next[reg._id];
                                return next;
                              });
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Cancel Edit"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {reg.projectSubmission && reg.projectSubmission.submittedAt ? (
                      <div className="flex flex-col gap-2">
                        {reg.projectSubmission.githubLink && (
                          <a href={reg.projectSubmission.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1.5 rounded-md w-fit">
                            <Code size={14}/> GitHub Repo
                          </a>
                        )}
                        {reg.projectSubmission.liveDemoLink && (
                          <a href={reg.projectSubmission.liveDemoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1.5 rounded-md w-fit">
                            <ExternalLink size={14}/> Live Demo
                          </a>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1">
                          <Clock size={12}/> {new Date(reg.projectSubmission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-md"><Clock size={14}/> Pending</span>
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

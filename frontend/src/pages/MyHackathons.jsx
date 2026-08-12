import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Code, CheckCircle, Clock, Save, Info, AlertCircle, Users, ExternalLink, FileText, Send, Edit2, Trophy, Medal } from 'lucide-react';
import { useContext } from 'react';
import { SidebarContext } from '../context/SidebarContext';

export default function MyHackathons() {
  const { isOpen } = useContext(SidebarContext);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [expandedProblems, setExpandedProblems] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [editingSubmission, setEditingSubmission] = useState({});

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const { data } = await api.get('/registrations/my-registrations');
      // Filter only hackathons
      const myHackathons = data.filter(event => event.isHackathon === true);
      setHackathons(myHackathons);
    } catch (error) {
      toast.error('Failed to load your hackathons');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (eventObj, problemId) => {
    setHackathons(prev => prev.map(event => {
      if (event._id === eventObj._id) {
        const currentPrefs = event.userReg.preferences || [];
        let newPrefs;
        if (currentPrefs.includes(problemId)) {
          newPrefs = currentPrefs.filter(id => id !== problemId);
        } else {
          // Check limit before adding
          const max = event.maxPreferences !== undefined ? event.maxPreferences : 3;
          if (max > 0 && currentPrefs.length >= max) {
            toast.error(`You can only select up to ${max} preferences.`);
            return event; // Do not update state
          }
          newPrefs = [...currentPrefs, problemId];
        }
        return {
          ...event,
          userReg: {
            ...event.userReg,
            preferences: newPrefs
          }
        };
      }
      return event;
    }));
  };

  const savePreferences = async (eventId, registrationId, preferences) => {
    setSaving(prev => ({ ...prev, [eventId]: true }));
    try {
      await api.put(`/registrations/${registrationId}/preferences`, { preferences });
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const toggleExpand = (e, problemId) => {
    e.stopPropagation();
    setExpandedProblems(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  const handleSubmissionChange = (eventId, field, value) => {
    setSubmissions(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value
      }
    }));
  };

  const handleSubmitProject = async (registrationId, eventId) => {
    const submissionData = submissions[eventId];
    if (!submissionData || !submissionData.githubLink) {
      toast.error('GitHub Link is required');
      return;
    }
    
    setSubmitting(prev => ({ ...prev, [eventId]: true }));
    try {
      const res = await api.put(`/registrations/${registrationId}/submit`, submissionData);
      setHackathons(prev => prev.map(event => 
        event._id === eventId ? { ...event, userReg: res.data } : event
      ));
      setEditingSubmission(prev => ({ ...prev, [eventId]: false }));
      toast.success('Project submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit project');
    } finally {
      setSubmitting(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <div className={`min-h-screen bg-[#F5F5F7] pt-20 transition-all duration-300 pl-0 ${isOpen ? 'md:pl-64' : 'md:pl-[72px]'}`}>
      <Navbar />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1200px] mx-auto w-full">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <Code className="text-primary" size={32} />
              My Hackathons
            </h1>
            <p className="text-gray-500 mt-2">Manage your hackathon enrollments and select your preferred problem statements.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="bg-white rounded-[24px] p-12 text-center border border-gray-100 shadow-sm">
              <Code size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Hackathons Found</h3>
              <p className="text-gray-500">You haven't enrolled in any hackathons yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {hackathons.map((event) => {
                const prefs = event.userReg.preferences || [];
                const isAssigned = !!event.userReg.assignedProblemId;
                
                return (
                  <div key={event._id} className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Event Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Hackathon
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${event.registrationStatus === 'registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {event.registrationStatus}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">{new Date(event.date).toLocaleDateString()} • {event.venue}</p>
                      </div>
                      
                      <button 
                        onClick={() => savePreferences(event._id, event.userReg._id, prefs)}
                        disabled={saving[event._id] || isAssigned}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving[event._id] ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        {isAssigned ? 'Problem Assigned' : 'Save Preferences'}
                      </button>
                    </div>

                    {/* Event Results Section */}
                    {event.results?.isReleased && event.results.winners?.length > 0 && (
                      <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-br from-amber-50 to-orange-50">
                        <div className="flex items-center gap-3 mb-6">
                          <Trophy className="text-amber-500" size={28} />
                          <h3 className="text-2xl font-black text-amber-900">Event Results</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {event.results.winners.map((winner, idx) => {
                            const isMe = winner.registrationId === event.userReg._id;
                            return (
                              <div key={idx} className={`p-5 rounded-xl border-2 flex flex-col items-center text-center relative ${isMe ? 'bg-amber-100 border-amber-400 shadow-md' : 'bg-white border-amber-100 shadow-sm'}`}>
                                {isMe && (
                                  <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                                    You Won!
                                  </div>
                                )}
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-3 border border-amber-200">
                                  {idx === 0 ? <Trophy size={20} /> : <Medal size={20} />}
                                </div>
                                <h4 className="font-black text-amber-900 text-lg">{winner.position}</h4>
                                <p className="text-amber-700/80 font-medium text-sm mt-1">{winner.registrationId === event.userReg._id ? 'You / Your Team' : 'Winner ID: ' + winner.registrationId.substring(0, 8)}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Problem Statements Section */}
                    <div className="p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Problem Statements
                          </h3>
                          {!isAssigned && (
                            <p className="text-sm text-gray-500 mt-1">
                              {event.maxPreferences === 0 
                                ? 'Select as many preferences as you like.'
                                : <>Select up to <span className="font-bold text-gray-700">{event.maxPreferences !== undefined ? event.maxPreferences : 3}</span> preferences.</>
                              }
                            </p>
                          )}
                        </div>
                        {isAssigned && (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium">
                              <CheckCircle size={16} />
                              You have been assigned a problem!
                            </div>
                            <button 
                              onClick={() => toast.success('Change request sent to the event organizer!')}
                              className="text-xs font-bold text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              Request Change
                            </button>
                          </div>
                        )}
                      </div>

                      {event.problemStatements && event.problemStatements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {event.problemStatements
                            .filter(problem => !isAssigned || problem._id === event.userReg.assignedProblemId)
                            .map((problem) => {
                              const isSelected = prefs.includes(problem._id);
                              const isThisAssigned = event.userReg.assignedProblemId === problem._id;

                              let borderClass = 'border-gray-200 hover:border-primary/40';
                              if (isSelected) borderClass = 'border-primary ring-1 ring-primary';
                              if (isThisAssigned) borderClass = 'border-green-500 ring-2 ring-green-500 bg-green-50/30';

                            return (
                              <div 
                                key={problem._id} 
                                onClick={() => !isAssigned && handlePreferenceChange(event, problem._id)}
                                className={`p-5 rounded-2xl border-2 transition-all ${!isAssigned && 'cursor-pointer'} ${borderClass}`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                      {problem.title}
                                      {isThisAssigned && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Assigned</span>}
                                    </h4>
                                    <div className="mt-2">
                                      <p className={`text-sm text-gray-600 whitespace-pre-wrap ${!expandedProblems[problem._id] ? 'line-clamp-3' : ''}`}>
                                        {problem.description}
                                      </p>
                                      {problem.description && problem.description.length > 150 && (
                                        <button 
                                          onClick={(e) => toggleExpand(e, problem._id)}
                                          className="text-primary text-xs font-bold mt-1 hover:underline focus:outline-none"
                                        >
                                          {expandedProblems[problem._id] ? 'Show Less' : 'Read More'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Custom Checkbox */}
                                  {!isAssigned && (
                                    <div className={`flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                                      {isSelected && <CheckCircle size={16} strokeWidth={3} />}
                                    </div>
                                  )}
                                </div>
                                {problem.maxTeams > 0 && (
                                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <Users size={14} />
                                    Max Teams: {problem.maxTeams}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                          <Info className="mx-auto text-gray-400 mb-2" size={24} />
                          <p className="text-gray-500">The organizer hasn't added any problem statements yet.</p>
                        </div>
                      )}
                      
                      {isAssigned && (
                        <div className="mt-8 border-t border-gray-100 pt-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Project Submission
                          </h3>
                          {event.userReg.projectSubmission?.submittedAt && !editingSubmission[event._id] ? (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                              <div className="flex items-center gap-2 text-green-600 mb-4">
                                <CheckCircle size={20} />
                                <span className="font-bold">Project Submitted</span>
                                <div className="ml-auto flex items-center gap-4">
                                  <span className="text-gray-500 text-sm font-normal">
                                    {new Date(event.userReg.projectSubmission.submittedAt).toLocaleString()}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      setSubmissions(prev => ({ ...prev, [event._id]: event.userReg.projectSubmission }));
                                      setEditingSubmission(prev => ({ ...prev, [event._id]: true }));
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                                  >
                                    <Edit2 size={14} /> Edit
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {event.userReg.projectSubmission.githubLink && (
                                  <a href={event.userReg.projectSubmission.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <Code size={16} /> GitHub Repository
                                  </a>
                                )}
                                {event.userReg.projectSubmission.liveDemoLink && (
                                  <a href={event.userReg.projectSubmission.liveDemoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <ExternalLink size={16} /> Live Demo
                                  </a>
                                )}
                                {event.userReg.projectSubmission.presentationLink && (
                                  <a href={event.userReg.projectSubmission.presentationLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <FileText size={16} /> Presentation Link
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">GitHub Repository Link *</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Code size={16} /></div>
                                    <input 
                                      type="url" 
                                      placeholder="https://github.com/your-username/repo"
                                      value={submissions[event._id]?.githubLink || ''}
                                      onChange={e => handleSubmissionChange(event._id, 'githubLink', e.target.value)}
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Live Demo URL (Optional)</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><ExternalLink size={16} /></div>
                                    <input 
                                      type="url" 
                                      placeholder="https://your-project.vercel.app"
                                      value={submissions[event._id]?.liveDemoLink || ''}
                                      onChange={e => handleSubmissionChange(event._id, 'liveDemoLink', e.target.value)}
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Presentation/Video Link (Optional)</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FileText size={16} /></div>
                                    <input 
                                      type="url" 
                                      placeholder="https://youtube.com/..."
                                      value={submissions[event._id]?.presentationLink || ''}
                                      onChange={e => handleSubmissionChange(event._id, 'presentationLink', e.target.value)}
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => handleSubmitProject(event.userReg._id, event._id)}
                                    className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                                  >
                                    <Send size={16} /> {submitting[event._id] ? 'Submitting...' : (editingSubmission[event._id] ? 'Update Project' : 'Submit Project')}
                                  </button>
                                  {editingSubmission[event._id] && (
                                    <button 
                                      onClick={() => setEditingSubmission(prev => ({ ...prev, [event._id]: false }))}
                                      className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

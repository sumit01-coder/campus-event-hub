import React, { useState } from 'react';
import { Target, Upload, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function HackathonParticipantCard({ event, registration, setRegistration }) {
  const [pref1, setPref1] = useState(registration?.preferences?.[0] || '');
  const [pref2, setPref2] = useState(registration?.preferences?.[1] || '');
  const [isSubmittingPrefs, setIsSubmittingPrefs] = useState(false);

  const [githubLink, setGithubLink] = useState(registration?.projectSubmission?.githubLink || '');
  const [liveDemoLink, setLiveDemoLink] = useState(registration?.projectSubmission?.liveDemoLink || '');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  const handleSavePreferences = async () => {
    if (!pref1 || !pref2) {
      toast.error('Please select both preferences');
      return;
    }
    if (pref1 === pref2) {
      toast.error('Preferences must be different');
      return;
    }

    setIsSubmittingPrefs(true);
    try {
      const res = await api.put(`/registrations/${registration._id}/preferences`, { preferences: [pref1, pref2] });
      toast.success('Preferences saved!');
      if (setRegistration) setRegistration(res.data);
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSubmittingPrefs(false);
    }
  };

  const handleSubmitProject = async () => {
    if (!githubLink) {
      toast.error('GitHub link is required');
      return;
    }

    setIsSubmittingProject(true);
    try {
      const res = await api.put(`/registrations/${registration._id}/submit`, { githubLink, liveDemoLink });
      toast.success('Project submitted successfully!');
      if (setRegistration) setRegistration(res.data);
    } catch (error) {
      toast.error('Failed to submit project');
    } finally {
      setIsSubmittingProject(false);
    }
  };

  if (!event || !event.isHackathon) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6 mt-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
          <Target className="text-purple-600" size={20} />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-lg">Hackathon Hub</h3>
          <p className="text-xs text-gray-500 font-medium">Manage your hackathon journey</p>
        </div>
      </div>

      {!registration.assignedProblemId ? (
        <div className="space-y-4">
          <div className="bg-purple-50 text-purple-700 p-3 rounded-lg text-sm font-medium border border-purple-100">
            Please select your top 2 problem statement preferences. The organizer will assign you one based on availability.
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Preference 1</label>
              <select 
                value={pref1} 
                onChange={e => setPref1(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="">-- Select Problem --</option>
                {event.problemStatements?.map(ps => (
                  <option key={ps._id} value={ps._id}>{ps.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Preference 2</label>
              <select 
                value={pref2} 
                onChange={e => setPref2(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="">-- Select Problem --</option>
                {event.problemStatements?.map(ps => (
                  <option key={ps._id} value={ps._id}>{ps.title}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleSavePreferences}
            disabled={isSubmittingPrefs}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2"
          >
            {isSubmittingPrefs ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            Save Preferences
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Assigned Problem</p>
            <p className="font-bold text-green-900">
              {event.problemStatements?.find(p => p._id === registration.assignedProblemId)?.title || 'Unknown Problem'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Submit Project</h4>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">GitHub Repository Link <span className="text-red-500">*</span></label>
              <input 
                type="url" 
                value={githubLink}
                onChange={e => setGithubLink(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Live Demo / Video Link (Optional)</label>
              <input 
                type="url" 
                value={liveDemoLink}
                onChange={e => setLiveDemoLink(e.target.value)}
                placeholder="https://..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button 
              onClick={handleSubmitProject}
              disabled={isSubmittingProject}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold text-sm py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 mt-2"
            >
              {isSubmittingProject ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              Submit Project
            </button>
            
            {registration.projectSubmission?.submittedAt && (
              <p className="text-xs text-center text-gray-500 font-medium">
                Last submitted: {new Date(registration.projectSubmission.submittedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

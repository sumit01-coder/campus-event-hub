import React, { useState, useEffect, useContext } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { Loader2, Search, Terminal, AlertTriangle, Info, AlertCircle, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (pageNum = 1, level = 'all') => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/admin/logs?page=${pageNum}&limit=50&level=${level}`);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
    } catch (error) {
      toast.error('Failed to load system logs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, filterLevel);
  }, [filterLevel]);

  const getLevelIcon = (level) => {
    switch(level) {
      case 'error': return <AlertCircle size={18} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getLevelBadge = (level) => {
    switch(level) {
      case 'error': return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md uppercase">Error</span>;
      case 'warning': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md uppercase">Warning</span>;
      default: return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase">Info</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Logs</h1>
            <p className="text-gray-500 mt-1">Monitor API errors, warnings, and system events</p>
          </div>
          <button 
            onClick={() => fetchLogs(page, filterLevel)}
            className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm flex items-center gap-2"
          >
            <RefreshCw size={18} /> <span className="font-medium text-sm">Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex gap-4">
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Only</option>
          </select>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Context</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <Terminal size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No logs found</p>
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{log.message}</p>
                        <p className="text-xs text-gray-400 font-mono truncate max-w-xs">{log.url}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                          {log.context}
                        </span>
                      </td>
                      <td className="p-4">
                        {log.userId ? (
                          <div>
                            <p className="text-sm font-bold text-gray-700">{log.userId.name}</p>
                            <p className="text-xs text-gray-500">{log.userId.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Guest / System</span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">{new Date(log.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="p-4">
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-500">
                Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => fetchLogs(page - 1, filterLevel)}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  onClick={() => fetchLogs(page + 1, filterLevel)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {getLevelIcon(selectedLog.level)}
                <h2 className="text-lg font-bold text-gray-900">Log Details</h2>
                {getLevelBadge(selectedLog.level)}
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Message</label>
                <div className="bg-red-50 text-red-900 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap border border-red-100">
                  {selectedLog.message}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Context</label>
                  <p className="text-sm font-medium text-gray-900">{selectedLog.context}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Timestamp</label>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedLog.url && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Request URL</label>
                  <p className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 break-all">{selectedLog.url}</p>
                </div>
              )}
              {selectedLog.userId && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Affected User</label>
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {selectedLog.userId.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedLog.userId.name}</p>
                      <p className="text-xs text-gray-500">{selectedLog.userId.email}</p>
                    </div>
                  </div>
                </div>
              )}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Additional Details</label>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, MapPin, Briefcase, Award, Check } from 'lucide-react';
import Modal from '../common/Modal';
import { assignmentApi } from '../../services/assignmentApi';
import LoadingSpinner from '../common/LoadingSpinner';

export default function WorkerAssignmentModal({
  isOpen,
  onClose,
  issue,
  onAssigned,
}) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen && issue?._id) {
      fetchRecommendations();
    }
  }, [isOpen, issue]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await assignmentApi.getRecommendations(issue._id);
      if (res.success && res.recommendations) {
        setRecommendations(res.recommendations);
        if (res.recommendations.rankedCandidates?.length > 0) {
          setSelectedWorkerId(res.recommendations.rankedCandidates[0].workerId);
        }
      }
    } catch (err) {
      console.error('Failed to load worker recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedWorkerId) return;
    setAssigning(true);
    try {
      const res = await assignmentApi.assignWorker({
        issueId: issue._id,
        workerId: selectedWorkerId,
        notes: adminNotes,
      });
      if (res.success) {
        onAssigned(res);
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intelligent Field Worker Dispatch"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-400">Target Issue:</div>
            <div className="text-sm font-bold text-white line-clamp-1">{issue?.title}</div>
            <div className="text-xs text-cyan-400 mt-0.5">Category: {issue?.category}</div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {issue?.priorityLevel} Priority
          </span>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>AI Ranked Candidate Recommendations</span>
          </div>

          {loading ? (
            <LoadingSpinner text="Evaluating worker skill match, GPS proximity, and live workload..." />
          ) : recommendations?.rankedCandidates?.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No active field technicians found in this zone.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {recommendations?.rankedCandidates?.map((worker, index) => {
                const isSelected = selectedWorkerId === worker.workerId;
                const isTopPick = index === 0;

                return (
                  <div
                    key={worker.workerId}
                    onClick={() => setSelectedWorkerId(worker.workerId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-glow'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{worker.name}</span>
                            {isTopPick && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                Best Match
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>📍 {worker.distanceKm} km away</span>
                            <span>•</span>
                            <span>📋 {worker.currentWorkload} active tasks</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-blue-400">
                          {worker.suitabilityScore}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Suitability</div>
                      </div>
                    </div>

                    {/* Recommendation reasons bullets */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {worker.reasons.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dispatch Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Admin Instructions / Equipment Directives (Optional)
          </label>
          <input
            type="text"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="e.g. Bring cold-mix asphalt, high-visibility barricades required."
            className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedWorkerId || assigning}
            onClick={handleAssign}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {assigning ? 'Dispatching...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

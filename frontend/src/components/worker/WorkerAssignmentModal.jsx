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
      title="Field Worker Dispatch"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-slate-800">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500">Target Complaint:</div>
            <div className="text-sm font-bold text-slate-900 line-clamp-1">{issue?.title}</div>
            <div className="text-xs text-slate-600 mt-0.5">Category: {issue?.category}</div>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            {issue?.priorityLevel} Priority
          </span>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Recommended Technicians</span>
          </div>

          {loading ? (
            <LoadingSpinner text="Evaluating technician skills, location proximity, and current workload..." />
          ) : recommendations?.rankedCandidates?.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              No active field technicians found in this zone.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {recommendations?.rankedCandidates?.map((worker, index) => {
                const isSelected = selectedWorkerId === worker.workerId;
                const isTopPick = index === 0;

                return (
                  <div
                    key={worker.workerId}
                    onClick={() => setSelectedWorkerId(worker.workerId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{worker.name}</span>
                            {isTopPick && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>📍 {worker.distanceKm} km away</span>
                            <span>•</span>
                            <span>📋 {worker.currentWorkload} active task(s)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-700">
                          {worker.suitabilityScore}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Match</div>
                      </div>
                    </div>

                    {/* Recommendation reasons */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {worker.reasons.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
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
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Admin Instructions / Equipment Directives (Optional)
          </label>
          <input
            type="text"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="e.g. Bring cold-mix asphalt, high-visibility barricades required."
            className="w-full text-xs px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedWorkerId || assigning}
            onClick={handleAssign}
            className="px-4 py-2 rounded-lg font-semibold text-xs bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {assigning ? 'Dispatching...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

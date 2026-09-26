import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Star } from 'lucide-react';
import Modal from '../common/Modal';

export default function CitizenVerificationModal({
  isOpen,
  onClose,
  issueTitle,
  onVerify,
  submitting,
}) {
  const [verificationChoice, setVerificationChoice] = useState('verified_resolved');
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  const handleConfirm = () => {
    onVerify({
      verificationStatus: verificationChoice,
      citizenNotes: verificationChoice === 'disputed_unresolved' ? reopenReason : notes,
      rating,
      feedbackText: notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Work Resolution"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-slate-800">
        <div>
          <div className="text-xs text-slate-500">Reported Issue:</div>
          <div className="font-semibold text-sm text-slate-900 mt-0.5">
            "{issueTitle}"
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            The assigned municipal crew has marked this issue as resolved. Please verify if the repair has been satisfactorily completed at the location.
          </p>
        </div>

        {/* 3 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setVerificationChoice('verified_resolved')}
            className={`p-3 rounded-lg border text-left sm:text-center flex flex-col items-start sm:items-center gap-1 transition-all ${
              verificationChoice === 'verified_resolved'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold mt-0.5">Fully Resolved</span>
            <span className="text-[10px] text-slate-500">Work completed</span>
          </button>

          <button
            type="button"
            onClick={() => setVerificationChoice('partially_resolved')}
            className={`p-3 rounded-lg border text-left sm:text-center flex flex-col items-start sm:items-center gap-1 transition-all ${
              verificationChoice === 'partially_resolved'
                ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold mt-0.5">Partially Fixed</span>
            <span className="text-[10px] text-slate-500">Remaining items</span>
          </button>

          <button
            type="button"
            onClick={() => setVerificationChoice('disputed_unresolved')}
            className={`p-3 rounded-lg border text-left sm:text-center flex flex-col items-start sm:items-center gap-1 transition-all ${
              verificationChoice === 'disputed_unresolved'
                ? 'bg-rose-50 border-rose-600 text-rose-900 ring-1 ring-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <XCircle className="w-5 h-5 text-rose-600" />
            <span className="text-xs font-bold mt-0.5">Not Resolved</span>
            <span className="text-[10px] text-slate-500">Reopen ticket</span>
          </button>
        </div>

        {/* Dynamic feedback inputs */}
        {verificationChoice === 'disputed_unresolved' ? (
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-rose-800">
              Reason for Reopening (Required)
            </label>
            <textarea
              rows={3}
              required
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Please describe why the issue is still present or needs additional repairs..."
              className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-rose-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
            <p className="text-[11px] text-slate-500">
              This will notify the department supervisor and schedule a re-inspection.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satisfaction Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-105 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-medium text-slate-700 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feedback Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any comments regarding the work done..."
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
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
            disabled={
              submitting ||
              (verificationChoice === 'disputed_unresolved' && !reopenReason.trim())
            }
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-semibold text-xs text-white shadow-xs transition-colors disabled:opacity-50 ${
              verificationChoice === 'disputed_unresolved'
                ? 'bg-rose-700 hover:bg-rose-800'
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {submitting
              ? 'Submitting...'
              : verificationChoice === 'disputed_unresolved'
              ? 'Reopen Complaint'
              : 'Confirm & Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

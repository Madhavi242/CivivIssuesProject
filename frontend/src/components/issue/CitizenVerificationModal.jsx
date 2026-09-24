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
      title="Verify Resolution: Citizen Confirmation"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        <div>
          <div className="text-xs text-slate-400">Issue:</div>
          <div className="font-semibold text-sm text-slate-100 mt-0.5">
            "{issueTitle}"
          </div>
          <p className="text-xs text-slate-400 mt-2">
            The assigned field worker has marked this civic issue as resolved. As the citizen reporter, your verification decides whether this issue is officially closed or reopened for department review.
          </p>
        </div>

        {/* 3 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setVerificationChoice('verified_resolved')}
            className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
              verificationChoice === 'verified_resolved'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-glow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">Fully Resolved</span>
            <span className="text-[10px] opacity-75">Work verified satisfactory</span>
          </button>

          <button
            type="button"
            onClick={() => setVerificationChoice('partially_resolved')}
            className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
              verificationChoice === 'partially_resolved'
                ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-glow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold">Partially Resolved</span>
            <span className="text-[10px] opacity-75">Remaining work noted</span>
          </button>

          <button
            type="button"
            onClick={() => setVerificationChoice('disputed_unresolved')}
            className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
              verificationChoice === 'disputed_unresolved'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-glow-danger'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <XCircle className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-bold">Not Resolved</span>
            <span className="text-[10px] opacity-75">Reopen issue for review</span>
          </button>
        </div>

        {/* Dynamic feedback inputs */}
        {verificationChoice === 'disputed_unresolved' ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Reason for Disputing Resolution (Required to Reopen)
            </label>
            <textarea
              rows={3}
              required
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Explain why the physical issue is still present or improperly fixed..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-rose-500/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-rose-300/80">
              ⚠️ This will immediately transition the status back to "Reopened" and notify the Department Admin!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Resolution Satisfaction Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Citizen Feedback & Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your experience or thank the municipal field crew..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
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
            disabled={
              submitting ||
              (verificationChoice === 'disputed_unresolved' && !reopenReason.trim())
            }
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-glow transition-all active:scale-95 disabled:opacity-50 ${
              verificationChoice === 'disputed_unresolved'
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {submitting
              ? 'Processing...'
              : verificationChoice === 'disputed_unresolved'
              ? 'Reopen Civic Issue'
              : 'Confirm & Close Issue'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Wrench, X } from 'lucide-react';
import Modal from '../common/Modal';

export default function ResolutionEvidenceModal({
  isOpen,
  onClose,
  issue,
  targetStatus = 'Resolved',
  onSubmit,
  submitting,
}) {
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemove = () => {
    setImageFile(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('status', targetStatus);
    formData.append('comment', comment);
    if (imageFile) {
      formData.append('evidence', imageFile);
    }
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={targetStatus === 'Resolved' ? 'Complete & Mark Issue as Resolved' : 'Begin Work on Issue'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="text-xs text-slate-400">Issue:</div>
          <div className="font-semibold text-sm text-white mt-0.5">{issue?.title}</div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {targetStatus === 'Resolved' ? 'Resolution Work Evidence Photo *' : 'Work-In-Progress Photo (Optional)'}
          </label>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700">
              <img src={preview} alt="Work Evidence" className="w-full h-44 object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors">
              <UploadCloud className="w-8 h-8 text-blue-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-300">
                Upload completion / repair photo
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Work Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Technician Notes & Actions Taken *
          </label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              targetStatus === 'Resolved'
                ? 'e.g. Cleared 45kg debris, sealed pipe joint with epoxy gasket, water pressure tested.'
                : 'e.g. Arrived on site, deploying barricades and heavy tools.'
            }
            className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || (targetStatus === 'Resolved' && !comment.trim())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {targetStatus === 'Resolved' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Wrench className="w-4 h-4" />
            )}
            <span>
              {submitting
                ? 'Updating...'
                : targetStatus === 'Resolved'
                ? 'Mark as Resolved'
                : 'Mark as In Progress'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

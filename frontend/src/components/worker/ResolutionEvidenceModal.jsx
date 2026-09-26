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
          <div className="text-xs text-slate-500">Target Issue:</div>
          <div className="font-semibold text-sm text-slate-900 mt-0.5">{issue?.title}</div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {targetStatus === 'Resolved' ? 'Resolution Work Evidence Photo *' : 'Work-In-Progress Photo (Optional)'}
          </label>

          {preview ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-300">
              <img src={preview} alt="Work Evidence" className="w-full h-44 object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-700 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-7 h-7 text-blue-700 mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">
                Upload completion / repair photo
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">JPEG, PNG up to 10MB</span>
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
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
            className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || (targetStatus === 'Resolved' && !comment.trim())}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors disabled:opacity-50"
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

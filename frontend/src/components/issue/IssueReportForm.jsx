import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Send,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { issueApi } from '../../services/issueApi';
import { CATEGORIES, ZONES } from '../../utils/constants';
import LocationPicker from '../map/LocationPicker';
import DuplicateModal from './DuplicateModal';
import { useNotifications } from '../../context/NotificationContext';

export default function IssueReportForm() {
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'auto',
    zone: 'Zone 3 - Central',
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Near Metro Station, MG Road',
    safetyRisk: 5,
    severity: 5,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Duplicate detection state
  const [duplicateData, setDuplicateData] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Trigger AI preview classification debounce
  useEffect(() => {
    if (!formData.title || formData.title.length < 5) return;

    const timeout = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await issueApi.previewIssue({
          title: formData.title,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
        });

        if (res.success && res.aiAnalysis) {
          setAiAnalysis(res.aiAnalysis);
          if (formData.category === 'auto') {
            setFormData((prev) => ({
              ...prev,
              safetyRisk: res.aiAnalysis.safetyRisk || prev.safetyRisk,
            }));
          }
        }

        if (res.duplicateCheck?.isDuplicateLikely) {
          setDuplicateData(res.duplicateCheck.topMatch);
        } else {
          setDuplicateData(null);
        }
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [formData.title, formData.description, formData.latitude, formData.longitude]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e, forceCreate = false) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      addToast('Please enter an issue title', 'error');
      return;
    }

    if (!formData.description.trim()) {
      addToast('Please enter an issue description', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append(
        'category',
        formData.category === 'auto'
          ? aiAnalysis?.category || 'Road damage'
          : formData.category
      );
      data.append('zone', formData.zone);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('address', formData.address);
      data.append('safetyRiskInput', formData.safetyRisk);
      data.append('severityInput', formData.severity);
      if (forceCreate) data.append('forceCreate', 'true');

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await issueApi.createIssue(data);

      if (res.success && res.issue) {
        addToast('Civic issue submitted successfully!', 'success');
        navigate(`/issues/${res.issue._id}`);
      }
    } catch (err) {
      if (err.status === 409 && err.data?.duplicateDetected) {
        setDuplicateData(err.data.existingIssue);
        setShowDuplicateModal(true);
      } else {
        addToast(err.message || 'Failed to submit issue', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupportExisting = async (issueId) => {
    try {
      setSubmitting(true);
      const res = await issueApi.supportIssue(issueId);
      if (res.success) {
        addToast('Supported existing issue! Priority escalated.', 'success');
        setShowDuplicateModal(false);
        navigate(`/issues/${issueId}`);
      }
    } catch (err) {
      addToast(err.message || 'Could not support issue', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Report a Civic Issue
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          CivicPulse uses multimodal AI to classify reports, detect existing complaints, and calculate dynamic priority for rapid resolution.
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Deep Hazardous Pothole near Metro Gate"
                className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the problem, approximate dimensions, and immediate safety impact on pedestrians or vehicles..."
                className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* AI Category Suggestion Banner */}
            {aiAnalysis && (
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 animate-fadeIn">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-cyan-300 flex items-center gap-2">
                    <span>AI Detected Category: {aiAnalysis.category}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                      {Math.round(aiAnalysis.confidence * 100)}% Confidence
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Suggested Department: <span className="text-white font-medium">{aiAnalysis.departmentCode}</span>
                  </div>
                  {aiAnalysis.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aiAnalysis.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Duplicate Preview Alert */}
            {duplicateData && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-amber-300">Potential Duplicate Detected!</div>
                    <div className="text-slate-300 line-clamp-1 mt-0.5">"{duplicateData.title}"</div>
                    <div className="text-slate-400 mt-1">
                      📍 {duplicateData.distanceMeters || '25'} meters away • {duplicateData.supportCount || 1} Supporters
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(true)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold hover:bg-amber-500/30 shrink-0"
                >
                  Review
                </button>
              </div>
            )}

            {/* Category & Zone Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="auto">✨ Auto-Detect with AI (Recommended)</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Municipal Zone
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Severity & Safety Risk Sliders */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Priority Engine Input Factors</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Public Safety Hazard (1 - 10):</span>
                  <span className="font-bold text-amber-400">{formData.safetyRisk}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.safetyRisk}
                  onChange={(e) => setFormData({ ...formData, safetyRisk: parseInt(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Physical Damage Severity (1 - 10):</span>
                  <span className="font-bold text-cyan-400">{formData.severity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Evidence Upload & Geolocation */}
          <div className="lg:col-span-5 space-y-5">
            {/* Image Evidence Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Photo Evidence (Multimodal Input)
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
                  <img
                    src={imagePreview}
                    alt="Upload Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-900/80 text-[10px] text-emerald-400 font-medium border border-emerald-500/30">
                    ✓ Photo Ready for AI Analysis
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900">
                  <UploadCloud className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200">
                    Click to upload photo evidence
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Location Picker */}
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lng) =>
                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
              }
              address={formData.address}
              onAddressChange={(address) =>
                setFormData((prev) => ({ ...prev, address }))
              }
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-glow transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Report...' : 'Submit Civic Report'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Duplicate Resolution Modal */}
      <DuplicateModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        existingIssue={duplicateData}
        onSupportExisting={handleSupportExisting}
        onProceedAnyway={() => {
          setShowDuplicateModal(false);
          handleSubmit(null, true);
        }}
        submitting={submitting}
      />
    </div>
  );
}

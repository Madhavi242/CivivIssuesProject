import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  AlertCircle,
  X,
  Send,
  Info,
  Sliders,
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

  // Trigger preview classification debounce
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
        addToast('Civic complaint submitted successfully!', 'success');
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
        addToast('Supported existing report! Priority escalated.', 'success');
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
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Report an Issue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Submit non-emergency civic complaints directly to municipal departments. Provide clear details to help field crews locate and repair the problem.
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Deep pothole near Metro Gate 2"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue, approximate size, and any immediate impact on traffic or pedestrian safety..."
                className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* AI Category Suggestion Banner */}
            {aiAnalysis && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2.5 animate-fadeIn">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-blue-900 flex items-center gap-2">
                    <span>Suggested Category: {aiAnalysis.category}</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-medium">
                      {Math.round(aiAnalysis.confidence * 100)}% Match
                    </span>
                  </div>
                  <div className="text-blue-800">
                    Routing Department: <strong className="font-medium">{aiAnalysis.departmentCode}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Preview Alert */}
            {duplicateData && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 flex items-start justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-amber-900">Similar Existing Report Found</div>
                    <div className="text-slate-700 line-clamp-1">"{duplicateData.title}"</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      📍 Approx. {duplicateData.distanceMeters || '25'}m away • {duplicateData.supportCount || 1} Supporters
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(true)}
                  className="text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold hover:bg-amber-200 shrink-0"
                >
                  View
                </button>
              </div>
            )}

            {/* Category & Zone Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="auto">Auto-Detect from Description</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Municipal Zone
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-blue-700" />
                <span>Severity & Impact Assessment</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 text-slate-700">
                  <span>Public Safety Risk:</span>
                  <span className="font-semibold text-slate-900">{formData.safetyRisk} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.safetyRisk}
                  onChange={(e) => setFormData({ ...formData, safetyRisk: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 text-slate-700">
                  <span>Physical Damage Level:</span>
                  <span className="font-semibold text-slate-900">{formData.severity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Evidence Upload & Geolocation */}
          <div className="lg:col-span-5 space-y-4">
            {/* Image Evidence Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Photo Evidence
              </label>

              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-300 group">
                  <img
                    src={imagePreview}
                    alt="Upload Preview"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/90 text-[10px] text-emerald-800 font-semibold border border-emerald-300">
                    Photo Attached
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white hover:bg-slate-50">
                  <UploadCloud className="w-7 h-7 text-blue-700 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-800">
                    Upload Photo Evidence
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG up to 10MB
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
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm py-3 px-6 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
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

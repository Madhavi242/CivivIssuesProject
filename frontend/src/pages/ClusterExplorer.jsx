import React, { useEffect, useState } from 'react';
import { Layers, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import { issueApi } from '../services/issueApi';
import { PriorityBadge } from '../components/common/Badge';
import IssueMap from '../components/map/IssueMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function ClusterExplorer() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true);
        const res = await issueApi.getClusters();
        if (res.success && res.clusters) {
          setClusters(res.clusters);
          if (res.clusters.length > 0) {
            setSelectedCluster(res.clusters[0]);
          }
        }
      } catch (err) {
        console.error('Cluster fetch err:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Analyzing spatial clusters across municipal zones..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Layers className="w-7 h-7 text-blue-700" />
          <span>Geographic Issue Hotspots</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Identifies clusters of nearby related civic problems for efficient bulk contractor repair and road resurfacing.
        </p>
      </div>

      {clusters.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-xs sm:text-sm text-slate-600">
          No clusters currently active. Clusters form automatically when 2 or more related issues exist within 600 meters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cluster List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Hotspots ({clusters.length})
            </h2>

            <div className="space-y-3">
              {clusters.map((cluster) => {
                const isSelected = selectedCluster?._id === cluster._id;
                return (
                  <div
                    key={cluster._id}
                    onClick={() => setSelectedCluster(cluster)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 shadow-xs ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge level={cluster.priority} size="xs" />
                          <span className="text-[11px] text-slate-500 font-medium">
                            {cluster.zone}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">
                          {cluster.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold shrink-0">
                        {cluster.issueCount} Issue(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-center text-[10px]">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <span className="text-slate-500">Reported</span>
                        <div className="font-bold text-blue-700 mt-0.5">
                          {cluster.statusSummary?.reported || 0}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <span className="text-slate-500">In Progress</span>
                        <div className="font-bold text-amber-700 mt-0.5">
                          {cluster.statusSummary?.inProgress || 0}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <span className="text-slate-500">Resolved</span>
                        <div className="font-bold text-emerald-700 mt-0.5">
                          {cluster.statusSummary?.resolved || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map and Member Issues */}
          <div className="lg:col-span-7 space-y-6">
            {selectedCluster && (
              <>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{selectedCluster.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Center: {selectedCluster.centerLocation.coordinates[1]},{' '}
                        {selectedCluster.centerLocation.coordinates[0]} • Radius: {selectedCluster.radiusMeters}m
                      </p>
                    </div>
                  </div>

                  {/* Cluster map */}
                  <IssueMap
                    issues={selectedCluster.issues || []}
                    center={[
                      selectedCluster.centerLocation.coordinates[1],
                      selectedCluster.centerLocation.coordinates[0],
                    ]}
                    zoom={15}
                    height="300px"
                  />
                </div>

                {/* Member Issues List */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Hotspot Issues ({selectedCluster.issues?.length || 0})
                  </h3>

                  <div className="space-y-2">
                    {selectedCluster.issues?.map((iss) => (
                      <Link
                        key={iss._id}
                        to={`/issues/${iss._id}`}
                        className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                            {iss.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {iss.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          📍 {iss.address}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Layers, MapPin, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
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
    return <LoadingSpinner text="Analyzing spatial clusters across metropolitan zones..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Layers className="w-8 h-8 text-cyan-400" />
          <span>Geographic Issue Clusters</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          CivicPulse automatically detects correlated problems in close physical proximity, preventing fragmented municipal work orders and enabling bulk contractor dispatch.
        </p>
      </div>

      {clusters.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
          No clusters currently active. Clusters form automatically when 2 or more related issues exist within 600 meters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cluster List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Geographic Hotspots ({clusters.length})
            </h2>

            <div className="space-y-3">
              {clusters.map((cluster) => {
                const isSelected = selectedCluster?._id === cluster._id;
                return (
                  <div
                    key={cluster._id}
                    onClick={() => setSelectedCluster(cluster)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-glow'
                        : 'glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge level={cluster.priority} size="xs" />
                          <span className="text-[11px] text-slate-400 font-medium">
                            {cluster.zone}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white mt-1">
                          {cluster.name}
                        </h3>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold shrink-0">
                        {cluster.issueCount} Issues
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-[10px]">
                      <div className="bg-slate-900/60 p-1.5 rounded-lg">
                        <span className="text-slate-500">Reported</span>
                        <div className="font-bold text-blue-400 mt-0.5">
                          {cluster.statusSummary?.reported || 0}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded-lg">
                        <span className="text-slate-500">In Progress</span>
                        <div className="font-bold text-amber-400 mt-0.5">
                          {cluster.statusSummary?.inProgress || 0}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded-lg">
                        <span className="text-slate-500">Resolved</span>
                        <div className="font-bold text-emerald-400 mt-0.5">
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
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">{selectedCluster.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
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
                    height="320px"
                  />
                </div>

                {/* Member Issues List */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cluster Member Tickets ({selectedCluster.issues?.length || 0})
                  </h4>

                  <div className="space-y-2">
                    {selectedCluster.issues?.map((iss) => (
                      <Link
                        key={iss._id}
                        to={`/issues/${iss._id}`}
                        className="block p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white line-clamp-1">
                            {iss.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {iss.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
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

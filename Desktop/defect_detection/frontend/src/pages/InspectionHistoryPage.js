import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DEFECT_TYPES = ['all', 'Crazing', 'Inclusion', 'Patches', 'Pitted Surface', 'Rolled-in Scale', 'Scratches'];
const SEVERITIES   = ['all', 'Low', 'Medium', 'High'];

const severityStyle = {
  High:   'bg-red-500/15 text-red-400 border border-red-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Low:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
};

const defectColor = {
  Crazing:           '#f59e0b',
  Inclusion:         '#10b981',
  Patches:           '#06b6d4',
  'Pitted Surface':  '#f43f5e',
  'Rolled-in Scale': '#8b5cf6',
  Scratches:         '#eab308',
};

// ── CSV export helper ─────────────────────────────────────────────────────────
const exportToCSV = (records) => {
  const headers = [
    'ID', 'Image Name', 'Defect Type', 'Confidence (%)',
    'Severity', 'Detection Type', 'Inspected By', 'Metal Type', 'Timestamp'
  ];
  const rows = records.map(r => [
    r._id,
    r.imageName || r.imageFileName || '-',
    r.defectType,
    ((r.confidence || 0) * 100).toFixed(2),
    r.severity,
    r.detectionType || 'AI-Automated',
    r.inspectedBy || '-',
    r.metalType || 'Steel',
    new Date(r.createdAt).toLocaleString()
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `inspection_history_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ record, onClose }) => {
  if (!record) return null;
  const conf = ((record.confidence || 0) * 100).toFixed(1);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100 font-mono uppercase tracking-wider">
            Inspection Detail
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 text-2xl leading-none transition">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          {record.imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800">
              <img
                src={`${API_URL}${record.imageUrl}`}
                alt={record.imageName || 'Inspection'}
                className="w-full max-h-72 object-cover"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider ${severityStyle[record.severity]}`}>
                  {record.severity}
                </span>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Image Name',     value: record.imageName || record.imageFileName || '—' },
              { label: 'Defect Type',    value: record.defectType },
              { label: 'Confidence',     value: `${conf}%` },
              { label: 'Severity',       value: record.severity },
              { label: 'Metal Type',     value: record.metalType || 'Steel' },
              { label: 'Detection Type', value: record.detectionType || 'AI-Automated' },
              { label: 'Inspected By',   value: record.inspectedBy || '—' },
              { label: 'Status',         value: record.status || 'processed' },
              { label: 'Timestamp',      value: new Date(record.createdAt).toLocaleString() },
              { label: 'Record ID',      value: record._id, mono: true, span: true },
            ].map(({ label, value, mono, span }) => (
              <div key={label} className={`bg-zinc-800/60 rounded-xl p-3 ${span ? 'col-span-2' : ''}`}>
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-zinc-100 font-semibold ${mono ? 'font-mono text-xs break-all' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Confidence Bar */}
          <div className="bg-zinc-800/60 rounded-xl p-4">
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-2">Confidence Score</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: `${conf}%`,
                    backgroundColor: defectColor[record.defectType] || '#f59e0b',
                    boxShadow: `0 0 8px ${defectColor[record.defectType] || '#f59e0b'}80`
                  }}
                />
              </div>
              <span className="font-mono font-bold text-lg" style={{ color: defectColor[record.defectType] || '#f59e0b' }}>
                {conf}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const InspectionHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const isAdmin   = user?.role === 'admin';

  // Data
  const [records, setRecords]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState(null);

  // Filters
  const [search,     setSearch]     = useState('');
  const [defectType, setDefectType] = useState('all');
  const [severity,   setSeverity]   = useState('all');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');

  // Pagination
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 10;

  // Fetch stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const res = await axios.get(`${API_URL}/api/inspections/stats`);
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error('Stats error:', err.message);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page, limit });
      if (defectType !== 'all') params.append('defectType', defectType);
      if (severity   !== 'all') params.append('severity',   severity);
      if (dateFrom)              params.append('dateFrom',   dateFrom);
      if (dateTo)                params.append('dateTo',     dateTo);
      if (search.trim())         params.append('search',     search.trim());

      const res = await axios.get(`${API_URL}/api/inspections?${params}`);
      if (res.data.success) {
        setRecords(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError('Failed to load inspection records: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page, defectType, severity, dateFrom, dateTo, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [defectType, severity, dateFrom, dateTo]);

  // Search on Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchRecords(); }
  };

  // CSV export — fetch ALL matching records (no pagination)
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ page: 1, limit: 9999 });
      if (defectType !== 'all') params.append('defectType', defectType);
      if (severity   !== 'all') params.append('severity',   severity);
      if (dateFrom)              params.append('dateFrom',   dateFrom);
      if (dateTo)                params.append('dateTo',     dateTo);
      if (search.trim())         params.append('search',     search.trim());
      const res = await axios.get(`${API_URL}/api/inspections?${params}`);
      if (res.data.success) exportToCSV(res.data.data);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  // Delete (admin only)
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this inspection record?')) return;
    try {
      await axios.delete(`${API_URL}/api/inspections/${id}`);
      setRecords(prev => prev.filter(r => r._id !== id));
      if (stats) setStats(prev => ({ ...prev, totalInspections: prev.totalInspections - 1 }));
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-10 font-sans text-zinc-100">
      {selected && <DetailModal record={selected} onClose={() => setSelected(null)} />}

      <div className="container mx-auto px-4">

        {/* ── Page Header ───────────────────────────── */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-1">
            Inspection <span className="text-amber-500">History</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">
            {isAdmin ? 'All inspection records — centralized MongoDB store' : `Records for: ${user?.username}`}
          </p>
        </div>

        {/* ── Stats Row ─────────────────────────────── */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Inspections', value: stats.totalInspections, color: 'text-amber-500' },
              { label: 'Avg Confidence',    value: `${stats.avgConfidence?.toFixed(1) || 0}%`, color: 'text-emerald-500' },
              { label: 'Defect Types',      value: stats.byDefectType?.length || 0, color: 'text-cyan-500' },
              { label: 'Last Scan',         value: stats.lastInspectionAt ? new Date(stats.lastInspectionAt).toLocaleDateString() : '—', color: 'text-purple-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-colors">
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">{label}</p>
                <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters & Search ──────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="🔍 Search by filename, defect, operator..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-zinc-100 placeholder-zinc-500 font-mono text-sm px-4 py-2.5 rounded-xl outline-none transition"
              />
            </div>

            {/* Defect Type */}
            <select
              value={defectType}
              onChange={e => setDefectType(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-zinc-200 font-mono text-sm px-4 py-2.5 rounded-xl outline-none transition"
            >
              {DEFECT_TYPES.map(t => (
                <option key={t} value={t}>{t === 'all' ? '— Defect Type —' : t}</option>
              ))}
            </select>

            {/* Severity */}
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-zinc-200 font-mono text-sm px-4 py-2.5 rounded-xl outline-none transition"
            >
              {SEVERITIES.map(s => (
                <option key={s} value={s}>{s === 'all' ? '— Severity —' : s}</option>
              ))}
            </select>

            {/* Search / Reset buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => { setPage(1); fetchRecords(); }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-zinc-900 font-bold font-mono text-sm uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                Search
              </button>
              <button
                onClick={() => { setSearch(''); setDefectType('all'); setSeverity('all'); setDateFrom(''); setDateTo(''); setPage(1); }}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200 font-mono text-sm py-2.5 px-4 rounded-xl transition"
                title="Reset filters"
              >
                ↺
              </button>
            </div>
          </div>

          {/* Date range row */}
          <div className="flex flex-wrap gap-3 mt-3 items-center">
            <label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Date Range:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-zinc-300 font-mono text-sm px-3 py-2 rounded-xl outline-none transition"
            />
            <span className="text-zinc-600 font-mono text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-zinc-300 font-mono text-sm px-3 py-2 rounded-xl outline-none transition"
            />

            {/* CSV export */}
            <button
              onClick={handleExportCSV}
              className="ml-auto flex items-center gap-2 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-600/50 text-emerald-100 font-mono text-xs uppercase tracking-wider py-2 px-4 rounded-xl transition shadow-lg shadow-emerald-500/10"
            >
              <span>⬇</span> Export CSV
            </button>
          </div>
        </div>

        {/* ── Error ─────────────────────────────────── */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 font-mono text-sm px-5 py-3 rounded-xl mb-6">
            ⚠ {error}
          </div>
        )}

        {/* ── Records Table ─────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-zinc-800/80 border-b border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
            <div className="col-span-1">Thumb</div>
            <div className="col-span-3">Image / Operator</div>
            <div className="col-span-2">Defect Type</div>
            <div className="col-span-2">Confidence</div>
            <div className="col-span-1">Severity</div>
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-1 text-right">Act.</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-amber-500 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <div className="text-5xl mb-4">🗃</div>
              <p className="font-mono text-sm uppercase tracking-wider">No inspection records found</p>
              <button onClick={() => navigate('/upload')} className="mt-4 text-amber-500 hover:text-amber-400 font-mono text-xs uppercase tracking-wider transition">
                → Upload first inspection
              </button>
            </div>
          ) : (
            <div>
              {records.map((r, idx) => (
                <div
                  key={r._id}
                  onClick={() => setSelected(r)}
                  className={`grid grid-cols-12 gap-2 px-5 py-4 border-b border-zinc-800/60 hover:bg-zinc-800/40 cursor-pointer transition-colors items-center ${idx % 2 === 0 ? '' : 'bg-zinc-900/50'}`}
                >
                  {/* Thumbnail */}
                  <div className="col-span-1">
                    {r.imageUrl ? (
                      <img
                        src={`${API_URL}${r.imageUrl}`}
                        alt={r.imageName}
                        className="w-10 h-10 object-cover rounded-lg border border-zinc-700"
                        onError={e => { e.target.outerHTML = '<div class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600 text-lg">📷</div>'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600">📷</div>
                    )}
                  </div>

                  {/* Image name / operator */}
                  <div className="col-span-3 min-w-0">
                    <p className="font-mono text-xs text-zinc-200 truncate" title={r.imageName || r.imageFileName}>
                      {r.imageName || r.imageFileName || '—'}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                      👤 {r.inspectedBy || '—'}
                    </p>
                  </div>

                  {/* Defect type */}
                  <div className="col-span-2">
                    <span
                      className="font-mono text-xs font-bold px-2 py-1 rounded-md"
                      style={{
                        color: defectColor[r.defectType] || '#f59e0b',
                        backgroundColor: (defectColor[r.defectType] || '#f59e0b') + '18'
                      }}
                    >
                      {r.defectType}
                    </span>
                  </div>

                  {/* Confidence bar */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${((r.confidence || 0) * 100).toFixed(0)}%`,
                            backgroundColor: defectColor[r.defectType] || '#f59e0b'
                          }}
                        />
                      </div>
                      <span className="font-mono text-xs text-zinc-300 w-12 text-right">
                        {((r.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="col-span-1">
                    <span className={`text-[10px] font-bold font-mono uppercase px-2 py-1 rounded-md tracking-wider ${severityStyle[r.severity] || ''}`}>
                      {r.severity}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="col-span-2">
                    <p className="font-mono text-[10px] text-zinc-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600">
                      {new Date(r.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                      className="text-zinc-500 hover:text-amber-400 transition text-sm p-1"
                      title="View detail"
                    >👁</button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(r._id, e)}
                        className="text-zinc-600 hover:text-red-400 transition text-sm p-1"
                        title="Delete record"
                      >🗑</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ────────────────────────────── */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-zinc-500 font-mono text-xs">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              <span className="text-amber-500 font-bold">{pagination.total}</span> records
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-sm rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const start = Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 font-mono text-sm rounded-xl transition border ${p === pagination.page ? 'bg-amber-600 border-amber-500 text-zinc-900 font-bold' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 text-zinc-300'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-sm rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionHistoryPage;

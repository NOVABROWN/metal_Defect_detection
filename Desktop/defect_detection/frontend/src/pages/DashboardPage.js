import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [myDetections, setMyDetections] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const COLORS = ['#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#8b5cf6', '#eab308'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          // Admin gets full analytics + recent inspections + employees + logs
          const [analyticsRes, inspectionsRes, employeesRes, logsRes] = await Promise.all([
            axios.get(`${API_URL}/api/analytics`),
            axios.get(`${API_URL}/api/inspections?limit=5`),
            axios.get(`${API_URL}/api/employees`),
            axios.get(`${API_URL}/api/logs?limit=10`)
          ]);
          if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
          if (inspectionsRes.data.success) setRecentInspections(inspectionsRes.data.data);
          if (employeesRes.data.success) setEmployees(employeesRes.data.data);
          if (logsRes.data.success) setActivityLogs(logsRes.data.data);
        } else {
          // Worker gets their own detections + recent inspections + own logs
          const [detectionsRes, inspectionsRes, logsRes] = await Promise.all([
            axios.get(`${API_URL}/api/detections`),
            axios.get(`${API_URL}/api/inspections?limit=5`),
            axios.get(`${API_URL}/api/logs?limit=10`)
          ]);
          if (detectionsRes.data.success) setMyDetections(detectionsRes.data.data);
          if (inspectionsRes.data.success) setRecentInspections(inspectionsRes.data.data);
          if (logsRes.data.success) setActivityLogs(logsRes.data.data);
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl text-amber-500 font-mono tracking-widest uppercase animate-pulse">Loading Analytics Data...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  // Worker personal dashboard
  if (!isAdmin) {
    const defectCounts = myDetections.reduce((acc, d) => {
      acc[d.defectType] = (acc[d.defectType] || 0) + 1;
      return acc;
    }, {});
    const defectChartData = Object.entries(defectCounts).map(([name, count]) => ({ name, count }));

    return (
      <div className="min-h-screen bg-zinc-950 py-12 font-sans text-zinc-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-black uppercase tracking-tight">Operator <span className="text-amber-500">Dashboard</span></h1>
            <img src="/mascot.png" alt="Mascot" className="w-16 h-16 object-contain animate-bounce" />
          </div>
          <p className="text-center text-zinc-400 font-mono text-sm tracking-widest uppercase mb-10">Accessing logs for: {user?.username}</p>

          {error && <div className="bg-red-950/50 border border-red-900 text-red-200 px-4 py-3 rounded-xl mb-8 font-mono text-sm">{error}</div>}

          {/* Personal Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-amber-500/50 transition-colors">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Total Scans</p>
              <p className="text-4xl font-black text-amber-500 mt-2">{myDetections.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-red-500/50 transition-colors">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Critical Defects</p>
              <p className="text-4xl font-black text-red-500 mt-2">{myDetections.filter(d => d.severity === 'High').length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-emerald-500/50 transition-colors">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Avg Confidence</p>
              <p className="text-4xl font-black text-emerald-500 mt-2">
                {myDetections.length > 0
                  ? (myDetections.reduce((s, d) => s + d.confidence, 0) / myDetections.length * 100).toFixed(1) + '%'
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* My Defects Chart */}
          {defectChartData.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 mb-10">
              <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">Defect Frequency</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={defectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="name" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Worker Activity Feed */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">My Activity Feed</h2>
            {activityLogs.length === 0 ? (
              <p className="text-zinc-500 text-center py-4 font-mono text-sm">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {activityLogs.map(log => (
                  <div key={log._id} className="p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-xl hover:bg-zinc-800/60 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          {log.employee_name ? log.employee_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-zinc-200">
                            <span className="font-bold text-amber-500">{log.employee_name || log.employee_id}</span> {log.action} <span className="text-zinc-400 font-mono text-xs">({log.detection_type})</span>
                          </p>
                          <p className="text-sm mt-1">
                            <span className="text-zinc-400">File:</span> <span className="font-mono text-cyan-400">{log.image_name}</span> | <span className="text-zinc-400">Prediction:</span> <span className="font-mono text-red-400">{log.prediction}</span> ({log.confidence_score})
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Inspections from MongoDB */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-zinc-100 font-mono tracking-wider uppercase">🗃 Recent Inspections</h2>
              <a href="/history" className="text-amber-500 hover:text-amber-400 font-mono text-xs uppercase tracking-wider transition">View Full History →</a>
            </div>
            {recentInspections.length === 0 ? (
              <p className="text-zinc-500 text-center py-6 font-mono text-sm">No inspection records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-300">
                  <thead className="bg-zinc-800 text-zinc-400 font-mono tracking-wider uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Image</th>
                      <th className="px-4 py-3">Defect</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Operator</th>
                      <th className="px-4 py-3 rounded-tr-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInspections.map((r) => (
                      <tr key={r._id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <img src={`${API_URL}${r.imageUrl}`} alt={r.imageName} className="w-9 h-9 object-cover rounded-lg border border-zinc-700" onError={e => { e.target.style.display='none'; }} />
                        </td>
                        <td className="px-4 py-3 font-medium text-amber-400">{r.defectType}</td>
                        <td className="px-4 py-3 font-mono">{((r.confidence||0)*100).toFixed(1)}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono uppercase tracking-wider ${ r.severity==='High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : r.severity==='Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>{r.severity}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{r.inspectedBy || '—'}</td>
                        <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* My Detection History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">Scan History</h2>
            {myDetections.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No detections yet. <a href="/upload" className="text-amber-500 hover:underline">Initiate a scan</a> to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-300">
                  <thead className="bg-zinc-800 text-zinc-400 font-mono tracking-wider uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Defect Type</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3 rounded-tr-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myDetections.map((d) => (
                      <tr key={d._id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{d.defectType}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded font-bold font-mono text-xs uppercase tracking-widest ${d.severity === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : d.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                            {d.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{(d.confidence * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-zinc-500 font-mono">{new Date(d.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 font-sans text-zinc-100">
      <div className="container mx-auto px-4 relative">
        {/* Mascot HUD Element */}
        <div className="hidden lg:block absolute -top-4 right-4 animate-[bounce_4s_ease-in-out_infinite] opacity-80 hover:opacity-100 transition-opacity">
          <img src="/mascot.png" alt="Mascot" className="w-24 h-24 object-contain" />
        </div>

        <h1 className="text-4xl font-black text-zinc-100 mb-2 text-center uppercase tracking-tight">Command <span className="text-amber-500">Center</span></h1>
        <p className="text-center text-zinc-500 font-mono text-sm tracking-widest uppercase mb-10">Global Factory Analytics</p>

        {error && (
          <div className="bg-red-950/50 border border-red-900 text-red-200 px-4 py-3 rounded-xl mb-8 font-mono text-sm">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-amber-500/50 transition-colors">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Total Detections</p>
            <p className="text-4xl font-black text-amber-500 mt-2">{summary.totalDetections || 0}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-emerald-500/50 transition-colors">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Recovery Ops</p>
            <p className="text-4xl font-black text-emerald-500 mt-2">{summary.totalRecyclingActions || 0}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-cyan-500/50 transition-colors">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Value Saved</p>
            <p className="text-4xl font-black text-cyan-500 mt-2">${summary.totalCostSaved || 0}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-emerald-500/50 transition-colors">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">CO₂ Prevented</p>
            <p className="text-4xl font-black text-emerald-500 mt-2">{summary.totalCo2Saved || 0} <span className="text-lg">kg</span></p>
          </div>
        </div>

      {/* Admin Monitoring Panel: Employee Directory & Global Activity Feed */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Employee Directory */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-100 font-mono tracking-wider uppercase">👥 Personnel Directory</h2>
            <span className="px-3 py-1 bg-zinc-800 text-amber-500 rounded-full font-mono text-xs">{employees.length} Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-zinc-300">
              <thead className="bg-zinc-800 text-zinc-400 font-mono tracking-wider uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3">Name / Handle</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Dept</th>
                  <th className="px-4 py-3 rounded-tr-lg">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-cyan-500">{emp.employee_id || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-100">{emp.full_name || emp.username}</div>
                      {emp.full_name && <div className="text-xs text-zinc-500 font-mono">@{emp.username}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-widest ${emp.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-300 border border-zinc-600'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{emp.department || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{emp.last_login ? new Date(emp.last_login).toLocaleDateString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">🌐 Global Activity Feed</h2>
          {activityLogs.length === 0 ? (
            <p className="text-zinc-500 text-center py-4 font-mono text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {activityLogs.map(log => (
                <div key={log._id} className="p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-xl hover:bg-zinc-800/60 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                        {log.employee_name ? log.employee_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-zinc-200">
                          <span className="font-bold text-amber-500">{log.employee_name || log.employee_id}</span> {log.action} <span className="text-zinc-400 font-mono text-xs">({log.detection_type})</span>
                        </p>
                        <p className="text-sm mt-1">
                          <span className="text-zinc-400">File:</span> <span className="font-mono text-cyan-400">{log.image_name}</span> | <span className="text-zinc-400">Result:</span> <span className="font-mono text-red-400">{log.prediction}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-zinc-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] font-mono text-zinc-600 mt-1">{new Date(log.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Defects by Type */}
        {analytics?.detectionsByType && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">Defects by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.detectionsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="_id" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Severity Distribution */}
        {analytics?.severityDistribution && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">Severity Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.severityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  stroke="#18181b"
                  strokeWidth={2}
                >
                  {analytics.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recycling by Action */}
        {analytics?.recyclingStats && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">Recovery Actions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.recyclingStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Scrap by Metal Type */}
        {analytics?.scrapByType && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">Scrap by Material</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.scrapByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="_id" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5' }} />
                <Bar dataKey="totalQuantity" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Metrics Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl shadow-xl p-6">
          <h3 className="font-bold text-lg text-emerald-400 mb-4 font-mono tracking-wider uppercase">♻️ Reused Metal</h3>
          <p className="text-4xl font-black text-emerald-500">{summary.reusedMetalPercentage || 0}%</p>
          <p className="text-sm text-emerald-700 mt-2 font-mono uppercase tracking-widest">Of total scrap inventory</p>
        </div>

        <div className="bg-cyan-950/20 border border-cyan-900/50 rounded-2xl shadow-xl p-6">
          <h3 className="font-bold text-lg text-cyan-400 mb-4 font-mono tracking-wider uppercase">📊 Inventory Items</h3>
          <p className="text-4xl font-black text-cyan-500">{summary.totalScrapInventory || 0}</p>
          <p className="text-sm text-cyan-700 mt-2 font-mono uppercase tracking-widest">Active in storage</p>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl shadow-xl p-6">
          <h3 className="font-bold text-lg text-emerald-400 mb-4 font-mono tracking-wider uppercase">🌍 Envr Impact</h3>
          <p className="text-4xl font-black text-emerald-500">{summary.totalCo2Saved || 0}</p>
          <p className="text-sm text-emerald-700 mt-2 font-mono uppercase tracking-widest">kg of CO₂ prevented</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default DashboardPage;

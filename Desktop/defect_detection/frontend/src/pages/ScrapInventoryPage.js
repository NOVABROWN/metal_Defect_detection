import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScrapInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    metalType: 'Steel',
    quantity: 0,
    status: 'reusable',
    location: '',
    notes: '',
    estimatedValue: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/scrap/all`);
      if (response.data.success) {
        setInventory(response.data.data);
        setSummary(response.data.summary);
      }
    } catch (err) {
      setError('Error fetching inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'estimatedValue' ? parseFloat(value) : value
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/scrap/add`, formData);
      if (response.data.success) {
        setFormData({
          metalType: 'Steel',
          quantity: 0,
          status: 'reusable',
          location: '',
          notes: '',
          estimatedValue: 0
        });
        setShowForm(false);
        fetchInventory();
      }
    } catch (err) {
      setError('Error adding item: ' + err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/api/scrap/delete/${id}`);
        fetchInventory();
      } catch (err) {
        setError('Error deleting item: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl text-amber-500 font-mono tracking-widest uppercase animate-pulse">Loading Inventory Data...</p>
      </div>
    );
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'reusable':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'scrap':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'recycled':
        return 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 font-sans text-zinc-100">
      <div className="container mx-auto px-4 relative">
        <h1 className="text-4xl font-black text-zinc-100 mb-8 text-center uppercase tracking-tight">Scrap <span className="text-amber-500">Inventory</span></h1>

        {error && (
          <div className="bg-red-950/50 border border-red-900 text-red-200 px-4 py-3 rounded-xl mb-8 font-mono text-sm">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-amber-500/50 transition-colors">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Total Items</p>
              <p className="text-4xl font-black text-amber-500 mt-2">{summary.total}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-cyan-500/50 transition-colors">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Total Quantity</p>
              <p className="text-4xl font-black text-cyan-500 mt-2">{summary.totalQuantity} <span className="text-lg">kg</span></p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 hover:border-emerald-500/50 transition-colors">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Reusable Items</p>
              <p className="text-4xl font-black text-emerald-500 mt-2">
                {Object.entries(summary.byStatus).find(([k]) => k === 'reusable')?.[1] || 0} <span className="text-lg">kg</span>
              </p>
            </div>
          </div>
        )}

        {/* Add New Item Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-wider"
          >
            {showForm ? 'Cancel Operation' : '+ Add New Item'}
          </button>
        </div>

        {/* Add Item Form */}
        {showForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 font-mono tracking-wider uppercase">Log New Material</h2>
            <form onSubmit={handleAddItem} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Material Signature</label>
                <select
                  name="metalType"
                  value={formData.metalType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option>Steel</option>
                  <option>Aluminum</option>
                  <option>Copper</option>
                  <option>Iron</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Mass (kg)</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Operational Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="reusable">Reusable</option>
                  <option value="scrap">Scrap</option>
                  <option value="recycled">Recycled</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Sector / Zone</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Diagnostic Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Estimated Value ($)</label>
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider mt-4"
                >
                  Commit to Database
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                <th className="px-6 py-4 text-left font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">Material Signature</th>
                <th className="px-6 py-4 text-left font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">Mass (kg)</th>
                <th className="px-6 py-4 text-left font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">Zone</th>
                <th className="px-6 py-4 text-left font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-4 text-left font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-200 font-mono font-bold tracking-wider">{item.metalType}</td>
                  <td className="px-6 py-4 text-sm text-zinc-200 font-mono">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded font-mono text-[10px] uppercase tracking-widest font-bold ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400 font-mono">{item.location}</td>
                  <td className="px-6 py-4 text-sm text-amber-500 font-mono font-bold">${item.estimatedValue}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="text-red-500 hover:text-red-400 font-mono font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                      Purge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inventory.length === 0 && (
            <div className="text-center py-12 text-zinc-500 font-mono tracking-widest uppercase">
              Database Empty. Awaiting initial scan inputs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapInventoryPage;

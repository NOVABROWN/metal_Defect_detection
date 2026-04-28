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
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'reusable':
        return 'bg-green-100 text-green-800';
      case 'scrap':
        return 'bg-yellow-100 text-yellow-800';
      case 'recycled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Scrap Inventory Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-500 text-sm">Total Items</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{summary.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-500 text-sm">Total Quantity</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{summary.totalQuantity} kg</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-500 text-sm">Reusable Items</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {Object.entries(summary.byStatus).find(([k]) => k === 'reusable')?.[1] || 0} kg
            </p>
          </div>
        </div>
      )}

      {/* Add New Item Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          {showForm ? 'Cancel' : '+ Add New Item'}
        </button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Scrap Item</h2>
          <form onSubmit={handleAddItem} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Metal Type</label>
              <select
                name="metalType"
                value={formData.metalType}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option>Steel</option>
                <option>Aluminum</option>
                <option>Copper</option>
                <option>Iron</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Quantity (kg)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="reusable">Reusable</option>
                <option value="scrap">Scrap</option>
                <option value="recycled">Recycled</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Estimated Value ($)</label>
              <input
                type="number"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metal Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity (kg)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{item.metalType}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${item.estimatedValue}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {inventory.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No scrap items in inventory. Add your first item!
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapInventoryPage;

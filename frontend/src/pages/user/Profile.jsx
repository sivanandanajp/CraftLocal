import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

export const Profile = () => {
  const { user, setUser, updateUserProfile, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user, setUser, updateUserProfile } = authContext || {};

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleEditToggle = () => {
    if (!isEditing) {
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        bio: user?.bio || '',
      });
    }
    setStatusMessage(null);
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Convert selected JPEG/PNG file to Base64 string
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setStatusMessage({ type: 'error', text: 'Please select an image file (.jpeg, .jpg, .png).' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result, // Base64 Data URL
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      if (typeof updateUserProfile === 'function') {
        await updateUserProfile(formData);
      } else {
        const token =
          user?.token ||
          localStorage.getItem('token') ||
          JSON.parse(localStorage.getItem('user') || '{}')?.token;

        const response = await API.put('/auth/profile', formData, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const updatedUser = { ...user, ...response.data };

        if (typeof setUser === 'function') {
          setUser(updatedUser);
        }
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update profile. Please try again.';

      setStatusMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const isCreator = user?.role === 'creator' || user?.role === 'seller' || user?.role === 'artisan';
  const [activeTab, setActiveTab] = useState('buyer');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    address: user?.address || { street: '', city: '', state: '', zip: '' },
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        bio: user?.bio || '',
        address: user?.address || { street: '', city: '', state: '', zip: '' },
      });
    }
    setStatusMessage(null);
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setStatusMessage({ type: 'error', text: 'Please select an image file (.jpeg, .jpg, .png).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      if (typeof updateUserProfile === 'function') {
        await updateUserProfile(formData);
      } else {
        const response = await API.put('/auth/profile', formData);
        const updatedUser = { ...user, ...response.data };
        if (typeof setUser === 'function') setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 my-6">
      {/* Profile Card Container */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 transition-all">
        {/* Dynamic Gradient Cover with Decorative Mesh */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 h-44 sm:h-48 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white tracking-wide uppercase border border-white/30 shadow-sm">
            {user?.role || 'buyer'}
          </div>
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
            {/* Avatar & User Core Details */}
            <div className="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-5">
              <div className="relative group">
                <img
                  src={
                    formData.avatar ||
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  }
                  alt="Avatar"
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-gray-50 ring-1 ring-gray-100"
                />
              </div>
              <div className="sm:mb-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {user?.name || 'User Name'}
                </h1>
                <p className="text-sm font-medium text-gray-500 mt-1">{user?.email}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 shadow-sm transition active:scale-95"
              >
                {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 shadow-sm transition active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-4 mb-6 rounded-xl text-sm font-medium border flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Avatar Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-100/60 file:text-amber-900 font-semibold hover:file:bg-amber-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bio / Craft Story
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* DUAL-ROLE TAB SWITCHER */}
      {isCreator && (
        <div className="flex p-1.5 bg-gray-200/60 backdrop-blur-md rounded-2xl mb-6 max-w-md mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'buyer'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🛒 Buyer Workspace
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'creator'
                ? 'bg-amber-800 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎨 Store Studio
          </button>
        </div>
      )}

      {/* DASHBOARD TAB CONTENT */}
      {activeTab === 'buyer' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center font-bold">
                  📱
                </div>
                <h3 className="font-bold text-gray-900">Contact Information</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-800">Email:</span> {user?.email}</p>
                <p><span className="font-semibold text-gray-800">Phone:</span> {user?.phone || 'Not added yet'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center font-bold">
                  📍
                </div>
                <h3 className="font-bold text-gray-900">Shipping Address</h3>
              </div>
              <p className="text-sm text-gray-600">
                {user?.address?.street
                  ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zip}`
                  : 'No default address configured.'}
              </p>
    <div className="max-w-4xl mx-auto p-4 sm:p-6 my-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header Banner & User Info */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 h-32 relative"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-12 mb-6 gap-4">
            <div className="flex items-end space-x-4">
              <img
                src={
                  formData.avatar ||
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                }
                alt={user?.name || 'User Avatar'}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
              />
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User Name'}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full capitalize">
                  {user?.role || 'buyer'} Account
                </span>
              </div>
            </div>

            <button
              onClick={handleEditToggle}
              className="px-4 py-2 text-sm font-medium rounded-lg transition text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 self-start sm:self-auto"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {/* Feedback Messages */}
          {statusMessage && (
            <div
              className={`p-4 mb-6 rounded-lg text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Purchases</h2>
            <p className="text-sm text-gray-500 mb-6">Track ongoing shipments and order history.</p>
            <div className="p-8 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center text-sm text-gray-500">
              🛍️ You have not placed any orders yet.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Creator Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Listings</span>
                <span className="p-2 bg-amber-50 text-amber-800 rounded-lg text-xs">📦 Items</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mt-2">0</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</span>
                <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs">💰 Sales</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mt-2">$0.00</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment</span>
                <span className="p-2 bg-blue-50 text-blue-800 rounded-lg text-xs">🚚 Queue</span>
          {/* Form / Display Toggle */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo (Upload JPEG / PNG)
                </label>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a short bio or describe your craft store..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Contact Details
                </h2>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Email:</span> {user?.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Phone:</span>{' '}
                    {user?.phone || 'No phone number added'}
                  </p>
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mt-2">0</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Craft Store Catalog</h2>
                <p className="text-sm text-gray-500">Manage products listed under your studio brand.</p>
              </div>
              <button className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm rounded-xl shadow-md transition">
                + Add Product Listing
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Brand Bio
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                {user?.bio || 'No studio bio added yet. Click "Edit Profile" above to describe your craft store.'}
              </p>
            </div>
          </div>
        </div>
      )}
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  About
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {user?.bio || 'No bio added yet.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
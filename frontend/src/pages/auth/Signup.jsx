import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const Signup = () => {
  const navigate = useNavigate();
  const { register, loading, error, setError } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer', // Default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    if (error) setError(null);
    if (localError) setLocalError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/profile');
    } catch (err) {
      // Error handled inside AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="flex flex-col items-center px-6 py-12">
        <span
          className="material-symbols-outlined text-primary text-6xl mb-4"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          location_on
        </span>

        <h1 className="font-headline text-4xl font-bold mb-2">
          Create Your Account
        </h1>

        <p className="text-on-surface-variant text-lg mb-8">
          Join CraftLocal and shop from or sell to local artisans.
        </p>

        <div className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant rounded-2xl p-8">
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full px-5 py-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-5 py-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block font-semibold mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`py-3 px-4 rounded-xl font-medium border transition ${
                    formData.role === 'buyer'
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  🛍️ Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                  className={`py-3 px-4 rounded-xl font-medium border transition ${
                    formData.role === 'seller'
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  🎨 Creator / Seller
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className="w-full px-5 py-4 pr-14 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full px-5 py-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                className="mt-1 w-5 h-5 accent-primary"
              />
              <p className="text-sm text-on-surface-variant">
                I agree to the Terms of Service and Privacy Policy.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-lg hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-on-surface-variant">
              Already have an account?{' '}
            </span>
            <Link
              to="/login"
              className="text-primary font-bold hover:text-primary-container"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
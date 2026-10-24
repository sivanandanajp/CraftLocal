
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Demo only: no actual email is sent.
    setMessage(
      `A password reset link has been sent to ${email.trim()}.`
    );

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="flex flex-col items-center px-6 py-16">
        <span className="material-symbols-outlined text-primary text-6xl mb-4">
          lock_reset
        </span>

        <h1 className="font-headline text-4xl font-bold mb-2 text-center">
          Forgot Your Password?
        </h1>

        <p className="text-on-surface-variant text-lg mb-8 text-center">
          Enter your email and we'll help you reset your password.
        </p>

        <div className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant rounded-2xl p-8">
          {submitted && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
            >
              <span className="material-symbols-outlined">
                check_circle
              </span>

              <div>
                <p className="font-bold">Reset link sent!</p>
                <p className="mt-1 text-sm">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="forgot-email"
                className="block font-semibold mb-2"
              >
                Email Address
              </label>

              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubmitted(false);
                  setMessage('');
                }}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full px-5 py-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-lg hover:bg-primary-container transition-colors"
            >
              Send Reset Link
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-primary font-bold hover:text-primary-container"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;

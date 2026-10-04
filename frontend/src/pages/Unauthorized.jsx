import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-2">403 - Access Denied</h1>
      <p className="text-gray-600 mb-6">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
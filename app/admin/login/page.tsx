'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminLoginPage = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });

      if(!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login Failed');
      }

      console.log('Login success, redirecting...');
      window.location.href = '/admin/dashboard';
      // window.location.href = '/admin/login?test=1';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex items-center justify-center py-20">
      <div className="w-full max-w-md border rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          {error && (
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-2 rounded disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLoginPage;

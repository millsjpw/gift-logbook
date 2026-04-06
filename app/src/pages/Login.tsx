import React, { useState } from 'react';
import { login, register } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../api/tokens';
import Layout from '../components/Layout';

export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError('');

        try {
            let data;
            if (mode === 'login') {
                data = await login(email, password);
            } else {
                data = await register(name, email, password);
            }

            setTokens(data.accessToken, data.refreshToken);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {mode === 'login' ? 'Login' : 'Register'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                                           placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                                       placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                                       placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {mode === 'login' ? 'Login' : 'Register'}
                    </button>
                </form>

                {error && (
                    <p className="mt-4 text-center text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-4 text-center">
                    {mode === 'login' ? (
                        <p className="text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={() => setMode('register')}
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Register
                            </button>
                        </p>
                    ) : (
                        <p className="text-sm">
                            Already have an account?{' '}
                            <button
                                onClick={() => setMode('login')}
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Login
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
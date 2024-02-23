import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useUser } from '../hooks/UserContext';
import { ModalProps } from '../hooks/ModalProvider';

const LoginModal: React.FC<ModalProps> = ({ close }) => {
    const { login } = useUser();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false,
        error: ''
    });

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const result = await apiFetch('login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });
            const data = await result.json();

            if (!result.ok) {
                setFormData({ ...formData, error: 'Invalid username or password.' });
                return;
            }

            login(data?.access_token, formData.remember);
            close();
            setFormData({ username: '', password: '', remember: false, error: '' });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormData({ ...formData, error: err.message });
            }
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleLogin}>
            <div>
                <label htmlFor="username" className="block text-sm font-medium leading-6">
                    Username
                </label>
                <div className="mt-2">
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        autoFocus
                        className="block w-full rounded-md border-0 p-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6">
                        Password
                    </label>
                </div>
                <div className="mt-2">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block w-full rounded-md border-0 p-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <p className="my-2 text-center text-sm font-bold text-primary-500">
                        {formData.error}
                    </p>
                </div>
            </div>
            <div>
                <label className="block" htmlFor="remember">
                    <input
                        className="mr-2 h-4 w-4 rounded-lg accent-accent-500"
                        type="checkbox"
                        id="remember"
                        name="remember"
                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                    />
                    <span className="text-sm">Remember me</span>
                </label>
            </div>

            <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400">
                    Sign in
                </button>
            </div>
        </form>
    );
};

export default LoginModal;

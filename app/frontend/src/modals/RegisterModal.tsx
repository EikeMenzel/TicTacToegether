import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useUser } from '../hooks/UserContext';
import { ModalProps } from '../hooks/ModalProvider';
import { toast } from 'sonner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface FormData {
    username: string;
    password: string;
    password_confirmation: string;
    error: {
        username?: string;
        password?: string;
        password_confirmation?: string;
    };
}

const initalFormData: FormData = {
    username: '',
    password: '',
    password_confirmation: '',
    error: {
        username: '',
        password: '',
        password_confirmation: ''
    }
};

const RegisterModal: React.FC<ModalProps> = ({ close }) => {
    const { login } = useUser();
    const [formData, setFormData] = useState(initalFormData);
    const [showPassword, setShowPassword] = useState({
        password: false,
        password_confirmation: false
    });

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formTarget = e.target as HTMLFormElement;

        if (formData.password !== formData.password_confirmation) {
            setFormData({
                ...formData,
                error: { ...formData.error, password_confirmation: 'Passwords do not match' }
            });
            formTarget.confirm_password.focus();
            return;
        }

        try {
            const result = await apiFetch('register', {
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
                setFormData({ ...formData, error: data.error });
                if (data.error.username) formTarget.username.focus();

                if (data.error.password) formTarget.password.focus();
                return;
            }

            login(data?.access_token, false);
            close();
            setFormData(initalFormData);
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleRegister}>
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
                    <p className="my-2 text-sm font-bold text-primary-500">
                        {formData.error.username}
                    </p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6">
                        Password
                    </label>
                </div>
                <div className="mt-2">
                    <div className="relative">
                        <div
                            onClick={() =>
                                setShowPassword({
                                    ...showPassword,
                                    password: !showPassword.password
                                })
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2">
                            {showPassword.password ? (
                                <EyeIcon className="size-6 text-black" />
                            ) : (
                                <EyeSlashIcon className="size-6 text-black" />
                            )}
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword.password ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            className="block w-full rounded-md border-0 p-1.5 pe-9 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <p className="my-2 text-sm font-bold text-primary-500">
                        {formData.error.password}
                    </p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6">
                        Confirm Password
                    </label>
                </div>
                <div className="mt-2">
                    <div className="relative">
                        <div
                            onClick={() =>
                                setShowPassword({
                                    ...showPassword,
                                    password_confirmation: !showPassword.password_confirmation
                                })
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2">
                            {showPassword.password_confirmation ? (
                                <EyeIcon className="size-6 text-black" />
                            ) : (
                                <EyeSlashIcon className="size-6 text-black" />
                            )}
                        </div>
                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type={showPassword.password_confirmation ? 'text' : 'password'}
                            required
                            className="block w-full rounded-md border-0 p-1.5 pe-9 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password_confirmation: e.target.value
                                })
                            }
                        />
                    </div>
                    <p className="my-2 text-sm font-bold text-primary-500">
                        {formData.error.password_confirmation}
                    </p>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400">
                    Sign up
                </button>
            </div>
        </form>
    );
};

export default RegisterModal;

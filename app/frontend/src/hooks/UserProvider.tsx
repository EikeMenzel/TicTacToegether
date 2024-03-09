import { ReactNode, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import Cookies from 'js-cookie';
import { User, UserContext } from './UserContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [socket, setSocket] = useState<Socket | null>(null);

    const connectSocket = (sessionToken: string) => {
        const socket = io('http://localhost:3000', {
            auth: { token: `Bearer ${sessionToken}` }
        });
        setSocket(socket);
    };

    const disconnectSocket = () => {
        socket?.disconnect();
        setSocket(null);
    };

    const login = async (token: string, remember: boolean) => {
        Cookies.set('sessionToken', token, {
            expires: remember ? 7 : undefined,
            sameSite: 'none',
            secure: true
        });
        connectSocket(token);
        await fetchUser();
    };

    const logout = () => {
        disconnectSocket();
        Cookies.remove('sessionToken');
        setUser(null);
        navigate('/');
    };

    const fetchUser = async () => {
        try {
            const result = await apiFetch('profiles/own', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${Cookies.get('sessionToken')}`
                }
            });
            const data = await result.json();

            if (!result.ok) {
                disconnectSocket();
                Cookies.remove('sessionToken');
                setUser(null);
                return;
            }

            setUser(data);

            try {
                const result = await apiFetch('profiles/own/image', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${Cookies.get('sessionToken')}`
                    }
                });

                if (!result.ok) {
                    setUser({ ...data, image: undefined });
                    return;
                }

                const image = URL.createObjectURL(await result.blob());

                setUser({ ...data, image: image });
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                }
            }
        } catch (err: unknown) {
            Cookies.remove('sessionToken');
            setUser(null);
        }
    };

    useEffect(() => {
        const sessionToken = Cookies.get('sessionToken');

        if (sessionToken) {
            fetchUser();
            connectSocket(sessionToken);
        } else {
            disconnectSocket();
            Cookies.remove('sessionToken');
            setUser(null);
        }

        return () => {
            disconnectSocket();
            setSocket(null);
        };
    }, []); // Fetch user data only once when the component mounts

    return (
        <UserContext.Provider value={{ user, login, logout, fetchUser, socket }}>
            {children}
        </UserContext.Provider>
    );
};

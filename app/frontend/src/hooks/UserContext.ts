import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

export interface User {
    username: string;
    image?: string;
    elo: number;
    isAdmin: boolean;
    gameStats: {
        totalGames: number;
        wonGames: number;
        lostGames: number;
        drawGames: number;
    };
}

interface UserContextType {
    user: User | null | undefined; // undefined is used to indicate that the user is still loading
    login: (token: string, remember: boolean) => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
    socket: Socket;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserContext.Provider');
    }
    return context;
};



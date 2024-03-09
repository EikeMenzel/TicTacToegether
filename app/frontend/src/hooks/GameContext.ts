import { createContext, useContext } from 'react';
import { Board, GameData, GameState } from './GameProvider';

interface GameContextProps {
    joinQueue: () => void;
    leaveQueue: () => void;
    setPiece: (x: number, y: number) => void;
    resetGame: () => void;
    gameData: GameData | undefined;
    gameState: GameState | undefined;
    board: Board;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameContext.Provider');
    }
    return context;
};

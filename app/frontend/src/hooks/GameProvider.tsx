import { useEffect, useState } from 'react';
import { GameContext } from './GameContext';
import { useNavigate } from 'react-router-dom';
import { useModal } from './ModalContext';
import { useUser } from './UserContext';

export interface GameData {
    gameId: string;
    ownSymbol: string;
    opponentUsername: string;
    opponentElo: number;
    opponentSymbol: string;
    startingPlayer: string;
}

export interface GameState {
    winner?: boolean;
    youNewElo: number;
    oppNewElo: number;
}

export interface Board {
    board: string[][];
    nextTurn?: string;
}

const initialBoard: Board = {
    board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ],
    nextTurn: undefined
};

export interface ChatData {
    message: string;
    sender: string;
    timestamp: Date;
}

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const { closeModal } = useModal();
    const [gameData, setGameData] = useState<GameData | undefined>();
    const { socket, fetchUser } = useUser();
    const [chat, setChat] = useState<ChatData[]>([]);

    const [board, setBoard] = useState(initialBoard);
    const [gameState, setGameState] = useState<GameState | undefined>();

    const setPiece = (x: number, y: number) => {
        socket.emit('game.move', { gameId: gameData?.gameId, move: { x, y } });
        console.log(`Move made at (${x}, ${y}) for game ${gameData}`);
    };

    const joinQueue = () => {
        socket.emit('queue');
        socket.on('queue', (data: { status: string; data: string }) => {
            console.log(data);
        });
    };

    const leaveQueue = () => {
        socket.off('queue');
    };

    const resetGame = () => {
        setBoard(initialBoard);
        setGameData(undefined);
        setGameState(undefined);
    };

    const sendChat = (message: string) => {
        socket.emit('game.chat', { message: message });
    };

    useEffect(() => {
        const handleMatchFound = (data: {
            gameId: string;
            ownSymbol: string;
            opponentUsername: string;
            opponentElo: number;
            opponentSymbol: string;
            startingPlayer: string;
        }) => {
            console.log(data);

            navigate('/play');
            closeModal();

            setGameData(data);
            setBoard((value) => ({ ...value, nextTurn: data.startingPlayer }));
            socket.emit('joinGameRoom', { gameId: data.gameId });
        };

        const handleGameBoardUpdate = (data: { gameBoard: string[][]; nextPlayer: string }) => {
            setBoard({ board: data.gameBoard, nextTurn: data.nextPlayer });
        };

        const handleGameEnd = (data: {
            winner: string;
            gameState: string;
            newXElo: number;
            newOElo: number;
        }) => {
            console.log(data);
            setGameState({
                winner: data.winner ? gameData?.ownSymbol === data.winner : undefined,
                youNewElo: gameData?.ownSymbol === 'X' ? data.newXElo : data.newOElo,
                oppNewElo: gameData?.opponentSymbol === 'X' ? data.newXElo : data.newOElo
            });
            socket.off('queue');
            socket.off('match-found');
            fetchUser();
        };

        const handleGameAbort = (data: {
            winner: string;
            gameState: string;
            newXElo: number;
            newOElo: number;
        }) => {
            console.log(data);
            setGameState({
                winner: data.winner ? gameData?.ownSymbol === data.winner : undefined,
                youNewElo: gameData?.ownSymbol === 'X' ? data.newXElo : data.newOElo,
                oppNewElo: gameData?.opponentSymbol === 'X' ? data.newXElo : data.newOElo
            });
            socket.off('queue');
            socket.off('match-found');
            fetchUser();
        };

        const handleChatReceived = (data: ChatData) => {
            setChat((chat) => [
                ...chat,
                { message: data.message, sender: data.sender, timestamp: new Date(data.timestamp) }
            ]);
        };

        socket.on('match-found', handleMatchFound);
        socket.on('game.gameboard', handleGameBoardUpdate);
        socket.on('game.gameend', handleGameEnd);
        socket.on('game.abort', handleGameAbort);
        socket.on('game.chat', handleChatReceived);

        return () => {
            socket.off('match-found', handleMatchFound);
            socket.off('game.gameboard', handleGameBoardUpdate);
            socket.off('game.gameend', handleGameEnd);
            socket.off('game.abort', handleGameAbort);
            socket.off('game.chat', handleChatReceived);
        };
    }, [navigate, closeModal, gameData, socket, fetchUser]);

    return (
        <GameContext.Provider
            value={{
                joinQueue,
                leaveQueue,
                setPiece,
                resetGame,
                board,
                gameData,
                gameState,
                chat,
                sendChat
            }}>
            {children}
        </GameContext.Provider>
    );
};

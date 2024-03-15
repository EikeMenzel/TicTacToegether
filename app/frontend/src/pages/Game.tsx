import { useEffect, useState } from 'react';
import { useGame } from '../hooks/GameContext';
import { useUser } from '../hooks/UserContext';
import { useNavigate } from 'react-router-dom';
import UserProfileImage from '../components/UserProfileImage';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

const Game = () => {
    const { setPiece, resetGame, board, gameData, gameState, chat, sendChat } = useGame();
    const navigate = useNavigate();
    const { user } = useUser();
    const [chatMessage, setChatMessage] = useState('');

    const [enemyImage, setEnemyImage] = useState<string | undefined>(undefined);

    const handleChat = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendChat(chatMessage);
        setChatMessage('');
    };

    useEffect(() => {
        if (!user || !gameData?.gameId) navigate('/');
    }, [user, gameData?.gameId, navigate]);

    useEffect(() => {
        if (!gameData?.opponentUsername) return;

        const fetchImage = async () => {
            try {
                const result = await apiFetch(`profiles/${gameData.opponentUsername}/image`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${Cookies.get('sessionToken')}`
                    }
                });

                if (!result.ok) {
                    return;
                }

                const image = URL.createObjectURL(await result.blob());

                setEnemyImage(image);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                }
            }
        };

        fetchImage();

        return () => {
            setEnemyImage(undefined);
        };
    }, [gameData?.opponentUsername]);

    const renderPiece = (piece: string) => {
        if (piece === 'O') {
            return (
                <div className="aspect-square h-full w-full rounded-full border-[1rem] border-text"></div>
            );
        } else if (piece === 'X') {
            return (
                <div className="relative flex aspect-square h-full w-full items-center justify-center">
                    <div className="absolute h-4 w-full rotate-[45deg] rounded-l-full rounded-r-full bg-text"></div>
                    <div className="h-full w-4 rotate-[45deg] rounded-l-full rounded-r-full bg-text"></div>
                </div>
            );
        }
    };

    return (
        user &&
        gameData && (
            <>
                {/* WINNER MODAL */}
                {gameState && (
                    <div className="fixed bottom-0 left-0 right-0 top-0 z-20 flex flex-col items-center justify-center backdrop-blur-lg">
                        <p className="pb-4 text-9xl font-black text-text">
                            {gameState.winner === undefined ? '🟰' : gameState.winner ? '🏆' : '🚽'}
                        </p>

                        <p className="text-5xl font-black text-text">
                            {gameState.winner === undefined
                                ? 'DRAW'
                                : gameState.winner
                                  ? 'Victory Royale!'
                                  : 'Defeat!'}
                        </p>
                        <p className="pt-14 text-4xl font-black text-text">
                            You: {gameState.youNewElo}
                        </p>
                        <p className="pb-14 text-4xl font-black text-text">
                            Opponent: {gameState.oppNewElo}
                        </p>
                        <button
                            onClick={() => {
                                navigate('/');
                                resetGame();
                            }}
                            className="rounded border border-primary-500 px-3 py-2 text-3xl font-black text-text">
                            Home
                        </button>
                    </div>
                )}

                <div className="flex h-full grow items-center justify-center">
                    <div className="w-full text-text xl:grid xl:grid-cols-2">
                        {/* MAIN GAME VIEW */}
                        <div className="mx-auto w-full p-12 md:max-w-[55vw] xl:max-w-[30vw]">
                            {/* GAME INFO TODO: DATAaaaa*/}
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="absolute -left-10 -top-3 me-2 rounded bg-secondary-400 px-2.5 py-0.5 text-xs font-medium text-secondary-800">
                                            {user.elo}
                                        </span>
                                        <UserProfileImage image={user.image} size={12} />
                                    </div>
                                    <p className="font-bold text-text">{user.username}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-text">
                                        {gameData.opponentUsername}
                                    </p>
                                    <div className="relative">
                                        <span className="absolute -right-10 -top-3 me-2 rounded bg-secondary-400 px-2.5 py-0.5 text-xs font-medium text-secondary-800">
                                            {gameData.opponentElo}
                                        </span>
                                        <UserProfileImage image={enemyImage} size={12} />
                                    </div>
                                </div>
                            </div>

                            {/* BOARD */}
                            <div className="grid aspect-square grid-cols-3 gap-4">
                                {board.board.map((data, x) =>
                                    data.map((piece, y) => (
                                        <div
                                            key={`${x}${y}`}
                                            onClick={() => setPiece(x, y)}
                                            className={`aspect-square rounded-xl bg-secondary-400 p-6 ${piece === '' && board.nextTurn === gameData.ownSymbol ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                            {renderPiece(piece)}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* SELECT SYMBOL TODO: DATAAAA*/}
                            <div className="mt-4 flex justify-center">
                                <div className="relative flex h-10 w-20 items-center rounded-full bg-white">
                                    <span
                                        className={`absolute z-10 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-600 transition-all duration-200 
                                        ${board.nextTurn === gameData.opponentSymbol ? 'translate-x-full' : 'translate-x-0'}`}>
                                        {board.nextTurn === gameData.opponentSymbol ? (
                                            gameData.opponentSymbol === 'X' ? (
                                                <XSymbol className="bg-white" />
                                            ) : (
                                                <OSymbol className="border-white" />
                                            )
                                        ) : gameData.ownSymbol === 'X' ? (
                                            <XSymbol className="bg-white" />
                                        ) : (
                                            <OSymbol className="border-white" />
                                        )}
                                    </span>
                                    <div className="absolute left-4">
                                        {gameData.ownSymbol === 'X' ? (
                                            <XSymbol className="bg-secondary-600" />
                                        ) : (
                                            <OSymbol className="-translate-x-1 border-secondary-600" />
                                        )}
                                    </div>

                                    <div className="absolute right-4">
                                        {gameData.opponentSymbol === 'X' ? (
                                            <XSymbol className="bg-secondary-600" />
                                        ) : (
                                            <OSymbol className="translate-x-1 border-secondary-600" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CHAT */}
                        <div className="mx-12 my-24 h-[500px] xl:my-auto">
                            <div className="relative h-full rounded-lg bg-background pb-8">
                                <div className="flex flex-col gap-3 overflow-y-scroll p-5">
                                    <p className="my-2 text-center text-xs">
                                        {chat[0] && chat[0].timestamp.toLocaleDateString('en')}
                                    </p>
                                    {chat.map((message, index) => (
                                        <>
                                            {index !== 0 &&
                                                chat[index - 1].timestamp.getDate() !==
                                                    message.timestamp.getDate() && (
                                                    <p className="my-2 text-center text-xs">
                                                        {message.timestamp.toLocaleDateString('en')}
                                                    </p>
                                                )}
                                            {user?.username === message.sender ? (
                                                <div className="flex justify-end">
                                                    <div>
                                                        <p className="rounded-md bg-primary-500 px-2 py-1">
                                                            {message.message}
                                                        </p>
                                                        <p className="float-right text-xs">
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex">
                                                    <div>
                                                        <p className="rounded-md bg-secondary-300 px-2 py-1">
                                                            {message.message}
                                                        </p>
                                                        <p className="text-xs">
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ))}
                                </div>

                                <form
                                    className="absolute bottom-0 flex w-full items-center gap-1 p-1"
                                    onSubmit={(e) => handleChat(e)}>
                                    <input
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        type="text"
                                        className="w-full rounded-lg border border-text bg-background px-2 py-1"
                                    />
                                    <div>
                                        <button
                                            type="submit"
                                            className="rounded-full bg-primary-500 p-1">
                                            <PaperAirplaneIcon className="size-6" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    );
};

interface SymbolProps {
    className?: string;
}

const XSymbol: React.FC<SymbolProps> = ({ className }) => {
    return (
        <div className="relative flex aspect-square h-full w-full items-center justify-center">
            <div
                className={`absolute h-[4px] w-4 rotate-[45deg] rounded-l-full rounded-r-full ${className}`}></div>
            <div
                className={`h-4 w-[4px] rotate-[45deg] rounded-l-full rounded-r-full ${className}`}></div>
        </div>
    );
};

const OSymbol: React.FC<SymbolProps> = ({ className }) => {
    return <div className={`aspect-square size-4 rounded-full border-[4px] ${className}`}></div>;
};

export default Game;

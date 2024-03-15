import { PencilIcon } from '@heroicons/react/24/outline';
import UserProfileImage from '../components/UserProfileImage';
import { User, useUser } from '../hooks/UserContext';
import { useModal } from '../hooks/ModalContext';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import PieChart from '../components/charts/PieChart';
import History from '../components/History';
import LineChart from '../components/charts/LineChart';
import StatisticsChart from '../components/charts/StatisticsChart';

interface ProfileOwnProps {
    user: User | null | undefined;
}

const ProfileOwn: React.FC<ProfileOwnProps> = ({ user }) => {
    const { fetchUser } = useUser();
    const { openModal } = useModal();
    const [image, setImage] = useState<File | null>(null);
    const [tab, setTab] = useState<'history' | 'elo' | 'statistics'>('history');
    const [history, setHistory] = useState<History[]>([]);

    const handleHistory = () => setTab('history');
    const handleElo = () => setTab('elo');
    const handleStatistics = () => setTab('statistics');

    const eloOverTime = () => {
        return history.map((game) => {
            return { x: game.timestamp, y: game.ownEloAtTimestamp };
        });
    };

    const statisticsOverTime = () => {
        let winSum = 0;
        let lossSum = 0;
        let drawSum = 0;
        const wins = [];
        const losses = [];
        const draws = [];

        history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        for (const item of history) {
            const { winner, timestamp } = item;

            if (winner === user?.username) {
                wins.push({ x: timestamp, y: ++winSum });
            } else if (winner === undefined) {
                draws.push({ x: timestamp, y: ++drawSum });
            } else {
                losses.push({ x: timestamp, y: ++lossSum });
            }
        }

        if (history.length > 0) {
            const lastItem = history[history.length - 1];

            wins.push({ x: lastItem.timestamp, y: winSum });
            losses.push({ x: lastItem.timestamp, y: lossSum });
            draws.push({ x: lastItem.timestamp, y: drawSum });
        }

        return [wins, draws, losses];
    };

    useEffect(() => {
        const handleProfileUpload = async () => {
            if (!image) return;

            try {
                const formData = new FormData();
                formData.append('image', image as Blob);
                const result = await apiFetch('profiles/own/image', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${Cookies.get('sessionToken')}`
                    },
                    body: formData
                });

                if (!result.ok) toast.error('An error occurred. Please try again later.');

                setImage(null);
                fetchUser();
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                } else {
                    toast.error('An error occurred. Please try again later.');
                }
            }
        };

        handleProfileUpload();
    }, [image, fetchUser]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const result = await apiFetch('profiles/own/history', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get('sessionToken')}`
                    }
                });

                if (!result.ok) {
                    return;
                }

                const data = await result.json();
                setHistory(
                    data.map((item: History) => ({
                        ...item,
                        timestamp: new Date(item.timestamp)
                    }))
                );
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                }
            }
        };

        fetchHistory();
    }, []);

    return (
        user && (
            <div className="m-2 text-text lg:m-10">
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {/* Profile */}
                        <div className="flex flex-col justify-around rounded-lg bg-background p-4 lg:p-10">
                            <div className="flex items-center justify-around">
                                <div className="relative">
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <button
                                            className="absolute bottom-0 right-0 rounded-full bg-secondary-400"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById('image-upload')?.click();
                                            }}>
                                            <PencilIcon className="h-8 w-8 p-1.5 text-secondary-800" />
                                        </button>

                                        <UserProfileImage
                                            image={user?.image}
                                            size={40}
                                            className={'border border-text shadow-md'}
                                        />

                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/jpeg, image/png"
                                            className="hidden"
                                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>

                                <div className="flex flex-col gap-4 text-3xl font-bold">
                                    <h2>{user?.username}</h2>
                                    <h2>Elo: {user?.elo}</h2>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-around p-4">
                                <button
                                    onClick={() => openModal('change_username')}
                                    className="rounded border border-primary-500 px-3 py-2">
                                    Change Username
                                </button>

                                <button
                                    onClick={() => openModal('change_password')}
                                    className="rounded border border-primary-500 px-3 py-2">
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="rounded-lg bg-background p-4 lg:p-10">
                            <h2 className="text-2xl font-bold lg:text-center">Statistic</h2>
                            <PieChart
                                wins={user.gameStats.wonGames}
                                losses={user.gameStats.lostGames}
                                draws={user.gameStats.drawGames}
                            />
                        </div>
                    </div>

                    {/* Analytics */}
                    <div className="rounded-lg bg-background p-4 lg:p-10">
                        <h1 className="my-3 text-2xl font-bold">Game Analytics</h1>

                        {/* Tabs */}
                        <div className="flex divide-x">
                            <button
                                onClick={handleHistory}
                                className={`${tab === 'history' ? 'bg-black/20' : ''} px-6 py-2`}>
                                History
                            </button>
                            <button
                                onClick={handleElo}
                                className={`${tab === 'elo' ? 'bg-black/20' : ''} px-6 py-2`}>
                                Elo
                            </button>
                            <button
                                onClick={handleStatistics}
                                className={`${tab === 'statistics' ? 'bg-black/20' : ''} px-6 py-2`}>
                                Statistics
                            </button>
                        </div>

                        {/* Content */}
                        {tab === 'history' && (
                            <History history={history} username={user.username} />
                        )}
                        {tab === 'elo' && <LineChart data={[eloOverTime()]} />}
                        {tab === 'statistics' && <StatisticsChart data={statisticsOverTime()} />}
                    </div>
                </div>
            </div>
        )
    );
};

export default ProfileOwn;

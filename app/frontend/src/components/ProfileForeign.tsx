import UserProfileImage from '../components/UserProfileImage';
import { User } from '../hooks/UserContext';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import PieChart from '../components/charts/PieChart';
import History from '../components/History';
import LineChart from '../components/charts/LineChart';
import StatisticsChart from '../components/charts/StatisticsChart';

interface ProfileForeignProps {
    user: User;
}

const ProfileForeign: React.FC<ProfileForeignProps> = ({ user }) => {
    const [image, setImage] = useState<string | undefined>(undefined);

    const [tab, setTab] = useState<'history' | 'elo' | 'statistics'>('history');
    const [history, setHistory] = useState<History[]>([]);

    const handleHistory = () => setTab('history');
    const handleElo = () => setTab('elo');
    const handleStatistics = () => setTab('statistics');

    const eloOverTime = () => {
        return history.map((game) => {
            return { x: new Date(game.timestamp), y: game.ownEloAtTimestamp };
        });
    };

    const statisticsOverTime = () => {
        let winSum = 0;
        let lossSum = 0;
        let drawSum = 0;
        const wins = [];
        const losses = [];
        const draws = [];

        for (const item of history) {
            const { winner, timestamp } = item;
            const date = new Date(timestamp);

            if (winner === user?.username) {
                wins.push({ x: date, y: ++winSum });
            } else if (winner !== user?.username) {
                losses.push({ x: date, y: ++lossSum });
            } else {
                draws.push({ x: date, y: ++drawSum });
            }
        }

        if (history.length > 0) {
            const lastItem = history[history.length - 1];
            const lastDate = new Date(lastItem.timestamp);

            wins.push({ x: lastDate, y: winSum });
            losses.push({ x: lastDate, y: lossSum });
            draws.push({ x: lastDate, y: drawSum });
        }

        return [wins, draws, losses];
    };

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const result = await apiFetch(`profiles/${user.username}/image`, {
                    method: 'GET'
                });

                if (!result.ok) {
                    return;
                }

                const image = URL.createObjectURL(await result.blob());

                setImage(image);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                }
            }
        };

        const fetchHistory = async () => {
            try {
                const result = await apiFetch(`profiles/${user.username}/history`, {
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
                setHistory(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                }
            }
        };

        fetchImage();
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
                                <UserProfileImage
                                    image={image}
                                    size={40}
                                    className={'border border-text shadow-md'}
                                />

                                <div className="flex flex-col gap-4 text-3xl font-bold">
                                    <h2>{user?.username}</h2>
                                    <h2>Elo: {user?.elo}</h2>
                                </div>
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

export default ProfileForeign;

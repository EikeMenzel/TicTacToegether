import React from 'react';
import { VictoryPie } from 'victory';

interface PieChartProps {
    wins: number;
    losses: number;
    draws: number;
}

const PieChart: React.FC<PieChartProps> = ({ wins, losses, draws }) => {
    const total: number = wins + losses + draws;

    const data = () => {
        const data = [];
        if (total === 0) data.push({ x: 'No games played yet', y: 1 });
        if (wins > 0) data.push({ x: 'Wins', y: wins });
        if (draws > 0) data.push({ x: 'Draws', y: draws });
        if (losses > 0) data.push({ x: 'Losses', y: losses });

        return data;
    };

    const colors = () => {
        const colors = [];
        if (total === 0 || wins > 0) colors.push('var(--accent-500)');
        if (draws > 0) colors.push('var(--primary-500)');
        if (losses > 0) colors.push('var(--secondary-500)');

        return colors;
    };

    return (
        <div className="flex items-center justify-center">
            <VictoryPie
                style={{ parent: { maxWidth: '15rem' } }}
                data={data()}
                colorScale={colors()}
                innerRadius={90}
                labels={() => null}
                startAngle={0}
                endAngle={360}
                padAngle={5}
                cornerRadius={10}
            />

            <div className="ml-5 flex min-w-[50%] flex-col items-center font-bold text-text">
                {total === 0 ? (
                    <div className="flex items-center">
                        <div className="mr-2 size-5 rounded-md bg-accent-500"></div>
                        <p>No games played yet</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="mb-3 whitespace-nowrap">
                            WIN RATE: {(losses === 0 ? wins : wins / losses || 0).toFixed(2)}
                        </h2>
                        <div className="flex items-center">
                            <div className="mr-2 size-5 rounded-md bg-text"></div>
                            <p className="whitespace-nowrap">TOTAL: {total}</p>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-2 size-5 rounded-md bg-accent-500"></div>
                            <p className="whitespace-nowrap">WINS: {wins}</p>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-2 size-5 rounded-md bg-primary-500"></div>
                            <p className="whitespace-nowrap">DRAWS: {draws}</p>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-2 size-5 rounded-md bg-secondary-500"></div>
                            <p className="whitespace-nowrap">LOSSES: {losses}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieChart;

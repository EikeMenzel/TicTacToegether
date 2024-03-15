import { useGame } from '../hooks/GameContext';
import { useModal } from '../hooks/ModalContext';
import { useUser } from '../hooks/UserContext';

function Home() {
    const { openModal } = useModal();
    const { leaveQueue, joinQueue } = useGame();
    const user = useUser();

    const handleQueue = () => {
        joinQueue();
        openModal('queue', leaveQueue);
    };

    return (
        <div className="flex h-full grow items-center justify-center">
            <div className="w-full text-text xl:grid xl:grid-cols-2">
                <div className="my-24 text-center xl:my-auto">
                    <h1 className="mb-6 text-4xl font-bold sm:text-6xl">
                        Welcome to <br />
                        <i className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text p-1 text-transparent">
                            TicTacToegether!
                        </i>
                    </h1>
                    <h4 className="mb-12 flex justify-center text-lg sm:text-3xl">
                        Join now to <b className="mx-1 animate-pulse">play</b> and connect with{' '}
                        <b className="mx-1 animate-bounce">friends</b>.
                    </h4>
                    <div className="flex justify-center gap-14">
                        {user.user ? (
                            <button
                                onClick={handleQueue}
                                className="rounded border border-primary-500 px-3 py-2">
                                Play now
                            </button>
                        ) : (
                            <button
                                onClick={() => openModal('register')}
                                className="rounded border border-primary-500 px-3 py-2">
                                Sign Up
                            </button>
                        )}

                        <button className="rounded border border-accent-500 px-3 py-2">
                            Get Started
                        </button>
                    </div>
                </div>
                <div className="m-4 flex items-center">
                    <div className="mx-auto grid aspect-square w-full grid-cols-3 gap-4 md:max-w-[70vw] xl:max-w-[30vw]">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="rounded-xl bg-secondary-400 p-6">
                                {Math.random() > 0.5 ? (
                                    <div className="aspect-square h-full w-full rounded-full border-[1rem] border-text"></div>
                                ) : (
                                    <div className="relative flex aspect-square h-full w-full items-center justify-center">
                                        <div className="absolute h-4 w-full rotate-[45deg] rounded-l-full rounded-r-full bg-text"></div>
                                        <div className="h-full w-4 rotate-[45deg] rounded-l-full rounded-r-full bg-text"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;

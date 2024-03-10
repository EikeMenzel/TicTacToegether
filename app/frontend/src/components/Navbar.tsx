import {
    BuildingLibraryIcon,
    MoonIcon,
    SunIcon,
    UserIcon,
    ArrowLeftStartOnRectangleIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/UserContext';
import { useModal } from '../hooks/ModalContext';
import UserProfileImage from './UserProfileImage';

interface Props {
    setDarkMode: (mode: boolean) => void;
    darkMode: boolean;
}

const Navbar: React.FC<Props> = ({ setDarkMode, darkMode }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownMenu = useRef<HTMLDivElement>(null);

    const { openModal } = useModal();

    const { user, logout } = useUser();

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
    };

    const handleProfile = () => {
        setDropdownOpen(false);
        if (user) navigate(user?.username);
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownMenu.current && !dropdownMenu.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);

    return (
        <>
            <nav className="flex w-full items-center justify-between text-text">
                <h1 className="m-5 text-xl font-bold sm:text-3xl">
                    <Link to={'/'}>TicTacToegether</Link>
                </h1>
                <div className="relative">
                    <div className="mx-3 flex items-center gap-3">
                        {user ? (
                            <>
                                <Link className={'flex items-center gap-3'} to={user.username}>
                                    <p className="hidden sm:block">{user.username}</p>
                                    <div className="relative">
                                        <span className="absolute -right-10 -top-3 me-2 rounded bg-secondary-400 px-2.5 py-0.5 text-xs font-medium text-secondary-800">
                                            {user.elo}
                                        </span>
                                        <UserProfileImage image={user.image} size={10} />
                                    </div>
                                </Link>
                                <div
                                    className="cursor-pointer"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}>
                                    {dropdownOpen ? (
                                        <ChevronUpIcon
                                            width={24}
                                            className="transition-transform hover:scale-125"
                                        />
                                    ) : (
                                        <ChevronDownIcon
                                            width={24}
                                            className="transition-transform hover:scale-125"
                                        />
                                    )}
                                </div>
                                <DarkModeToggle setDarkMode={setDarkMode} darkMode={darkMode} />
                            </>
                        ) : (
                            <>
                                <button onClick={() => openModal('login')}>Sign in</button>
                                <button className="mx-0.5" onClick={() => openModal('register')}>
                                    Sign up
                                </button>
                                <DarkModeToggle setDarkMode={setDarkMode} darkMode={darkMode} />
                            </>
                        )}
                    </div>

                    {/* Dropdown */}
                    <div
                        className={`duration-400 fixed right-0 z-50 m-4 overflow-hidden rounded-md bg-background text-lg shadow-lg transition-[max-height] ease-in-out ${
                            dropdownOpen ? 'max-h-[400px]' : 'max-h-0'
                        }`}
                        ref={dropdownMenu}>
                        <p
                            onClick={handleProfile}
                            className="flex cursor-pointer items-center border-b-[1px] border-b-gray-600 px-4 py-3">
                            <UserIcon width={24} className="me-2" />
                            Profile
                        </p>
                        {user?.isAdmin && (
                            <p className="flex cursor-pointer items-center border-b-[1px] border-b-gray-600 px-4 py-3">
                                <BuildingLibraryIcon width={24} className="me-2" />
                                Administration
                            </p>
                        )}
                        <p
                            className="flex cursor-pointer items-center border-b-gray-600 px-4 py-3"
                            onClick={handleLogout}>
                            <ArrowLeftStartOnRectangleIcon width={24} className="me-2" />
                            Log out
                        </p>
                    </div>
                </div>
            </nav>
        </>
    );
};

const DarkModeToggle: React.FC<{ setDarkMode: (mode: boolean) => void; darkMode: boolean }> = ({
    setDarkMode,
    darkMode
}) => {
    return (
        <button onClick={() => setDarkMode(!darkMode)} className="px-1">
            {darkMode ? <SunIcon width={32} /> : <MoonIcon width={32} />}
        </button>
    );
};

export default Navbar;

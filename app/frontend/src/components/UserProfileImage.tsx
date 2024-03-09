import { UserIcon } from '@heroicons/react/24/outline';

interface UserProfileImageProps {
    image: string | undefined;
    size: number;
    className?: string;
}

const UserProfileImage: React.FC<UserProfileImageProps> = ({ image, size, className }) => {
    const remSize = `${size * 0.25}rem`;

    return image ? (
        <img
            src={image}
            alt="Profile"
            style={{ height: remSize, width: remSize }}
            className={`rounded-full bg-text object-cover ${className}`}
        />
    ) : (
        <div
            style={{ height: remSize, width: remSize }}
            className={`rounded-full bg-text ${className}`}>
            <UserIcon
                style={{ height: remSize, width: remSize }}
                className={`p-2 text-background`}
            />
        </div>
    );
};

export default UserProfileImage;

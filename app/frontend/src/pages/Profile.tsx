import { User, useUser } from '../hooks/UserContext';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiFetch } from '../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileOwn from '../components/ProfileOwn';
import ProfileForeign from '../components/ProfileForeign';

const Profile = () => {
    const { username } = useParams();
    const { user } = useUser();
    const [foreignUser, setForeignUser] = useState<User | undefined>();
    const navigate = useNavigate();

    useEffect(() => {
        if (username === user?.username) return;

        const fetchUser = async () => {
            try {
                const result = await apiFetch(`profiles/${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get('sessionToken')}`
                    }
                });

                if (!result.ok) {
                    navigate('/');
                    return;
                }

                const data = await result.json();
                setForeignUser(data);
            } catch (err: unknown) {
                navigate('/');
            }
        };

        fetchUser();
    }, [navigate, user?.username, username]);

    return username === user?.username ? (
        <ProfileOwn user={user} />
    ) : (
        foreignUser && <ProfileForeign user={foreignUser} />
    );
};

export default Profile;

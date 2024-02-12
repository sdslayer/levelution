import React, { useState, useEffect } from 'react';
import { getDatabase, set, get, push, update, remove, ref, child, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import './user.css'
import { type } from '@testing-library/user-event/dist/type';

export const User = () => {
    
    const [userDisplayName, setDisplayName] = useState(null);
    const [userLastLogin, setLastLogin] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = getAuth().currentUser;

        if (!user) {
            navigate('/');
        } else {
            setDisplayName(user.displayName);

            getLastLogin().then(lastLogin => {
                setLastLogin(lastLogin);
            }).catch(error => {
                console.error("Error fetching last login time:", error);
            });
        }
    }, [navigate]);

    const db = getDatabase();

    function getUserData() {
        const user = getAuth().currentUser;
        const userRef = ref(db, `users/${user.email.replace('.', '_')}`);
    
        return get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val() || 0;
                    const stringData = JSON.stringify(userData)
                    const convData = JSON.parse(stringData)
                    return convData;
                }
            });
    }

    async function getLastLogin() {
        try {
            const userData = await getUserData();
            return userData.lastLogin || ''; // Return last login time or empty string if not available
        } catch (error) {
            throw error;
        }
    }


    const signOutAndNavigate = async () => {
        try {
            // Sign out the user from Firebase
            await signOut(auth);
            localStorage.removeItem("auth"); // Remove user data from local storage
            navigate("/"); // Navigate to the auth page
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    function formatHumanReadableDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
    }

    return (
        <div className='start-group'>
            <h1>Welcome {userDisplayName}</h1> {/* Render the user's email */}
            <h3>Last Login: {formatHumanReadableDate(userLastLogin)}</h3>

            <h3>Games</h3>
            <form>
            <label>
                Minecraft (Hypixel)
                <input type="text" name="name" />
            </label>
            <input type="submit" value="Submit" />
            </form>

            <h5>test</h5>
            <button onClick={() => getLastLogin()}>TEST</button>

            <div className='signout'>
                <button className="signout-button" onClick={signOutAndNavigate}>Sign Out</button>
            </div>
        </div>
    );
}

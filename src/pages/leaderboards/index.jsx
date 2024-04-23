import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, orderByChild, limitToFirst } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import './leaderboards.css';
import NavBar from '../../components/WebNavbar';

export const Leaderboards = () => {
    const [userDisplayName, setDisplayName] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName);
                fetchLeaderboardData();
            } else {
                navigate('/');
            }
        });
    }, [navigate]);

    const db = getDatabase();

    async function fetchLeaderboardData() {
        const userRef = ref(db, 'users');
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const users = [];
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const latestData = userData?.data?.hypixelBW;
                const name = userData?.names?.hypixelBW?.name;
                if (latestData) {
                    const latestEntry = Object.entries(latestData).pop();
                    const level = latestEntry[1] || 0; // Assuming level is stored in the 'level' field
                    users.push({ name, level });
                }
            });

            // Sort users by level in descending order
            users.sort((a, b) => b.level - a.level);

            // Display top 10 users or all users if less than 10
            const topUsers = users.slice(0, Math.min(users.length, 10));
            setLeaderboardData(topUsers);
        }
    }

    const signOutAndNavigate = async () => {
        try {
            // Sign out
            await signOut(auth);
            localStorage.removeItem("auth"); // Remove user data from local storage
            navigate("/"); // Navigate to auth
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    return (
        <div className='user-account'>
        <NavBar />
            <h1>Leaderboards</h1>
            <h2>Hypixel (Bedwars)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Level</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((user, index) => (
                        <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.level}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
    
            <div className='signout'>
                <button className="signout-button" onClick={signOutAndNavigate}>Sign Out</button>
            </div>
        </div>
    );
}

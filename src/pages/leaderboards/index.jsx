/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './leaderboards.module.css';
import NavBar from '../../components/WebNavbar';

export const Leaderboards = () => {
    const [userDisplayName, setDisplayName] = useState(null);
    const [leaderboardBWData, setLeaderboardBWData] = useState([]);
    const [leaderboardGDData, setLeaderboardGDData] = useState([]);
    const [leaderboardGDMoonData, setLeaderboardGDMoonData] = useState([]);
    const [activeTab, setActiveTab] = useState('bedwars');
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName);
                console.log(userDisplayName)
                fetchLeaderboardBWData();
                fetchLeaderboardGDData();
                fetchLeaderboardGDMoonData();
            } else {
                navigate('/');
            }
        });
    }, [navigate]);

    const db = getDatabase();

    async function fetchLeaderboardBWData() {
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
                    const level = latestEntry[1] || 0;
                    users.push({ name, level });
                }
            });

            // Sort users by level in descending order
            users.sort((a, b) => b.level - a.level);

            // Display top 10 users or all users if less than 10
            const topUsers = users.slice(0, Math.min(users.length, 10));
            setLeaderboardBWData(topUsers);
        }
    }

    async function fetchLeaderboardGDData() {
        const userRef = ref(db, 'users');
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const users = [];
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const latestData = userData?.data?.GD;
                var name = userData?.names?.GD?.name;
                if (userData?.names?.GD?.actualname) {
                    name = userData?.names?.GD?.actualname;
                    
                }
                if (latestData) {
                    const latestEntry = Object.entries(latestData).pop();
                    const stars = latestEntry[1] || 0;
                    users.push({ name, stars });
                }
            });

            // Sort users by level in descending order
            users.sort((a, b) => b.stars - a.stars);

            // Display top 10 users or all users if less than 10
            const topUsers = users.slice(0, Math.min(users.length, 10));
            setLeaderboardGDData(topUsers);
        }
    }

    async function fetchLeaderboardGDMoonData() {
        const userRef = ref(db, 'users');
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const users = [];
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const latestData = userData?.data?.GDmoons;
                var name = userData?.names?.GD?.name;
                if (userData?.names?.GD?.actualname) {
                    name = userData?.names?.GD?.actualname;
                    
                }
                if (latestData) {
                    const latestEntry = Object.entries(latestData).pop();
                    const moons = latestEntry[1] || 0;
                    users.push({ name, moons });
                }
            });

            // Sort users by level in descending order
            users.sort((a, b) => b.moons - a.moons);

            // Display top 10 users or all users if less than 10
            const topUsers = users.slice(0, Math.min(users.length, 10));
            setLeaderboardGDMoonData(topUsers);
        }
    }

    return (
        <div className={styles['user-account']}>
            <NavBar />
            <h1>Leaderboards</h1>
            <div className={styles.tabs}>
                <button className={activeTab === 'bedwars' ? styles.active : ''} onClick={() => setActiveTab('bedwars')}>Hypixel Bedwars (Level)</button>
                <button className={activeTab === 'geometryDash' ? styles.active : ''} onClick={() => setActiveTab('geometryDash')}>Geometry Dash (Star Count)</button>
                <button className={activeTab === 'geometryDashMoons' ? styles.active : ''} onClick={() => setActiveTab('geometryDashMoons')}>Geometry Dash (Moon Count)</button>
            </div>
            {activeTab === 'bedwars' && (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardBWData.map((user, index) => (
                            <tr key={index}>
                                <td>{user.name}</td>
                                <td>{user.level}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {activeTab === 'geometryDash' && (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Stars</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardGDData.map((user, index) => (
                            <tr key={index}>
                                <td>{user.name}</td>
                                <td>{user.stars}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {activeTab === 'geometryDashMoons' && (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Moons</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardGDMoonData.map((user, index) => (
                            <tr key={index}>
                                <td>{user.name}</td>
                                <td>{user.moons}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

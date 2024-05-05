/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import './help.css';
import NavBar from '../../components/WebNavbar';

export const Help = () => {
    const [userDisplayName, setDisplayName] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName);
                console.log(userDisplayName);
            } else {
                navigate('/');
            }
        });
    }, [navigate]);


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
            <h1>Help</h1>
            <h4>This section of the site will assist you in getting started.</h4>
            <br></br>
            <h3>Hypixel (Bedwars)</h3>
            <p>To get started with logging your Bedwars stats, you will first need to have a Minecraft account that is not banned from the server <b>mc.hypixel.net</b>.</p>
    
            <div className='signout'>
                <button className="signout-button" onClick={signOutAndNavigate}>Sign Out</button>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { getDatabase, set, get, push, update, remove, ref, child, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import './user.css';
import axios from 'axios';
import { type } from '@testing-library/user-event/dist/type';

export const User = () => {
    
    const [userDisplayName, setDisplayName] = useState(null);
    const [userLastLogin, setLastLogin] = useState(null);
    const [userMinecraftKey, setMinecraftKey] = useState("");
    const [bedwarsLevel, setBedwarsLevel] = useState(null);
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

    const handleMinecraftFormSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        console.log("Minecraft Key:", userMinecraftKey);
        const uuid = "ab5e4e78-c45c-42ba-b12b-197c9edade37";
        const key = userMinecraftKey;
        axios.get("https://api.hypixel.net/player?uuid=" + uuid + "&key=" + key)
        .then(({data}) => {
            console.log(data);
            const bwlevel = data['player']['achievements']['bedwars_level']
            console.log(bwlevel);
            setBedwarsLevel(bwlevel);
        })
        .catch(err => {
            console.error(err);
    })};


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

    function buttonTest() {
        
    }

    return (
        <div className='start-group'>
            <h1>Welcome {userDisplayName}</h1> {/* Render the user's email */}
            <h3>Last Login: {formatHumanReadableDate(userLastLogin)}</h3>

            <h3>Games</h3>
            <form onSubmit={handleMinecraftFormSubmit}> {/* Attach the event handler to the form submission */}
                <label>
                    Minecraft (Hypixel)
                    <input type="text" name="name" value={userMinecraftKey} onChange={(e) => setMinecraftKey(e.target.value)} /> {/* Update the state with the value of the text box */}
                </label>
                <input type="submit" value="Submit" />
            </form>

            <h4>Level: {bedwarsLevel}</h4>

            <button onClick={() => buttonTest()}>TEST</button>

            <div className='signout'>
                <button className="signout-button" onClick={signOutAndNavigate}>Sign Out</button>
            </div>
        </div>
    );
}

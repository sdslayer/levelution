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
    const [userBedwarsKey, setBedwarsKey] = useState("");
    const [userBedwarsName, setBedwarsName] = useState("");
    const [userBedwarsID, setBedwarsID] = useState("");
    const [userProfilePicture, setuserProfilePicture] = useState("");
    const [bedwarsLevel, setBedwarsLevel] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName);
                setuserProfilePicture(user.photoURL);
    
                getLastLogin().then(lastLogin => {
                    setLastLogin(lastLogin);
                }).catch(error => {
                    console.error("Error fetching last login time:", error);
                });
            } else {
                navigate('/');
            }
            });


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
            return userData.lastLogin || '';
        } catch (error) {
            throw error;
        }
    }

    const handleBedwarsFormSubmit = (event) => {
        event.preventDefault();

        const user = getAuth().currentUser;
        const email = user.email.replace('.', '_');
        const game = 'hypixelBW';
        
        console.log("hypixelBW Key:", userBedwarsKey);
        // const uuid = "ab5e4e78-c45c-42ba-b12b-197c9edade37";
        const key = userBedwarsKey;
        const keyRef = ref(db, `users/${email}/keys/${game}`);
            set(child(keyRef, 'key'), key)
                .then(() => {
                    console.log(`Key stored in the database under ${email}/keys/${game}`);
                })
                .catch(error => {
                    console.error("Error storing key in the database:", error);
                });
        // axios.get("https://api.hypixel.net/player?uuid=" + uuid + "&key=" + key)
        // .then(({data}) => {
        //     console.log(data);
        //     const bwlevel = data['player']['achievements']['bedwars_level'];
        //     setBedwarsLevel(bwlevel);

            
        // })
        // .catch(err => {
        //     console.error(err);
        // });
    };

    const handleBedwarsNameSubmit = (event) => {
        event.preventDefault();

        const user = getAuth().currentUser;
        const email = user.email.replace('.', '_');
        const game = 'hypixelBW';
        
        console.log("hypixelBW Name:", userBedwarsName);
        axios.get("https://playerdb.co/api/player/minecraft/" + userBedwarsName)
        .then(({data}) => {
            console.log(data);
            console.log(data['data']['player']['id']);
            const BWuuid = data['data']['player']['id'];
            const id = BWuuid;
            console.log("hypixelBW UUID:", BWuuid);
            const idRef = ref(db, `users/${email}/ids/${game}`);
            set(child(idRef, 'id'), id)
                .then(() => {
                    console.log(`Key stored in the database under ${email}/ids/${game}`);
                    setBedwarsID(id);
                })
                .catch(error => {
                    console.error("Error storing key in the database:", error);
                });
        })
        .catch(err => {
            console.error(err);
        });
    };


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

    function formatHumanReadableDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
    }

    function handleBedwarsLevelButton() {
        if (userBedwarsKey && userBedwarsID){
            axios.get("https://api.hypixel.net/player?uuid=" + userBedwarsID + "&key=" + userBedwarsKey)
            .then(({data}) => {
                console.log(data);
                const bwlevel = data['player']['achievements']['bedwars_level'];
                setBedwarsLevel(bwlevel);
    
                
            })
            .catch(err => {
                console.error(err);
            });
        }
        else{
            setBedwarsLevel("Missing one or more arguments!")
        }
    }

    return (
        <div className='user-account'>
            <div className='user-info'>
                {/* Profile Picture */}
                <img src={userProfilePicture} alt="" />

                {/* Display Username */}
                <h1>Welcome, {userDisplayName}!</h1>

                {/* Display Last Login */}
                <p>Last Login: {formatHumanReadableDate(userLastLogin)}</p>
            </div>

            <div className='game-info'>
                <h2>Games</h2>
                <h3>Minecraft (Hypixel Bedwars)</h3>
                <form onSubmit={handleBedwarsFormSubmit}>
                    <label>
                        API Key
                        <input type="text" name="name" value={userBedwarsKey} onChange={(e) => setBedwarsKey(e.target.value)} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>

                <form onSubmit={handleBedwarsNameSubmit}>
                    <label>
                        Username
                        <input type="text" name="name" value={userBedwarsName} onChange={(e) => setBedwarsName(e.target.value)} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>

                <button onClick={() => handleBedwarsLevelButton()}>Print Level</button>

                {bedwarsLevel && (
                    <p>Level: {bedwarsLevel}</p>
                )}
            </div>

            <h3>Friend Requests (0)</h3>
            {/*List friend requests*/}

            <div className='signout'>
                <button className="signout-button" onClick={signOutAndNavigate}>Sign Out</button>
            </div>
        </div>
    );
}

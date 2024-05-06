/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import './help.css';
import NavBar from '../../components/WebNavbar';
import BWServer from '../../images/hypixelserver.png'
import BWChat from '../../images/hypixelchat.PNG'
import BWSubmit from '../../images/hypixelwebsubmit.PNG'
import GDMenu from '../../images/gdmenu.png'
import GDBrowser from '../../images/gdbrowser2.png'
import GDSubmit from '../../images/gdsubmit.PNG'

export const Help = () => {
    const [userDisplayName, setDisplayName] = useState(null);
    const [userGDName, setGDName] = useState("");
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

    const handleGDFormSubmit = (event) => {
        event.preventDefault();
    
        var gdwebsite = `https://gdbrowser.com/u/${userGDName}`
        window.open(gdwebsite, '_blank', 'noopener,noreferrer')
      };

    return (
        <div className='user-account'>
        <NavBar />
            <h1>Help</h1>
            <h4>This section of the site will assist you in getting started.</h4>
            <br></br>
            <h3>Hypixel (Bedwars)</h3>
            <p>To get started with logging your Bedwars stats, you will first need to have a Minecraft account that is not banned from the server <b>mc.hypixel.net</b>.</p>
            <img src={BWServer} alt="Hypixel Server" width="40%"></img>
            <p>If you are unsure of your Minecraft username, simply log in with your email and join the above server address.</p>
            <p>Then send any message, and you will see your name in the chat. Ignore any text that appears within brackets, like [OWNER] or [MVP].</p>
            <img src={BWChat} alt="Hypixel Chat"></img>
            <p>In this case, my username is <b>sdslayer</b>.</p>
            <p>Then simply return to your user page, and enter that username in the text box.</p>
            <img src={BWSubmit} alt="Hypixel Web Submit"></img>
            <p>Then click <b>Submit</b>, and your level will start logging automatically!</p>

            <br></br>

            <h3>Geometry Dash</h3>
            <p>To get started with logging your Geometry Dash stats, you will first need to have a Geometry Dash account.</p>
            <p>Your name is visible on the main menu in the bottom-left corner above the profile button.</p>
            <img src={GDMenu} alt="GD Menu" width="40%"></img>
            <p>Once you have your username, you can enter it in this box:</p>
            <form onSubmit={handleGDFormSubmit}>
            <label>
                Username
                <input
                type="text"
                name="name"
                value={userGDName}
                onChange={(e) => setGDName(e.target.value)}
                />
            </label>
            <input type="submit" value="Submit" />
            </form>
            <p>This will open a new website, where you can see your <b>User ID</b>.</p>
            <img src={GDBrowser} alt="GD Browser" width="40%"></img>
            <p>Copy that User ID, and go back to your user page, and enter the User ID in the textbox.</p>
            <img src={GDSubmit} alt="GD Submit"></img>
            <p>Then click <b>Submit</b>, and your star count will start logging automatically!</p>

            <br></br>
            <h2>About the site</h2>
            <h3>The website logs all data using the informnation given by users once per day at 12:00am, PST.</h3>
    
            <div className='signout'>
                <button className="signout-button" onClick={signOutAndNavigate}>Sign Out</button>
            </div>
        </div>
    );
}

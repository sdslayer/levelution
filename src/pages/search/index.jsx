import React, { useState, useEffect } from 'react';
import { getDatabase, set, get, push, update, remove, ref, child, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import './search.css';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import NavBar from '../../components/WebNavbar';

export const Search = () => {

    const [userDisplayName, setDisplayName] = useState(null);
    const [userLastLogin, setLastLogin] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const [searchedUserData, setSearchedUserData] = useState(null); // State to store the data of the searched user
    const [requestSent, setRequestStatus] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName);

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

    async function getLastLogin() {
        try {
            const userData = await getUserData();
            return userData.lastLogin || '';
        } catch (error) {
            throw error;
        }
    }

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

    async function searchUser() {
        try {
            // Fetch all user emails
            const userRef = ref(db, 'users');
            const snapshot = await get(userRef);
    
            // Iterate over each user's email entry
            snapshot.forEach((childSnapshot) => {
                const userEmail = childSnapshot.key.replace('_', '.'); // Convert back to email format
                const displayNameRef = child(childSnapshot.ref, 'name');
    
                // Fetch the display name and last login time associated with the email
                get(displayNameRef).then(async (displayNameSnapshot) => {
                    const displayName = displayNameSnapshot.val();
                    console.log("Checking user:", userEmail, "with display name:", displayName);
    
                    // Check if the display name matches the search query
                    if (displayName === searchQuery) {
                        // Fetch last login time
                        const userData = await getUserData(userEmail);
                        const lastLogin = userData.lastLogin || '';
                        const latestBWData = userData?.data?.hypixelBW;
                        const latestGDData = userData?.data?.GD;
                        var level = null;
                        var bedwarsData = null;
                        if (latestBWData) {
                            bedwarsData = transformBedwarsData(latestBWData);
                            const latestEntry = Object.entries(latestBWData).pop();
                            level = latestEntry[1] || 0; // Assuming level is stored in the 'level' field
                        }
                        var stars = null;
                        var GDData = null;
                        if (latestGDData) {
                            GDData = transformGDData(latestGDData);
                            const latestEntry = Object.entries(latestGDData).pop();
                            stars = latestEntry[1] || 0; // Assuming level is stored in the 'level' field
                        }
    
                        // Extract bedwars data for the chart
                        const bedwarsDomains = ['auto', 'auto']; // Set your own Y-axis domain here
    
                        // Extract GD data for the chart
                        const GDDomains = ['auto', 'auto']; // Set your own Y-axis domain here
    
                        // Set searched user data
                        setSearchedUserData({
                            email: userEmail,
                            lastLogin: lastLogin,
                            profilePicture: userData.profilePhoto, // Assuming profile picture is stored in the database
                            bedwarsLevel: level || null, // Assuming bedwars level is stored in the database
                            GDstars: stars || null, // Assuming bedwars level is stored in the database
                            bedwarsData: bedwarsData,
                            bedwarsDomains: bedwarsDomains,
                            GDData: GDData,
                            GDDomains: GDDomains
                        });
                        console.log(searchedUserData)
                        // console.log(userData)
    
                    }
                }).catch((error) => {
                    console.error("Error fetching display name:", error);
                });
            });
        } catch (error) {
            console.error("Error searching for user:", error);
        }
    }

    

  const transformBedwarsData = (data) => {
    return Object.entries(data).map(([time, level]) => ({
      time: new Date(parseInt(time) * 1000), // Convert Unix timestamp to Date object
      level: level,
    }));
  };

  const transformGDData = (data) => {
    return Object.entries(data).map(([time, level]) => ({
      time: new Date(parseInt(time) * 1000), // Convert Unix timestamp to Date object
      stars: level,
    }));
  };
    

    const sendFriendRequest = async () => {
        try {
            const currentUserEmail = getAuth().currentUser.email;
            const incomingRequestsRef = ref(db, `users/${searchedUserData.email.replace('.', '_')}/incomingRequests`);
            await set(child(incomingRequestsRef, currentUserEmail.replace('.', '_')), true);
            console.log(`Friend request sent to ${searchedUserData.email}`);
            setRequestStatus(true);
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };


    async function getUserData(email) {
        const userRef = ref(db, `users/${email.replace('.', '_')}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            return userData;
        }
        return {};
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        searchUser();
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

    return (
        <div className='user-account'>
            <NavBar />
            <div className='user-info'></div>

            <div className='search'>
                <h2>Search</h2>
                <form onSubmit={handleSearchSubmit}>
                    <label>
                        Search by Display Name
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </label>
                    <input type="submit" value="Search" />
                </form>

                {/* Display search results */}
                {searchedUserData && (
                    <div className="search-results">
                        <h3>User Information</h3>
                        <p>Email: {searchedUserData.email}</p>
                        <p>Last Login: {formatHumanReadableDate(searchedUserData.lastLogin)}</p>
                        <img src={searchedUserData.profilePicture} alt="Profile" />
                        <h4>Game Levels</h4>
                        {searchedUserData.bedwarsLevel && (
                            <p>Bedwars Level: {searchedUserData.bedwarsLevel}</p>
                        )}
                        {searchedUserData.GDstars && (
                            <p>GD Star Count: {searchedUserData.GDstars}</p>
                        )}
                        {/* Display bedwars data */}
                        {!searchedUserData.bedwarsData && (
                            <div>
                                <h4>Bedwars Data</h4>
                                <h2>NO DATA</h2>
                                </div>
                        )}
                        {searchedUserData.bedwarsData && (
                            <div>
                                <h4>Bedwars Data</h4>
                                <LineChart
                                    width={500}
                                    height={300}
                                    data={searchedUserData.bedwarsData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis domain={searchedUserData.bedwarsDomains} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="level"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </div>
                        )}
                        {/* Display GD data */}
                        {!searchedUserData.GDData && (
                            <div>
                                <h4>Geometry Dash Data</h4>
                                <h2>NO DATA</h2>
                                </div>
                        )}
                        {searchedUserData.GDData && (
                            <div>
                                <h4>Geometry Dash Data</h4>
                                <LineChart
                                    width={500}
                                    height={300}
                                    data={searchedUserData.GDData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis domain={searchedUserData.GDDomains} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="stars"
                                        stroke="#82ca9d"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </div>
                        )}
                        <button className="friendreq-button" onClick={sendFriendRequest}>Send Friend Request</button>
                    </div>
                )}
            </div>

            <div className='signout'>
                <button className="signout-button" onClick={signOutAndNavigate}>Sign Out</button>
            </div>
        </div>
    );

}

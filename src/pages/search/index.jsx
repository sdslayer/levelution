/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { getDatabase, set, get, ref, child } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import NavBar from '../../components/WebNavbar';
import styles from './search.module.css'

export const Search = () => {

  const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
  const [searchedUserData, setSearchedUserData] = useState(null); // State to store the data of the searched user
  const [requestSent, setRequestStatus] = useState(false);
  const [friendStatus, setFriendStatus] = useState(false);
  const navigate = useNavigate();

  const db = getDatabase();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("")
      } else {
        navigate('/');
      }
    });
  }, [navigate]);



  useEffect(() => {
    // Check if searchedUserData is updated
    if (searchedUserData) {
      // console.log(searchedUserData);

      var yourEmail = getAuth().currentUser.email.replace('.', '_')
      if (searchedUserData.friends) {
        var friendArray = Object.keys(searchedUserData.friends) || []

        if (friendArray.includes(yourEmail)) {
          setFriendStatus(true)
          // console.log("friend stat changed to true")
        }

      }
    }

  }, [searchedUserData]);

  async function searchUser() {
    setFriendStatus(false);
    // console.log("friend stat changed to false")
    try {
      const userRef = ref(db, 'users');
      const snapshot = await get(userRef);

      snapshot.forEach((childSnapshot) => {
        const userEmail = childSnapshot.key.replace('_', '.');
        const displayNameRef = child(childSnapshot.ref, 'name');

        get(displayNameRef).then(async (displayNameSnapshot) => {
          const displayName = displayNameSnapshot.val();

          if (displayName === searchQuery) {
            const userData = await getUserData(userEmail);
            const lastLogin = userData.lastLogin || '';
            const latestBWData = userData?.data?.hypixelBW;
            const latestGDData = userData?.data?.GD;
            var level = null;
            var bedwarsData = null;
            if (latestBWData) {
              bedwarsData = transformBedwarsData(latestBWData);
              const latestEntry = Object.entries(latestBWData).pop();
              level = latestEntry[1] || 0;
            }
            var stars = null;
            var GDData = null;
            if (latestGDData) {
              GDData = transformGDData(latestGDData);
              const latestEntry = Object.entries(latestGDData).pop();
              stars = latestEntry[1] || 0;
            }

            const bedwarsDomains = ['auto', 'auto'];
            const GDDomains = ['auto', 'auto'];
            const timeCreated = userData.userCreated;

            setSearchedUserData({
              email: userEmail,
              lastLogin: lastLogin,
              dateCreated: timeCreated,
              displayName: userData.name,
              profilePicture: userData.profilePhoto,
              friends: userData.friends,
              bedwarsLevel: level || null,
              GDstars: stars || null,
              bedwarsData: bedwarsData,
              bedwarsDomains: bedwarsDomains,
              GDData: GDData,
              GDDomains: GDDomains
            });
          }
        }).catch((error) => {
          console.error("Error fetching display name:", error);
        });
      });
    } catch (error) {
      console.error("Error searching for user:", error);
    }
    console.log(searchedUserData)
  }




  const transformBedwarsData = (data) => {
    return Object.entries(data).map(([time, level]) => ({
      time: formatDate(new Date(parseInt(time) * 1000)), // Format date string
      level: level,
    }));
  };

  const transformGDData = (data) => {
    return Object.entries(data).map(([time, level]) => ({
      time: formatDate(new Date(parseInt(time) * 1000)), // Format date string
      stars: level,
    }));
  };

  function formatDate(date) {
    const options = {
      month: "short",
      day: "2-digit",
    };
    return date.toLocaleString(undefined, options);
  }

  const sendFriendRequest = async () => {
    try {
      const currentUserEmail = getAuth().currentUser.email;
      const incomingRequestsRef = ref(db, `users/${searchedUserData.email.replace('.', '_')}/incomingRequests`);
      await set(child(incomingRequestsRef, currentUserEmail.replace('.', '_')), true);
      console.log(`Friend request sent to ${searchedUserData.email}`);
      setRequestStatus(true);
      console.log(requestSent)
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

  function formatHumanReadableYear(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleString(undefined, options);
  }

  return (
    <div className={styles['user-account']}>
      <NavBar />
      <div className={styles['user-info']}></div>

      <div className={styles['search-container']}>
        <h2>Search</h2>
        <label className={styles['display-text']}>
          Search by Display Name</label>
        <p> </p>
        <form className={styles["search-form"]} onSubmit={handleSearchSubmit}>
          <label>
            <input className={styles["search-input"]} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </label>
          <input className={styles["search-submit"]} type="submit" value="Search" />
        </form>
        
        {searchedUserData && (
          <div className={styles["search-results"]}>
            <h3>User Information</h3>
            <p>Username: <b>{searchedUserData.displayName}</b></p>
            <p>Member since: <b>{formatHumanReadableYear(searchedUserData.dateCreated)}</b></p>
            <p>Last Login: <b>{formatHumanReadableDate(searchedUserData.lastLogin)}</b></p>
            <img className={styles["profile-picture"]} src={searchedUserData.profilePicture} alt="Profile" />
            <h4>Game Levels</h4>
            {searchedUserData.bedwarsLevel && (
              <p>Bedwars Level: {searchedUserData.bedwarsLevel}</p>
            )}
            {searchedUserData.GDstars && (
              <p>GD Star Count: {searchedUserData.GDstars}</p>
            )}
            {!searchedUserData.bedwarsData && friendStatus && (
              <div>
                <h4>Bedwars Data</h4>
                <h2>NO DATA</h2>
              </div>
            )}
            {searchedUserData.bedwarsData && friendStatus && (
              <div>
                <h4>Bedwars Data</h4>
                <LineChart
                  className={styles["chart"]}
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
                    stroke="#00b8b8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </div>
            )}
            {/* Display GD data */}
            {!searchedUserData.GDData && friendStatus && (
              <div>
                <h4>Geometry Dash Data</h4>
                <h2>NO DATA</h2>
              </div>
            )}
            {searchedUserData.GDData && friendStatus && (
              <div>
                <h4>Geometry Dash Data</h4>
                <LineChart
                  className={styles["chart"]}
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
                    stroke="#a8a800"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>

                
              </div>
            )}

            {!friendStatus && (
              <button className={styles["friendreq-button"]} onClick={sendFriendRequest}>Send Friend Request</button>
            )}
          </div>
        )}
      </div>
    </div>
  );


}

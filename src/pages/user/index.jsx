/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  getDatabase,
  set,
  get,
  remove,
  ref,
  child,
} from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase-config";
import axios from "axios";
import styles from './user.module.css'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import NavBar from "../../components/WebNavbar";
import HypixelLogo from "../../images/logos/hypixel.png"
import GDLogo from "../../images/logos/gd.png"

export const User = () => {
  const [userDisplayName, setDisplayName] = useState(null);
  const [userLastLogin, setLastLogin] = useState(null);
  const [userDateCreated, setDateCreated] = useState(null);
  const [userBedwarsKey, setBedwarsKey] = useState("");
  const [userBedwarsName, setBedwarsName] = useState("");
  const [userGDName, setGDName] = useState("");
  const [userBedwarsID, setBedwarsID] = useState("");
  const [userProfilePicture, setuserProfilePicture] = useState("");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [currentBedwarsData, setCurrentBedwarsData] = useState([]);
  const [bedwarsData, setBedwarsData] = useState([]);
  const [currentGDData, setCurrentGDData] = useState([]);
  const [GDData, setGDData] = useState([]);
  const [domains, setDomains] = useState([]);
  const [domains2, setDomains2] = useState([]);
  const [gdError, setGDError] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName);
        setuserProfilePicture(user.photoURL);
        fetchIncomingRequests(user);
        getBedwarsLevel();
        getGDData();

        getLastLogin()
          .then((lastLogin) => {
            setLastLogin(lastLogin);
          })
          .catch((error) => {
            console.error("Error fetching last login time:", error);
          });

          getDateCreated()
            .then((dateCreated) => {
              setDateCreated(dateCreated);
            })
            .catch((error) => {
              console.error("Error fetching last login time:", error);
            });
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  const db = getDatabase();

  

  useEffect(() => {
    const fetchRecentEvents = async () => {
      const db = getDatabase();
      const user = getAuth().currentUser;
      const userEmail = user.email.replace(".", "_");

      // Fetch recent events from GD
      const gdEventsRef = ref(db, `users/${userEmail}/events/GD`);
      const gdEventsSnapshot = await get(gdEventsRef);
      const gdEvents = parseEventsSnapshot(gdEventsSnapshot);

      // Fetch recent events from hypixelBW
      const hypixelBWEventsRef = ref(db, `users/${userEmail}/events/hypixelBW`);
      const hypixelBWEventsSnapshot = await get(hypixelBWEventsRef);
      const hypixelBWEvents = parseEventsSnapshot(hypixelBWEventsSnapshot);

      // Combine and sort events by timestamp
      const combinedEvents = [...gdEvents, ...hypixelBWEvents];
      combinedEvents.sort((a, b) => b.timestamp - a.timestamp);

      // Store only the most recent five events
      const mostRecentEvents = combinedEvents.slice(0, 5);
      setRecentEvents(mostRecentEvents);
    };

    fetchRecentEvents();
  }, []);

  const parseEventsSnapshot = (snapshot) => {
    const events = [];
    snapshot.forEach((childSnapshot) => {
      const eventData = childSnapshot.val();
      events.push({
        prev: eventData.prev,
        next: eventData.next,
        timestamp: eventData.timestamp,
        metric: eventData.metric,
      });
    });
    return events;
  };

  function getUserData() {
    const user = getAuth().currentUser;
    const userRef = ref(db, `users/${user.email.replace(".", "_")}`);

    return get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val() || 0;
        const stringData = JSON.stringify(userData);
        const convData = JSON.parse(stringData);
        return convData;
      }
    });
  }

  async function getLastLogin() {
    try {
      const userData = await getUserData();
      return userData.lastLogin || "";
    } catch (error) {
      throw error;
    }
  }

  async function getDateCreated() {
    try {
      const userData = await getUserData();
      return userData.userCreated || "";
    } catch (error) {
      throw error;
    }
  }

  async function getBedwarsLevel() {
    try {
      const userData = await getUserData();
      const latestData = userData?.data?.hypixelBW;
      //   console.log(latestData)
      //   console.log(transformBedwarsData(latestData))
      if (latestData) {
        var fullbwdata = transformBedwarsData(latestData);
        var lowerdom = fullbwdata[0]["level"] - 2;
        var higherdom = fullbwdata[fullbwdata.length - 1]["level"] + 2;
        setDomains([lowerdom, higherdom]);
        const latestEntry = Object.entries(latestData).pop();
        const level = latestEntry[1] || 0;
        const time = parseInt(latestEntry[0]) * 1000 || 0;
        const bwdata = [level, time];
        setBedwarsData(fullbwdata);
        setCurrentBedwarsData(bwdata);
        return level || "";
      }
      return "";
    } catch (error) {
      throw error;
    }
  }

  async function getGDData() {
    try {
      const userData = await getUserData();
      const latestData = userData?.data?.GD;
      const latestMoonData = userData?.data?.GDmoons;
      // console.log("aaabbbbbaaa");
      // console.log(latestData);
      // console.log(latestMoonData);
      if (latestData && latestMoonData) {
        var fulldata = transformGDData(latestData, latestMoonData);
        var lowerdom = fulldata[0]["level"] - 2;
        var higherdom = fulldata[fulldata.length - 1]["level"] + 2;
        setDomains2([lowerdom, higherdom]);
        const latestStarEntry = Object.entries(latestData).pop();
        const level = latestStarEntry[1] || 0; // Assuming level is stored in the 'level' field
        const latestMoonEntry = Object.entries(latestMoonData).pop();
        const moons = latestMoonEntry[1] || 0; // Assuming level is stored in the 'level' field
        const time = parseInt(latestStarEntry[0]) * 1000 || 0;
        const gddata = [level, moons, time];
        console.log(gddata)
        console.log(fulldata)
        setGDData(fulldata);
        setCurrentGDData(gddata);
        return level || "";
      }
      return "";
    } catch (error) {
      throw error;
    }
  }

  async function fetchIncomingRequests(user) {
    try {
      const incomingRequestsRef = ref(
        db,
        `users/${user.email.replace(".", "_")}/incomingRequests`
      );
      const snapshot = await get(incomingRequestsRef);
      const requests = [];

      snapshot.forEach(async (childSnapshot) => {
        const senderEmail = childSnapshot.key.replace("_", ".");
        // get display name associated with email
        const userData = await getUserDataByEmail(senderEmail);
        if (userData.name) {
          requests.push({
            email: senderEmail,
            displayName: userData.name,
          });
        } else {
          requests.push({
            email: senderEmail,
            displayName: senderEmail,
          });
        }
        setIncomingRequests([...requests]); // Update state after fetching all display names
      });
    } catch (error) {
      console.error("Error fetching incoming friend requests:", error);
    }
  }

  async function getUserDataByEmail(email) {
    const userRef = ref(db, `users/${email.replace(".", "_")}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData;
    }
    return {};
  }

  async function handleAcceptRequest(senderEmail) {
    try {
      const currentUser = getAuth().currentUser;
      const currentUserEmail = currentUser.email;
      const currentUserRef = `users/${currentUserEmail.replace(".", "_")}`;

      // Add sender to current user's friends list
      const currentUserFriendsRef = ref(
        db,
        `${currentUserRef}/friends/${senderEmail.replace(".", "_")}`
      );
      await set(currentUserFriendsRef, true);

      // Add current user to sender's friends list
      const senderRef = `users/${senderEmail.replace(".", "_")}`;
      const senderFriendsRef = ref(
        db,
        `${senderRef}/friends/${currentUserEmail.replace(".", "_")}`
      );
      await set(senderFriendsRef, true);

      // Remove the friend request visually
      const incomingRequestsRef = ref(db, `${currentUserRef}/incomingRequests`);
      await remove(child(incomingRequestsRef, senderEmail.replace(".", "_")));

      // Get updated incoming requests
      const updatedRequests = incomingRequests.filter(
        (request) => request.email !== senderEmail
      );
      setIncomingRequests(updatedRequests);
      await fetchIncomingRequests(currentUser);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  }

  const handleDenyRequest = async (senderEmail) => {
    try {
      const currentUser = getAuth().currentUser;
      const currentUserEmail = currentUser.email.replace(".", "_");

      // Remove the request from the current user's incoming requests
      const updatedRequests = incomingRequests.filter(
        (request) => request.email !== senderEmail
      );
      setIncomingRequests(updatedRequests);

      // Remove the denied request from the current user's incoming requests in the database
      const incomingRequestsRef = ref(
        db,
        `users/${currentUserEmail}/incomingRequests`
      );
      await remove(child(incomingRequestsRef, senderEmail.replace(".", "_")));
    } catch (error) {
      console.error("Error denying friend request:", error);
    }
  };

  const handleBedwarsFormSubmit = (event) => {
    event.preventDefault();

    const user = getAuth().currentUser;
    const email = user.email.replace(".", "_");
    const game = "hypixelBW";

    console.log("hypixelBW Key:", userBedwarsKey);
    // const uuid = "ab5e4e78-c45c-42ba-b12b-197c9edade37";
    const key = userBedwarsKey;
    const keyRef = ref(db, `users/${email}/keys/${game}`);
    set(child(keyRef, "key"), key)
      .then(() => {
        console.log(`Key stored in the database under ${email}/keys/${game}`);
      })
      .catch((error) => {
        console.error("Error storing key in the database:", error);
      });
  };

  const handleBedwarsNameSubmit = (event) => {
    event.preventDefault();

    const user = getAuth().currentUser;
    const email = user.email.replace(".", "_");
    const game = "hypixelBW";

    console.log("hypixelBW Name:", userBedwarsName);
    const nameRef = ref(db, `users/${email}/names/${game}`);
    set(child(nameRef, "name"), userBedwarsName)
      .then(() => {
        console.log(`Key stored in the database under ${email}/names/${game}`);
      })
      .catch((error) => {
        console.error("Error storing key in the database:", error);
      });
    axios
      .get("https://playerdb.co/api/player/minecraft/" + userBedwarsName)
      .then(({ data }) => {
        console.log(data);
        console.log(data["data"]["player"]["id"]);
        const BWuuid = data["data"]["player"]["id"];
        const id = BWuuid;
        console.log("hypixelBW UUID:", BWuuid);
        const idRef = ref(db, `users/${email}/ids/${game}`);
        set(child(idRef, "id"), id)
          .then(() => {
            console.log(
              `Key stored in the database under ${email}/ids/${game}`
            );
            setBedwarsID(id);
            console.log(userBedwarsID)
          })
          .catch((error) => {
            console.error("Error storing key in the database:", error);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleGDFormSubmit = (event) => {
    setGDError(false);
    event.preventDefault();

    const user = getAuth().currentUser;
    const email = user.email.replace(".", "_");
    const game = "GD";

    var isNumber = (!isNaN(+userGDName))

    if(!isNumber) {
      console.log("NOT A VALID ID")
      setGDError(true);
      return
    }

    console.log("GD Name:", userGDName);
    setGDError(false);
    // const uuid = "ab5e4e78-c45c-42ba-b12b-197c9edade37";
    const name = userGDName;
    const nameRef = ref(db, `users/${email}/names/${game}`);
    // const actualnameRef = ref(db, `users/${email}/names/${game}`);
    set(child(nameRef, "name"), name)
      .then(() => {
        console.log(`Name stored in the database under ${email}/names/${game}`);
      })
      .catch((error) => {
        console.error("Error storing name in the database:", error);
      });

      // set(child(actualnameRef, "actualName"), name)
      //   .then(() => {
      //     console.log(`Name stored in the database under ${email}/names/${game}`);
      //   })
      //   .catch((error) => {
      //     console.error("Error storing name in the database:", error);
      //   });
  };



  function formatHumanReadableDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  }

  function formatHumanReadableYear(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  }

  // function handleBedwarsLevelButton() {
  //     if (userBedwarsKey && userBedwarsID){
  //         axios.get("https://api.hypixel.net/player?uuid=" + userBedwarsID + "&key=" + userBedwarsKey)
  //         .then(({data}) => {
  //             console.log(data);
  //             const bwlevel = data['player']['achievements']['bedwars_level'];
  //             setBedwarsLevel(bwlevel);

  //         })
  //         .catch(err => {
  //             console.error(err);
  //         });
  //     }
  //     else{
  //         setBedwarsLevel("Missing one or more arguments!")
  //     }
  // }
  const transformBedwarsData = (data) => {
    return Object.entries(data).map(([time, level]) => ({
      time: formatDate(new Date(parseInt(time) * 1000)), // Format date string
      level: level,
    }));
  };
  
  const transformGDData = (dataStars, dataMoons) => {
    const combinedData = {};
  
    // Map stars data
    Object.entries(dataStars).forEach(([time, stars]) => {
      combinedData[time] = { time: formatDate(new Date(parseInt(time) * 1000)), stars };
    });
  
    // Map moons data
    Object.entries(dataMoons).forEach(([time, moons]) => {
      if (combinedData[time]) {
        // If time entry already exists, add moons to existing object
        combinedData[time].moons = moons;
      } else {
        // If time entry doesn't exist, create new object with moons
        combinedData[time] = { time: formatDate(new Date(parseInt(time) * 1000)), moons };
      }
    });
  
    // Convert combinedData object to array
    const transformedData = Object.values(combinedData);
  
    console.log("Transformed Data:");
    console.log(transformedData);
  
    return transformedData;
  };
  
  function formatDate(date) {
    const options = {
      month: "short",
      day: "2-digit",
    };
    return date.toLocaleString(undefined, options);
  }
  
  return (
    <div className={styles["user-account"]}>
      <NavBar />
      <div className={styles["user-info"]}>
        <div className={styles["profile-header"]}>
          <h1>Welcome, {userDisplayName}!</h1>
          <img src={userProfilePicture} alt="Profile" />
        </div>
          <h4 className={styles["date-created"]}><i>Member since {formatHumanReadableYear(userDateCreated)}</i></h4>
      </div>

      
        <div className={styles["event-list"]}>
          <h2>Recent Activity</h2>
          {recentEvents.map((event, index) => (
            <div key={index} className={styles["events"]}>
              <h3>{event.metric}</h3>
              <h4>{event.prev} ➜ {event.next}</h4>
              <p><i>{formatHumanReadableDate(event.timestamp * 1000)}</i></p>
              <br></br>
            </div>
          ))}
        </div>

      <div className={styles["game-info"]}>
        <h2>Games</h2>
        {/* Bedwars section */}
        <div className={styles["game-section"]}>
          <div className={styles["graph"]}>
            <LineChart
              width={500}
              height={300}
              data={bedwarsData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={domains} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="level"
                stroke="#00b8b8"
                activeDot={{ r: 4 }}
                dot={{ r: 2 }}
              />
            </LineChart>
          </div>
          <div className={styles["game-details"]}>
            <img src={HypixelLogo} alt="Bedwars Icon" />
            <h3>Hypixel Bedwars</h3>
            <form onSubmit={handleBedwarsNameSubmit}>
          <label>
            Username
            <input
              type="text"
              name="name"
              value={userBedwarsName}
              onChange={(e) => setBedwarsName(e.target.value)}
            />
          </label>
          <br></br>
          <input type="submit" value="Submit" />
            </form>
          </div>
        </div>

        {/* Geometry Dash section */}
        <div className={styles["game-section"]}>
          <div className={styles["graph"]}>
            <LineChart
              width={500}
              height={300}
              data={GDData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={domains2} />{" "}
              {/* Use domains2 state to set Y-axis domain */}
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="stars"
                stroke="#a8a800"
                activeDot={{ r: 4 }}
                dot={{ r: 2 }}
              />
            </LineChart>
          </div>
          <div className={styles["graph"]}>
            <LineChart
              width={500}
              height={300}
              data={GDData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={domains2} />{" "}
              {/* Use domains2 state to set Y-axis domain */}
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="moons"
                stroke="#0065a8"
                activeDot={{ r: 4 }}
                dot={{ r: 2 }}
              />
            </LineChart>
          </div>
          <div className={styles["game-details"]}>
            <img src={GDLogo} alt="Geometry Dash Icon" />
            <h3>Geometry Dash</h3>
            <form onSubmit={handleGDFormSubmit}>
          <label>
            User ID
            <input
              type="text"
              name="name"
              value={userGDName}
              onChange={(e) => setGDName(e.target.value)}
            />
          </label>
          <input type="submit" value="Submit" />
            </form>
            {gdError && (
              <h2>ERROR: Not a valid ID</h2>
            )}
          </div>
        </div>
      </div>

      <div className="incoming-requests">
        <h3>Incoming Friend Requests <b>({incomingRequests.length})</b></h3>
        <ul>
          {incomingRequests.map((request, index) => (
            <li key={index}>
              {request.displayName}
              <button onClick={() => handleAcceptRequest(request.email)}>
                Accept
              </button>
              <button onClick={() => handleDenyRequest(request.email)}>
                Deny
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

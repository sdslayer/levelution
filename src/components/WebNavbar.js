import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase-config';
import styles from './WebNavbar.module.css'

const NavBar = () => {
  
  const navigate = useNavigate();


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
        <nav>
            <ul className={styles["nav-list"]}>
                <li>
                    <Link to="/leaderboards">Leaderboards</Link>
                </li>
                <li>
                    <Link to="/search">Search</Link>
                </li>
                <li>
                    <Link to="/help">Help</Link>
                </li>
                <li>
                  <Link to="/user">Your Profile</Link>
                </li>
                <li className={styles["user-link"]}>
                    <Link to="/" onClick={signOutAndNavigate}>Sign Out</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;

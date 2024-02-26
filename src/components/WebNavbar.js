import React from 'react';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase-config';

const Navbar = () => {
  const navigate = useNavigate();
//   const signOutAndNavigate = async () => {
//     try {
//         // Sign out
//         await signOut(auth);
//         localStorage.removeItem("auth"); // Remove user data from local storage
//         navigate("/"); // Navigate to auth
//     } catch (error) {
//         console.error("Error signing out:", error);
//     }
// }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-button" onClick={navigate("/user")}>Account</button>
        <button className="navbar-button" onClick={navigate("/search")}>Search</button>
      </div>
      {/* <div className="navbar-right">
        <button className="navbar-button" onClick={signOutAndNavigate}>Logout</button>
      </div> */}
    </nav>
  );
};

export default Navbar;
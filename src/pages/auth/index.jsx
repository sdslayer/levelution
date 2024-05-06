/* eslint-disable no-unused-vars */
import { auth, provider, database } from "../../config/firebase-config"; // Import database from firebase-config
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, get, child, update } from "firebase/database"; // Import ref, set, get, child, exists, update from firebase/database
import styles from './auth.module.css';

export const Auth = () => {
    const navigate = useNavigate();

    const signInWithGoogle = async () => {
        const results = await signInWithPopup(auth, provider);
        const authInfo = {
            userID: results.user.uid,
            name: results.user.displayName,
            email: results.user.email,
            profilePhoto: results.user.photoURL,
            isAuth: true,
        };
        
        // Check if the user exists in the database
        const userRef = ref(database, `users/${authInfo.email.replace('.', '_')}`);
        get(child(userRef, 'userCreated')).then((snapshot) => {
            if (!snapshot.exists()) {
                // User does not exist, set the "user created" timestamp
                authInfo.userCreated = Date.now();
            }

            // Update user data in the database
            const updates = {
                ...authInfo,
                lastLogin: Date.now(), // Update the lastLogin value
            };
            update(userRef, updates).then(() => {
                console.log("User data updated in the database");
                console.log(authInfo);
            }).catch((error) => {
                console.error("Error updating user data in the database: ", error);
            });

            // Update authInfo with lastLogin value
            authInfo.lastLogin = updates.lastLogin;
            
            // Save authInfo to local storage
            localStorage.setItem("auth", JSON.stringify(authInfo));

            navigate("/user");
        }).catch((error) => {
            console.error("Error checking user existence: ", error);
        });
    };

    return (
        <div className={styles["auth-page"]}> {/* Update class name */}
            <h1 className={styles["title"]}>Levelution</h1> {/* Update class name */}
            <h3 className={styles["line-1 anim-typewriter"]}>Track your journey with just a few clicks.</h3> {/* Update class name */}
            <div className={styles["sub-body"]}> {/* Update class name */}
                <div className={styles["fade-grid"]}> {/* Update class name */}
                    <p className={styles["fade-text-1"]}>Start A New Adventure?</p> {/* Update class name */}
                    <p className={styles["fade-text-2"]}>Or Continue...</p> {/* Update class name */}
                </div>
            </div>
            <button className={styles["google-login"]} onClick={signInWithGoogle}> {/* Update class name */}
                Sign In With Google
            </button>
        </div>
    );
};

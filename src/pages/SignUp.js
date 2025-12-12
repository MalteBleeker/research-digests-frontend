import React, { useEffect, useState} from 'react';
import pencilLamp from '../assets/images/pencilLamp.png';
import { Link } from 'react-router-dom';
import { auth, functions } from '../firebase';
import { sendSignInLinkToEmail, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useMediaQuery } from 'react-responsive';
import { httpsCallable } from "firebase/functions";


function SignUp() {


    const [researcher, setResearcher] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }


    const handleSignUp = async () => {
        const auth = getAuth();
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log('User created:', user);
    
          // Create user object in Firestore or your database
          const functionRef = httpsCallable(functions, 'createUser');
          const response = await functionRef({ email: email, researcher: researcher });
          console.log('User created in Firestore:', response);
          
          alert(`User created successfully. Welcome, ${email}!`);

          if (researcher) {
            window.location.href = '/mydigests';
          } else {
            window.location.href = '/';
        }
        } catch (error) {
          console.error('Error during sign-up:', error);
          alert(`Error: ${error.message}`);
        }
      };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    }

    const Mobile = useMediaQuery({
        query: '(max-width: 899px)'
      });

    return (
    <div>
    <div style={{...styles.container, marginLeft: Mobile? 0: "13%", width: Mobile? "100%": "86%"}}>
        <div style={styles.logInContainer}>
            <img src={pencilLamp} alt="pencilLamp" style={styles.image} />
            <div style={styles.loginSection}>
                <div style={styles.title}>Welcome, curious mind!</div>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: "6vh", marginBottom: 8}}>
                    <p style={{color: 'black'}}>Are you a researcher?</p>
                <div style={{ display: 'flex', alignItems: 'center', height: "100%"}}>
 
                        <div
                            style={{...styles.yesButton, backgroundColor: researcher ? '#b3c6ff' : 'white'}}
                            onClick={() => setResearcher(true)}
                        >
                            Yes
                        </div>
                        <div
                            style={{...styles.noButton, backgroundColor: !researcher  ? '#b3c6ff' : 'white'}}
                            onClick={() => setResearcher(false)}
                        >
                            No
                        </div>
                </div>
                </div>
                <input type="email" placeholder="E-Mail" style={styles.input} onChange={handleEmailChange} value={email}/>
                { researcher && (
                    <div style={{width: 240}}>
                    <div style={{fontSize: 12,  textAlign: "center"}}>
                        Please use your <span style={{color: "orange"}}>academic mail</span> to be eligible for publication of digests.
                    </div>
                    </div>
                )}
                <input type="password" placeholder="Password" style={{...styles.input, marginTop: "20px"}} onChange={handlePasswordChange} value={password}/>
                <div>

                </div>
                    <button style={styles.logInButton}
                        onClick={handleSignUp}
                    >                         
                        <div>
                            <p style={{color: 'white'}}>Sign Up</p>
                        </div>
                    </button>
            </div>
            <div style={styles.signUpSection}>
                <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <button style={{...styles.logInButton, backgroundColor: 'white', color: 'black'}}>
                        <div>
                            <p>Login</p>
                        </div>
                    </button>
                </Link>
                    <div>
                        <p style={{marginTop: 10, color: 'black'}}>Already registered?</p>
                    </div>
                </div>
        </div>
        </div>
    </div>
    );
}



const styles = {
    container: {
        justifyContent: 'center',
        width: '86%',
        height: '100%',
        marginLeft: '13%',
    },
    logInContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '99vh',
    },
    loginSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: "12vh",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: "6%",
    },
    image: {
        width: "10vh",
        height: "10vh",
    },
    logInButton: {
        backgroundColor: 'black',
        borderRadius: 20,
        border: '1px solid gray',
        width: 130,
        height: 40,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.2)', // Add this line for shadow    
    },
    yesButton: {
        backgroundColor: 'white',
        //border: '0.1px solid grey',
        boxShadow: '-1px 1px 3px rgba(0, 0, 0, 0.1)', // Add this line for shadow
        borderRight: 'none',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        width: 50,
        height: 30,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    noButton: {
        backgroundColor: 'white',
        //border: '0.1px solid grey',
        boxShadow: '-1px 1px 3px rgba(0, 0, 0, 0.1)', // Add this line for shadow
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        width: 50,
        height: 30,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        padding: '8px',

        textAlign: 'center',
        border: 'none',
        //borderBottom: '2px solid black',
        outline: 'none',
        fontSize: '16px',
        boxShadow: '-1px 1px 3px rgba(0, 0, 0, 0.1)', // Add this line for shadow
        borderRadius: 20,
    },
    signUpSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: "7%",
    }
};

export default SignUp;
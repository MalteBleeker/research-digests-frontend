import React, { useEffect, useState} from 'react';
import pencilLamp from '../assets/images/pencilLamp.png';
import { Link } from 'react-router-dom';
import { useGlobalContext } from '../Context';
import { useNavigate } from 'react-router-dom';
import { sendSignInLinkToEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useMediaQuery } from 'react-responsive';


function LogIn() {

    const { setGlobalLoggedIn } = useGlobalContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const Mobile = useMediaQuery({
        query: '(max-width: 899px)'
      });

      const handleLogIn = async () => {
        if (email === '' || password === '') {
          alert('Please enter both email and password.');
          return;
        }
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log('User logged in:', user);
          alert(`Welcome back, ${email}!`);
          // Redirect to /mydigests or any other page
          window.location.href = '/mydigests';
        } catch (error) {
          console.error('Error during log-in:', error);
          alert(`Error: ${error.message}`);
        }
      };


    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }


    return (
        <div>
        <div style={{...styles.container, marginLeft: Mobile? 0: "13%", width: Mobile? "100%": "86%"}}>
            <div style={styles.logInContainer}>
                <img src={pencilLamp} alt="pencilLamp" style={styles.image} />
                <div style={styles.loginSection}>
                    <div style={styles.title}>Welcome back, curious mind!</div>
                    <input type="email" placeholder="E-Mail" style={styles.input} onChange={handleEmailChange} value={email}/>
                    <input type="password" placeholder="Password" style={{...styles.input, marginTop: "20px"}} onChange={handlePasswordChange} value={password}/>
                    <button style={styles.logInButton}
                    onClick={handleLogIn}>
                        <div>
                            <p style={{color: 'white'}}>Log In</p>
                        </div>
                    </button>

                </div>
                <div style={styles.signUpSection}>
                        <Link to="/signup" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <button style={{...styles.logInButton, backgroundColor: 'white', color: 'black'}}>
                            <div>
                                <p>Sign Up</p>
                            </div>
                        </button>
                        </Link>
                        <div>
                            <p style={{marginTop: 10, color: 'black'}}>New here? Let's get started...</p>
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
        marginBottom: "8%",
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

export default LogIn;
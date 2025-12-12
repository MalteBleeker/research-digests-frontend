import React, { useEffect, useState} from 'react';
import pencilLamp from '../assets/images/pencilLamp.png';
import { Link } from 'react-router-dom';
import { useGlobalContext } from '../Context';
import { useNavigate } from 'react-router-dom';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth,db } from '../firebase';
import { useMediaQuery } from 'react-responsive';
import { collection } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';



function Settings() {

    const { globalLoggedIn, profession, verified } = useGlobalContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const userMail = auth.currentUser.email;

    const Mobile = useMediaQuery({
        query: '(max-width: 899px)'
      });

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    }

    const sendFeedback = async () => {
        if(feedback === '') {
            return
        }
        const userRef = collection(db, "support")
        await addDoc(userRef, {
            email: userMail,
            uid: auth.currentUser.uid,
            feedback: feedback,
        });
        setFeedback('');
        alert("Successfully sent feedback / support request!");
    }

    return (
        <div>
        <div style={{...styles.container, marginLeft: Mobile? 0: "13%", width: Mobile? "100%": "86%", paddingTop: Mobile? "80px": "100px"}}>
        { Mobile ? (
            <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingLeft: "25px", paddingRight: "35px", marginBottom: "50px"}}>
                <div style={styles.title}>Email</div>
                <div style={styles.value}>{userMail}</div>
                <div style={styles.title}>Role</div>
                <div style={styles.value}>{profession === "academic" ? "Researcher" : "Practitioner"}</div>
                {profession === "academic" && (
                    <>
                        <div style={styles.title}>Status</div>
                        <div style={styles.value}>{verified ? "Verified Academic" : "Verification in progress..."}</div>
                    </>
                )}
                <div style={styles.title}>Feedback / Support</div>
                <textarea 
                    type="text"
                    placeholder="Type your feedback / support request here..." 
                    style={styles.inputMobile}
                    onChange={(event) => setFeedback(event.target.value)}
                    value={feedback}
                />
                <button 
                    style={{...styles.logInButton, backgroundColor: feedback ? "black" : 'gray'}}
                    onClick={() => feedback ? sendFeedback() : null}
                >
                    <div>
                        <p style={{color: 'white', fontWeight: "bold"}}>Send</p>
                    </div>
                </button>
            </div>

        ): (
            <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", width: "100%"}}>
                <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start", width: "25%"}}>
                    <div style={styles.title}>Email</div>
                    <div style={styles.value}>{userMail}</div>
                    <div style={styles.title}>Role</div>
                    <div style={styles.value}>{profession === "academic" ? "Researcher" : "Practitioner"}</div>
                    {profession === "academic" && (
                        <>
                            <div style={styles.title}>Status</div>
                            <div style={styles.value}>{verified ? "Verified Academic" : "Verification in progress..."}</div>
                        </>
                    )}
                </div>
                <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start", width: "60%", paddingLeft: "5%"}}>
                    <div style={styles.title}>Feedback / Support</div>
                    <textarea 
                        type="text"
                        placeholder="Type your feedback / support request here..." 
                        style={styles.input}
                        onChange={(event) => setFeedback(event.target.value)}
                        value={feedback}
                    />
                    <button 
                        style={{...styles.logInButton, backgroundColor: feedback ? "black" : 'gray'}}
                        onClick={() => feedback ? sendFeedback() : null}
                    >
                        <div>
                            <p style={{color: 'white', fontWeight: "bold"}}>Send</p>
                        </div>
                    </button>
                </div>
            </div>
        )}

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
    title: {
        color: 'black',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    value: {
        color: 'black',
        fontSize: 16,
        marginBottom: 15,
        padding: 10,
        //border: '1px solid #f2f2f2',
        borderRadius: 10,
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.2)',
    },
    logInButton: {
        backgroundColor: 'black',
        borderRadius: 20,
        border: '1px solid gray',
        width: 130,
        height: 40,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.3)', // Add this line for shadow    
    },
    input: {
        width: '100%',
        padding: '5px 0',
        paddingTop: 15,
        fontFamily: "system-ui",
        height: 300,
        marginBottom: 15,
        borderRadius: 10,
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.3)',
        border: "none",
        padding: 10,
        textAlignVertical: "top",
        resize: "none",
    },
    inputMobile: {

        padding: '5px 0',
        paddingTop: 15,
        fontFamily: "system-ui",
        height: 300,
        marginBottom: 15,
        borderRadius: 10,
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.3)',
        border: "none",
        padding: 10,
        textAlignVertical: "top",
        resize: "none",
    },
};

export default Settings;
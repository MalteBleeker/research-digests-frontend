import React from "react";
import { useLocation, Link } from "react-router-dom";

function ProgressBar() {

    const location = useLocation();

    const file = location.pathname.includes('/file')
    const summary = location.pathname.includes('/summary')
    const title = location.pathname.includes('/title')
    const authors = location.pathname.includes('/authors')
    const publish = location.pathname.includes('/publish') 

    return (
        <div style={{...styles.progressBar, justifyContent: "flex-start", alignItems: "center", flexDirection: "row"}}>
            <div style={{...styles.progressSectionStart, width: "25%", backgroundColor: file || summary || title || authors || publish ? "#b3c6ff" : "white"}}>
                <Link to="./../file" style={styles.textLink}> 
                Upload PDF / Word
                </Link>
                <div style={styles.roundedArrow}></div>
            </div>
            <div style={{...styles.progressSection, width: "25%", backgroundColor: summary || title || authors || publish ? "#b3c6ff" : "white"}}>
                <Link to="./../summary" style={styles.textLink}> 
                    Your Digest
                </Link>
                <div style={styles.roundedArrow}></div>
            </div>
            <div style={{...styles.progressSection, width: "25%", backgroundColor: title || authors || publish ? "#b3c6ff" : "white"}}>
                <Link to="./../title" style={styles.textLink}> 
                    Title & Cover
                </Link>
                <div style={styles.roundedArrow}></div>
            </div>
            <div style={{...styles.progressSectionEnd, width: "25%", backgroundColor: authors || publish ? "#b3c6ff" : "white"}}>
                <Link to="./../authors" style={styles.textLink}> 
                    Authors
                </Link>
            </div>
        </div>
    );
}

const styles = {
    progressBar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: "7vh",
        width: "82vw",
        borderRadius: 20,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.6)",
        fontSize: "1.2vw",
    },
    progressSectionStart: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: "100%",
        borderRadius: "20px 0 0 20px",
        position: 'relative',
    },
    progressSectionEnd: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: "100%",
        position: 'relative',
        borderRadius: "0 20px 20px 0",
    },
    progressSection: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: "100%",
        position: 'relative',
    },
    roundedArrow: {
        width: 0,
        height: 0,
        borderTop: "15px solid transparent",
        borderBottom: "15px solid transparent",
        borderLeft: "15px solid #f2f2f2", // Set the arrow color
        position: 'absolute', // Use absolute positioning
        right: 0, // Align to the right
        marginLeft: "1vw",
        marginRight: "0.4vw",
    },
    textLink: {
        textDecoration: 'none',
        color: 'black',
    },
};

export default ProgressBar;

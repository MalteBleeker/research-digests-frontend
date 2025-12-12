import React from "react";
import editIcon from '../assets/images/editIcon.png';
import statsIcon from '../assets/images/statsIcon.png';
import trashIcon from '../assets/images/trashIcon.png';
import { Link, useNavigate } from "react-router-dom";
import { db, auth, functions } from "../firebase";
import { getDocs, collection, where, query } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";

function MyDigests() {

    const [digests, setDigests] = useState([]);
    const [generatingDigest, setGeneratingDigest] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [modal, setModal] = useState("");
    const navigate = useNavigate();

    // Get the user's digests from the database
    useEffect(() => {
        if (!auth?.currentUser?.uid) {
            return;
        }
        const fetchData = async () => {
            const q = query(collection(db, "digests"), where("editors", "array-contains", auth?.currentUser?.uid));
            const querySnapshot = await getDocs(q);
            setDigests(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        }
        fetchData();
    }
    , [auth?.currentUser?.uid]);

    const startNewDigest = async () => {
      setGeneratingDigest(true);
      try {
        const functionRef = httpsCallable(functions, 'newDigest');
        const response = await functionRef({ title: 'New Digest' });
        
        if (response) {
          window.location.href = `./mydigests/${response.data.id}/file`;
          setGeneratingDigest(false);
        }


      } catch (error) {
        console.error('Error:', error);
        setGeneratingDigest(false);
      }
    };

    const handleEdit = (digest) => {
        if (digest?.status === "Published") {
            navigate(`./${digest?.id}/authors`);
        } else if (digest?.cAuthors[0] || digest?.cCategory || digest?.cReference || digest?.cSourceUrl) {
            navigate(`./${digest?.id}/authors`);
        } else if (digest?.cTitle || digest?.cCoverUrl) {
            navigate(`./${digest?.id}/title`);
        } else if (digest?.cContent) {
            navigate(`./${digest?.id}/summary`);
        }
    };

      

    // call delete digest function
    const deleteDigest = async (digestId) => {
        try {
            setDigests(digests.filter(digest => digest.id !== digestId));
            const functionRef = httpsCallable(functions, 'deleteDigest');
            const response = await functionRef({ id: digestId });
            console.log(response);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (generatingDigest) {
            const interval = setInterval(() => {
            setLoadingText((prev) => {
                if (prev === '...') return '';
                return "" + prev + '.';
            });
            }, 500);

        return () => clearInterval(interval);
    }
    }, [generatingDigest]);

    return (
        <>
            <div style={{display: modal ? 'block' : "none" , position: 'fixed', zIndex: 3, left: 0, top: 0, width: '100%', height: "100%", backgroundColor: 'rgba(0,0,0,0.4)'}}>
                <div style={{position: 'relative', backgroundColor: 'white', margin: '5% auto', marginLeft: "30%", padding: '20px', border: '1px solid #888', width: '30%', borderRadius: '20px'}}>
                    <span style={{position: 'absolute', top: '16px', right: '20px', cursor: 'pointer', fontSize: 20}} onClick={() => {setModal(false)}}>Close</span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "30px"}}></div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "23px", marginTop: "6%", marginBottom: "5%"}}>Are you sure you want to delete this digest?</div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "20px"}}>
                        <div style={{backgroundColor: "red", cursor: "pointer", color: "white", padding: "10px", borderRadius: "10px", marginRight: "40px", width: "15%", display: "flex", justifyContent: "center"}} onClick={() => {deleteDigest(modal); setModal(false);}}>Yes</div>
                        <div style={{backgroundColor: "green", cursor: "pointer", color: "white", padding: "10px", borderRadius: "10px", width: "15%", display: "flex", justifyContent: "center"}} onClick={() => setModal(false)}>No</div>
                    </div>
                </div>
            </div>

            <div style={styles.container}>
                <div style={styles.digestsContainer}>
                    {digests.map((digest, index) => (
                        <div key={index} style={styles.digest}>
                            <div style={styles.digestDetails}>
                            <Link
                                to={digest?.status === "Published" ? 
                                    `../article/${digest?.id}` : digest?.cAuthors[0]  || digest?.cCategory  || digest?.cReference  || digest?.cSourceUrl ? 
                                    `./${digest?.id}/authors` : digest?.cTitle  || digest?.cCoverUrl ?
                                    `./${digest?.id}/title` : digest?.cContent ?
                                    `./${digest?.id}/summary` : `./${digest?.id}/file`}
                                style={{ textDecoration: 'none', color: 'inherit', ...styles.digestTitleContainer }}>
                                <div style={styles.digestTitle}>
                                    {digest?.title ? digest?.title : digest?.cTitle ? digest?.cTitle :`Draft: ${digest?.lastModified?.toDate()}`}</div>
                                <div style={styles.digestBy}>{digest?.authors? digest?.authors?.join(', '): digest?.cAuthors?.join(', ') }</div>
                            </Link>
                            <img src={digest?.coverUrl ? digest?.coverUrl : digest?.cCoverUrl} alt=" " style={styles.thumbnail} />
                            <div style={styles.verticalLineBox}>
                                <div style={{...styles.digestStatus, color: digest?.status === "Published" ? "green" : "grey"}}>{digest?.status}</div>
                            </div>
                            <div 
                             style={{display: 'flex', flexDirection: 'row', alignItems: "center"}}>
                            <img 
                                src={editIcon} 
                                alt="editIcon" 
                                style={styles.editIcon}
                                onClick = {(e) =>  {handleEdit(digest)}} 
                            />
                            <img 
                                src={statsIcon} 
                                alt="statsIcon" 
                                style={styles.editIcon}
                                // onClick = {(e) =>  {handleEdit(digest)}} 
                            />
                            <img 
                                src={trashIcon}
                                onClick={(e) => {setModal(digest.id)}}
                                alt="trashIcon" 
                                style={styles.trashIcon}
                            />
                            </div>
                        </div>
                        </div>
                    ))}
                    <div onClick={() => generatingDigest? null : startNewDigest()}  style={{...styles.digestDetails, justifyContent: "center", alignItems: "center", cursor: "pointer"}}>
                            <div style={styles.plusIcon}>{generatingDigest? <div style={{fontSize: "10", color: "black"}}>{loadingText}</div> : "+"}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        justifyContent: 'flex-start',
        width: '86wh',
        height: 'auto',
        marginLeft: '13%',
        display: 'flex',
        fontSize: 24,
    },
    digestsContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '88vh',
        paddingTop: "12vh",
        marginBottom: "30vh"
    },
    digest: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: "3vh",
    },
    digestDetails: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: "7vh",
        width: "70vw",
        borderRadius: 20,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.5)",
    },
    digestTitleContainer: {
        flexDirection: 'column',
        display: 'flex',
        justifyContent: 'center',
        width: "50vw", // Set width to 60%
        overflow: 'hidden', // Hide overflow content
        whiteSpace: 'nowrap', // Prevent text from wrapping
        textOverflow: 'ellipsis', // Add ellipsis if content overflows
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRight: "none",
        paddingLeft: "3vh",
        paddingRight: "2.5vh",
    },
    digestTitle: {
        fontSize: 24,
        overflow: 'hidden', // Hide overflow content
        whiteSpace: 'nowrap', // Prevent text from wrapping
        textOverflow: 'ellipsis', // Show ellipsis (...) when text overflows
    },
    digestBy: {
        fontSize: 16,
        color: 'grey',
        overflow: 'hidden', // Hide overflow content
        whiteSpace: 'nowrap', // Prevent text from wrapping
        textOverflow: 'ellipsis', // Add ellipsis if content overflows
    },
    thumbnail: {
        width: "7vh",
        height: "5vh",
    },
    verticalLineBox: {
        borderLeft: "1px solid gray",
        height: "80%",
        width: "8%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: "2vh",
        paddingRight: "2vh",
        borderRight: "1px solid gray",
        marginLeft: "1vw",
        marginRight: "1vw",
    },
    digestStatus: {
        fontSize: 20,
    },
    editIcon: {
        width: "5vh",
        height: "5vh",
        marginRight: "2vh",
        cursor: "pointer",
    },
    trashIcon: {
        width: "3.6vh",
        height: "3.6vh",
        marginRight: "2vh",
        cursor: "pointer",
    },
    plusIcon: {
        fontSize: "5vh",
        color: "grey",
        fontWeight: "bold",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: "1.5vh",
    },
}

export default MyDigests;
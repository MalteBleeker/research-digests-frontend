import React, {useRef, useState, useEffect} from "react";
import ProgressBar from "../assets/components/progressBar";
import {Link} from "react-router-dom";
import {functions, storage} from "../firebase";
import { httpsCallable } from "firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useNavigate } from "react-router-dom";


function NewDigestFile() {

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const { id } = useParams();
    const [fileUrl, setFileUrl] = useState("");
    const [uploadLoading, setUploadLoading] = useState(false);
    const [summarizationLoading, setSummarizationLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Summarizing');
    const [uploadLoadingText, setUploadLoadingText] = useState('Uploading');
    const navigate = useNavigate();


    const handleFileChange = async (event) => {
        console.log("File selected");
        const files = event.target.files;
        if (files.length > 0) {
            const file0 = files[0];
            setFile(file0);
            console.log(file0?.size);
            try {
            
            setUploadLoading(true);
            // Create a storage reference
            const storageRefInstance = ref(storage, file0?.name);

            // Upload the file
            const snapshot = await uploadBytes(storageRefInstance, file0);
            console.log('Uploaded a blob or file!', snapshot);

            // Get the download URL
            const url = await getDownloadURL(storageRefInstance);
            setFileUrl(url);
            setUploadLoading(false);

            } catch (error) {
                console.error("Failed to upload pdf", error);
                setUploadLoading(false);
            }
            }
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file0 = files[0];
            setFile(file0);
            try {
                setUploadLoading(true);
                // Create a storage reference
                const storageRefInstance = ref(storage, file0?.name);
    
                // Upload the file
                const snapshot = await uploadBytes(storageRefInstance, file0);
                console.log('Uploaded a blob or file!', snapshot);
    
                // Get the download URL
                const url = await getDownloadURL(storageRefInstance);
                setFileUrl(url);
                setUploadLoading(false);
            } catch (error) {
                console.error("Failed to extract text from pdf", error);
                setUploadLoading(false);
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const toSummary = () => {
        navigate(`./../summary`);
    };


    const generateSummary = async () => {
    console.log("Generating summary");
    try {
        setSummarizationLoading(true);
        const functionRef = httpsCallable(functions, 'summarizeDocument');
        const response = await functionRef({ fileUrl: fileUrl, id: id });
        
        if (response) {
            console.log(response);
            // Redirect to the summary page
            navigate(`./../summary`);
        }

        setSummarizationLoading(false);
        } catch (error) {
        console.error('Error:', error);
        setSummarizationLoading(false);
        }
    };

    useEffect(() => {
    if (summarizationLoading) {
        const interval = setInterval(() => {
        setLoadingText((prev) => {
            if (prev === 'Summarizing...') return 'Summarizing';
            return "" + prev + '.';
        });
        }, 300);

        return () => clearInterval(interval);
    }
    }, [summarizationLoading]);

    useEffect(() => {
    if (uploadLoading) {
        const interval = setInterval(() => {
        setUploadLoadingText((prev) => {
            if (prev === 'Uploading...') return 'Uploading';
            return '' + prev + '.';
        });
        }, 300);

        return () => clearInterval(interval);
    }
    }, [uploadLoading]);

    return (
        <div style={styles.container}>
            <div style={styles.creationContainer}>
                <ProgressBar />
                <div
                    style={{ ...styles.contentDrop, justifyContent: "flex-start", alignItems: "center", flexDirection: "row" }}
                >
                    <div style={{ ...styles.contentDropFirstHalf, justifyContent: "center", alignItems: "center", flexDirection: "column" }}
                        onClick={uploadLoading ? null : handleClick}
                        onDrop={uploadLoading ? null : handleDrop}
                        onDragOver={handleDragOver}
                    >
                    {fileUrl? (
                        <>
                            <div style={{...styles.dropText, color: "black"}}>Ready for summarization! ({file.name})</div>
                            <div style={{fontSize: 20, color: "grey", marginTop: 5}}>Click to change</div>
                        </>
                    ) : (
                        <>
                            <div style={styles.dropText}>{uploadLoading ? uploadLoadingText : "Optional: Drop or select the PDF / .docx of your research article here, to generate a preliminary digest."}</div>
                            <div style={styles.plusIcon}>{uploadLoading? null : "+"}</div>
                        </>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".pdf,.docx"
                        />
                        </div>
                </div>
                <div style={styles.disclaimerText}>
                    Note: The article will solely be used for the generation and optimization of the summarization mechanism. Please nevertheless ensure that you have the rights to the content (generally granted to authors by peer-reviewed journals).
                </div>
                <div style={styles.link}>
                <div onClick={()=> summarizationLoading? null : fileUrl? generateSummary() : toSummary() }> 
                    <div style={styles.skipButton}>
                        {summarizationLoading ? loadingText : fileUrl ? "Summarize" : "Skip"}
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
        width: '86wh',
        height: '100vh',
        marginLeft: '12%',
        display: 'flex',
        fontSize: 24,
    },
    creationContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '88vh',
        paddingTop: "12vh",
        alignItems: 'center',
    },
    contentDrop: {
        display: 'flex',
        alignItems: 'center',
        height: "55vh",
        width: "82vw",
        borderRadius: 20,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.7)",
        marginTop: "3vh",
        cursor: 'pointer',
    },
    contentDropFirstHalf: {
        display: 'flex',
        alignItems: 'center',
        height: "55vh",
        width: "81vw",
        borderRadius: "20px 0 0 20px",
        borderRight: "1px solid #f2f2f2",
        cursor: 'pointer',
    },
    contentDropSecondHalf: {
        display: 'flex',
        alignItems: 'center',
        height: "55vh",
        width: "41vw",
        borderRadius: "0 20px 20px 0",
        cursor: 'pointer',
    },
    dropText: {
        fontSize: 24,
        color: 'gray',
        marginLeft: "10vw",
        marginRight: "10vw",
        textAlign: 'center',
    },
    plusIcon: {
        fontSize: 60,
        color: 'gray',
    },
    disclaimerText: {
        fontSize: 17,
        color: 'grey',
        width: "82vw",
        marginTop: "1vh",
    },
    skipButton: {
        fontSize: 20,
        color: 'white',
        marginTop: "2vh",
        cursor: 'pointer',
        backgroundColor: 'black',
        margin: "3vh",
        padding: "1vh",
        width: "8vw",
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        borderRadius: 13,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.7)",
    },
    link: {
        width: "100%", 
        display: "flex", 
        justifyContent: "flex-end",
        textDecoration: 'none', // Remove underline from link
    },
}

export default NewDigestFile;
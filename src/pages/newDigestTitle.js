import React, {useRef, useState, useEffect} from "react";
import ProgressBar from "../assets/components/progressBar";
import {Link} from "react-router-dom";
import { db, functions, storage } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import pencilLamp from "../assets/images/pencilLamp.png";

function NewDigestTitle() {

    const [modal, setModal] = useState(false);
    const [imagePrompt, setImagePrompt] = useState("");
    const { id } = useParams();
    const [digest, setDigest] = useState({});
    const [title, setTitle] = useState("");
    const [savedTitle, setSavedTitle] = useState("");
    const [titleSaved, setTitleSaved] = useState(true);
    const [coverUrl, setCoverUrl] = useState("");
    const [savedCoverUrl, setSavedCoverUrl] = useState("");
    const [coverLoading, setCoverLoading] = useState(false);
    const [imagesGenerated, setImagesGenerated] = useState(0);
    const [thumbnailOptions, setThumbnailOptions] = useState([]);
    const [loadedCover, setLoadedCover] = useState(false);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [loadingText, setLoadingText] = useState('.');

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [fileUrl, setFileUrl] = useState("");
    const [uploadLoading, setUploadLoading] = useState(false);

    console.log(coverUrl);

    useEffect(() => {
        const fetchData = async () => {
          try {
            // Get article based on doc id
            const docRef = doc(db, "digests", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              console.log("Fetching Data");
              const data = docSnap.data();
              setDigest(data);
              setTitle(data?.cTitle || '');
              setSavedTitle(data?.cTitle || '');
              setCoverUrl(data?.cCoverUrl || '');
              setSavedCoverUrl(data?.cCoverUrl || '');
              setThumbnailOptions(data?.thumbnailOptions || []);
              setImagesGenerated(data?.imagesGenerated || 0);
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching document:", error);
          }
        };
        fetchData();
      }, [id]);

    useEffect(() => {
    if (generatingImage) {
        const interval = setInterval(() => {
        setLoadingText((prev) => {
            if (prev === '...') return '.';
            return "" + prev + '.';

        });
        }, 500);

    return () => clearInterval(interval);
}
    }, [generatingImage]);

    useEffect(() => {
        if (title === savedTitle || title === "") {
            console.log("Content has not changed");
            setTitleSaved(true);
            return;
        } else {
        setTitleSaved(false);
        const timer = setTimeout(() => {
            console.log("Saving title to database");
            // Save the content to the database
            const docRef = doc(db, "digests", id);
            setDoc(docRef, {
                cTitle: title,
                lastModified: serverTimestamp(),
            }, { merge: true });
            setSavedTitle(title);
            setTitleSaved(true);
        }, 3000);
        return () => clearTimeout(timer);
        }
    }, [title]);

    useEffect(() => {
        if (coverUrl === savedCoverUrl || coverUrl === "") {
            console.log("Content has not changed");
            return;
        } else {
            const timer = setTimeout(() => {
                console.log("Saving cover to database");
                // Save the content to the database
                const docRef = doc(db, "digests", id);
                setDoc(docRef, {
                    cCoverUrl: coverUrl,
                    lastModified: serverTimestamp(),
                }, { merge: true });
                setSavedCoverUrl(coverUrl);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [coverUrl]);



    const generateImage = () => {
        console.log('Generating image with prompt:', imagePrompt);
        setGeneratingImage(true);
        const functionRef = httpsCallable(functions, 'generateImage');
        functionRef({ prompt: imagePrompt, id: id })
            .then((result) => {
                console.log('Image generated:', result.data);
                setThumbnailOptions([...thumbnailOptions, result.data]);
                setImagesGenerated(imagesGenerated + 1);
                setLoadedCover(result.data);
                setGeneratingImage(false);
            })
            .catch((error) => {
                console.error('Error generating image:', error);
                setGeneratingImage(false);
            });
    };


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

    return (
        // Modal background
        <>
        <div style={{display: modal ? 'block' : "none" , position: 'fixed', zIndex: 3, left: 0, top: 0, width: '100%', height: "100%", backgroundColor: 'rgba(0,0,0,0.4)'}}>
            <div style={{position: 'relative', backgroundColor: 'white', margin: '5% auto', marginLeft: "28%", padding: '20px', border: '1px solid #888', width: '50%', borderRadius: '20px'}}>
                <span style={{position: 'absolute', top: '16px', right: '20px', cursor: 'pointer', fontSize: 25}} onClick={() => {setModal(false); setLoadedCover(false)}}>Close</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", fontSize: "30üx"}}>
                    <div
                        
                        style={{marginBottom: "1vh", marginTop: "4vh", fontSize: '28px',}}>
                        Generate a cover ({imagesGenerated}/2)
                    </div>
                   
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%',  height: "15vw", justifyContent: "space-between"}}>
                            <div style={{fontSize: 18}}>
                                You can describe and generate up to two images per digest.
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column',  width: "100%"}}>

                            <textarea
                                style={{
                                    fontSize: 20,
                                    outline: "none",
                                    border: "none",
                                    width: "100%",
                                    marginBottom: "10px",
                                    resize: "none",
                                    height: "8vw",
                                    fontFamily: "system-ui",
                                    borderBottom: "1px solid black"
                                }}
                                placeholder="Example: A person confidently wearing gym attire in a luxury shop. Focus on the contrast between the casual clothing and the upscale environment to convey non-conformity."
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                />
                            <div
                                onClick={() => generatingImage? null: generateImage()}
                                style={{backgroundColor: imagesGenerated == 2? "grey":'black', color: 'white', padding: '10px', borderRadius: '20px', cursor: 'pointer', alignSelf: "flex-end"}}>
                                    {generatingImage? loadingText : "Generate" }
                            </div>
                            </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%', border: loadedCover? null : "0.5px solid grey" , borderRadius: loadedCover? null: "20px" }}>
                            <img style={{height: '15vw', borderRadius: '20px', width: fileUrl || loadedCover? "100%" : null}} src={fileUrl? fileUrl : loadedCover ? loadedCover : pencilLamp} />
                        </div>
                    </div>
                <div>
                    <div style={{marginBottom: "0vh", marginTop: "4vh", fontSize: '28px'}}>
                        Alternative: Upload an own cover
                    </div>
                    <div style={{fontSize: 18, marginTop: "1vh"}}>
                    Important: Only grayscale, non-photorealistic covers are allowed (Recommended ratio: 3:2). 
                    </div>

                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />
                <div 
                    style={styles.dropArea}
                    onClick={uploadLoading ? null : handleClick}
                    onDrop={uploadLoading ? null : handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', justifyContent: "space-between"}}
                    >
                        <div style={{fontSize: 18, color: "grey"}}>
                            {uploadLoading ? "Image Uploading..." : "Select / drop a suitable cover image here"}
                        </div>
                    </div>
                </div>
                </div>  
                <div style={styles.doneButton}
                    onClick={() => {
                        setModal(false);
                        setLoadedCover(false);
                        if (fileUrl) {
                        setCoverUrl(fileUrl);
                        // Append the new cover to the list of thumbnail options
                        setThumbnailOptions((prevOptions) => [...prevOptions, fileUrl]);
                        // Save the content to the database and also add the new cover to the list of thumbnail options
                        const docRef = doc(db, "digests", id);
                        setDoc(docRef, {
                            cCoverUrl: fileUrl,
                            thumbnailOptions: arrayUnion(fileUrl), // Use arrayUnion to add the new cover URL
                            lastModified: serverTimestamp(),
                        }, { merge: true });
                        }
                    }}
                >
                    Done
                </div> 
            </div>
        </div>
        {/* Main content */}
        <div style={styles.container}>
            <div style={styles.creationContainer}>
                <ProgressBar />
                <div style={styles.contentContainer}>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                        <div style={{marginBottom: "0vh", marginTop: "4vh"}}>Headline / Title</div>
                        <div style={{fontSize: 20, color: "grey", marginRight: "2vw", marginTop: "4vh", marginBottom: "0vh"}}>
                            {titleSaved? "All saved" : "Saving..."}
                        </div>
                    </div>
                    <div style={styles.headlineBox}>
                        <input 
                            style={{fontSize: 20, margin: "2vh", alignSelf: "center", outline: "none", border: "none", width: "100%"}} 
                            type="text" 
                            placeholder="Type the title here..."
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}

                        />
                    </div>
                    <div style={{marginBottom: "0vh", marginTop: "4vh"}}>Small Cover Image</div>
                    
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', overflowX: "auto", maxWidth: "100%"}}>
                    {thumbnailOptions?.map((thumbnail, index) => (
                        <div style={styles.thumbnailBox}
                            onClick = {() => setCoverUrl(thumbnail)}
                        >
                            <img style ={styles.thumbnail} src={thumbnail} />
                            <div style={{...styles.circle, backgroundColor: 'white'}} />
                            <div style={thumbnail == coverUrl? styles.innerCircle : null} />
                        </div>
                    ))}
                        <div style={styles.thumbnailBox}>
                            <div style={{...styles.thumbnail, backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'}}
                            onClick={() => setModal(true)}
                            >
                                <p style={{fontSize: 60, color: 'grey', paddingBottom: 10}}>+</p>
                            </div>
                        </div> 
                    </div>
                </div>
                <div style={styles.link}>
                <Link to="./../authors" style={{textDecoration: "none"}}> 
                    <div style={{...styles.skipButton, backgroundColor: "black"}}>Next</div>
                </Link>
                </div>
            </div>
        </div>
        </>
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
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: "82vw",
    },
    headlineBox: {
        display: 'flex',
        width: "100%",
        borderRadius: 20,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.5)",
        marginTop: "2vh",
        cursor: 'pointer',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    thumbnailBox: {
        position: 'relative',
        marginTop: "2vh",
        marginRight: "2vh",
        cursor: 'pointer',
    },

    thumbnail: {
        width: "18vw",
        height: "11vw",
        borderRadius: 20,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.5)",
        position: 'relative',
    },    
    circle: {
        borderRadius: '50%',
        position: 'absolute',
        top: '5px',
        right: '5px',
        width: '30px',
        height: '30px',
    },
    innerCircle: {
        borderRadius: '50%',
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '16px',
        height: '16px',
        backgroundColor: 'black'
    },
    dropArea : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: "4vh",
        height: "10vh",
        borderRadius: 20,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.5)",
        cursor: 'pointer',
        border: '2px dashed #f2f2f2',
    },
    doneButton: {
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: 20,
        cursor: 'pointer',
        width: '8vw',
        textAlign: 'center',
        position: 'absolute',
        right: '20px',
        bottom: '-8vh', 
        color: 'black',
        padding: '10px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: "28px",
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.5)",
    },
    skipButton: {
        fontSize: 20,
        color: 'white',
        marginTop: "1.5vh",
        cursor: 'pointer',
        margin: "3vh",
        padding: "1vh",
        width: "8vw",
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        borderRadius: 13,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.7)",
        textDecoration: 'none', // Remove underline from link
    },
    link: {
        width: "100%", 
        display: "flex", 
        justifyContent: "flex-end",
        textDecoration: 'none', // Remove underline from link
        marginTop: "6vh",
    },

}

export default NewDigestTitle;
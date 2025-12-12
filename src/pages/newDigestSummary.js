import React, {useRef, useState, useEffect} from "react";
import ProgressBar from "../assets/components/progressBar";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import "../styles/summary.css";
import {Link} from "react-router-dom";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { useNavigate } from 'react-router-dom';
import firebase from "firebase/compat/app";


function NewDigestSummary() {

    const [editorContent, setEditorContent] = useState('');
    const [editorContentMethod, setEditorContentMethod] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    const [editorCollapsed, setEditorCollapsed] = useState(false);
    const [savedContent, setSavedContent] = useState(false);
    const [savedMethodContent, setSavedMethodContent] = useState(false);
    const [draftSaved, setDraftSaved] = useState(true);
    const [digest, setDigest] = useState(null);

    const [generatingCover, setGeneratingCover] = useState(false);
    const [loadingText, setLoadingText] = useState('Generating Title');

    const [methodEditorCollapsed, setMethodEditorCollapsed] = useState(true);

    const quillRef = useRef(null); // Create a reference to the Quill editor

    const generateHeadline = async () => {
        setGeneratingCover(true);
        try {
            const functionRef = httpsCallable(functions, 'extractHeadline');
            const response = await functionRef({ id: id });
            if (response) {
                console.log(response.data);
                navigate(`./../title`);
                setGeneratingCover(false);
            }
        } catch (error) {  
            console.error("Failed to generate image", error);
            setGeneratingCover(false);
        }
    };

    useEffect(() => {
        if (generatingCover) {
            const interval = setInterval(() => {
            setLoadingText((prev) => {
                if (prev === 'Generating Title...') return 'Generating Cover';
                if (prev === 'Generating Cover...') return 'Generating Cover';
                return "" + prev + '.';

            });
            }, 500);

        return () => clearInterval(interval);
    }
    }, [generatingCover]);

    // Fetch current text from database
    useEffect(() => {
        const fetchData = async () => {
          // Get article based on doc id
          const docRef = doc(db, "digests", id);
          const docSnap = await getDoc(docRef);
          setDigest(docSnap.data());
          setSavedContent(docSnap.data().cContent);
          setSavedMethodContent(docSnap.data().cMethodText);
          setEditorContent(docSnap.data().cContent);
          setEditorContentMethod(docSnap.data().cMethodText);
          setDraftSaved(true);
        };
        fetchData();
      }
      , [id]);

      // Store the current text in the database (when cotent has changed and no activity for four seconds)
    useEffect(() => {
        if (editorContent === savedContent && editorContentMethod === savedMethodContent) {
            console.log("Content has not changed");
            setDraftSaved(true);
            return;
        } else if (editorContent !== savedContent && editorContent|| editorContentMethod !== savedMethodContent && editorContentMethod) {
        setDraftSaved(false);
        const timer = setTimeout(() => {
            console.log("Saving content to database");
            // Save the content to the database
            const docRef = doc(db, "digests", id);
            setDoc(docRef, {
                cContent: editorContent,
                cMethodText: editorContentMethod,
                lastModified: serverTimestamp(),
            }, { merge: true });
            setSavedContent(editorContent);
            setSavedMethodContent(editorContentMethod);
            setDraftSaved(true);
        }, 3000);
        return () => clearTimeout(timer);
        }
    }, [editorContent, editorContentMethod]);

    const handleEditorChange = (content) => {
        setEditorContent(content);
    };

    const handleEditorChangeMethod = (content) => {
        setEditorContentMethod(content);
    };

    const handleUndo = () => {
        if (quillRef.current) {
            quillRef.current.getEditor().history.undo();
        }
    };

    const handleRedo = () => {
        if (quillRef.current) {
            quillRef.current.getEditor().history.redo();
        }
    };

    const handleCheckboxClick = (event) => {
        event.stopPropagation();
    };

    const nextPage = () => {
        navigate(`./../title`);
    };


    return (
        <div style={styles.container}>
            <div style={styles.creationContainer}>
                <ProgressBar />
                <div
                    style={{ ...styles.editorBox, justifyContent: "center", alignItems: "center", flexDirection: "column", height: !editorCollapsed ? "55vh" : "10vh" }}
                >
                    <div id="toolbar" style={{width: "95%", paddingLeft: "2vw", flexDirection: "row", justifyContent: "space-between", display: "flex", paddingRight: "2vw", alignmentItems: "center"}}
                    onClick = {() => {
                        //setEditorCollapsed(!editorCollapsed);
                    }}
                    >
                        <div style={{display: "flex", alignItems: "center" , marginTop: "1vh" }}>
                            <div style={{fontSize: 20, color: "grey", marginRight: 10}}>Your research as a digest</div>
                            <button style={styles.toolbarButton}  onClick={handleUndo}>↶</button>
                            <button style={styles.toolbarButton}  onClick={handleRedo}>↷</button>
                        </div>
                        <div style={{margin: 15, color: "grey", fontSize: 20,}}>
                            {draftSaved? `Draft saved`: "Draft saving..."}
                        </div>
                    </div>
                { editorCollapsed ? null :
                    <ReactQuill
                        ref={quillRef}
                        value={editorContent}
                        onChange={handleEditorChange}
                        formats={formats}
                        style={styles.quillEditor}
                        theme="bubble"
                        toolbar={toolbar}
                    />
                }
                </div>
                <div
                    style={{ ...styles.editorBox, justifyContent: "center", alignItems: "center", flexDirection: "column", height: !methodEditorCollapsed ? "40vh" : "10vh" }}
                >
                    <div id="toolbar" style={{width: "95%", paddingLeft: "2vw", flexDirection: "row", justifyContent: "space-between", display: "flex", paddingRight: "2vw", alignmentItems: "center"}}
                    onClick = {() => {
                        setMethodEditorCollapsed(!methodEditorCollapsed);
                    }}
                    >
                        <div style={{display: "flex", alignItems: "center"}}>
                            <div style={{fontSize: 20, color: "grey", marginRight: 10}}>Optional: What is the basis of such findings (method)?</div>
                        </div>
                        {/*<div style={{ display: 'flex', alignItems: 'center', margin: 15, color: 'grey', fontSize: 20 }}
                            onClick={handleCheckboxClick}
                        >
                            <label htmlFor="skipSection" style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: 'grey' }}>
                                Skip this section?
                                <input type="checkbox" id="skipSection" style={{ marginLeft: 10, width: 20, height: 20 }} />
                            </label>
                        </div>
                        */}
                    </div>
                    { methodEditorCollapsed ? null :
                        <ReactQuill
                            value={editorContentMethod}
                            onChange={handleEditorChangeMethod}
                            formats={formatsMethod}
                            style={styles.quillEditorMethod}
                            theme="bubble"
                            toolbar={toolbarMethod}
                        />
                    }
                </div>
                <div style={styles.link}>
                { digest?.imagesGenerated > 0 ? (
                    <Link to="./../title" style={{textDecoration: "none"}}>
                    <div style={{...styles.skipButton, width: "14vw", backgroundColor: "black"}}>Next</div>
                    </Link>
                ) : (
                    <>
                    { editorContent.length > 1000 || digest?.cTitle || digest?.cCoverUrl? (
                    <div>
                        <button onClick={() => digest?.cTitle || digest?.cCoverUrl ? nextPage() : generatingCover ? null : generateHeadline()} style={{...styles.skipButton, backgroundColor: "black"}}>
                            {digest?.cTitle || digest?.cCoverUrl ? "Next" : generatingCover? loadingText : "Generate Title & Cover"}
                        </button>
                    </div>
                    ) : (
                    <>
                        <div style={styles.note}>{`Please ensure that your digest is at least 1000 characters long.`}</div>
                        <div style={{...styles.skipButton, backgroundColor: "lightgrey"}}>{`Generate Title & Cover (${editorContent?.length}/1000)`}</div>
                        
                    </>
                    )}
                    </>
                )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        justifyContent: 'center',
        width: '86wh',
        marginLeft: '12%',
        display: 'flex',
        fontSize: 24,
    },
    creationContainer: {
        display: 'flex',
        flexDirection: 'column',
        paddingTop: "12vh",
        alignItems: 'center',
    },
    editorBox: {
        display: 'flex',
        alignItems: 'center',
        width: "82vw",
        borderRadius: 20,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.7)",
        marginTop: "3vh",
        cursor: 'pointer',
    },
    quillEditor: {
        width: "80vw",
        height: "45vh",
        marginBottom: "1.5vh",
    },
    quillEditorMethod: {
        width: "80vw",
        height: "30vh",
        marginBottom: "1.5vh",
    },
    toolbarButton: {
        color: "grey",
        border: "none",
        margin: 10,
        cursor: "pointer",
        backgroundColor: "white",
        fontSize: 20,
    },
    skipButton: {
        fontSize: 20,
        color: 'white',
        marginTop: "1.5vh",
        cursor: 'pointer',
        margin: "3vh",
        padding: "1vh",
        width: "18vw",
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        borderRadius: 13,
        boxShadow: "0 4px 8px 0 rgba(128,128,128,0.7)",
        textDecoration: 'none', // Remove underline from link
    },
    note: {
        fontSize: 16,
        color: 'grey',
        marginTop: "1vh",
        marginTop: "1.5vh",
        cursor: 'pointer',
        margin: "1vh",
        marginRight: 0,
        paddingRight: 0,
        padding: "1vh",
        width: "16vw",
        alignSelf: 'center',
        textAlign: 'right',
    },
    link: {
        width: "100%", 
        display: "flex", 
        justifyContent: "flex-end",
        textDecoration: 'none', // Remove underline from link
        flexDirection: "row",
    },
};


const formats = [
    'bold',
    'italic',
    'link',
]

const toolbar = [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{size: []}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean']
];

const formatsMethod = [
    'bold',
    'italic',
    'link',
]

const toolbarMethod = [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{size: []}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean']
];

export default NewDigestSummary;
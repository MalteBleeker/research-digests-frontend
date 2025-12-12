import React, {useRef, useState, useEffect} from "react";
import ProgressBar from "../assets/components/progressBar";
import {Link} from "react-router-dom";
import { db, functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function NewDigestAuthors() {
    const [savedCategory, setSavedCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const selectRef = useRef(null);
    const [savedAuthors, setSavedAuthors] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [savedSourceReference, setSavedSourceReference] = useState('');
    const [sourceReference, setSourceReference] = useState('');
    const [savedSourceUrl, setSavedSourceUrl] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [currentInput, setCurrentInput] = useState('');
    const [digest, setDigest] = useState({});
    const { id } = useParams();
    const [saving, setSaving] = useState(false);
    const [allFieldsSubmitted, setAllFieldsSubmitted] = useState(false);
    const [lastModifiedLocal, setLastModifiedLocal] = useState('');
    const [doiModal, setDoiModal] = useState(false);
    const [doi, setDoi] = useState('');

    const [publishing, setPublishing] = useState(false);
    const [loadingText, setLoadingText] = useState('Publishing...');
    const [fetching, setFetching] = useState(false);
    const [fetchingText, setFetchingText] = useState('Fetching...');

    const [changesDetected, setChangesDetected] = useState(false);

    const navigate = useNavigate();
    const currentTime = new Date();

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
                setSavedCategory(data?.cCategory);
                setSelectedCategory(data?.cCategory);
                setSavedAuthors(data?.cAuthors);
                setAuthors(data?.cAuthors);
                setSavedSourceReference(data?.cReference);
                setSourceReference(data?.cReference);
                setSavedSourceUrl(data?.cSourceUrl);
                setSourceUrl(data?.cSourceUrl);
                setLastModifiedLocal(data?.lastModified.toDate());
                
                // if the fields are empty, set doiModal to true
                if (data?.cAuthors?.length == 0 && !data?.cReference && !data?.cSourceUrl) {
                    setDoiModal(true);
                }
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
        // If lastModifiedLocal > data.lastModified.toDate(), then there are changes
        if (lastModifiedLocal > digest?.publishedDate?.toDate() && digest?.publishedDate) {
            console.log("Changes detected");
            setChangesDetected(true);
        }
    }, [lastModifiedLocal]);
    
    useEffect(() => {
        if (selectedCategory && authors?.length > 0 && sourceReference && sourceUrl && digest?.cTitle && digest?.cContent && digest?.cCoverUrl) {
            setAllFieldsSubmitted(true);
        } else {
            setAllFieldsSubmitted(false);
        }
        console.log(allFieldsSubmitted);
    }, [selectedCategory, authors, sourceReference, sourceUrl, digest?.cTitle, digest?.content, digest?.cCoverUrl]);
    
    const publishDigest = async () => {
        setPublishing(true);

        try {
            const functionRef = httpsCallable(functions, 'publishDigest');
            const response = await functionRef({ id: id });
            if (response) {
                navigate(`/../../mydigests`);
            }
            setPublishing(false);
        } catch (error) {
            console.error('Error:', error);
            setPublishing(false);
        }
    };


    useEffect(() => {
        if (publishing) {
            const interval = setInterval(() => {
            setLoadingText((prev) => {
                if (prev === 'Publishing...') return 'Publishing';
                return "" + prev + '.';

            });
            }, 500);

        return () => clearInterval(interval);
    }
    }, [publishing]);

    useEffect(() => {
      if (fetching) {
          const interval = setInterval(() => {
          setFetchingText((prev) => {
              if (prev === 'Fetching...') return 'Fetching';
              return "" + prev + '.';

          });
          }, 300);

      return () => clearInterval(interval);
  }
  }, [fetching]);
  



    const handleInputChange = (event) => {
      const value = event.target.value;
      if (value.includes(',')) {
        const names = value.split(',');
        const newAuthors = names.slice(0, -1).map((name) => name.trim());
        setAuthors([...authors, ...newAuthors]);
        setCurrentInput(names[names.length - 1].trim());
      } else {
        setCurrentInput(value);
      }
    };
  
    const handleKeyDown = (event) => {
        if ((event.key === 'Backspace' || event.key === 'Delete') && currentInput.trim() === '') {
          if (authors.length > 0) {
            setAuthors(authors.slice(0, -1));
          }
        } else if (event.key === 'Enter' && currentInput.trim() !== '') {
          setAuthors([...authors, currentInput.trim()]);
          setCurrentInput('');
        }
      };
  
    const removeAuthor = (index) => {
      setAuthors(authors.filter((_, i) => i !== index));
    };
  

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    // Save authors to the database
    useEffect(() => {
        const saveAuthors = async () => {
          try {
            
            const docRef = doc(db, "digests", id);
            await setDoc(docRef, { cAuthors: authors, lastModified: serverTimestamp(), }, { merge: true });
            setSaving(false);
            setLastModifiedLocal(currentTime);
          } catch (error) {
            console.error("Error saving authors:", error);
            setSaving(false);
          }
        };

        if (authors !== savedAuthors && authors.length > 0) {
            setSaving(true);
            saveAuthors();
            setSavedAuthors(authors);
            
        }
      }, [authors]);

      // Save category to the database
    useEffect(() => {
        const saveCategory = async () => {
          try {
            setSaving(true);
            const docRef = doc(db, "digests", id);
            await setDoc(docRef, { cCategory: selectedCategory, lastModified: serverTimestamp() }, { merge: true });
            setSaving(false);
            setLastModifiedLocal(currentTime);
          } catch (error) {
            console.error("Error saving category:", error);
          }
        };

        if (selectedCategory !== savedCategory && selectedCategory) {
            saveCategory();
            setSavedCategory(selectedCategory);
        }
      }, [selectedCategory]);

  // Save source reference to the database with debounce
  useEffect(() => {
    const saveSourceReference = async () => {
      try {
        const docRef = doc(db, "digests", id);
        await setDoc(docRef, { cReference: sourceReference, lastModified: serverTimestamp() }, { merge: true });
        setSavedSourceReference(sourceReference);
        setLastModifiedLocal(currentTime);
      } catch (error) {
        console.error("Error saving source reference:", error);
      }
    };

    if (sourceReference !== savedSourceReference && sourceReference) {
      setSaving(true);
      const timer = setTimeout(() => {
        saveSourceReference();
        setSaving(false);
      }, 2000); // 2-second debounce

      return () => {clearTimeout(timer)}
    } else {
        setSaving(false);
    }
  }, [sourceReference]);

  // Save source URL to the database with debounce
  useEffect(() => {
    const saveSourceUrl = async () => {
      try {
        const docRef = doc(db, "digests", id);
        await setDoc(docRef, { cSourceUrl: sourceUrl, lastModified: serverTimestamp() }, { merge: true });
        setSavedSourceUrl(sourceUrl);
        setLastModifiedLocal(currentTime);
      } catch (error) {
        console.error("Error saving source URL:", error);
      }
    };

    if (sourceUrl !== savedSourceUrl && sourceUrl) {
      setSaving(true);
      const timer = setTimeout(() => {
        saveSourceUrl();
        setSaving(false);
      }, 2000); // 2-second debounce

      return () => clearTimeout(timer);
    } else {
        setSaving(false);
    }
  }, [sourceUrl]);

  // Get Details via DOI and set fields
  // https://api.crossref.org/works/doi for DOI details
  // https://doi.org/doi and Accept: text/x-bibliography; style=apa for citation
  const getDetailsViaDOI = async () => {
    try {

        // if doi contains no :/

        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        const data = await response.json();
        if (data.message.author) {
            const authorNames = data.message.author.map((author) => `${author.given} ${author.family}`);
            setAuthors(authorNames);
        }
        if (data.message.URL) {
            setSourceUrl(data.message.URL);
        }
        return true;
    } catch (error) {
        console.error("Error fetching DOI details:", error);
        return true;
    }
  }

  const getCitation = async () => {
    try {
        const response = await fetch(`https://doi.org/${doi}`, {
            headers: {
                'Accept': 'text/x-bibliography; style=apa',
            }
        });
        const data = await response.text();
        // if data contains <head> then it is an error
        if (data.includes("<head>")) {
            return true;
        }
        setSourceReference(data);
        return true;
    } catch (error) {
        console.error("Error fetching citation:", error);
        return true;
    }
  }

  const getDetails = async () => {
    let resp = await getDetailsViaDOI();
    let resp2 = await getCitation();
    if (resp && resp2) {
      setDoiModal(false);
      setFetching(false);
    }
  }



    return (
        <div style={styles.container}>
            <div style={styles.creationContainer}>
                <ProgressBar />
                <div style={styles.contentContainer}>
                    {doiModal && (
                        // Add a div that contains the doi input and a button to submit the doi
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.0)', position: 'fixed', zIndex: 5}}>
                            <div style={{display: 'flex', boxShadow: "0 4px 8px 0 rgba(128,128,128,0.9)",   flexDirection: 'column', marginLeft: "23%", alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 20, padding: 20, marginTop: 110}}>
                                <div style={{ margin: "20", marginBottom: "20px", fontWeight: "bold"}}>
                                  Add article details via DOI
                                </div>
                                <div style={{borderRadius: 20, border: "1px solid grey", padding: 0, display: 'flex', flexDirection: 'row', width: "75%", marginLeft: "5%", marginRight: "5%"}}>
                                  <input
                                      style={{
                                          fontSize: 20,
                                          margin: "2vh",
                                          alignSelf: "center",
                                          outline: "none",
                                          border: "none",
                                          width: "100%",
                                      }}
                                      type="text"
                                      placeholder="Example: https://doi.org/10.1509/jmr.13.0296"
                                      value={doi}
                                      onChange={(event) => setDoi(event.target.value)}
                                  />
                                </div>
                                <div style={{flexDirection: "row", width: "65%", display: "flex", justifyContent: "space-between"}}>
                                <div style={{...styles.skipButton, backgroundColor: "black"}} 
                                  onClick={() =>{
                                    if (doi && !fetching) {

                                    setFetching(true);
                                    getDetails()
                                    }
                                  }
                                  }
                                >
                                  {fetching? fetchingText : "Submit"}
                                </div>
                                <div style={{...styles.skipButton, backgroundColor: "gray", width: 200}} onClick={() => setDoiModal(false)}>Close</div>
                                </div>
                            </div>
                        </div>
                    )}


                    <div style={{flexDirection: "row", width: "100%", display: "flex", justifyContent:"space-between"}}>
                        <div style={{ marginBottom: "0vh", marginTop: "4vh" }}>All Authors</div>
                        <div style={{fontSize: 20, color: 'gray',marginTop: "4vh", marginRight: '2vw'}}>{saving? "Saving..." : "All saved"}</div>
                    </div>
                    <div style={styles.headlineBox}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        {authors.map((author, index) => (
                            <div key={index} style={styles.authorChip}>
                            {author}
                            <span style={styles.removeButton} onClick={() => removeAuthor(index)}>
                                &times;
                            </span>
                            </div>
                        ))}
                        <input
                            style={{
                            fontSize: 20,
                            margin: '2vh',
                            marginRight: '2vh',
                            outline: 'none',
                            width: '80vw',
                            border: 'none',
                            flex: 1,
                            }}
                            type="text"
                            placeholder="Full Name, Full Name..."
                            value={currentInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        </div>
                    </div>
                    <div style={{ marginBottom: "0vh", marginTop: "4vh" }}>Source Article (Reference)</div>
                    <div style={styles.headlineBox}>
                        <input
                            style={{
                                fontSize: 20,
                                margin: "2vh",
                                alignSelf: "center",
                                outline: "none",
                                border: "none",
                                width: "100%",
                            }}
                            type="text"
                            placeholder="Example: Biswas et. al. (2023). Caffeine’s  Effects on Consumer Spending. Journal of Marketing, 87(2), 149–167."
                            value={sourceReference}
                            onChange={(event) => setSourceReference(event.target.value)}
                        />
                    </div>
                    <div style={styles.headlineBox}>
                        <input
                            style={{
                                fontSize: 20,
                                margin: "2vh",
                                alignSelf: "center",
                                outline: "none",
                                border: "none",
                                width: "100%",
                            }}
                            type="text"
                            placeholder="URL or DOI"
                            value={sourceUrl}
                            onChange={(event) => setSourceUrl(event.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: "0vh", marginTop: "4vh" }}>Category</div>
                    <div style={{ ...styles.headlineBox, position: 'relative' }}>
                        <div
                            style={{
                                fontSize: 20,
                                margin: "2vh",
                                alignSelf: "center",
                                width: "100%",
                                pointerEvents: 'none', // Prevents interaction with this div
                            }}
                        >
                            {selectedCategory || "Select a category"}
                        </div>
                        <select
                            ref={selectRef}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0, // Makes the select invisible
                                cursor: 'pointer',
                            }}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option style={styles.option} value="" disabled>Select a category</option>
                            <option style={styles.option} value="Marketing">Marketing</option>
                            <option style={styles.option} value="Leadership & Culture">Leadership & Culture</option>
                            <option style={styles.option} value="Innovation & Enterpreneurship">Innovation & Enterpreneurship</option>
                            <option style={styles.option} value="AI & Data">AI & Data</option>
                            <option style={styles.option} value="Psychology">Psychology</option>
                            <option style={styles.option} value="Economics">Economics</option>
                            <option style={styles.option} value="Others">Others</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                </div>
                <div style={styles.link}>
                    <button onClick={()=> allFieldsSubmitted && changesDetected || allFieldsSubmitted && !digest?.title ? publishDigest() : null} 
                        style={{...styles.skipButton, backgroundColor:  allFieldsSubmitted && !digest?.title  || allFieldsSubmitted && changesDetected ? "black" : "gray"}}>
                        {publishing? loadingText : !digest?.title ? "Publish" : changesDetected ? "Publish Changes" : "Published"}
                    </button>
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
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 100,
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
    skipButton: {
        fontSize: 20,
        color: 'white',
        marginTop: "1.5vh",
        cursor: 'pointer',
        margin: "3vh",
        padding: "1vh",
        width: "15vw",
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
    authorChip: {
        backgroundColor: '#FBFBFB',
        padding: '5px 10px',
        margin: '5px',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
    },
    removeButton: {
    marginLeft: '10px',
    cursor: 'pointer',
    },
    option: {
    fontSize: 16,
    },

}

export default NewDigestAuthors;
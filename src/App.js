import React, {useContext, useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import ArticleDetails from './pages/ArticleDetails';
import LogIn from './pages/LogIn';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import SignUp from './pages/SignUp';
import GlobalContext from './Context';
import MyDigests from './pages/mydigests';
import NewDigestFile from './pages/newDigestFile';
import NewDigestSummary from './pages/newDigestSummary';
import NewDigestTitle from './pages/newDigestTitle';
import NewDigestsAuthors from './pages/newDigestAuthors';
import NewDigestPreview from './pages/newDigestPreview';
import Settings from './pages/Settings';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailLink } from 'firebase/auth';
import Search from "./assets/images/search.png";
import burgermenu from "./assets/images/burgermenu.png";
import { useGlobalContext } from "./Context";
import { displayName } from 'react-quill';
import { getDoc, doc } from 'firebase/firestore';
import LegalNotice from './pages/LegalNotice';
import { useNavigate, useParams} from 'react-router-dom';


function App() {
  const XL = useMediaQuery({
    query: '(min-width: 1724px)'
  });

  const L = useMediaQuery({
    query: '(min-width: 1450px) and (max-width: 1723px)'
  });

  const M = useMediaQuery({
    query: '(min-width: 1070px) and (max-width: 1449px)'
  });

  const S = useMediaQuery({
    query: '(min-width: 900px) and (max-width: 1069px)'
  });

  const Mobile = useMediaQuery({
    query: '(max-width: 899px)'
  });

  console.log("Mobile", Mobile, "S", S, "M", M, "L", L, "XL", XL);

  
 const [globalLoggedIn, setGlobalLoggedIn] = useState(false); // To be adjusted based on .auth in the future
 const [profession, setProfession] = useState(''); // To be fetched from the backend in the future
 const [topicHome, setTopicHome] = useState('All');
 const [topicLatest, setTopicLatest] = useState('All');
 const [topicPopular, setTopicPopular] = useState('All');
 const [homeType, setHomeType] = useState("");
 const [verified, setVerified] = useState(false);


 const contextValues = {
    globalLoggedIn,
    setGlobalLoggedIn,
    profession,
    setProfession,
    topicHome,
    setTopicHome,
    topicLatest,
    setTopicLatest,
    topicPopular,
    setTopicPopular,
    homeType,
    setHomeType,
    verified,
  };


  // SignInWithEmailLink
  useEffect(() => {
    const email = window.localStorage.getItem('emailForSignIn');
    if (email) {
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          console.log('Email sign in success');
        })
        .catch((error) => {
          console.error('Email sign in error:', error);
        });
    }
  }, []);

    // Firebase Auth Listener
  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setGlobalLoggedIn(true);
        console.log('Auth: User is logged in');
        console.log("uid" , auth.currentUser.uid);
      } else {
        setGlobalLoggedIn(false);
        console.log('Auth: User is logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user document from Firestore
  useEffect(() => {
    if (globalLoggedIn) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef)
        .then((doc) => {
          if (doc.exists()) {
            setProfession(doc.data().type);
            setVerified(doc.data()?.verified);
          } else {
            console.log('No such document!');
          }
        })
        .catch((error) => {
          console.error('Error getting document:', error);
        });
    }
  }, [globalLoggedIn]);

  const topics = [
    { name: "All", backgroundColor: "#f2f2f2", selected: 0 },
    { name: "Marketing", backgroundColor: "lightblue", selected: 0 },
    { name: "Leadership & Culture", backgroundColor: "lightcoral", selected: 0 },
    { name: "Innovation & Entrepreneurship", backgroundColor: "lightgreen", selected: 0 },
    { name: "AI & Data", backgroundColor: "lightyellow", selected: 0 },
    { name: "Psychology", backgroundColor: "yellow", selected: 0 },
    { name: "Economics", backgroundColor: "lightgreen", selected: 0 },
    { name: "Others", backgroundColor: "#f2f2f2", selected: 0 },
  ];
  


  return (
    <GlobalContext.Provider value={contextValues}>
      <Router>
        { !Mobile && <SideMenu globalLoggedIn={globalLoggedIn} />}
        { !Mobile && <TopBar topics={topics} globalLoggedIn={globalLoggedIn} />}
        { Mobile && <MobileTopBar />}
          <Routes>
            <Route path="/" element={<Home topics={topics}/>} />
            <Route path="/article/:id" element={<ArticleDetails />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/imprint" element={<LegalNotice />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/mydigests" element={<MyDigests />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/mydigests/:id/file" element={<NewDigestFile />} />
            <Route path="/mydigests/:id/summary" element={<NewDigestSummary />} />
            <Route path="/mydigests/:id/title" element={<NewDigestTitle/>} />
            <Route path="/mydigests/:id/authors" element={<NewDigestsAuthors />} />
            <Route path="/mydigests/:id/preview" element={<NewDigestPreview />} />

          </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}

// TopBar.js
function TopBar(props) {

  const location = useLocation();
  const isMainPath = location.pathname === '/';
  const isLoginPath = location.pathname === '/login';
  const isSignUpPath = location.pathname === '/signup';
  const isSettingsPath = location.pathname === '/settings';
  const isMyDigestsPath = location.pathname.startsWith('/mydigests');
  const file = location.pathname.includes('/file') && location.pathname.startsWith('/mydigests');
  const summary = location.pathname.includes('/summary') && location.pathname.startsWith('/mydigests');
  const title = location.pathname.includes('/title') && location.pathname.startsWith('/mydigests');
  const authors = location.pathname.includes('/authors') && location.pathname.startsWith('/mydigests');
  const publish = location.pathname.includes('/publish') && location.pathname.startsWith('/mydigests');
  const article = location.pathname.includes('/article') && location.pathname.startsWith('/article');
  const preview = location.pathname.includes('/preview') && location.pathname.startsWith('/mydigests');
  const navigate = useNavigate();
  const id = location.pathname.split("/")[2];
  
  const [signOutModal, setSignOutModal] = useState(false);

  const [initial, setInitial] = useState('');



  const modalRef = useRef(null);
  const profileRef = useRef(null);

  const { setTopicHome, topicHome, setHomeType, homeType } = useGlobalContext();

  const XL = useMediaQuery({
    query: '(min-width: 1724px)'
  });

  const L = useMediaQuery({
    query: '(min-width: 1450px) and (max-width: 1723px)'
  });

  const M = useMediaQuery({
    query: '(min-width: 1070px) and (max-width: 1449px)'
  });

  const S = useMediaQuery({
    query: '(min-width: 900px) and (max-width: 1069px)'
  });

  const Mobile = useMediaQuery({
    query: '(max-width: 899px)'
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current && !modalRef.current.contains(event.target) &&
        profileRef.current && !profileRef.current.contains(event.target)
      ) {
        setSignOutModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, profileRef]);

  const handlePreviewClick = () => {
    navigate(`/mydigests/${id}/preview`);
  };

  const handleEditClick = () => {
    navigate(`/mydigests/${id}/summary`);
  };

  useEffect(() => {
    if (auth?.currentUser) {
      if (auth?.currentUser?.email) {
        setInitial(auth?.currentUser?.email?.charAt(0).toUpperCase());
      } else if (auth?.currentUser) {
        setInitial("G");
      }
    }
  }, [auth?.currentUser]);

  return (
    <div style={{...styles.topBar, backgroundColor: article ? "" : "white", zIndex: preview? 5 : 0 }}>
      <div style={styles.searchBar}>
        { isMainPath ? (
        <>
          {/*
            <input type="text" placeholder="Search" style={styles.searchInput}/>
          */}
          <div className="topics" 
              style={{ 
                display: 'flex',
                width: "100%",
                border: "0px solid black",
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginTop: 33,
                paddingLeft: S ? "4vw" : M ? "4vw" : L ? "1.5vw" : "0vw",
                flexWrap: "nowrap",
                overflowX: 'auto' 
              }}>
            {props?.topics.map((topic, index) => (
              <div
                key={index}
                style={{
                  ...styles.topic,
                  backgroundColor: topicHome != topic.name ? "white":"#f2f2f2",// topic.backgroundColor,
                  cursor: 'pointer',
                  border: topicHome != topic.name ? "1px solid #f2f2f2" : "none",
                }}
                onClick={() => setTopicHome(topic?.name)}
              >
                <div style={{ ...styles.text }}>{topic.name}</div>
              </div>
            ))}
          </div>

        </>
        ) : (
          <>
          { isMyDigestsPath && (
          <div style={{width: "100%", flexDirection: "row", marginTop: 30}}>
            <div style={{ fontSize: 15 * 1.7, fontWeight: "bold", backgroundColor: "weight" }}>
            {file || summary || title || authors || publish || preview ? (
              <> 
                { preview ? (
                  <div style={{flexDirection: "row", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    <div>
                      Digest Preview 
                    </div>
                    <div style={{flexDirection: "row", display: "flex", marginRight: XL? "18vw" : "2vw"}}>
                      <div
                        onClick={handleEditClick}
                        style={{height: 30, width: 80, borderRadius: 12, padding: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: "2vw", cursor: 'pointer', border: "0px solid grey", boxShadow: "0 4px 8px 0 rgba(128,128,128,0.6)",}}>
                        <p style={{fontSize: 18, color: 'gray'}}>Edit</p>
                      </div>
                      {/*
                      <div style={{height: 30, width: 80, borderRadius: 12, padding: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: "0%", cursor: 'pointer', border: "0px solid grey", backgroundColor: "black", boxShadow: "0 4px 8px 0 rgba(128,128,128,0.6)",}}>
                        <p style={{fontSize: 18, color: 'white'}}>Publish</p>
                      </div>
                      */}
                    </div>
                  </div>
                ) : (
                <div style={{flexDirection: "row", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                  <div>
                  New digest
                  </div>
                  <div style={{flexDirection: "row", display: "flex", marginRight: "0vw"}}>
                      <div 
                        onClick={handlePreviewClick}
                        style={{height: 30, paddingLeft: 10, paddingRight: 10, borderRadius: 12, padding: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: "2vw", cursor: 'pointer', border: "1px solid grey"}}>
                        <p style={{fontSize: 18, color: 'gray', fontWeight: "normal"}}>View preview</p>
                      </div>
                    </div>
                </div>
                )}                
              </>
            ) : (
              "New Digest"
            )}
          </div>
          </div>
          )}
          { isSettingsPath && (
          <div style={{width: '90%', flexDirection: "row",  marginTop: 20}}>
            <div style={{fontSize: 15*1.7, fontWeight: "bold" }}>Settings & Feedback</div>
          </div>
          )}
          </>
        )}
      </div>
      <div style={{marginRight: "3vw", marginTop: 10 }}>
      {props?.globalLoggedIn ? (
        <>
        <div ref={profileRef} style={{width: 40, height: 40, marginBottom: 3, borderRadius: 30, border:"1px solid grey", backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: "10vw", cursor: 'pointer'}}
          onClick={() => {
            setSignOutModal(!signOutModal);
          }}
        >
          <p style={{fontSize: 24, marginBottom: 27, color: 'grey'}}>{initial}</p>
        </div>
        {signOutModal && (
          <div ref={modalRef} style={{display: "flex", zIndex: "3", position: 'absolute', top: 80, right: "12.75vw", width: 50, boxShadow: "0 4px 8px 0 rgba(128,128,128,0.4)", borderRadius: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <p style={{fontSize: 10, color: 'black', cursor: 'pointer'}} onClick={() => {auth.signOut(); window.location.href = '/';setSignOutModal(false)}}>Sign Out</p>
          </div>
        )}
      </>
      ) : (
        <>
        {isLoginPath ? (
          <Link to="/signup" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{height: 40, width: 80, borderRadius: 15, display: 'flex', paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 4, marginRight: "10vw", cursor: 'pointer', border: "1px solid #f2f2f2", backgroundColor: "white"}}>
            <p style={{ fontSize: 12 * 1.7, color: 'grey'}}>Sign Up</p>
            </div>
          </Link>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{height: 40, borderRadius: 15, display: 'flex', paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 4, marginRight: "10vw", cursor: 'pointer', border: "1px solid #f2f2f2", backgroundColor: "white"}}>
            <p style={{ fontSize: 12 * 1.7, color: 'grey'}}>Login</p>
            </div>
          </Link>
      )}
      </>
      )}
      </div>
    </div>
  );
}

function MobileTopBar() {

  const [sideMenu, setSideMenu] = useState(false);

  const { globalLoggedIn } = useGlobalContext();

  const [initial, setInitial] = useState('');

  const location = useLocation();
  const isLoginPath = location.pathname === '/login';

  useEffect(() => {
    if (auth?.currentUser) {
      if (auth?.currentUser?.email) {
        setInitial(auth?.currentUser?.email?.charAt(0).toUpperCase());
      } else if (auth?.currentUser) {
        setInitial("G");
      }
    }
  }, [auth?.currentUser]);

  return (
    <div>
      { 
        sideMenu && (
          <div onClick={() => setSideMenu(false)} style={{width: "100%", height: "100vh", backgroundColor: "rgb(1,1,1,0.5)", position: 'fixed', zIndex: 2}}>
            <div  onClick={(e) => e.stopPropagation()} style={{width: "60%", height: "100%", backgroundColor: "white", position: 'fixed', zIndex: 3, display: "flex"}}>
              <SideMenu setSideMenu={setSideMenu}/>
            </div>
          </div>
        )
      }
      <div style={styles.topBarMobile}>
        <div style={{flexDirection: "row", display: "flex"}}>
          <img src={burgermenu} alt="search" style={{marginLeft: 20, width: 38, height: 38, cursor: 'pointer', marginRight: 3}} 
            onClick={() => setSideMenu(!sideMenu)}
          />
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            onClick={() => {setSideMenu(false)}}
            style={styles.title}
          >
            Research Digests
          </div>
          </Link>
        </div>
        
        <div style={{ flexDirection: "row", display: "flex" }}>
          {/*
            <div>
          <img src={Search} alt="search" style={{width: 30, height: 30, cursor: 'pointer', marginRight: "3vw"}} />
          </div>
          */}
          { globalLoggedIn ? (
          <div onClick={() => {setSideMenu(!sideMenu)}} style={{width: 30, height: 30, borderRadius: 25, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 5, marginRight: "3vw", cursor: 'pointer', border: "1px solid grey"}}>
            <p style={{fontSize: 12 * 1.7, color: 'black', marginBottom: 23}}>{initial}</p>
          </div>
          ) : (
          <>
            { isLoginPath ? (
              <Link to="/signup" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{height: 23, borderRadius: 10, marginBottom: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 5, cursor: 'pointer', border: "1px solid grey", marginRight: 10}}>
                  <p style={{ fontSize: 12 * 1.7, color: 'grey', marginBottom: 23 }}>Sign Up</p>
                </div>
              </Link>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{height: 23, marginBottom: 3, borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 5, cursor: 'pointer', border: "1px solid grey", marginRight: 10}}>
                  <p style={{ fontSize: 12 * 1.7, color: 'grey', marginBottom: 23 }}>Login</p>
                </div>
              </Link>
            )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}



// SideMenu.js
function SideMenu(props) { 

  const location = useLocation();
  const isLoginPath = location.pathname === '/login';
  const isSignUpPath = location.pathname === '/signup';
  const isMyDigestsPath = location.pathname === '/mydigests';
  const isMainPath = location.pathname === '/';
  const isArticlePath = location.pathname.includes('/article/');

  const Mobile = useMediaQuery({
    query: '(max-width: 899px)'
  });

  const { setHomeType, homeType, globalLoggedIn } = useGlobalContext();


  return (
    <>
      {Mobile ? (
        <div style={styles.sideMenuMobile}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display:"flex", width: "100%" }}>
            <button style={styles.buttonMobile}
              onClick={() => {
                setHomeType("");
                props?.setSideMenu(false);
              }}
            >
              <p style={{...styles.paragraphMobile, backgroundColor: isMainPath && !homeType ? "#f2f2f2" : "white"}}>Main</p>
            </button>
          </Link>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display:"flex", width: "100%" }}>
            <button style={styles.buttonMobile}
              onClick={() => {
                setHomeType("Popular");
                props?.setSideMenu(false);
              }}
            >
              <p style={{...styles.paragraphMobile, backgroundColor: isMainPath && homeType === "Popular" ? "#f2f2f2" : "white"}}>Popular</p>
            </button>
          </Link>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display:"flex", width: "100%" }}>
            <button style={styles.buttonMobile}
              onClick={() => {
                setHomeType("Latest");
                props?.setSideMenu(false);
              }}
            >
              <p style={{...styles.paragraphMobile, backgroundColor: isMainPath && homeType === "Latest" ? "#f2f2f2" : "white"}}>Latest</p>
            </button>
          </Link>
          { globalLoggedIn && (
          <>
          <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit', display:"flex", width: "100%" }}>
            <button onClick={() => props?.setSideMenu(false)} style={styles.buttonMobile}><p style={styles.paragraphMobile}>Settings</p></button>
          </Link>
          <button onClick={() => {props?.setSideMenu(false);auth.signOut(); window.location.href = '/'}} style={styles.buttonMobile}><p style={styles.paragraphMobile}>Sign Out</p></button>
          </>
          )}
          <div style={{position: 'absolute', bottom: 15, left: 20, fontSize: 12, color: 'gray', flexDirection: "column"}}>
            <p>Privacy Policy | <Link to="/imprint" style={{ textDecoration: 'none', color: 'inherit', pointer: "cursor" }}>Imprint</Link></p>
            <div style={{marginTop: 5}}></div>
            <p >© 2025 Research Digests</p>
          </div>
        </div>
          
      ) : (
      <div style={styles.sideMenu}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <p style={styles.logoTitle}>Research Digests</p>
        </Link>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <button style={{ ...styles.button, cursor: 'pointer' }}
            onClick={() => {
              setHomeType("");
            }}
          >
            <p style={{...styles.paragraph, backgroundColor: isMainPath && !homeType ? "#f2f2f2" : "white"}}>Main</p>
          </button>
        </Link>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <button style={styles.button}
            onClick={() => {
              setHomeType("Popular");
            }}
          >
            <p style={{...styles.paragraph, cursor: "pointer", backgroundColor: isMainPath && homeType === "Popular" ? "#f2f2f2" : "white"}}>Popular</p>
          </button>
        </Link>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <button style={styles.button}
            onClick={() => {
              setHomeType("Latest");
            }}
          ><p style={{...styles.paragraph, cursor: "pointer", backgroundColor: isMainPath && homeType === "Latest" ? "#f2f2f2" : "white"}}>Latest</p>
        </button>
        </Link>
        { props?.globalLoggedIn && (
        <>
        {/*<button style={styles.button}><p style={styles.paragraph}>History</p></button>*/}
        <div style={{width: 1, width: '60%', backgroundColor: 'black', border: "1px solid lightgray", marginBottom: "4%", marginTop: "4%"}}></div>
        <Link to="/mydigests" style={{ textDecoration: 'none', color: 'inherit' }}>
          <button style={{...styles.button, cursor: "pointer"}}><p style={{...styles.paragraph, backgroundColor: isMyDigestsPath ? "#f2f2f2" : "white"}}>MyDigests</p></button>
        </Link>
        <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
          <button style={{...styles.button, cursor: "pointer"}}><p style={styles.paragraph}>Settings</p></button>
        </Link>
        </>
        )}
        <div style={{position: 'absolute', bottom: 60, fontSize: 12, color: 'gray', flexDirection: "column"}}>
        <p>Privacy Policy | <Link to="/imprint" style={{ textDecoration: 'none', color: 'inherit', pointer: "cursor" }}>Imprint</Link></p>
          <div style={{marginTop: 5}}></div>
          <p >© 2025 Research Digests</p>
        </div>
      </div>
      )
      }
    </>
  );
}


const styles = {
  paragraph: {
    fontSize: 12 * 1.7,
    width: "8vw",
    height: 30 * 1.7,
    alignItems: 'center',
    paddingLeft: "1vw",
    display: 'flex',
    borderRadius: 8,
  },
  paragraphMobile: {
    fontSize: 12 * 1.7,
    width: "100%",
    height: 30 * 1.7,
    alignItems: 'center',
    paddingLeft: "15px",
    display: 'flex',
    borderRadius: 8,
  },
  logoTitle: {
    fontSize: 15 * 1.7,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 5 * 1.7,
  },
  title: {
    fontSize: '25px',
    fontWeight: 'bold',
    marginLeft: "4vw",
    marginBottom: 5,
  },
  button: {
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
  },
  buttonMobile: {
    background: 'none',
    border: 'none',
    padding: 0,
    width: "90%",
    display: 'flex',
    cursor: 'pointer',
  },
  sideMenu: {
    width: "9%",
    height: '100%',
   //backgroundColor: '#fff',
    padding: 20 * 1.7,
    paddingTop: 8 * 1.7,
    marginTop: 0,
    position: 'fixed',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'flex-start',
    zIndex: 3,
  },
  sideMenuMobile: {
    width: "100%",
   //backgroundColor: '#fff',
    paddingLeft: 10,
    marginTop: 60,
    //position: 'fixed',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'flex-start',
  },
  topBar: {
    width: '100%',
    height: 38 * 1.7,
    position: 'fixed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8 * 1.7,
    paddingBottom: 5 * 1.7,
    marginLeft: '10%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  topBarMobile: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    position: 'fixed',
    paddingTop: 5 ,
    flexDirection: 'row',
    zIndex: 3,
    alignItems: 'center',
    paddingTop: 8 * 1.7,
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
  },

  searchBar: {
    width: '100%',
    backgroundColor: 'white',
    marginLeft: "3vw",
    alignItems: 'center',
    display: 'flex',
    marginBottom: 25,
  },
  searchInput: {
    width: '90%',
    height: 30 * 1.7,
    border: 'none',
    paddingLeft: 20 * 1.7,
    fontSize: 12 * 1.7,
  },
  topic: {
    backgroundColor: 'gray',
    height: 45,
    borderRadius: 15,
    paddingLeft: 12,
    paddingRight: 12,
    marginRight: 10,
    whiteSpace: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    marginLeft: 15,
  },
  text: {
    color: '#454545',
    fontSize: 20,
    marginBottom: 3,
  },
};

export default App;

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Tile from '../assets/components/tile';
import { useMediaQuery } from 'react-responsive'
import { doc, getDoc, where, query, collection, getDocs, limit} from "firebase/firestore";
import { db, functions } from '../firebase';
import "./../styles/article.css";
import { httpsCallable } from "firebase/functions";

function ArticleDetails(props) {

  useEffect(() => {
    // Scroll to the top when the component mounts or updates
    window.scrollTo(0, 0);
  }, []);

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


    const [article, setArticle] = useState([]);
    const { id } = useParams();
    const [showMethod, setShowMethod] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const [loading, setLoading] = useState(true);


    const handleImageLoad = () => {
      setIsImageLoaded(true);
    };

    const [posts, setPosts] = useState([]);

    // Clapp Animation / Behaviour
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [applauseBoxBottom, setApplauseBoxBottom] = useState(-25);
    const [clapped, setClapped] = useState(false);
    const [clapCount, setClapCount] = useState(null);
  
    console.log(window.innerHeight, document.documentElement.scrollHeight);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
        // Check if near bottom of page
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const buffer = 100; // Adjust as needed
    
        if (windowHeight + currentScrollTop >= documentHeight - buffer) {
          // Near bottom, set bottom to -25px
          setApplauseBoxBottom(-25);
        } else if (currentScrollTop > lastScrollTop) {
          // Scrolling down
          setApplauseBoxBottom(-80);
        } else {
          // Scrolling up
          setApplauseBoxBottom(-25);
        }
    
        setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
      };
    
      window.addEventListener('scroll', handleScroll);
    
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, [lastScrollTop]);

    useEffect(() => {
      const fetchData = async () => {
        // Get article based on doc id
        const docRef = doc(db, "digests", id);
        const docSnap = await getDoc(docRef);
        console.log(docSnap.data());
        setArticle(docSnap.data());
        setClapCount(docSnap.data().claps);
        setLoading(false);
      };
      fetchData();
    }
    , [id]);

  const formatAuthors = (authors) => {
    if (authors) {
        return `By ${authors.join(', ')}`;
    } else {
        return '';
    }
  }

  const clapforPost = async (id) => {
    setClapped(true);

    try {
        const functionRef = httpsCallable(functions, 'clapForPost');
        const response = await functionRef({ id: id });
    } catch (error) {
        console.error('Error:', error);
    }
  }



  useEffect(() => {

    const fetchData = async () => {
        const q = query(collection(db, "digests"), where("status", "==", "Published"), limit(4));
        const querySnapshot = await getDocs(q);
        setPosts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    if (XL) {
      fetchData();
    }
  }
  , [XL]);

  const formatUrl = (url) => {
    if (!url) return '#'; // Fallback URL or handle as needed
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const getBorderColor = (category, Mobile) => {
    const shadowStrength = Mobile ? '0px -1px 2px' : '0px 4.5px 9px';
    switch(category) {
      case 'Marketing':
        return `${shadowStrength} lightblue`;
      case 'Leadership & Culture':
        return `${shadowStrength} lightcoral`;
      case 'Innovation & Entrepreneurship':
        return `${shadowStrength} lightgreen`;
      case 'AI & Data':
        return `${shadowStrength} lightyellow`;
      case 'Psychology':
        return `${shadowStrength} yellow`;
      case 'Economics':
        return `${shadowStrength} lightgreen`;
      case 'Others':
        return `${shadowStrength} #f2f2f2`;
      default:
        return Mobile ? `${shadowStrength} lightgray` : '0px 4.5px 9px lightgray';
    }
  };

  const borderColor = getBorderColor(article?.category, Mobile);
  


  return (
    <div  style={{ display: 'flex', flexDirection: 'row' }}>
      {Mobile ? (
        <div>
          <div style={{...styles.startContainerMobile, marginLeft: 0, padding: 0, alignSelf: "center", justifyContent: "center"}}>
            <div style={{...styles.mainContainerMobile, border: "none", boxShadow: borderColor, marginLeft: 0, minWidth: "102%", padding: 0}}>
              {loading ? (<></>) : (
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",margin: '0 auto', marginTop: "10px"}}>
                <div style={{flexDirection: "row", display: "flex", justifyContent: "space-between", width: '82%', fontSize: 23, marginBottom: 0}}>
                  <div style={{position: "relative", flexDirection:"column", justifyContent: "space-between", width: "75%", fontSize: 23,}}>
                    <h1 style={{fontSize: 17, marginRight: 7, fontWeight: "bold", lineHeight: '28px' }}>{article?.title}</h1>
                  </div>
                  <div style={{flexDirection: "column", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                    <img 
                      src={article?.coverUrl} 
                      style={{
                        ...styles.imageMobile,
                        marginTop: 20,
                        display: isImageLoaded ? 'block' : 'none', // Hide image until loaded
                      }}
                      onLoad={handleImageLoad}
                    />
                    {/*
                    <div style={{flexDirection: "row", display: "flex", width:"90px", justifyContent: "center", alignItems: "center", position: "relative", marginTop: 10}}>
                      <div style={{backgroundColor: "lightgrey", width: "70%", height: 20, borderBottomLeftRadius: 8, borderTopLeftRadius: 8}}/>
                      <div style={{backgroundColor: "grey", width: "30%", height: 20, borderBottomRightRadius: 8, borderTopRightRadius: 8}}/>
                      <div style={{position: "absolute", bottom: "0px", fontSize: 16, color: "white"}}>
                        Academic
                      </div>
                    </div>
                    */}
                  </div>
                </div>
                <div style={{width: "82%", marginBottom: 0}}>
                  <div style={{fontSize: 15, color: "grey"}}>{formatAuthors(article?.authors)}</div>
                </div>
                <div style={{}}>
                <p
                  className="article-contentMobile"
                  style={{
                    fontSize: 17,
                    letterSpacing: '-0.0em',
                    lineHeight: '30px',
                    maxWidth: '82%',
                    textAlign: 'left',
                    margin: '0 auto',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: `${article?.content}`, // Append the black square
                  }}
                ></p>
                </div>
            
                <div style={{marginTop: 5, justifyContent: "flex-start", display: "flex", width:'82%', fontSize: 23, flexDirection: "column"}}>
                      {article?.methodText &&
                      <div style={{cursor: "pointer"}} onClick={() => setShowMethod(!showMethod) }>
                        <div
                          style={{fontSize: 17, textDecoration: "underline", lineHeight: '25px', marginTop:0, marginBottom: showMethod? "0px" : "10px"}}>Further Details: Method / Basis of the Findings?
                        </div>
                      </div>
                      }
                      {showMethod &&
                        <div style={{marginTop: 0}}>
                          <p
                            className="article-contentMobile"
                            style={{
                              fontSize: 17,
                              letterSpacing: '-0.0em',
                              lineHeight: '30px',
                              textAlign: 'left',
                              margin: '0 auto',
                          }} dangerouslySetInnerHTML={{ __html: article?.methodText }}></p>
                        </div>
                      }
                      {article?.reference && (
                        <p style={{ fontSize: 15, lineHeight: '25px', }} >
                          Source: {article?.reference}
                          &nbsp;
                          <a href={article?.sourceUrl ? formatUrl(article?.sourceUrl) : null} style={{ fontSize: 15, color: "grey" }} target="_blank" rel="noopener noreferrer">
                            {article?.sourceUrl}
                          </a>
                        </p>
                      )}
                    </div>

              </div>
            )}
            </div>
          </div>
          <div
            style={{
              ...styles.applauseBoxMobile,
              bottom: `${applauseBoxBottom}px`,
            }}
            onClick={() => {
              if (!clapped) {
                clapforPost(id);
                setClapCount(clapCount + 1);
              }
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: 'grey',
                marginLeft: '10px',
                marginBottom: '20px',
                filter: clapped ? 'grayscale(100%)' : 'none',
              }}
            >
              👏
            </div>
            <div
              style={{
                fontSize: 18,
                color: 'grey',
                marginRight: '10px',
                marginLeft: '10px',
                marginBottom: '20px',
              }}
            >
              {clapCount}
            </div>
          </div>
        </div>
        ) : (
        <>
          <div style={{...styles.startContainer, marginLeft: XL  || L ? "15vw" : M ? "16vw" : "18vw", marginRight: XL ? "1vw" : "2vw"}}>
            {loading ? (<></>) : (
              <div style={{...styles.mainContainer, width: XL? "56vw": "90%"}}>
                  <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", margin: '0 auto',}}>
                    <div style={{flexDirection: "row", display: "flex", justifyContent: "space-between", width: '89%', fontSize: 23, marginBottom: 20}}>
                      <div style={{position: "relative", flexDirection:"column", justifyContent: "space-between", width: "75%", fontSize: 23,}}>
                      {/*
                        <div style={{position: "absolute", marginRight: "20"}}>
                      <button className="voteButton">Upvote</button>
                      <button className="voteButton">Downvote</button>
                    </div>*/}
                        <h1 className="overflow" style={{fontSize: 30 }}>{article?.title}</h1>
                        <p style={{fontSize: 23}}>{formatAuthors(article?.authors)}</p>
                      </div>
                    <div style={{flexDirection: "column", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                      <img 
                        src={article?.coverUrl} 
                        style={{
                          ...styles.image,
                          display: isImageLoaded ? 'block' : 'none', // Hide image until loaded
                        }}
                        onLoad={handleImageLoad}
                      />
                      {/*
                      <div style={{flexDirection: "row", display: "flex", width:"200px", justifyContent: "center", alignItems: "center", position: "relative", marginTop: 10, marginRight: 10}}>
                        <div style={{backgroundColor: "lightgrey", width: "50%", height: 25, borderBottomLeftRadius: 10, borderTopLeftRadius: 10}}/>
                        <div style={{backgroundColor: "grey", width: "50%", height: 25, borderBottomRightRadius: 10, borderTopRightRadius: 10}}/>
                        <div style={{position: "absolute", bottom: 1, fontSize: 20, color: "white"}}>
                          Balanced
                        </div>
                      </div>
                      */}
                    </div>
                    </div>
                    <div style={{}}>
                    <p 
                    className="article-content"
                    style={{
                        fontSize: 23,
                        letterSpacing: '-0.003em',
                        lineHeight: '32px',
                        maxWidth: '89%',
                        textAlign: 'justify',
                        margin: '0 auto',
                        //textRendering: 'optimizeLegibility'
                      }} dangerouslySetInnerHTML={{ __html: article?.content }}></p>
                    </div>
                    <div style={{marginTop: 30, justifyContent: "flex-start", display: "flex", width:'89%', fontSize: 23, flexDirection: "column"}}>
                      {article?.methodText &&
                      <div style={{cursor: "pointer"}} onClick={() => setShowMethod(!showMethod) }>
                        <div
                          //className="article-contentMethod" 
                          style={{fontSize: 23, textDecoration: "underline", marginBottom: showMethod? "0px" : "10px"}}>Further Details: Method / Basis of the Findings?
                        </div>
                      </div>
                      }
                      {showMethod &&
                        <div style={{marginTop: 0, paddingTop: 0}}>
                          <p
                            className="article-content"
                            style={{
                              fontSize: 23,
                              letterSpacing: '-0.003em',
                              lineHeight: '32px',
                              maxWidth: '100%',
                              textAlign: 'justify',
                              //margin: '0 auto',
                            //textRendering: 'optimizeLegibility'
                          }} dangerouslySetInnerHTML={{ __html: article?.methodText }}></p>
                        </div>
                      }
                      {article?.reference && (
                        <p style={{ fontSize: 20 }}>
                          Source: {article?.reference}
                          &nbsp;
                          <a href={article?.sourceUrl ? formatUrl(article?.sourceUrl) : null} style={{ fontSize: 16, color: "grey" }} target="_blank" rel="noopener noreferrer">
                            {article?.sourceUrl}
                          </a>
                        </p>
                      )}
                    </div>
                </div>
                <div style={styles.applauseBox}
                  onClick={() => {
                      if (!clapped) {
                        clapforPost(id);
                        setClapCount(clapCount + 1);
                      }
                  }}
                >
                  <div style={{fontSize: 20, color: "grey", marginLeft: "10px", marginBottom: 2, filter: clapped ? 'grayscale(100%)' : 'none',}}>
                    👏
                  </div>
                  <div style={{fontSize: 20, color: "grey", marginRight: "10px", marginLeft: "10px", marginBottom: 2}}>
                    {clapCount}
                  </div>
                </div> 
              </div>
            )}
            </div>
            {XL && (
              <div
                style={{ marginLeft: 120, width: '15%', marginTop: 75, marginBottom: 20 * 1.7 }}
              >
                {posts?.map((post, index) => (
                  <Tile
                    key={index}
                    image={post.coverUrl}
                    text={post.title}
                    category={post.category}
                    id={post.id}
                    authors={post.authors}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

const styles = {

  startContainer: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    backgroundColor: 'white',
    width: '100vw',
  },
  mainContainer: {
  border: "3px lightgray solid",
  boxShadow: "0 4px 8px 0 rgba(128,128,128,0.4)",
  padding: 20 * 1.7,
  marginTop: 100,
  marginLeft: 10,
  borderRadius: 20 * 1.7,
  marginBottom: 50,
  position: 'relative',
  },
  applauseBox: {
    position: 'absolute',
    bottom: '-25px', // Adjust to overlap the bottom border
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    border: '3px solid #ccc',
    boxShadow: "0 4px 8px 0 rgba(128,128,128,0.4)",
    flexDirection: 'row',
    display: 'flex',
    zIndex: 1, // Ensure it appears above other elements
    cursor: 'pointer'
  },
  applauseBoxMobile: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxShadow: "0 4px 8px 0 rgba(128,128,128,0.8)",
    flexDirection: 'row',
    display: 'flex',
    zIndex: 1, // Ensure it appears above other elements
    transition: 'bottom 0.3s',
    cursor: 'pointer',
  },

  startContainerMobile: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '110vh',
    backgroundColor: 'white',
    width: '100vw',
    overflow: 'hidden',
  },
  mainContainerMobile: {
    width: '100%',
    borderBottom: "none",
    padding: 20 * 1.7,
    marginTop: 85,
    marginLeft: 10,
    borderTopLeftRadius: 20 * 1.7,
    borderTopRightRadius: 20 * 1.7,
    marginBottom: 45,
  },
  imageMobile: {
    width: 90,
    height: 59,
    marginRight: 0,
    marginleft: 10,
    borderRadius: 20,
    marginTop: 17,
  },
  image: {
  width: 200,
  height: 130,
  marginRight: 10,
  marginleft: 10,
  borderRadius: 20,
  marginTop: 21,
  },
    };


export default ArticleDetails;
import React from 'react';
import Tile from './assets/components/tile';
import { useState, useEffect } from 'react';
import ArticleDetails from './pages/ArticleDetails';
import { Route } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import { auth, db } from './firebase';
import { getDocs, collection, where, query, orderBy } from "firebase/firestore";
import "./styles/home.css";
import { useGlobalContext } from "./Context";


function Home(props) {

    const [posts, setPosts] = useState([]);
    const { topicHome, setTopicHome, homeType } = useGlobalContext();

 
    const S = useMediaQuery({
      query: '(min-width: 900px) and (max-width: 1069px)'
    });
  
    const Mobile = useMediaQuery({
      query: '(max-width: 899px)'
    });


    // Get the user's digests from the database
    useEffect(() => {

    const fetchData = async () => {
      // ToDo: Pagination
        if (topicHome == "All") {
          if (homeType == "") {
            const q = query(collection(db, "digests"), where("status", "==", "Published"), orderBy("publishedDate", "desc")); // ToDo: Embedding-Based
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          } else if (homeType == "Popular") {
            // Sort by "claps" in descending order
            const q = query(collection(db, "digests"), where("status", "==", "Published"), orderBy("claps", "desc"));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          } else if (homeType == "Latest") {
            // Sort by "date" in descending order
            const q = query(collection(db, "digests"), where("status", "==", "Published"), orderBy("publishedDate", "desc"));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          } 
        } else if (topicHome) {
          if (homeType == "") {
            const q = query(collection(db, "digests"), where("status", "==", "Published"), where ("category", "==", topicHome));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          } else if (homeType == "Popular") {
            // Sort by "claps" in descending order
            const q = query(collection(db, "digests"), where("status", "==", "Published"), where ("category", "==", topicHome), orderBy("claps", "desc"));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          } else if (homeType == "Latest") {
            // Sort by "date" in descending order
            const q = query(collection(db, "digests"), where("status", "==", "Published"), where ("category", "==", topicHome), orderBy("publishedDate", "desc"));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          } 
          
        }
      }
      fetchData();
    }
    , [topicHome, homeType]);


  return (
    <div>
      {!Mobile && <header/> }
      <div style={styles.startContainer}>
        <div style={{...styles.mainContainer, marginLeft: Mobile ? 0: "10%", width: Mobile ? "100%" : "90%", padding: Mobile ? 0 : 20 * 1.7}}>
          {Mobile && 
            <div className="topics" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 70, marginLeft: "4vw", marignBottom: 13, flexWrap: "nowrap", overflowX: 'auto' }}>
              {props?.topics.map((topic, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.topic,
                    backgroundColor: topic.name == topicHome? "#f2f2f2": "white"  ,//topic.backgroundColor,//"#f2f2f2"
                    cursor: 'pointer',
                    border:  "1px solid #f2f2f2"//`1px solid ${topic.backgroundColor}`,
                  }}
                  onClick={() => setTopicHome(topic.name)}
                >
                  <div style={{ ...styles.text }}>{topic.name}</div>
                </div>
              ))}
            </div>
          }
          <div style={{...styles.tileRow, justifyContent: Mobile ? "center" : "flex-start", marginLeft: Mobile ? 0 : 10, marginTop: Mobile ? 2 : 68}}>
            {posts.map((post, index) => (
              <Tile 
                key={index} 
                image={post.coverUrl} 
                text={post.title} 
                category={post.category}
                id = {post.id}
                authors = {post.authors}
              />
            ))}
          </div>
      </div>
      </div>
    </div>
  );
}

const styles = {
    startContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100vh',
      backgroundColor: 'white',

    },
    mainContainer: {
      height: '100%',
      backgroundColor: 'white',
      paddingTop: 0,
      marginTop: 0,
    },
    tileText: {
      fontSize: 12 * 1.7,
      textAlign: 'left',
      marginTop: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    tileContainer: {
      padding: 20 * 1.7,
      width: 200 * 1.7,
      height: 100 * 1.7,
      borderWidth: 1 * 1.7,
    },
    tileRow: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 40 * 1.7,
      width: '100%',
  
    },
    topic: {
      backgroundColor: 'gray',
      height: 35,
      borderRadius: 8,
      paddingLeft: 12,
      paddingRight: 12,
      marginRight: 10,
      whiteSpace: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
    },
    text: {
      color: '#454545',
      fontSize: 18,
    },

  
  };

  

export default Home;

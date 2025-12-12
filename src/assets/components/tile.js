import React from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import { useNavigate } from 'react-router-dom';

function Tile(props) {

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

  const navigate = useNavigate();

  const getBorderColor = (category, Mobile) => {
    const shadowStrength = Mobile ? '0px 2px 4px' : '0px 3px 5px';
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
        return `${shadowStrength} lightgray`;
      default:
        return Mobile ? `${shadowStrength} lightgray` : '0px 4.5px 9px lightgray';
    }
  };

  const formatAuthors = (authors) => {
    if (authors.length === 1) {
        return `By ${authors[0]}`;
    } else if (authors.length === 2) {
        return `By ${authors.join(' & ')}`;
    } else if (authors.length >= 3) {
        return `By ${authors[0]} et. al.`;
    }
    return '';
  };

  // Use the function to get the border color
    const borderColor = getBorderColor(props.category, Mobile);

    return (
      <>
      { Mobile ? (
        <div>
          <Link to={{pathname: `/article/${props.id}`, state:{id: props.id}}} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{...styles.tileFormM, boxShadow: borderColor}}>
              <div style={{flexDirection: "row", display: "flex", alignItems:"flex-start"}}>
              <p style={styles.tileTextM}>{props.text}</p> 
                <img src={props.image} style={styles.imageM} />
              </div>
              <div>
              <p style={styles.authorTextM}>{formatAuthors(props?.authors)}</p>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div style={{...styles.tileContainer, width: XL ? '20%' : L ? '25%' : M ? "35%" : '45%',}}>
            <Link to={{pathname: `/article/${props.id}`, state:{id: props.id}}} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{...styles.tileForm, boxShadow: borderColor}}>
                <div style={{flexDirection: "row", display: "flex"}}> 
                  <img src={props.image} style={styles.image} />
                  <div style={{flexDirection: "column", display: "flex"}}>
                  <p style={styles.otherText}>{props.category}</p>
                  <p style={styles.authorText}>{formatAuthors(props?.authors)}</p>
                  </div>
                </div>
                <div>
                <p style={styles.tileText}>{props.text}</p>
                </div>
              </div>
            </Link>
        </div>
      )}
      </>
    );
}

const styles = {
  tileForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10 * 1.5,
    paddingTop: 10 * 1.5,
    width: 200 * 1.5,
    height: 110 * 1.5,
    backgroundColor: 'white',
    borderRadius: 20 * 1.5,
  },
  tileFormM: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10 * 1.5,
    paddingTop: 10 * 1.5,
    width: "83vw",
    marginBottom: 8,
    marginTop: 15,
    //height: 110 * 1.5,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  tileText: {
    fontSize: 12 * 1.5,
    textAlign: 'left',
    marginTop: 10 * 1.5,
    whiteSpace: 'normal',
    marginHorizontal: 6 * 1.5,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  tileTextM: {
    fontSize: 12 * 1.5,
    textAlign: 'left',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 0,
    marginBottom: 7,
    whiteSpace: 'normal',
    marginHorizontal: 6 * 1.5,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  otherText: {
    fontSize: 10 * 1.5,
    textAlign: 'left',
    margin: 10 * 1.5,
    marginTop: 3 * 1.5,
    whiteSpace: 'wrap',
    marginHorizontal: 6 * 1.5,
    color: "#9e9e9e"
  },
  authorText: {
    fontSize: 10 * 1.5,
    textAlign: 'left',
    margin: 10 * 1.5,
    marginTop: 0,
    whiteSpace: 'wrap',
    marginHorizontal: 6 * 1.5,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  authorTextM: {
    fontSize: 10 * 1.5,
    textAlign: 'left',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 10,
    textWrap: "no-wrap",
    marginHorizontal: 0,
    color: "gray",
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
  },
  tileContainer: {
    display: 'flex',
    justifyContent: "center",
    padding: 20 * 1.5,
     // Adjusted to fit 4 tiles in a row
    height: 100 * 1.5,
    borderWidth: 1 * 1.5,
    marginBottom: 15 * 1.5,
  },
  image: {
    width: 100 * 1.5,
    height: 65 * 1.5,
    borderRadius: 5 * 1.5,
    objectFit: 'fill',
  },
  imageM: {
    width: 100,
    height: 65,
    borderRadius: 5 * 1.5,
    objectFit: 'fill',
  }
}

export default Tile;
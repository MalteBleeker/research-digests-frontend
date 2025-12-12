import React, { useEffect, useState} from 'react';
import pencilLamp from '../assets/images/pencilLamp.png';
import { Link } from 'react-router-dom';
import { useGlobalContext } from '../Context';
import { useNavigate } from 'react-router-dom';

import { useMediaQuery } from 'react-responsive';



function LegalNotice() {

    const { globalLoggedIn, profession, verified } = useGlobalContext();

    const Mobile = useMediaQuery({
        query: '(max-width: 899px)'
      });


    return (
        <div>
        <div style={{...styles.container, marginLeft: Mobile? 0: "13%", width: Mobile? "100%": "86%", paddingTop: Mobile? "80px": "80px"}}>
        { Mobile ? (
            <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingLeft: "25px", paddingRight: "35px", marginBottom: "50px"}}>
                <div style={{...styles.title, marginTop: 10}}>Imprint</div>
                <div style={styles.value}>ResearchDigests is a plattform by Malte Bleeker.
                <br/>
                <br/>
                It is currently being developed as part of his PhD at the University of St.Gallen (HSG).
                </div>
                <div style={{...styles.title, marginTop: 10}}>Contact & Feedback</div>
                <div style={styles.value}>Malte Bleeker
                <br/>
                malte.bleeker@unisg.ch
                <br/>
                <br/>
                Institute for Marketing and Customer Insights
                <br/>
                Dufourstrasse 40a 
                <br/>
                9000 St.Gallen
                <br/>
                Switzerland
                </div>
            </div>

        ): (
            <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start", width: "50%"}}>
                <div style={styles.title}>Imprint</div>
                <div style={styles.value}>ResearchDigests is a plattform by Malte Bleeker.
                <br/>
                <br/>
                It is currently being developed as part of his PhD at the University of St.Gallen (HSG).
                </div>
                <div style={styles.title}>Contact & Feedback</div>
                <div style={styles.value}>Malte Bleeker
                <br/>
                malte.bleeker@unisg.ch
                <br/>
                <br/>
                Institute for Marketing and Customer Insights
                <br/>
                Dufourstrasse 40a 
                <br/>
                9000 St.Gallen
                <br/>
                Switzerland
                </div>
            </div>
        )}

        </div>
        </div>
    );
}



const styles = {
    container: {
        justifyContent: 'center',
        width: '86%',
        height: '100%',
    },
    title: {
        color: 'black',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    value: {
        color: 'black',
        fontSize: 16,
        marginBottom: 15,
        padding: 10,
        //border: '1px solid #f2f2f2',
        borderRadius: 10,
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.2)',
    },
    logInButton: {
        backgroundColor: 'black',
        borderRadius: 20,
        border: '1px solid gray',
        width: 130,
        height: 40,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.3)', // Add this line for shadow    
    },
    input: {
        width: '100%',
        padding: '5px 0',
        paddingTop: 15,
        fontFamily: "system-ui",
        height: 300,
        marginBottom: 15,
        borderRadius: 10,
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.3)',
        border: "none",
        padding: 10,
        textAlignVertical: "top",
        resize: "none",
    },
    inputMobile: {

        padding: '5px 0',
        paddingTop: 15,
        fontFamily: "system-ui",
        height: 300,
        marginBottom: 15,
        borderRadius: 10,
        boxShadow: '-2px 2px 5px rgba(0, 0, 0, 0.3)',
        border: "none",
        padding: 10,
        textAlignVertical: "top",
        resize: "none",
    },
};

export default LegalNotice;
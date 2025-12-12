import React, {createContext, useContext} from 'react';


const GlobalContext = createContext();

export const useGlobalContext = () => {
    return useContext(GlobalContext);
    }

export default GlobalContext;
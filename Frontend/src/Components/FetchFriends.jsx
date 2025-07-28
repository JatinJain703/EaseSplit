import {  useEffect } from "react";
import { usegetFriends } from "../hooks/usegetFriends";
export function FetchDetails({ children }) {
    
    const fetchFriends=usegetFriends();
        
    useEffect(()=>{
      fetchFriends();
    },[])
        return children;
}
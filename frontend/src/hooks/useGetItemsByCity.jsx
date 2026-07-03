import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity, setShopsInMyCity, setUserData } from '../redux/userSlice.js'

function useGetItemsByCity() {
    const dispatch=useDispatch()
    const {currentCity, userData}=useSelector(state=>state.user)
  useEffect(()=>{
    if (!userData || !currentCity) return;
    const fetchItems=async () => {
    try {
           const result=await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`,{withCredentials:true})
            dispatch(setItemsInMyCity(result.data))
           console.log(result.data)
    } catch (error) {
        console.log(error)
    }
}
fetchItems()
 
  },[currentCity])
}

export default useGetItemsByCity



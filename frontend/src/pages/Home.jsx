import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard.jsx'
import OwnerDashboard from '../components/OwnerDashboard.jsx'
import DeliveryBoy from '../components/DeliveryBoy.jsx'
import Footer from '../components/Footer.jsx'

function Home() {
    const {userData}=useSelector(state=>state.user)
  return (
    <div className='w-screen min-h-screen pt-24 flex flex-col justify-between items-center bg-[#FAFAFA]'>
      <div className="w-full flex flex-col items-center flex-grow">
        {userData.role=="user" && <UserDashboard/>}
        {userData.role=="owner" && <OwnerDashboard/>}
        {userData.role=="deliveryBoy" && <DeliveryBoy/>}
      </div>
      <Footer />
    </div>
  )
}

export default Home

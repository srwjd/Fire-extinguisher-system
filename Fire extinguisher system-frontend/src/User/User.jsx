import './User.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'

import Home from "./Home/Home";
import Profile from './Profile/Profile';
import FireDetails from './Fire_details/Fire_details';
import ScanQR from './ScanQR/ScanQR';

function User() {
    return (
        <div className='userContainer'>
            <DeviceFrameset device="iPhone X">
                    <Router className='frame'>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path='/profile' element={<Profile />} />
                            <Route path="/fire-details/:fire_id" element={<FireDetails />} />
                            <Route path="/qr-scan" element={<ScanQR />} />
                        </Routes>
                    </Router>
            </DeviceFrameset>
        </div>
    );
}

export default User;
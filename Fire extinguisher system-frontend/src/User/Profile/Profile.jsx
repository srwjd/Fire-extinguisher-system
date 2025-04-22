/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import './Profile.css'
import Bar from '../Layouts/Bar/Bar';


function Profile() {
    const [isEditName, setIsEditName] = useState(false);
    const userID = localStorage.getItem('userID');
    const [profileInfo, setProfileInfo] = useState([])
    const [newFirstName, setNewFirstName] = useState('');
    const [newSurName, setNewSurName] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        freshProfileInfo()
    }, [])

    const freshProfileInfo = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/fire/getUserById/${userID}`)
            setProfileInfo(res.data.result[0])
        } catch {
            console.error();
        }
    }

    const editProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('firstname', newFirstName || profileInfo.firstname);
            formData.append('surname', newSurName || profileInfo.surname);
            

            if (fileInputRef.current.files[0]) {
                formData.append('image', fileInputRef.current.files[0]);
            } else {
               formData.append('image', profileInfo.profile_img); // ถ้า backend รองรับส่ง path เดิม
            }

            await axios.put(
                `http://localhost:3000/fire/updatenameandimage/${userID}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    
                }
            );

            setIsEditName(false);
            freshProfileInfo();
        } catch (err) {
            console.error(err);
        }
    };


    const handleImageClick = () => {
        fileInputRef.current.click(); // สั่งให้ input ถูกคลิกเมื่อ span ถูกคลิก
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className='profileContainer'>
            <div className='profileContent'>
                <div className='profileTitle'>
                    <h1>Profile</h1>
                </div>
                <div className='profileImageContainer'>
                    {profileInfo.profile_img ? (
                        <img src={`http://localhost:3000/fire/uploads/${profileInfo.profile_img}`}
                            alt="Fire Extinguisher"
                            className='profileImage'
                        />
                    ) : (
                        <div className='profileImage'>
                            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                        </div>
                    )}

                    <div className='profileEditImage' onClick={handleImageClick}>
                        <span>แก้ไขรูปโปรไฟล์</span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={editProfile}
                        />
                    </div>
                </div>
                <div className='profileInfo'>
                    <div className='profileUsername'>{profileInfo.username}</div>
                    <div className='profileNameContainer'>
                        <div className='profileName'>
                            <div>{profileInfo.firstname}&nbsp;{profileInfo.surname}</div>
                        </div>
                        <div
                            className='iconEditName'
                            onClick={() => {
                                setIsEditName(true);
                                setNewFirstName(profileInfo.firstname || '');
                                setNewSurName(profileInfo.surname || '');
                            }}

                        >
                            <span className="fi fi-rr-pencil"></span>
                        </div>
                    </div>
                    <div className='profileEmail'>{profileInfo.email}</div>
                </div>
                <div className='profileLogout'>
                    <button
                        className='logoutButton'
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {isEditName && (
                <div className='formEditName'>
                    <span className="fi fi-rr-cross closeButton" onClick={() => setIsEditName(false)}></span>
                    <input
                        className='inputEditName'
                        type="text"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                    />
                    <input
                        className='inputEditName'
                        type="text"
                        value={newSurName}
                        onChange={(e) => setNewSurName(e.target.value)}
                    />
                    <div className='saveButton' onClick={editProfile}>Save</div>
                </div>
            )}

            <div className='barProfile'>
                <Bar />
            </div>
        </div>
    );
}

export default Profile;
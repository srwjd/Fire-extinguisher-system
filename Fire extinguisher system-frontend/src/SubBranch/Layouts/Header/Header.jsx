/* eslint-disable react-hooks/exhaustive-deps */
import "./Header.css";
// import { FaRegCircleUser } from "react-icons/fa6";
import axios from "axios";
import { TbLogout2 } from "react-icons/tb";
import { useState, useEffect } from "react";

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [profileInfo, setProfileInfo] = useState([])

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/"; // กลับไปหน้า login
  };

  const role = localStorage.getItem("role") || "";
  const userID = localStorage.getItem("userID") || "";

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

  return (
    <div className="headerContainer">
      <div className="logo">
        <div className="logoSubBranch"></div>
      </div>
      <div
        className="title"
        onClick={() => setShowMenu(!showMenu)}
        style={{ position: "relative", cursor: "pointer" }}
      >
        {/* <FaRegCircleUser size={50} /> */}
        <div>
          {`${profileInfo.firstname} ${profileInfo.surname} ${role === "SubBranch" ? "(Sub Branch)" : ""}`}
        </div>
        {showMenu && (
          <div className="dropdownMenu">
            <div className="dropdownItem" onClick={handleLogout}>
              <TbLogout2 /> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;

import './Login.css'
import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const navigate = useNavigate();


    const loginClick = async () => {
        try {
            const res = await axios.post('http://localhost:3000/fire/login', {
                username,
                password
            });
            console.log("Login response:", res.data);
            const token = res.data.token;
            const role = res.data.role;
            const companyId = res.data.companyId;
            const userID = res.data.userID;

            localStorage.setItem('userID', userID);
            localStorage.setItem('role', role);
            localStorage.setItem('token', token);
            localStorage.setItem('companyId', companyId)
            localStorage.setItem('branchId', res.data.branchId)
            localStorage.setItem('userID', userID)
            
            

            alert("Login successful!");
            window.location.reload();  // รีเฟรชหน้า
        } catch (err) {
            alert("Login failed! Please check your username and password.");
            console.error("Login error:", err);
        }
    }

    return (
        <div>
            <div className='loginForm'>
                <h1>Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={loginClick}>
                    Submit
                </button>
            </div>
        </div>
    );
}

export default Login;

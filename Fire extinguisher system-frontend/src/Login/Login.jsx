import './Login.css'
import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginFailed, setLoginFailed] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);


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
            const firstname = res.data.firstname;
            const surname = res.data.surname;

            localStorage.setItem('userID', userID);
            localStorage.setItem('role', role);
            localStorage.setItem('token', token);
            localStorage.setItem('companyId', companyId)
            localStorage.setItem('branchId', res.data.branchId)
            localStorage.setItem('userID', userID)
            localStorage.setItem('firstname', firstname)
            localStorage.setItem('surname', surname)



            setLoginSuccess(true);
            setTimeout(() => {
                setLoginSuccess(false);
                window.location.reload();  // รีเฟรชหน้า
            }, 1000);
        } catch (err) {
            setLoginFailed(true);
            setTimeout(() => {
                setLoginFailed(false);
                setUsername('');
                setPassword('');
            }, 1000);
            console.error("Login error:", err);
        }
    }

    return (
        <div className='loginContainer'>
            <div className='bgImage'>
                <img src="/bg.jpg" alt="" />
            </div>
            <div className='loginForm'>
                <div className='titleLogin'>Welcome to Firecheck</div>
                <input
                    className='inputLogin'
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className='inputLogin'
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={loginClick}>
                    Login
                </button>
            </div>

            {loginFailed && (
                <div className="loginFailedAlert">
                    Login failed! Please check your username and password.
                </div>
            )}
            {loginSuccess && (
                <div className="loginSuccessAlert">
                    Login successful!
                </div>
            )}
        </div>
    );
}

export default Login;

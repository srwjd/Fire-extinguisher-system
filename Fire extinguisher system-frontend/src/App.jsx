import './App.css'

// import { useEffect } from 'react'

import Login from './Login/Login'
import SuperAdmin from './SuperAdmin/SuperAdmin'
import Admin from './Admin/Admin'
import User from './User/User'

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');


  if (token === null) {
    return (
      <div>
        <Login
        />
      </div>
    )
  } else {
    return (
      <div>
        {role === 'SuperAdmin' && <SuperAdmin />}
        {role === 'Admin' && <Admin />}
        {role === 'User' && <User />}
      </div>
    )
  }
}

export default App
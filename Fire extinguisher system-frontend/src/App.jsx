import './App.css'

// import { useEffect } from 'react'

import Login from './Login/Login'
import SuperAdmin from './SuperAdmin/SuperAdmin'
import Admin from './Admin/Admin'
import User from './User/User'
import MainBranch from './MainBranch/MainBranch'
import SubBranch from './SubBranch/SubBranch'

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
        {role === 'MainBranch' && <MainBranch />}
        {role === 'SubBranch' && <SubBranch />}
      </div>
    )
  }
}

export default App
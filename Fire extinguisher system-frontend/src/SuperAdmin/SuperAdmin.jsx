import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MyLayout from "./Layouts/Layout";
import Dashboard from "./Dashboard/Dashboard";
import ManageUser from "./ManageUser/ManageUser";
import ManageUnit from "./ManageUnit/ManageUnit";

function SuperAdmin() {
    return (
        <div className='superadminContainer'>
            <Router>
                <MyLayout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/manageuser" element={<ManageUser />} />
                        <Route path="/manageunit" element={<ManageUnit />} />
                    </Routes>
                </MyLayout>
            </Router>
        </div>
    );
}

export default SuperAdmin;
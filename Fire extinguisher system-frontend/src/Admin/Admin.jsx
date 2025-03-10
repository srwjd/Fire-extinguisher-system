import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MyLayout from "./Layouts/Layout";
import Inspection from "./Inspection/Inspection";
import Checkwork from "./Checkwork/Checkwork";
import Report from "./Report/Report";
import AssignHistory from "./AssignHistory/AssignHistory";

function Admin() {
    return (
        <div className='adminContainer'>
            <Router>
                <MyLayout>
                    <Routes>
                        <Route path="/" element={<Inspection />} />
                        <Route path="/inspection" element={<Inspection />} />
                        <Route path="/checkwork" element={<Checkwork />} />
                        <Route path="/report" element={<Report />} />
                        <Route path="/assignhistory" element={<AssignHistory />} />
                    </Routes>
                </MyLayout>
            </Router>
        </div>
    );
}

export default Admin;
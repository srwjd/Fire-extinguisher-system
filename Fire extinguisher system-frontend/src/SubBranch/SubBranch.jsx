import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MyLayout from "./Layouts/Layout";
import Home from "./Home/Home";
import Report from "./Report/Report";

function SubBranch() {
    return (
        <div className='subbranchContainer'>
            <Router>
                <MyLayout>
                    <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/home" element={<Home />} />
                          <Route path="/report" element={<Report />} />
                    </Routes>
                </MyLayout>
            </Router>
        </div>
    );
}

export default SubBranch;
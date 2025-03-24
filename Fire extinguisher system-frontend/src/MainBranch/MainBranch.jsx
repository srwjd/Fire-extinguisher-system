import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MyLayout from "./Layouts/Layout";
import Home from "./Home/Home";
import Report from "./Report/Report";
import ReportDetail from "./ReportDetail/ReportDetail";
import Test from "./Test/Test";

function MainBranch() {
    return (
        <div className='mainbranchContainer'>
            <Router>
                <MyLayout>
                    <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/home" element={<Home />} />
                          <Route path="/report" element={<Report />} />
                          <Route path="/report/:fireId" element={<ReportDetail />} />
                          <Route path="/test" element={<Test />} />
                    </Routes>
                </MyLayout>
            </Router>
        </div>
    );
}

export default MainBranch;
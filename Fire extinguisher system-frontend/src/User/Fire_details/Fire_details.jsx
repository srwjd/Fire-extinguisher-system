import './Fire_details.css'

import { useParams } from 'react-router';

function Fire_details() {
    const { serialNumber } = useParams();
    return (
        <div className='fire_detailsContainer'>
            <div className='fireReportContainer'>
                <div className='fireReportImgContainer'>
                    <div className='fireReportImg'></div>
                    <div className='fireReportImg'></div>
                    <div className='fireReportImg'></div>
                </div>
            </div>
        </div>
    );
}

export default Fire_details;
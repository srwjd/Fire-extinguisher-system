import './Home.css';
import Bar from '../Layouts/Bar/Bar';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CiSearch } from 'react-icons/ci';
import { IoIosArrowDropright, IoIosArrowDropleft } from "react-icons/io";

function Home() {
    const [fireList, setFireList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const itemsPerPage = 4;
    const userID = localStorage.getItem('userID');

    useEffect(() => {
        fetchFireList();
    }, []);

    const fetchFireList = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/fire/getreports/${userID}`);
            setFireList(response.data.result);
        } catch (error) {
            setError(error.message);
        }
    };

    // กรองรายการตาม searchTerm
    // กรองรายการตาม searchTerm
    const filteredList = fireList.filter((fire) => {
        // ตรวจสอบว่าแต่ละฟิลด์มีค่าหรือไม่ก่อนที่จะใช้ .toLowerCase()
        const serialNumber = fire.serial_number ? fire.serial_number.toLowerCase() : '';
        const company = fire.company ? fire.company.toLowerCase() : '';
        const branch = fire.branch ? fire.branch.toLowerCase() : '';
        const description = fire.description ? fire.description.toLowerCase() : '';

        return (
            serialNumber.includes(searchTerm.toLowerCase()) ||
            company.includes(searchTerm.toLowerCase()) ||
            branch.includes(searchTerm.toLowerCase()) ||
            description.includes(searchTerm.toLowerCase())
        );
    });


    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    if (error) return <p>❌ {error}</p>;

    return (
        <div className='homeContainer'>
            <div className='homeContent'>
                <div className='homeHeader'>
                    <div className='jacklogo'></div>
                    <div className='search'>
                        <CiSearch size={25} />
                        <input
                            type="text"
                            placeholder="ค้นหา"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // รีเซ็ตหน้าเมื่อมีการค้นหาใหม่
                            }}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="clear-search">
                                ล้าง
                            </button>
                        )}
                    </div>
                </div>

                <div className='cardContainer'>
                    {currentItems.length > 0 ? (
                        currentItems.map((fire) => (
                            <Link
                                to={`/fire-details/${fire.serial_number}`}
                                key={Math.random()}
                                className="fire-card-link"
                            >
                                <div className='card'>
                                    <span>S/N : {fire.fire_id || 'ไม่พบข้อมูล'}</span>
                                    <span>หมายเหตุ : {fire.description || 'ไม่พบข้อมูล'}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>ไม่พบข้อมูลที่ค้นหา</p>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className='pagination'>
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <IoIosArrowDropleft size={25} />
                        </button>
                        <span>{currentPage} / {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <IoIosArrowDropright size={25} />
                        </button>
                    </div>
                )}
            </div>

            <div className='barHome'>
                <Bar />
            </div>
        </div>
    );
}

export default Home;

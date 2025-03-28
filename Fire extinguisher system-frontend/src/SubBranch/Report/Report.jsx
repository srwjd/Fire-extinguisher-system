

function Report() {
    return ( 
        <div className="reportContainer">
            <div className="reportTable">
                <table className="tableContainer">
                    <thead>
                        <tr>
                            <th>S/N</th>
                            <th>MFD</th>
                            <th>EXP</th>
                            <th>Last Check</th>
                            <th>Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>NFPA 10-0001</td>
                            <td>01/01/2023</td>
                            <td>01/01/2023</td>
                            <td>01/01/2023</td>
                            <td>Report</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
     );
}

export default Report;
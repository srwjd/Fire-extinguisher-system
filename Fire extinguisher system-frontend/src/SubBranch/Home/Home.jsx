import * as React from 'react';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import './Home.css';

const StyledTableContainer = styled(TableContainer)``;
const StyledTableHead = styled(TableHead)``;
const StyledTableCell = styled(TableCell)``;

function createData(bank, fireExtinguishers, location) {
  return { bank, fireExtinguishers, location };
}

const rows = [
  createData('Ratchayothin', 3, 'ประตูด้านหน้า, ประตูด้านหลัง, ข้างตู้ ATM'),
];

export default function DenseTable() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="container">
      <h2 className="heading">Sub-branch</h2>

      <StyledTableContainer component={Paper} className="styled-table-container">
        <Table className="styled-table" size="small" aria-label="a dense table">
          <StyledTableHead className="styled-table-head">
            <TableRow>
              <TableCell className="styled-table-head">Banks</TableCell>
              <TableCell className="styled-table-head" align="center">
                Fire extinguisher
              </TableCell>
              <TableCell className="styled-table-head" align="center">
                Location
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody className="styled-table-body">
            {rows.map((row) => (
              <TableRow key={row.bank}>
                <TableCell className="styled-table-cell">{row.bank}</TableCell>
                <TableCell className="styled-table-cell" align="center">
                  <strong>{row.fireExtinguishers}</strong>
                </TableCell>
                <TableCell className="styled-table-cell" align="center">
                  {row.location}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <div className="pagination">
        <Button variant="text" onClick={() => setPage(page - 1)} disabled={page === 1}>
          &lt;
        </Button>
        <span>{page} out of {totalPages}</span>
        <Button variant="text" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          &gt;
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Modal, Box, TextareaAutosize } from '@mui/material';
import './Report.css';

const rows = [
  { serial: 'NFPA 10-0003', date: '09/03/2568', location: 'Ratchayothin - ประตูด้านหน้า' },
];

export default function ReportTable() {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-5">
      <TableContainer component={Paper} className="styled-table-container">
        <Table>
          <TableHead className="styled-table-head">
            <TableRow>
              <TableCell>S/N</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.serial} onClick={handleOpen} style={{ cursor: 'pointer' }}>
                <TableCell style={{ color: 'blue', textDecoration: 'underline' }}>{row.serial}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box className="modal-box">
          <h3 style={{ color: '#D2691E' }}>NFPA 10-0003</h3>
          <p>Date: 09/03/2568</p>
          <p>Location: Ratchayothin - ประตูด้านหน้า</p>

          <div className="upload-box">
            {selectedImage ? (
              <img src={selectedImage} alt="Uploaded" style={{ maxWidth: '100%', height: '200px', borderRadius: '10px' }} />
            ) : (
              <>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="fileUpload" />
                <label htmlFor="fileUpload" style={{ cursor: 'pointer', color: '#D2691E' }}>📤 อัปโหลดรูปภาพ</label>
              </>
            )}
          </div>

          <div>
            {[
              'สภาพของถังไม่เสียหาย',
              'ความดันของถังอยู่ในระดับที่เหมาะสม',
              'หัวฉีดและวาล์วไม่อุดตัน',
              'สลักนิรภัยและซีลป้องกันไม่ถูกดึงออก',
              'ตำแหน่งการติดตั้งเหมาะสม'
            ].map((label) => (
              <div key={label} className="checkbox-container">
                <p>{label}:</p>
                <label style={{ marginRight: '10px' }}><input type="checkbox" /> ผ่าน</label>
                <label><input type="checkbox" /> ไม่ผ่าน</label>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '14px', marginTop: '10px' }}>หมายเหตุ:</p>
          <TextareaAutosize minRows={3} className="textarea" />

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button variant="contained" className="report-button" onClick={handleClose}>
              Report
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Alert, Button, CircularProgress } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { attendanceService } from '../../services/attendanceService';

const StudentScanAttendance = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [loading, setLoading] = useState(false);
  const html5QrCodeRef = useRef(null);

  const onScanSuccess = async (decodedText) => {
    // Stop scanner after successful scan to prevent multiple scans
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch((err) => console.error("Failed to stop scanner", err));
    }
    
    setLoading(true);
    setScanError(null);
    setScanResult(null);

    try {
      // Send the scanned token to backend
      const response = await attendanceService.markAttendance(decodedText);
      setScanResult({ type: 'success', message: response.message });
    } catch (err) {
      // Backend returns specific error messages (e.g., Expired, Already Marked, Wrong Class)
      const errorMsg = err.response?.data?.detail || 'Failed to mark attendance. Please try again.';
      setScanResult({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error) => {
    // Ignore continuous scan failures while searching for QR
  };

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    // Start scanning using the back camera ("environment")
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    ).catch((err) => {
      console.error("Unable to start scanning", err);
      setScanError("Unable to access camera. Please check permissions and try again.");
    });

    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch((err) => console.error(err));
      }
    };
  }, []);

  const handleReset = () => {
    setScanResult(null);
    setScanError(null);
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      ).catch((err) => console.error(err));
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
        Scan Attendance QR
      </Typography>
      
      {scanResult && (
        <Alert 
          severity={scanResult.type} 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleReset}>
              Scan Again
            </Button>
          }
        >
          {scanResult.message}
        </Alert>
      )}

      {scanError && <Alert severity="error" sx={{ mb: 2 }}>{scanError}</Alert>}

      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, overflow: 'hidden', bgcolor: '#000' }}>
        {/* Container for the QR Scanner */}
        <div id="qr-reader" style={{ width: '100%' }}></div>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, color: 'white' }}>
            <CircularProgress color="inherit" />
            <Typography sx={{ ml: 2 }}>Processing...</Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 3, textAlign: 'center' }}>
        Point your camera at the QR code displayed by your teacher.
      </Typography>
    </Box>
  );
};

export default StudentScanAttendance;
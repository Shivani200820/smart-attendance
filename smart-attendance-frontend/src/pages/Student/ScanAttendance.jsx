import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import { CheckCircle, XCircle, QrCode } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { markAttendance } from '../../services/attendanceApi';

const ScanAttendance = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null); // 'success', 'error', or null
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize scanner only if no result yet
    if (!scanResult) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false // verbose
      );

      scanner.render(
        async (decodedText) => {
          scanner.clear(); // Stop scanning after successful read
          setLoading(true);
          try {
            // The decoded text IS the session_token (or contains it)
            // Assuming the QR code directly contains the session_token string
            const response = await markAttendance(decodedText);
            setScanResult('success');
            setMessage(response.message || 'Attendance marked successfully!');
          } catch (err) {
            setScanResult('error');
            setMessage(err.response?.data?.detail || 'Failed to mark attendance. QR may be expired or invalid.');
          } finally {
            setLoading(false);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (e.g., no QR in frame), they happen frequently
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scanResult]);

  return (
    <DashboardLayout title="Mark Attendance">
      <Box sx={{ maxWidth: '500px', mx: 'auto', mt: 4 }}>
        {!scanResult && !loading && (
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <QrCode size={48} color="#2563EB" style={{ marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Scan Classroom QR Code</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Align the QR code within the frame. The camera will scan it automatically.
              </Typography>
              <Box id="qr-reader" sx={{ width: '100%', maxWidth: '300px', mx: 'auto', borderRadius: 2, overflow: 'hidden' }} />
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card sx={{ textAlign: 'center', p: 6 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">Verifying Attendance...</Typography>
          </Card>
        )}

        {scanResult === 'success' && (
          <Card sx={{ textAlign: 'center', p: 4, borderColor: 'success.main', borderWidth: 2, borderStyle: 'solid' }}>
            <CheckCircle size={64} color="#16A34A" style={{ marginBottom: '16px' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>Success!</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>{message}</Typography>
            <Button variant="contained" onClick={() => navigate('/student/dashboard')} sx={{ px: 4 }}>
              Back to Dashboard
            </Button>
          </Card>
        )}

        {scanResult === 'error' && (
          <Card sx={{ textAlign: 'center', p: 4, borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
            <XCircle size={64} color="#DC2626" style={{ marginBottom: '16px' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>Failed</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>{message}</Typography>
            <Button variant="outlined" onClick={() => { setScanResult(null); setMessage(''); }} sx={{ px: 4 }}>
              Try Scanning Again
            </Button>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default ScanAttendance;
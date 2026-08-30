import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main`, opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
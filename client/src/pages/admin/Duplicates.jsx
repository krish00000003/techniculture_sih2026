import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Avatar, Skeleton,
  Snackbar, Alert, LinearProgress, Divider,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MergeIcon from '@mui/icons-material/MergeType';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import adminApi from '../../api/admin';

function MatchBar({ score }) {
  const color = score >= 85 ? '#C62828' : score >= 70 ? '#E65100' : '#F9A825';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          bgcolor: 'rgba(31,45,46,0.08)',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
      <Typography variant="body2" sx={{ fontWeight: 700, color, minWidth: 40 }}>
        {score}%
      </Typography>
    </Box>
  );
}

function ProfileCard({ trainee }) {
  const user = trainee?.userId || {};
  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user.name || 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.phone || user.email || '—'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body2">
          <strong>Outcome ID:</strong> {trainee?.outcomeId || '—'}
        </Typography>
        <Typography variant="body2">
          <strong>DOB:</strong> {trainee?.dob ? new Date(trainee.dob).toLocaleDateString('en-IN') : '—'}
        </Typography>
        <Typography variant="body2">
          <strong>Gender:</strong> {trainee?.gender || '—'}
        </Typography>
        <Typography variant="body2">
          <strong>District:</strong> {trainee?.district || '—'}
        </Typography>
        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <strong>Status:</strong>{' '}
          <Chip
            label={trainee?.employmentStatus || 'unknown'}
            size="small"
            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
          />
        </Typography>
      </Box>
    </Box>
  );
}

export default function Duplicates() {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getDuplicates();
      setDuplicates(data.duplicates);
    } catch {
      setSnack({ open: true, message: 'Failed to load duplicates', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleMerge = async (id) => {
    try {
      await adminApi.mergeDuplicate(id);
      setSnack({ open: true, message: 'Profiles merged', severity: 'success' });
      setDuplicates((prev) => prev.filter((d) => d._id !== id));
    } catch {
      setSnack({ open: true, message: 'Merge failed', severity: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectDuplicate(id);
      setSnack({ open: true, message: 'Marked as not same person', severity: 'info' });
      setDuplicates((prev) => prev.filter((d) => d._id !== id));
    } catch {
      setSnack({ open: true, message: 'Action failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CompareArrowsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Duplicate Review
        </Typography>
        {!loading && (
          <Chip label={`${duplicates.length} pending`} size="small" sx={{ ml: 1, fontWeight: 600 }} />
        )}
      </Box>

      {loading ? (
        [...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
        ))
      ) : duplicates.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CompareArrowsIcon sx={{ fontSize: 56, color: 'primary.light', mb: 2 }} />
          <Typography variant="h6">No pending duplicates</Typography>
          <Typography variant="body2" color="text.secondary">
            All potential duplicates have been reviewed.
          </Typography>
        </Card>
      ) : (
        duplicates.map((dup) => (
          <Card
            key={dup._id}
            sx={{
              mb: 3,
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(31,45,46,0.12)' },
            }}
          >
            <CardContent>
              {/* Match score bar */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Match Confidence
                </Typography>
                <MatchBar score={dup.matchScore} />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Side-by-side profiles */}
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(dup.linkedTraineeIds || []).map((trainee, idx) => (
                  <Box key={trainee._id || idx} sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                      Profile {idx + 1}
                    </Typography>
                    <ProfileCard trainee={trainee} />
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<MergeIcon />}
                  onClick={() => handleMerge(dup._id)}
                  sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                >
                  Merge
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BlockIcon />}
                  onClick={() => handleReject(dup._id)}
                  color="error"
                >
                  Not Same Person
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

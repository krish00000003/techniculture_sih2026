import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, Select, FormControl,
  InputLabel, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper, Chip, Skeleton, Snackbar, Alert,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import adminApi from '../../api/admin';

export default function Rankings() {
  const [data, setData] = useState({ rankings: [], districts: [], periods: [] });
  const [district, setDistrict] = useState('');
  const [period, setPeriod] = useState('');
  const [orderBy, setOrderBy] = useState('adjustedScore');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchData();
  }, [district, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await adminApi.getRankings({ district, period, sort: orderBy, order });
      setData(res);
    } catch {
      setSnack({ open: true, message: 'Failed to load rankings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (col) => {
    const isAsc = orderBy === col && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(col);
  };

  const sorted = useMemo(() => {
    return [...data.rankings].sort((a, b) => {
      const v = order === 'asc' ? 1 : -1;
      return (a[orderBy] - b[orderBy]) * v;
    });
  }, [data.rankings, orderBy, order]);

  const exportCSV = () => {
    const headers = ['Rank', 'Provider', 'District', 'Adjusted Score', 'Raw Score', 'Retention %', 'Wage Growth %'];
    const rows = sorted.map((r, i) => [
      i + 1, r.providerName, r.district, r.adjustedScore, r.rawScore, r.retentionPct, r.wageGrowthPct,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provider-rankings-${period || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { id: 'rank', label: '#', sortable: false },
    { id: 'providerName', label: 'Provider', sortable: false },
    { id: 'district', label: 'District', sortable: false },
    { id: 'adjustedScore', label: 'Adjusted Score', sortable: true },
    { id: 'rawScore', label: 'Raw Score', sortable: true },
    { id: 'retentionPct', label: 'Retention %', sortable: true },
    { id: 'wageGrowthPct', label: 'Wage Growth %', sortable: true },
    { id: 'cohortDifficulty', label: 'Cohort Diff.', sortable: true },
    { id: 'districtEconomyIndex', label: 'Economy Idx', sortable: true },
  ];

  const medalColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'transparent';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: 32, color: '#FFD700' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Provider Rankings
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCSV} disabled={!sorted.length}>
          Export CSV
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>District</InputLabel>
            <Select value={district} label="District" onChange={(e) => setDistrict(e.target.value)}>
              <MenuItem value="">All Districts</MenuItem>
              {data.districts.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="">All Periods</MenuItem>
              {data.periods.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.id === 'providerName' || col.id === 'district' ? 'left' : 'center'}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                      sx={{ '&.Mui-active': { color: 'inherit' }, '& .MuiTableSortLabel-icon': { color: 'inherit !important' } }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.id}><Skeleton variant="text" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No ranking data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r, idx) => (
                <TableRow
                  key={r._id}
                  hover
                  sx={{
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'secondary.light' },
                  }}
                >
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {idx < 3 && (
                        <EmojiEventsIcon sx={{ fontSize: 18, color: medalColor(idx + 1) }} />
                      )}
                      <Typography fontWeight={idx < 3 ? 700 : 400}>{idx + 1}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{r.providerName}</Typography>
                  </TableCell>
                  <TableCell>{r.district}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={r.adjustedScore}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: r.adjustedScore >= 80 ? '#C8E6C9' : r.adjustedScore >= 60 ? '#FFF9C4' : '#FFCDD2',
                        color: '#1F2D2E',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">{r.rawScore}</TableCell>
                  <TableCell align="center">{r.retentionPct}%</TableCell>
                  <TableCell align="center">{r.wageGrowthPct}%</TableCell>
                  <TableCell align="center">{r.cohortDifficulty}</TableCell>
                  <TableCell align="center">{r.districtEconomyIndex}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ open: false, message: '' })}>
        <Alert severity="error">{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Skeleton,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import adminApi from '../../api/admin';

export default function SkillGaps() {
  const [data, setData] = useState({ gaps: [], sectors: [], districts: [] });
  const [sector, setSector] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [sector, district]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await adminApi.getSkillGaps({ sector, district });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data.gaps.slice(0, 12).map((g) => ({
    skill: g.skill.length > 16 ? g.skill.slice(0, 14) + '…' : g.skill,
    fullSkill: g.skill,
    Taught: g.taught,
    Demanded: g.demanded,
  }));

  const statusColor = (status) => {
    if (status === 'deficit') return { bg: '#FFCDD2', color: '#C62828' };
    if (status === 'surplus') return { bg: '#C8E6C9', color: '#2E7D32' };
    return { bg: '#E0E0E0', color: '#424242' };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Skill Gap Analysis
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sector</InputLabel>
            <Select value={sector} label="Sector" onChange={(e) => setSector(e.target.value)}>
              <MenuItem value="">All Sectors</MenuItem>
              {data.sectors.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>District</InputLabel>
            <Select value={district} label="District" onChange={(e) => setDistrict(e.target.value)}>
              <MenuItem value="">All Districts</MenuItem>
              {data.districts.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Bar Chart */}
      <Card sx={{ mb: 3, p: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Skills Taught vs. Demanded
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
          ) : chartData.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              No skill data available
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,45,46,0.1)" />
                <XAxis
                  dataKey="skill"
                  angle={-35}
                  textAnchor="end"
                  tick={{ fontSize: 12, fill: '#1F2D2E' }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: '#1F2D2E' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #A6E3E9' }}
                  formatter={(val, name) => [val, name]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullSkill || ''}
                />
                <Legend wrapperStyle={{ paddingTop: 12 }} />
                <Bar dataKey="Taught" fill="#71C9CE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Demanded" fill="#1F2D2E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gap Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
              <TableCell>Skill</TableCell>
              <TableCell align="center">Taught</TableCell>
              <TableCell align="center">Demanded</TableCell>
              <TableCell align="center">Gap</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((__, j) => (
                    <TableCell key={j}><Skeleton variant="text" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.gaps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No gap data</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.gaps.map((g) => {
                const sc = statusColor(g.status);
                return (
                  <TableRow key={g.skill} hover sx={{ '&:hover': { bgcolor: 'secondary.light' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{g.skill}</TableCell>
                    <TableCell align="center">{g.taught}</TableCell>
                    <TableCell align="center">{g.demanded}</TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600} color={g.gap > 0 ? 'error.main' : g.gap < 0 ? 'success.main' : 'text.secondary'}>
                        {g.gap > 0 ? `+${g.gap}` : g.gap}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={g.status} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, textTransform: 'capitalize' }} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

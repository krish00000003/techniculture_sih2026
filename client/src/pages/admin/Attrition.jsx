import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, Select, FormControl,
  InputLabel, Skeleton, Grid, Chip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import adminApi from '../../api/admin';

const COLORS = ['#C62828', '#E65100', '#F9A825', '#2E7D32', '#1565C0', '#6A1B9A', '#00838F', '#4E342E', '#37474F', '#AD1457'];

function StatCard({ title, value, sub, loading }) {
  return (
    <Card sx={{ flex: 1, minWidth: 150 }}>
      <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Attrition() {
  const [data, setData] = useState({
    reasons: [], totalDropped: 0, totalEnrolled: 0, dropoutRate: 0, providers: [], courses: [],
  });
  const [provider, setProvider] = useState('');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [provider, course, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await adminApi.getAttrition({
        provider: provider || undefined,
        course: course || undefined,
        period: period || undefined,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = data.reasons.map((r) => ({ name: r.reason, value: r.count }));
  const barData = data.reasons.slice(0, 10);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <TrendingDownIcon sx={{ fontSize: 32, color: '#C62828' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Attrition & Non-Placement
        </Typography>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard title="Total Dropouts" value={data.totalDropped} loading={loading} />
        <StatCard title="Total Enrolled" value={data.totalEnrolled} loading={loading} />
        <StatCard title="Dropout Rate" value={`${data.dropoutRate}%`} loading={loading} />
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Provider</InputLabel>
            <Select value={provider} label="Provider" onChange={(e) => setProvider(e.target.value)}>
              <MenuItem value="">All Providers</MenuItem>
              {data.providers.map((p) => (
                <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Course</InputLabel>
            <Select value={course} label="Course" onChange={(e) => setCourse(e.target.value)}>
              <MenuItem value="">All Courses</MenuItem>
              {data.courses.map((c) => (
                <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="">All Time</MenuItem>
              <MenuItem value="3">Last 3 months</MenuItem>
              <MenuItem value="6">Last 6 months</MenuItem>
              <MenuItem value="12">Last 12 months</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Pie Chart */}
        <Card sx={{ flex: 1, minWidth: 320, p: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Dropout Reasons</Typography>
            {loading ? (
              <Skeleton variant="circular" width={260} height={260} sx={{ mx: 'auto' }} />
            ) : pieData.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>No dropout data</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name.slice(0, 18)}${name.length > 18 ? '…' : ''} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card sx={{ flex: 1, minWidth: 320, p: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Top Reasons (Count)</Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ) : barData.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>No data</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,45,46,0.1)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="reason"
                    tick={{ fontSize: 11 }}
                    width={110}
                    tickFormatter={(v) => v.length > 20 ? v.slice(0, 18) + '…' : v}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#71C9CE" radius={[0, 4, 4, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

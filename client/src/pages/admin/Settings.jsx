import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid,
  Divider, Skeleton, Snackbar, Alert,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import adminApi from '../../api/admin';

function SettingsSection({ title, icon, children }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
        <Divider sx={{ mb: 2.5 }} />
        {children}
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getSettings();
      setSettings(data.settings);
    } catch {
      setSnack({ open: true, message: 'Failed to load settings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: isNaN(value) ? value : Number(value),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { escalation, rewards, velocityCaps, alertThresholds } = settings;
      await adminApi.updateSettings({ escalation, rewards, velocityCaps, alertThresholds });
      setSnack({ open: true, message: 'Settings saved successfully', severity: 'success' });
    } catch {
      setSnack({ open: true, message: 'Failed to save settings', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Settings</Typography>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={180} sx={{ borderRadius: 2, mb: 3 }} />
        ))}
      </Box>
    );
  }

  const esc = settings?.escalation || {};
  const rew = settings?.rewards || {};
  const vel = settings?.velocityCaps || {};
  const alt = settings?.alertThresholds || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Settings</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ minWidth: 140 }}
        >
          {saving ? 'Saving…' : 'Save All'}
        </Button>
      </Box>

      {/* Escalation Timing */}
      <SettingsSection title="Escalation Timing" icon={<Typography>⏱️</Typography>}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Survey Window (days)"
            type="number"
            value={esc.surveyWindowDays ?? ''}
            onChange={(e) => handleChange('escalation', 'surveyWindowDays', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="WhatsApp Delay (hrs)"
            type="number"
            value={esc.whatsappDelayHours ?? ''}
            onChange={(e) => handleChange('escalation', 'whatsappDelayHours', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="IVR Delay (hrs)"
            type="number"
            value={esc.ivrDelayHours ?? ''}
            onChange={(e) => handleChange('escalation', 'ivrDelayHours', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Backup Contact Delay (hrs)"
            type="number"
            value={esc.backupContactDelayHours ?? ''}
            onChange={(e) => handleChange('escalation', 'backupContactDelayHours', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Coordinator Delay (hrs)"
            type="number"
            value={esc.coordinatorDelayHours ?? ''}
            onChange={(e) => handleChange('escalation', 'coordinatorDelayHours', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
        </Box>
      </SettingsSection>

      {/* Reward Configuration */}
      <SettingsSection title="Reward Configuration" icon={<Typography>🎁</Typography>}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Survey Completion Amount"
            type="number"
            value={rew.surveyCompletionAmount ?? ''}
            onChange={(e) => handleChange('rewards', 'surveyCompletionAmount', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Currency"
            value={rew.currency ?? ''}
            onChange={(e) => handleChange('rewards', 'currency', e.target.value)}
            size="small"
            sx={{ width: 140 }}
          />
        </Box>
      </SettingsSection>

      {/* Velocity Caps */}
      <SettingsSection title="Velocity Caps" icon={<Typography>🚦</Typography>}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Per Person / Day"
            type="number"
            value={vel.perPersonPerDay ?? ''}
            onChange={(e) => handleChange('velocityCaps', 'perPersonPerDay', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Per Person Total"
            type="number"
            value={vel.perPersonTotal ?? ''}
            onChange={(e) => handleChange('velocityCaps', 'perPersonTotal', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Daily Budget (₹)"
            type="number"
            value={vel.dailyBudget ?? ''}
            onChange={(e) => handleChange('velocityCaps', 'dailyBudget', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Monthly Budget (₹)"
            type="number"
            value={vel.monthlyBudget ?? ''}
            onChange={(e) => handleChange('velocityCaps', 'monthlyBudget', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
        </Box>
      </SettingsSection>

      {/* Alert Thresholds */}
      <SettingsSection title="Alert Thresholds" icon={<Typography>🔔</Typography>}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Dropout Rate (%)"
            type="number"
            value={alt.dropoutRatePercent ?? ''}
            onChange={(e) => handleChange('alertThresholds', 'dropoutRatePercent', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Failing Score (%)"
            type="number"
            value={alt.failingScorePercent ?? ''}
            onChange={(e) => handleChange('alertThresholds', 'failingScorePercent', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Unemployment Months"
            type="number"
            value={alt.unemploymentMonths ?? ''}
            onChange={(e) => handleChange('alertThresholds', 'unemploymentMonths', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="Low Attendance (%)"
            type="number"
            value={alt.lowAttendancePercent ?? ''}
            onChange={(e) => handleChange('alertThresholds', 'lowAttendancePercent', e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
        </Box>
      </SettingsSection>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

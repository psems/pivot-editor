import React from 'react';
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Stack, Divider, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';

const drawerWidth = 240;

export default function DashboardLayout({
  children,
  onFile,
  onDownload,
  onSave,
  onDiscard,
  dirty,
  doc
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
              position="fixed"
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Toolbar sx={{ minHeight: 64, px: 3, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 240 }}>
                  <img src="/table.svg" alt="Pivot Editor" style={{ height: 32, marginRight: 12, verticalAlign: 'middle' }} />
                  <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                    Pivot Editor
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
              </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: 8 }}>
              {children}
            </Box>
          </Box>
        );
      }

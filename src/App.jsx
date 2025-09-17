import React, { useState, useRef } from "react";
import PivotEditor from "./components/PivotEditor";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import DashboardLayout from './layout/DashboardLayout';

/**
 * App component for the Pivot Editor utility.
 * Handles file loading, saving, and top-level layout.
 *
 * @author Paul Sems
 * @see https://paulsems.com
 */


const theme = createTheme({
  palette: { primary: { main: '#0ea5a4' } },
});

export default function App() {
  // State for the loaded pivot document
  const [doc, setDoc] = useState(null);
  // State for the loaded filename (used for download naming)
  const [filename, setFilename] = useState("");

  /**
   * Handles file input change event, loads and parses the selected JSON file.
   * @param {Event} e - The file input change event
   */
  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFilename(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setDoc(JSON.parse(reader.result));
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(f);
  }

  /**
   * Downloads the current pivot document as a JSON file.
   * The filename is based on the original, with a timestamp inserted before .osheet.json.
   */
  function download() {
    const data = JSON.stringify(doc, null, 2);
    const timecode = Date.now();
    let newName = `File.${timecode}.osheet.json`;
    if (filename && filename.endsWith('.osheet.json')) {
      // Insert the timecode before .osheet.json
      newName = filename.replace(/(.*)(?=\.osheet\.json$)/, `$1.${timecode}`);
    }
    if (window.electron) {
      window.electron.saveFile(newName, data);
      return;
    }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = newName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Save/discard refs for top-level buttons
  const saveRef = useRef(null);
  const discardRef = useRef(null);
  const [dirty, setDirty] = useState(false);


  // Handler to be called by PivotEditor to update dirty state
  function handleDirty(isDirty) {
    setDirty(isDirty);
  }

  // Reset dirty state when doc changes (e.g., new file loaded)
  React.useEffect(() => {
    setDirty(false);
  }, [doc]);

  // Save/discard handlers for top bar
  function handleSave() {
    if (saveRef.current) saveRef.current();
  }
  function handleDiscard() {
    if (discardRef.current) discardRef.current();
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardLayout>
        <Card sx={{ maxWidth: 1200, mx: 'auto', mt: 4, boxShadow: 3 }}>
          <CardHeader
            title="Pivots"
            action={
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" color="primary" component="label">
                  Import
                  <input
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={onFile}
                  />
                </Button>
                <Button variant="outlined" color="primary" onClick={download} disabled={!doc}>
                  Export
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={!doc || !dirty}>
                  Save
                </Button>
                <Button variant="text" color="primary" onClick={handleDiscard} disabled={!doc || !dirty}>
                  Discard
                </Button>
              </Stack>
            }
            sx={{ pb: 0, pt: 2, px: 3 }}
          />
          <CardContent>
            {doc ? (
              <PivotEditor
                doc={doc}
                setDoc={setDoc}
                saveRef={saveRef}
                discardRef={discardRef}
                onDirty={handleDirty}
              />
            ) : (
              <p>Import a .osheet.json file to start.</p>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ThemeProvider>
  );
}

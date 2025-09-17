import React, { useState, useRef } from "react";
import PivotEditor from "./components/PivotEditor";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

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
      <div className="container">
        <header style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
          <img src="/table.svg" alt="App icon" width={32} height={32} style={{verticalAlign:'middle',marginRight:8}} />
          <h1 style={{display:'inline', verticalAlign:'middle',marginRight:24}}>Pivot Definitions Editor</h1>
          <input type="file" accept=".json,application/json" onChange={onFile} style={{marginRight:8}} />
          {doc && (
            <Stack direction="row" spacing={1} style={{marginLeft:'auto'}}>
              <Button variant="outlined" onClick={download}>Download</Button>
              <Button variant="contained" color="primary" onClick={handleSave} disabled={!dirty}>Save</Button>
              <Button variant="outlined" color="inherit" onClick={handleDiscard} disabled={!dirty}>Discard</Button>
            </Stack>
          )}
        </header>
        <main>
          {doc ? (
            <PivotEditor
              doc={doc}
              setDoc={setDoc}
              saveRef={saveRef}
              discardRef={discardRef}
              onDirty={handleDirty}
            />
          ) : (
            <p>Open Example.osheet.json to start.</p>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

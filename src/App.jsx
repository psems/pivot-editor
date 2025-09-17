
import React, { useState, useRef } from "react";
import PivotEditor from "./components/PivotEditor";
import ReactDOM from 'react-dom';

/**
 * App component for the Pivot Editor utility.
 * Handles file loading, saving, and top-level layout.
 *
 * @author Paul Sems
 * @see https://paulsems.com
 */


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
   * Import pivots from another osheet.json file and merge into current doc.
   * New pivot IDs will be assigned starting after the largest numeric ID
   * present in the current document to avoid collisions. Imported pivots
   * will be named "imported" as requested.
   */
  function onImportPivots(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        console.debug('Import pivots: file loaded', f.name);
        const imported = JSON.parse(reader.result);
        const importedPivots = (imported && imported.pivots) ? imported.pivots : {};
        console.debug('Import pivots: found pivots', Object.keys(importedPivots));
        const importCount = Object.keys(importedPivots).length;
        if (importCount === 0) {
          alert('No pivots found in the imported file.');
          return;
        }
        const existingPivots = (doc && doc.pivots) ? { ...doc.pivots } : {};
        console.debug('Import pivots: existing pivot keys', Object.keys(existingPivots));
        const numericIds = Object.keys(existingPivots).map(k => Number(k)).filter(n => !Number.isNaN(n));
        let maxId = numericIds.length ? Math.max(...numericIds) : 0;
        const newPivots = { ...existingPivots };
        Object.values(importedPivots).forEach((p) => {
          maxId += 1;
          const idStr = String(maxId);
          const copy = { ...p, id: idStr, name: 'imported' };
          newPivots[idStr] = copy;
        });
        console.debug('Import pivots: new pivot keys', Object.keys(newPivots));
        const newDoc = { ...(doc || {}), pivots: newPivots };
        setDoc(newDoc);
        setFilename(f.name);
        alert(`Imported ${importCount} pivots starting at ID ${String(maxId - importCount + 1)}.`);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(f);
    // clear the input so selecting the same file again will fire change
    e.target.value = null;
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
    <div className="container">
      <header style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <img src="/table.svg" alt="App icon" width={32} height={32} style={{verticalAlign:'middle',marginRight:8}} />
        <h1 style={{display:'inline', verticalAlign:'middle',marginRight:24}}>Pivot Definitions Editor</h1>
        <input type="file" accept=".json,application/json" onChange={onFile} style={{marginRight:8}} />
        {doc && <>
          <button onClick={download} style={{marginRight:8}}>Download</button>
          <input type="file" accept=".json,application/json" onChange={onImportPivots} style={{marginRight:8}} />
          <button onClick={handleSave} disabled={!dirty} style={{marginRight:8}}>Save</button>
          <button onClick={handleDiscard} disabled={!dirty}>Discard</button>
        </>}
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
  );
}

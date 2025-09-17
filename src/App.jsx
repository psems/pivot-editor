
import React, { useState } from "react";
import PivotEditor from "./components/PivotEditor";

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

  // Main UI layout
  return (
    <div className="container">
      <header>
        <img src="/table.svg" alt="App icon" width={32} height={32} style={{verticalAlign:'middle',marginRight:8}} />
        <h1 style={{display:'inline', verticalAlign:'middle'}}>Pivot Definitions Editor</h1>
        {/* File input for loading osheet.json files */}
        <input type="file" accept=".json,application/json" onChange={onFile} />
        {/* Download button appears only when a file is loaded */}
        {doc && <button onClick={download}>Download modified JSON</button>}
      </header>
      <main>
        {/* Show the editor if a file is loaded, otherwise show instructions */}
        {doc ? (
          <PivotEditor doc={doc} setDoc={setDoc} />
        ) : (
          <p>Open Example.osheet.json to start.</p>
        )}
      </main>
    </div>
  );
}

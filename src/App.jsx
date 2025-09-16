import React, { useState } from "react";
import PivotEditor from "./components/PivotEditor";

export default function App() {
  const [doc, setDoc] = useState(null);

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
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

  function download() {
    const data = JSON.stringify(doc, null, 2);
    if (window.electron) {
      window.electron.saveFile('Pipeline.osheet.modified.json', data);
      return;
    }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Pipeline.osheet.modified.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container">
      <header>
        <h1>Pivot Definitions Editor</h1>
        <input type="file" accept=".json,application/json" onChange={onFile} />
        {doc && <button onClick={download}>Download modified JSON</button>}
      </header>
      <main>
        {doc ? (
          <PivotEditor doc={doc} setDoc={setDoc} />
        ) : (
          <p>Open Example.osheet.json to start.</p>
        )}
      </main>
    </div>
  );
}

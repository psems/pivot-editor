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
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
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
      <main>{doc ? <PivotEditor doc={doc} setDoc={setDoc} /> : <p>Open Pipeline.osheet.json to start.</p>}</main>
    </div>
  );
}

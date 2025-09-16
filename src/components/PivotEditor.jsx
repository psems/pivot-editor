import React, { useState, useMemo } from "react";

export default function PivotEditor({ doc, setDoc }) {
  const pivots = doc.pivots || {};
  const keys = Object.keys(pivots);
  const [selected, setSelected] = useState(keys[0] || null);

  const pivot = useMemo(() => (selected ? JSON.parse(JSON.stringify(pivots[selected])) : null), [selected, pivots]);

  function applyUpdate(changes) {
    const newDoc = { ...doc, pivots: { ...doc.pivots } };
    newDoc.pivots[selected] = { ...newDoc.pivots[selected], ...changes };
    setDoc(newDoc);
  }

  if (!selected) {
    return <div>No pivots found.</div>;
  }

  return (
    <div className="editor">
      <aside className="sidebar">
        <h3>Pivots</h3>
        <ul>
          {keys.map((k) => (
            <li key={k}>
              <button className={k === selected ? "active" : ""} onClick={() => setSelected(k)}>
                {k} — {pivots[k].name || "unnamed"}
              </button>
            </li>
          ))}
        </ul>
        <hr />
        <button
          onClick={() => {
            const id = String(Math.max(...keys.map(Number)) + 1);
            const newPivot = { id, name: "new pivot", model: "crm.lead", measures: [], rowGroupBys: [] };
            const newDoc = { ...doc, pivots: { ...doc.pivots, [id]: newPivot } };
            setDoc(newDoc);
            setSelected(id);
          }}
        >
          Add pivot
        </button>
        <button
          onClick={() => {
            if (!confirm("Delete selected pivot?")) return;
            const newPivots = { ...doc.pivots };
            delete newPivots[selected];
            const newDoc = { ...doc, pivots: newPivots };
            setDoc(newDoc);
            const remaining = Object.keys(newPivots);
            setSelected(remaining[0] || null);
          }}
        >
          Delete pivot
        </button>
      </aside>

      <section className="pane">
        <h2>Edit pivot: {selected}</h2>
        <label>
          Name
          <input value={pivot.name || ""} onChange={(e) => applyUpdate({ name: e.target.value })} />
        </label>

        <label>
          Model
          <input value={pivot.model || pivot.modelName || ""} onChange={(e) => applyUpdate({ model: e.target.value })} />
        </label>

        <label>
          Domain (JSON)
          <textarea
            value={JSON.stringify(pivot.domain || [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                applyUpdate({ domain: parsed });
              } catch {
                // ignore invalid json while typing
              }
            }}
            rows={4}
          />
        </label>

        <label>
          Row group by (comma separated)
          <input
            value={(pivot.rowGroupBys || []).join(",")}
            onChange={(e) => applyUpdate({ rowGroupBys: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
        </label>

        <label>
          Measures (comma separated field names)
          <input
            value={(pivot.measures || []).map((m) => m.field || m).join(",")}
            onChange={(e) =>
              applyUpdate({
                measures: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((f) => ({ field: f }))
              })
            }
          />
        </label>

        <label>
          SortedColumn (JSON)
          <textarea
            value={JSON.stringify(pivot.sortedColumn || null, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                applyUpdate({ sortedColumn: parsed });
              } catch {
                // ignore invalid json while typing
              }
            }}
            rows={3}
          />
        </label>
      </section>
    </div>
  );
}

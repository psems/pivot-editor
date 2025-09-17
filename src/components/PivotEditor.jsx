/**
 * Minimal validation for a pivot definition object.
 * @param {object} pivot - The pivot definition to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidPivot(pivot) {
  if (!pivot.id || !pivot.name || !pivot.model) return false;
  if (!Array.isArray(pivot.measures) || !Array.isArray(pivot.rowGroupBys)) return false;
  if (!Array.isArray(pivot.domain)) return false;
  return true;
}

import React, { useState, useMemo, useEffect } from "react";

/**
 * PivotEditor component for editing a single pivot definition.
 * @param {{ doc: object, setDoc: function }} props - The document and setter.
 */

export default function PivotEditor({ doc, setDoc }) {
  const pivots = doc.pivots || {};
  const keys = Object.keys(pivots);
  const [selected, setSelected] = useState(keys[0] || null);

  // Reset selected pivot when doc changes (e.g., new file loaded)
  useEffect(() => {
    setSelected(keys[0] || null);
  }, [doc]);

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
            style={{ minHeight: 120, resize: 'vertical', height: Math.max(120, (JSON.stringify(pivot.domain || [], null, 2).split('\n').length * 20)) }}
          />
        </label>


        <label>
          Row group by
          <table style={{ width: '100%', marginBottom: 10 }}>
            <tbody>
              {(pivot.rowGroupBys || []).map((val, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      value={val}
                      onChange={e => {
                        const arr = [...(pivot.rowGroupBys || [])];
                        arr[idx] = e.target.value;
                        applyUpdate({ rowGroupBys: arr });
                      }}
                      style={{ width: '90%' }}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => {
                      const arr = [...(pivot.rowGroupBys || [])];
                      arr.splice(idx, 1);
                      applyUpdate({ rowGroupBys: arr });
                    }}>🗑️</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <button type="button" onClick={() => {
                    const arr = [...(pivot.rowGroupBys || []), ""];
                    applyUpdate({ rowGroupBys: arr });
                  }}>Add row</button>
                </td>
              </tr>
            </tbody>
          </table>
        </label>

        <label>
          Measures
          <table style={{ width: '100%', marginBottom: 10 }}>
            <tbody>
              {(pivot.measures || []).map((m, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      value={m.field || ""}
                      onChange={e => {
                        const arr = [...(pivot.measures || [])];
                        arr[idx] = { field: e.target.value };
                        applyUpdate({ measures: arr });
                      }}
                      style={{ width: '90%' }}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => {
                      const arr = [...(pivot.measures || [])];
                      arr.splice(idx, 1);
                      applyUpdate({ measures: arr });
                    }}>🗑️</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <button type="button" onClick={() => {
                    const arr = [...(pivot.measures || []), { field: "" }];
                    applyUpdate({ measures: arr });
                  }}>Add row</button>
                </td>
              </tr>
            </tbody>
          </table>
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
            style={{ minHeight: 120, resize: 'vertical', height: Math.max(120, (JSON.stringify(pivot.sortedColumn || null, null, 2).split('\n').length * 20)) }}
          />
        </label>
      </section>
    </div>
  );
}

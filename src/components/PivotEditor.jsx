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

import React, { useState, useMemo, useEffect, useRef } from "react";

/**
 * PivotEditor component for editing a single pivot definition.
 * @param {{ doc: object, setDoc: function }} props - The document and setter.
 */

export default function PivotEditor({ doc, setDoc, saveRef, discardRef, onDirty }) {
  const pivots = doc.pivots || {};
  const keys = Object.keys(pivots);
  const [selected, setSelected] = useState(keys[0] || null);

  // Reset selected pivot when doc changes (e.g., new file loaded)
  useEffect(() => {
    setSelected(keys[0] || null);
  }, [doc]);


  // Local edit state for the selected pivot. Initialize to null and
  // rehydrate below when `selected` or `doc` changes so the UI stays
  // in sync with the sidebar selection.
  const [editPivot, setEditPivot] = useState(null);
  // Track if there are unsaved changes
  const [dirty, setDirty] = useState(false);
  const isInitial = useRef(true); // Track if this is the first load

  // Reset dirty when selected pivot changes
  useEffect(() => {
    onDirty(false);
  }, [selected, onDirty]);


  // Keep `editPivot` in sync when the selection or the document changes.
  // Mark this as an initial (non-user) load so the `editPivot` effect
  // that sets `onDirty(true)` doesn't trigger spuriously.
  useEffect(() => {
    if (!selected) {
      setEditPivot(null);
      isInitial.current = true;
      setDirty(false);
      if (onDirty) onDirty(false);
      return;
    }

    const pivotData = pivots[selected] ? JSON.parse(JSON.stringify(pivots[selected])) : null;
    setEditPivot(pivotData);
    // Treat this as an initial load so the edit change watcher doesn't
    // mark the document dirty immediately.
    isInitial.current = true;
    setDirty(false);
    if (onDirty) onDirty(false);
  }, [selected, doc]);

  // Set dirty only on user changes (skip initial load)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    onDirty(true);
  }, [editPivot, onDirty]);

  function applyEditUpdate(changes) {
    setEditPivot(prev => ({ ...prev, ...changes }));
    setDirty(true);
    if (onDirty) onDirty(true);
  }

  function saveEdit() {
    // If ID changed, move key
    const newId = editPivot.id;
    if (!newId || pivots[newId] && newId !== selected) return;
    let newPivots = { ...pivots };
    if (newId !== selected) {
      newPivots[newId] = { ...editPivot };
      delete newPivots[selected];
    } else {
      newPivots[newId] = { ...editPivot };
    }
    setDoc({ ...doc, pivots: newPivots });
    setSelected(newId);
    setDirty(false);
  if (onDirty) onDirty(false);
  }

  function discardEdit() {
    // Resetting selection will cause the `useEffect` to rehydrate `editPivot`.
    const resetKey = Object.keys(pivots).includes(selected) ? selected : Object.keys(pivots)[0];
    setSelected(resetKey);
    setDirty(false);
    if (onDirty) onDirty(false);
  }

  // Expose save/discard to parent via refs
  useEffect(() => {
    if (saveRef) saveRef.current = saveEdit;
    if (discardRef) discardRef.current = discardEdit;
  });


  if (!selected || !editPivot) {
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
          Pivot Number (ID)
          <input
              value={editPivot.id}
              onChange={e => {
                const newId = e.target.value.trim();
                if (!newId || (pivots[newId] && newId !== selected)) return; // prevent empty/duplicate
                setEditPivot(prev => ({ ...prev, id: newId }));
                setDirty(true);
              }}
            style={{ width: 80, marginRight: 8 }}
          />
        </label>
        <label>
          Name
          <input value={editPivot.name || ""} onChange={e => applyEditUpdate({ name: e.target.value })} />
        </label>

        <label>
          Model
          <input value={editPivot.model || editPivot.modelName || ""} onChange={e => applyEditUpdate({ model: e.target.value })} />
        </label>

        <label>
          Domain (JSON)
          <textarea
            value={JSON.stringify(editPivot.domain || [], null, 2)}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value);
                applyEditUpdate({ domain: parsed });
              } catch {
                // ignore invalid json while typing
              }
            }}
            style={{ minHeight: 120, resize: 'vertical', height: Math.max(120, (JSON.stringify(editPivot.domain || [], null, 2).split('\n').length * 20)) }}
          />
        </label>


        <label>
          Row group by
          <table style={{ width: '100%', marginBottom: 10 }}>
            <tbody>
              {(editPivot.rowGroupBys || []).map((val, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      value={val}
                      onChange={e => {
                        const arr = [...(editPivot.rowGroupBys || [])];
                        arr[idx] = e.target.value;
                        applyEditUpdate({ rowGroupBys: arr });
                      }}
                      style={{ width: '90%' }}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => {
                      const arr = [...(editPivot.rowGroupBys || [])];
                      arr.splice(idx, 1);
                      applyEditUpdate({ rowGroupBys: arr });
                    }}>🗑️</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <button type="button" onClick={() => {
                    const arr = [...(editPivot.rowGroupBys || []), ""];
                    applyEditUpdate({ rowGroupBys: arr });
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
              {(editPivot.measures || []).map((m, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      value={m.field || ""}
                      onChange={e => {
                        const arr = [...(editPivot.measures || [])];
                        arr[idx] = { field: e.target.value };
                        applyEditUpdate({ measures: arr });
                      }}
                      style={{ width: '90%' }}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => {
                      const arr = [...(editPivot.measures || [])];
                      arr.splice(idx, 1);
                      applyEditUpdate({ measures: arr });
                    }}>🗑️</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <button type="button" onClick={() => {
                    const arr = [...(editPivot.measures || []), { field: "" }];
                    applyEditUpdate({ measures: arr });
                  }}>Add row</button>
                </td>
              </tr>
            </tbody>
          </table>
        </label>

        <label>
          SortedColumn (JSON)
          <textarea
            value={JSON.stringify(editPivot.sortedColumn || null, null, 2)}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value);
                applyEditUpdate({ sortedColumn: parsed });
              } catch {
                // ignore invalid json while typing
              }
            }}
            style={{ minHeight: 120, resize: 'vertical', height: Math.max(120, (JSON.stringify(editPivot.sortedColumn || null, null, 2).split('\n').length * 20)) }}
          />
        </label>
        {/* Save/Discard buttons moved to top bar */}
      </section>
    </div>
  );
}

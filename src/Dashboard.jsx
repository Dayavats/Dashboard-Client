import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import './Dashboard.css';
import Chart from './components/Chart';
import AIInsightsModal from './components/AIInsightsModal';
import AuthContext from './components/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Dashboard Sharing Modal
const SharingModal = ({ open, onClose, shareUrl, permission, setPermission }) => {
  const modalRef = useRef();
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus();
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div className="modal" style={{ display: 'block', position: 'relative', margin: 'auto', maxHeight: '85%', width: '90%', maxWidth: 520 }}>
        <div className="modal-content">
        <h4>Share Dashboard</h4>
        <div style={{ margin: '16px 0' }}>
          <label>Shareable Link:<br />
            <input type="text" value={shareUrl} readOnly style={{ width: '100%' }} />
            <button className="btn waves-effect waves-light" style={{ marginTop: 8 }} onClick={() => { navigator.clipboard.writeText(shareUrl); }}>Copy Link</button>
          </label>
        </div>
        <div style={{ margin: '16px 0' }}>
          <label>Permission:<br />
            <select value={permission} onChange={e => setPermission(e.target.value)}>
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </label>
        </div>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
          Anyone with the link can access this dashboard with the selected permission.<br />
          (Demo: permissions stored in browser localStorage)
        </div>
        </div>
        <div className="modal-footer">
          <button className="btn-flat waves-effect" onClick={onClose} aria-label="Close sharing modal">Close</button>
        </div>
      </div>
    </div>
  );
};
// Notifications Modal
const NotificationsModal = ({ open, onClose, notifications, addNotification, removeNotification }) => {
  const modalRef = useRef();
  const [form, setForm] = useState({ type: 'time', time: '', widgetId: '', threshold: '', message: '' });
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus();
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div className="modal" style={{ display: 'block', position: 'relative', margin: 'auto', maxHeight: '85%', width: '90%', maxWidth: 520 }}>
        <div className="modal-content">
        <h4>Notifications</h4>
        <div style={{ margin: '16px 0' }}>
          <b>Scheduled/Data Alerts</b>
          <ul style={{ paddingLeft: 18 }}>
            {notifications.length === 0 && <li style={{ color: '#888' }}>No notifications set.</li>}
            {notifications.map((n, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {n.type === 'time' ? (
                  <>
                    <b>At:</b> {n.time} — {n.message}
                  </>
                ) : (
                  <>
                    <b>Widget:</b> {n.widgetId} <b>Threshold:</b> {n.threshold} — {n.message}
                  </>
                )}
                <button className="btn-small waves-effect red" style={{ marginLeft: 8 }} onClick={() => removeNotification(i)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ margin: '16px 0', borderTop: '1px solid #eee', paddingTop: 12 }}>
          <b>Add Notification</b>
          <div style={{ margin: '8px 0' }}>
            <label>Type:
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ marginLeft: 8 }}>
                <option value="time">Scheduled</option>
                <option value="data">Data Trigger</option>
              </select>
            </label>
          </div>
          {form.type === 'time' ? (
            <div style={{ marginBottom: 8 }}>
              <label>Time (HH:MM, 24h):
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ marginLeft: 8 }} />
              </label>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 8 }}>
                <label>Widget ID:
                  <input type="text" value={form.widgetId} onChange={e => setForm(f => ({ ...f, widgetId: e.target.value }))} style={{ marginLeft: 8 }} />
                </label>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Threshold (number):
                  <input type="number" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} style={{ marginLeft: 8 }} />
                </label>
              </div>
            </>
          )}
          <div style={{ marginBottom: 8 }}>
            <label>Message:
              <input type="text" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ marginLeft: 8, width: 180 }} />
            </label>
          </div>
          <button
            onClick={() => {
              if (form.type === 'time' && form.time && form.message) {
                addNotification({ ...form });
                setForm({ type: 'time', time: '', widgetId: '', threshold: '', message: '' });
              } else if (form.type === 'data' && form.widgetId && form.threshold && form.message) {
                addNotification({ ...form });
                setForm({ type: 'data', time: '', widgetId: '', threshold: '', message: '' });
              }
            }}
            className="btn waves-effect waves-light"
            style={{ marginTop: 4 }}
          >Add</button>
        </div>
        </div>
        <div className="modal-footer">
          <button className="btn-flat waves-effect" onClick={onClose} aria-label="Close notifications modal">Close</button>
        </div>
      </div>
    </div>
  );
};
// Version History Modal
const VersionHistoryModal = ({ open, onClose, versions, restoreVersion, deleteVersion }) => {
  const modalRef = useRef();
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus();
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)', zIndex: 1350, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div className="modal" style={{ display: 'block', position: 'relative', margin: 'auto', maxHeight: '85%', width: '90%', maxWidth: 540 }}>
        <div className="modal-content">
        <h4>Dashboard Version History</h4>
        <div style={{ margin: '16px 0' }}>
          <ul style={{ paddingLeft: 18, maxHeight: 260, overflowY: 'auto' }}>
            {versions.length === 0 && <li style={{ color: '#888' }}>No versions saved yet.</li>}
            {versions.map((v, i) => (
              <li key={v.timestamp} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                <b>{new Date(v.timestamp).toLocaleString()}</b>
                <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>({v.name || 'Untitled'})</span>
                <button className="btn-small waves-effect" style={{ marginLeft: 12 }} onClick={() => restoreVersion(i)}>Restore</button>
                <button className="btn-small waves-effect red" style={{ marginLeft: 6 }} onClick={() => deleteVersion(i)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        </div>
        <div className="modal-footer">
          <button className="btn-flat waves-effect" onClick={onClose} aria-label="Close version history modal">Close</button>
        </div>
      </div>
    </div>
  );
};
// Drill-down Modal
const DrilldownModal = ({ open, onClose, widget, subDashboards, saveSubDashboard, loadSubDashboard, deleteSubDashboard }) => {
  const modalRef = useRef();
  const [name, setName] = useState('');
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus();
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open || !widget) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)', zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div className="modal" style={{ display: 'block', position: 'relative', margin: 'auto', maxHeight: '85%', width: '90%', maxWidth: 540 }}>
        <div className="modal-content">
        <h4>Drill-down for Widget: {widget.id}</h4>
        <div style={{ margin: '16px 0' }}>
          <b>Sub-dashboards</b>
          <ul style={{ paddingLeft: 18, maxHeight: 180, overflowY: 'auto' }}>
            {(!subDashboards[widget.id] || subDashboards[widget.id].length === 0) && <li style={{ color: '#888' }}>No sub-dashboards yet.</li>}
            {subDashboards[widget.id]?.map((sd, i) => (
              <li key={sd.timestamp} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                <b>{sd.name || 'Untitled'}</b> <span style={{ color: '#888', fontSize: 13 }}>({new Date(sd.timestamp).toLocaleString()})</span>
                <button className="btn-small waves-effect" style={{ marginLeft: 12 }} onClick={() => loadSubDashboard(widget.id, i)}>Load</button>
                <button className="btn-small waves-effect red" style={{ marginLeft: 6 }} onClick={() => deleteSubDashboard(widget.id, i)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ margin: '16px 0', borderTop: '1px solid #eee', paddingTop: 12 }}>
          <b>Save Current as Sub-dashboard</b>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sub-dashboard name" style={{ marginLeft: 8 }} />
          <button className="btn waves-effect waves-light" style={{ marginLeft: 8 }} onClick={() => { saveSubDashboard(widget.id, name); setName(''); }}>Save</button>
        </div>
        </div>
        <div className="modal-footer">
          <button className="btn-flat waves-effect" onClick={onClose} aria-label="Close drilldown modal">Close</button>
        </div>
      </div>
    </div>
  );
};
// Widget Marketplace Modal
const WidgetMarketplace = ({ open, onClose, onAddWidget, catalog }) => {
  const modalRef = useRef();
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus();
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div className="modal" style={{ display: 'block', position: 'relative', margin: 'auto', maxHeight: '85%', width: '90%', maxWidth: 520 }}>
        <div className="modal-content">
        <h4>Widget Marketplace</h4>
        <div style={{ maxHeight: 320, overflowY: 'auto', margin: '16px 0' }}>
          {Object.entries(catalog).map(([type, config]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
              <div>
                <b>{config.title}</b>
                <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>{type}</span>
              </div>
              <button className="btn-small waves-effect waves-light" onClick={() => onAddWidget(type)} style={{ marginLeft: 12 }}>Add</button>
            </div>
          ))}
        </div>
        </div>
        <div className="modal-footer">
          <button className="btn-flat waves-effect" onClick={onClose} aria-label="Close marketplace">Close</button>
        </div>
      </div>
    </div>
  );
};
// Theme Customizer Modal
const ThemeCustomizerModal = ({ open, onClose, colors, setColors, currentTheme, setTheme }) => {
  const modalRef = useRef();
  const [tempColors, setTempColors] = useState(colors);
  
  useEffect(() => {
    setTempColors(colors);
  }, [colors]);
  
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus();
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  
  const handleSave = () => {
    setColors(tempColors);
    if (currentTheme !== 'custom') {
      setTheme('custom');
    }
    onClose();
  };
  
  const resetToDefault = () => {
    const defaults = {
      bg: '#0f172a',
      header: '#1e293b',
      text: '#e2e8f0',
      card: '#1e293b',
      border: '#334155',
      toolbarBg: '#1e293b',
      buttonBg: '#334155',
      buttonText: '#e2e8f0',
      buttonBorder: '#475569'
    };
    setTempColors(defaults);
  };
  
  if (!open) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div className="modal" style={{ display: 'block', position: 'relative', margin: 'auto', maxHeight: '90%', width: '90%', maxWidth: 600, background: '#fff', borderRadius: 8 }}>
        <div className="modal-content" style={{ maxHeight: '70vh', overflowY: 'auto', background: '#fff' }}>
          <h4 style={{ marginBottom: 20 }}>Customize Theme Colors</h4>
          <p style={{ color: '#666', marginBottom: 20 }}>Personalize your custom theme by adjusting the colors below. Changes will be applied when you click Save.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>palette</i>
                Background
              </label>
              <input 
                type="color" 
                value={tempColors.bg} 
                onChange={e => setTempColors({...tempColors, bg: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.bg} 
                onChange={e => setTempColors({...tempColors, bg: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>view_agenda</i>
                Header
              </label>
              <input 
                type="color" 
                value={tempColors.header} 
                onChange={e => setTempColors({...tempColors, header: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.header} 
                onChange={e => setTempColors({...tempColors, header: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>text_fields</i>
                Text Color
              </label>
              <input 
                type="color" 
                value={tempColors.text} 
                onChange={e => setTempColors({...tempColors, text: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.text} 
                onChange={e => setTempColors({...tempColors, text: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>dashboard</i>
                Card Background
              </label>
              <input 
                type="color" 
                value={tempColors.card} 
                onChange={e => setTempColors({...tempColors, card: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.card} 
                onChange={e => setTempColors({...tempColors, card: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>border_outer</i>
                Border Color
              </label>
              <input 
                type="color" 
                value={tempColors.border} 
                onChange={e => setTempColors({...tempColors, border: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.border} 
                onChange={e => setTempColors({...tempColors, border: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>construction</i>
                Toolbar Background
              </label>
              <input 
                type="color" 
                value={tempColors.toolbarBg} 
                onChange={e => setTempColors({...tempColors, toolbarBg: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.toolbarBg} 
                onChange={e => setTempColors({...tempColors, toolbarBg: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>smart_button</i>
                Button Background
              </label>
              <input 
                type="color" 
                value={tempColors.buttonBg} 
                onChange={e => setTempColors({...tempColors, buttonBg: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.buttonBg} 
                onChange={e => setTempColors({...tempColors, buttonBg: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>title</i>
                Button Text
              </label>
              <input 
                type="color" 
                value={tempColors.buttonText} 
                onChange={e => setTempColors({...tempColors, buttonText: e.target.value})}
                style={{ width: '100%', height: 40, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={tempColors.buttonText} 
                onChange={e => setTempColors({...tempColors, buttonText: e.target.value})}
                style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-flat waves-effect grey-text" onClick={resetToDefault}>Reset to Default</button>
          <div>
            <button className="btn-flat waves-effect" onClick={onClose} style={{ marginRight: 8 }}>Cancel</button>
            <button className="btn waves-effect waves-light blue" onClick={handleSave}>
              <i className="material-icons left">save</i>
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// Export dashboard as image
  const exportAsImage = async () => {
    const dashboardEl = document.querySelector('.dashboard');
    if (!dashboardEl) return;
    const canvas = await html2canvas(dashboardEl, { backgroundColor: '#fff', useCORS: true });
    const link = document.createElement('a');
    link.download = 'dashboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Export dashboard as PDF
  const exportAsPDF = async () => {
    const dashboardEl = document.querySelector('.dashboard');
    if (!dashboardEl) return;
    const canvas = await html2canvas(dashboardEl, { backgroundColor: '#fff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Fit image to page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    let renderWidth = pageWidth;
    let renderHeight = (imgHeight * pageWidth) / imgWidth;
    if (renderHeight > pageHeight) {
      renderHeight = pageHeight;
      renderWidth = (imgWidth * pageHeight) / imgHeight;
    }
    pdf.addImage(imgData, 'PNG', (pageWidth - renderWidth) / 2, (pageHeight - renderHeight) / 2, renderWidth, renderHeight);
    pdf.save('dashboard.pdf');
  };
// CSV parsing helper (simple, for demo)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = isNaN(values[i]) ? values[i] : Number(values[i]); });
    return obj;
  });
}
// Accessible modal for editing widget properties
const Modal = ({ open, onClose, children }) => {
  const modalRef = useRef();
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
    const handleKeyDown = e => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div className="modal modal-fixed-footer" style={{ 
        display: 'block', 
        position: 'relative', 
        margin: 'auto', 
        maxHeight: '90vh', 
        width: '90%', 
        maxWidth: 700,
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        opacity: 1,
        borderRadius: 12,
        boxShadow: '0 24px 48px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-content" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
// (already imported at the top)

const chartTypes = new Set([
  'lineChart',
  'barChart',
  'pieChart',
  'areaChart',
  'scatterChart',
  'gaugeChart'
]);

const widgetCatalog = {
  lineChart: { title: 'Sales Trend', layout: { w: 4, h: 3 } },
  barChart: { title: 'Revenue Breakdown', layout: { w: 4, h: 3 } },
  pieChart: { title: 'Market Share', layout: { w: 4, h: 3 } },
  areaChart: { title: 'Growth Momentum', layout: { w: 4, h: 3 } },
  scatterChart: { title: 'Performance Cloud', layout: { w: 4, h: 3 } },
  gaugeChart: { title: 'Utilization', layout: { w: 3, h: 3 } }
};

const starterWidgets = [];

const classicChartData = {
  lineChart: {
    title: 'Sales Trend',
    data: [
      { x: 1, y: 40 },
      { x: 2, y: 55 },
      { x: 3, y: 62 },
      { x: 4, y: 48 },
      { x: 5, y: 70 },
      { x: 6, y: 66 }
    ]
  },
  barChart: {
    title: 'Revenue by Region',
    data: [
      { label: 'North', value: 320 },
      { label: 'South', value: 95 },
      { label: 'East', value: 410 },
      { label: 'West', value: 270 }
    ]
  },
  pieChart: {
    title: 'Market Share',
    data: [
      { label: 'Product A', value: 52 },
      { label: 'Product B', value: 33 },
      { label: 'Product C', value: 15 }
    ]
  }
};

const classicCards = [
  { id: 'classic-1', type: 'lineChart', title: 'Sales Trend' },
  { id: 'classic-2', type: 'barChart', title: 'Revenue by Region' },
  { id: 'classic-3', type: 'pieChart', title: 'Market Share' },
  {
    id: 'classic-4',
    type: 'statValue',
    title: 'Quarterly Target',
    content: { label: 'Target', value: '127%' }
  },
  {
    id: 'classic-5',
    type: 'statText',
    title: 'Announcements',
    content: { heading: 'Reminder', body: 'Weekly sync moved to 11 AM.' }
  }
];

const StaticValueWidget = ({ content, onChange }) => (
  <div className="static-widget">
    <input
      className="static-widget__label"
      value={content.label}
      onChange={event => onChange({ label: event.target.value })}
      placeholder="Label"
    />
    <input
      className="static-widget__value"
      value={content.value}
      onChange={event => onChange({ value: event.target.value })}
      placeholder="Value"
    />
  </div>
);

const StaticTextWidget = ({ content, onChange }) => (
  <div className="static-widget static-widget--text">
    <input
      className="static-widget__label"
      value={content.heading}
      onChange={event => onChange({ heading: event.target.value })}
      placeholder="Heading"
    />
    <textarea
      value={content.body}
      onChange={event => onChange({ body: event.target.value })}
      placeholder="Add notes"
    />
  </div>
);

const StaticNumberWidget = ({ content, onChange }) => (
  <div className="static-widget static-widget--number">
    <input
      className="static-widget__label"
      value={content.label}
      onChange={event => onChange({ label: event.target.value })}
      placeholder="Metric"
    />
    <div className="static-widget__number-row">
      <input
        className="static-widget__value"
        type="number"
        value={content.value}
        onChange={event => onChange({ value: Number(event.target.value) })}
      />
      <input
        className="static-widget__suffix"
        value={content.suffix}
        onChange={event => onChange({ suffix: event.target.value })}
        placeholder="Suffix"
      />
    </div>
  </div>
);



const Dashboard = ({ user }) => {
  const { logout } = useContext(AuthContext);
  const [mode, setMode] = useState(null);
  const [widgets, setWidgets] = useState(starterWidgets);
  const [chartData, setChartData] = useState({});
  // Per-widget external data cache
  const [externalData, setExternalData] = useState({});
  const [editWidgetId, setEditWidgetId] = useState(null);
  const [editWidgetDraft, setEditWidgetDraft] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [layouts, setLayouts] = useState([]); // {name, widgets}
  const [layoutName, setLayoutName] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('dashboardTheme') || 'light');
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const [customThemeColors, setCustomThemeColors] = useState(() => {
    const saved = localStorage.getItem('customThemeColors');
    return saved ? JSON.parse(saved) : {
      bg: '#0f172a',
      header: '#1e293b',
      text: '#e2e8f0',
      card: '#1e293b',
      border: '#334155',
      toolbarBg: '#1e293b',
      buttonBg: '#334155',
      buttonText: '#e2e8f0',
      buttonBorder: '#475569'
    };
  });
  const [globalFilter, setGlobalFilter] = useState(null);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  // Sharing state
  const [sharingOpen, setSharingOpen] = useState(false);
  const [sharePermission, setSharePermission] = useState(() => localStorage.getItem('dashboardSharePerm') || 'view');
  // Generate a shareable link (for demo, just use current URL with ?share=1)
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=1`;

  // Drilldown modal state
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownWidget, setDrilldownWidget] = useState(null);
  const [subDashboards, setSubDashboards] = useState({});
  const openDrilldown = (widget) => {
    setDrilldownWidget(widget);
    setDrilldownOpen(true);
  };
  const saveSubDashboard = (widgetId, name) => {
    setSubDashboards(prev => ({
      ...prev,
      [widgetId]: [
        ...(prev[widgetId] || []),
        { name, timestamp: Date.now(), widgets: JSON.parse(JSON.stringify(widgets)) }
      ]
    }));
  };
  const loadSubDashboard = (widgetId, idx) => {
    const sub = subDashboards[widgetId]?.[idx];
    if (sub) setWidgets(JSON.parse(JSON.stringify(sub.widgets)));
  };
  const deleteSubDashboard = (widgetId, idx) => {
    setSubDashboards(prev => ({
      ...prev,
      [widgetId]: prev[widgetId].filter((_, i) => i !== idx)
    }));
  };

  // Version history modal state
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const saveVersion = (name) => {
    setVersions(prev => [
      ...prev,
      { name, timestamp: Date.now(), widgets: JSON.parse(JSON.stringify(widgets)) }
    ]);
  };
  const restoreVersion = (idx) => {
    const v = versions[idx];
    if (v) setWidgets(JSON.parse(JSON.stringify(v.widgets)));
  };
  const deleteVersion = (idx) => {
    setVersions(prev => prev.filter((_, i) => i !== idx));
  };

  // Notifications modal state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const addNotification = (notif) => setNotifications(prev => [...prev, notif]);
  const removeNotification = (idx) => setNotifications(prev => prev.filter((_, i) => i !== idx));

  // AI Insights modal state and handler
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [aiInsights, setAIInsights] = useState([]);
  const [aiLoading, setAILoading] = useState(false);
  const fetchInsights = async () => {
    setAILoading(true);
    // Simulate async AI call (replace with real API call as needed)
    setTimeout(() => {
      setAIInsights([
        { title: "Anomaly Detected", description: "Sales dropped by 30% last week.", score: 0.92 },
        { title: "Suggestion", description: "Consider increasing marketing spend.", type: "recommendation" }
      ]);
      setAILoading(false);
    }, 1500);
  };
  useEffect(() => {
    localStorage.setItem('dashboardSharePerm', sharePermission);
  }, [sharePermission]);
  
  // Initialize Materialize components
  useEffect(() => {
    if (window.M) {
      // Initialize all modals
      const elems = document.querySelectorAll('.modal');
      window.M.Modal.init(elems, {});
      
      // Initialize selects
      const selects = document.querySelectorAll('select');
      window.M.FormSelect.init(selects, {});
    }
  }, [mode, editWidgetId, marketplaceOpen, sharingOpen, notificationsOpen, versionModalOpen, drilldownOpen]);
  
  const gridContainerRef = useRef(null);
  const gridRef = useRef(null);
  const registeredWidgetsRef = useRef(new Set());
  const wsRef = useRef(null);
    // Persist theme
    useEffect(() => {
      localStorage.setItem('dashboardTheme', theme);
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-custom');
      document.body.classList.add(`theme-${theme}`);
    }, [theme]);

  // Apply custom theme colors dynamically
  useEffect(() => {
    localStorage.setItem('customThemeColors', JSON.stringify(customThemeColors));
    const root = document.documentElement;
    // Apply custom theme colors to CSS variables when custom theme is active
    if (theme === 'custom') {
      root.style.setProperty('--dashboard-bg', customThemeColors.bg);
      root.style.setProperty('--dashboard-header', customThemeColors.header);
      root.style.setProperty('--dashboard-text', customThemeColors.text);
      root.style.setProperty('--dashboard-card', customThemeColors.card);
      root.style.setProperty('--dashboard-border', customThemeColors.border);
      root.style.setProperty('--dashboard-toolbar-bg', customThemeColors.toolbarBg);
      root.style.setProperty('--dashboard-button-bg', customThemeColors.buttonBg);
      root.style.setProperty('--dashboard-button-text', customThemeColors.buttonText);
      root.style.setProperty('--dashboard-button-border', customThemeColors.buttonBorder);
    } else {
      // Remove custom properties when switching to light or dark theme
      root.style.removeProperty('--dashboard-bg');
      root.style.removeProperty('--dashboard-header');
      root.style.removeProperty('--dashboard-text');
      root.style.removeProperty('--dashboard-card');
      root.style.removeProperty('--dashboard-border');
      root.style.removeProperty('--dashboard-toolbar-bg');
      root.style.removeProperty('--dashboard-button-bg');
      root.style.removeProperty('--dashboard-button-text');
      root.style.removeProperty('--dashboard-button-border');
    }
  }, [customThemeColors, theme]);

  // Load layouts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayouts');
    if (saved) {
      try {
        setLayouts(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save layouts to localStorage when changed
  useEffect(() => {
    localStorage.setItem('dashboardLayouts', JSON.stringify(layouts));
  }, [layouts]);

  // Real-time collaboration: open WebSocket and sync widgets
  useEffect(() => {
    if (mode !== 'custom') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }
    // Connect to WebSocket server (collab - use backend WebSocket URL)
    const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    const ws = new window.WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      // Send initial state
      ws.send(JSON.stringify({ type: 'sync', widgets }));
    };
    ws.onmessage = event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'sync' && Array.isArray(msg.widgets)) {
          setWidgets(msg.widgets);
        }
      } catch {}
    };
    ws.onerror = err => { console.error('Collab WebSocket error', err); };
    ws.onclose = () => { wsRef.current = null; };
    return () => { ws.close(); };
    // eslint-disable-next-line
  }, [mode]);

  // Broadcast widget changes to collaborators
  useEffect(() => {
    if (mode !== 'custom') return;
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'sync', widgets }));
    // eslint-disable-next-line
  }, [widgets]);
    // Save current layout
    const saveCurrentLayout = () => {
      if (!layoutName.trim()) return;
      const newLayout = { name: layoutName.trim(), widgets: JSON.parse(JSON.stringify(widgets)) };
      setLayouts(prev => {
        // Overwrite if name exists
        const idx = prev.findIndex(l => l.name === newLayout.name);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = newLayout;
          return copy;
        }
        return [...prev, newLayout];
      });
      setLayoutName('');
    };

    // Load a saved layout
    const loadLayout = layout => {
      setWidgets(JSON.parse(JSON.stringify(layout.widgets)));
      setUndoStack([]);
      setRedoStack([]);
    };

    // Delete a saved layout
    const deleteLayout = name => {
      setLayouts(prev => prev.filter(l => l.name !== name));
    };
  // Find widget by id
  const getWidgetById = id => widgets.find(w => w.id === id);

  // Save current widgets state to undo stack
  const pushUndo = () => {
    setUndoStack(prev => [...prev, JSON.stringify(widgets)]);
    setRedoStack([]);
  };

  // Undo/redo handlers
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    setRedoStack(prev => [...prev, JSON.stringify(widgets)]);
    const prevState = undoStack[undoStack.length - 1];
    setWidgets(JSON.parse(prevState));
    setUndoStack(undoStack.slice(0, -1));
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setUndoStack(prev => [...prev, JSON.stringify(widgets)]);
    const nextState = redoStack[redoStack.length - 1];
    setWidgets(JSON.parse(nextState));
    setRedoStack(redoStack.slice(0, -1));
  };


  // Permissions: Only owner can edit/remove/duplicate/lock
  const canEditWidget = widget => !widget.owner || widget.owner === user.username;

  // Open edit modal for widget
  const openEditModal = id => {
    const widget = getWidgetById(id);
    if (!widget || !canEditWidget(widget)) return;
    setEditWidgetId(id);
    // Deep copy for editing
    setEditWidgetDraft(JSON.parse(JSON.stringify(widget)));
  };

  // Save changes from modal
  const saveEditWidget = () => {
    pushUndo();
    setWidgets(prev => prev.map(w => w.id === editWidgetId ? { ...w, ...editWidgetDraft } : w));
    setEditWidgetId(null);
    setEditWidgetDraft(null);
  };

  // Cancel modal
  const closeEditModal = () => {
    setEditWidgetId(null);
    setEditWidgetDraft(null);
  };

  useEffect(() => {
    if (mode !== 'custom') {
      if (gridRef.current) {
        gridRef.current.destroy(false);
        gridRef.current = null;
        registeredWidgetsRef.current.clear();
      }
      return undefined;
    }

    if (gridRef.current || !gridContainerRef.current) {
      return undefined;
    }

    const grid = GridStack.init(
      {
        column: 12,
        float: false,
        margin: 12,
        cellHeight: 90,
        resizable: { handles: 'e, se, s, sw, w' }
      },
      gridContainerRef.current
    );

    const handleChange = (_event, changedNodes) => {
      if (!Array.isArray(changedNodes)) {
        return;
      }

      setWidgets(prev =>
        prev.map(widget => {
          const node = changedNodes.find(item => item?.el?.id === `widget-${widget.id}`);
          if (!node) {
            return widget;
          }
          return {
            ...widget,
            layout: { x: node.x, y: node.y, w: node.w, h: node.h }
          };
        })
      );
    };

    grid.on('change', handleChange);
    gridRef.current = grid;

    // Store ref value in local variable for cleanup
    const widgetsRef = registeredWidgetsRef.current;
    return () => {
      grid.off('change', handleChange);
      grid.destroy(false);
      gridRef.current = null;
      widgetsRef.clear();
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'custom') {
      return;
    }

    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    widgets.forEach(widget => {
      const el = document.getElementById(`widget-${widget.id}`);
      if (!el) {
        return;
      }

      const defaults = widgetCatalog[widget.type]?.layout ?? { w: 4, h: 3 };
      const nodeConfig = {
        x: widget.layout.x ?? 0,
        y: widget.layout.y ?? 0,
        w: widget.layout.w ?? defaults.w,
        h: widget.layout.h ?? defaults.h
      };

      if (!registeredWidgetsRef.current.has(widget.id)) {
        grid.makeWidget(el);
        registeredWidgetsRef.current.add(widget.id);
      }

      grid.update(el, nodeConfig);
    });
  }, [widgets, mode]);

  useEffect(() => {
    if (mode !== 'custom') {
      return undefined;
    }

    const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => console.info('Connected to live data server');
    socket.onmessage = event => {
      try {
        setChartData(JSON.parse(event.data));
      } catch (error) {
        console.error('Unable to parse live data', error);
      }
    };
    socket.onerror = error => console.error('WebSocket error', error);
    socket.onclose = () => console.info('Live data connection closed');

    return () => socket.close();
  }, [mode]);

  const addWidget = type => {
    pushUndo();
    const preset = widgetCatalog[type] || widgetCatalog.lineChart;
    const id = `${type}-${Date.now()}`;

    const nextY = widgets.reduce((maxY, widget) => {
      const defaults = widgetCatalog[widget.type]?.layout ?? { h: 3 };
      const height = widget.layout.h ?? defaults.h;
      const bottomEdge = (widget.layout.y ?? 0) + height;
      return Math.max(maxY, bottomEdge);
    }, 0);

    const newWidget = {
      id,
      type,
      layout: { x: 0, y: nextY, w: preset.layout.w, h: preset.layout.h },
      content: preset.defaultContent ? { ...preset.defaultContent } : undefined,
      owner: user.username
    };

    setWidgets(prev => [...prev, newWidget]);
  };

  // Handler for marketplace add
  const handleMarketplaceAdd = type => {
    addWidget(type);
    setMarketplaceOpen(false);
  };

  const removeWidget = id => {
    const widget = getWidgetById(id);
    if (!canEditWidget(widget)) return;
    pushUndo();
    const grid = gridRef.current;
    const el = document.getElementById(`widget-${id}`);
    if (grid && el) {
      grid.removeWidget(el, false);
    }
    registeredWidgetsRef.current.delete(id);
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  // Duplicate widget
  const duplicateWidget = id => {
    const widget = getWidgetById(id);
    if (!widget || !canEditWidget(widget)) return;
    pushUndo();
    const newId = `${widget.type}-${Date.now()}`;
    const newWidget = {
      ...JSON.parse(JSON.stringify(widget)),
      id: newId,
      layout: { ...widget.layout, y: (widget.layout.y ?? 0) + 1 },
      owner: user.username
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = id => {
    pushUndo();
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, hidden: !w.hidden } : w));
  };

  // Toggle widget lock
  const toggleWidgetLock = id => {
    const widget = getWidgetById(id);
    if (!canEditWidget(widget)) return;
    pushUndo();
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, locked: !w.locked } : w));
    // Optionally, update gridstack's locked state if needed
    const grid = gridRef.current;
    const el = document.getElementById(`widget-${id}`);
    if (grid && el) {
      grid.setWidgetLocked(el, !getWidgetById(id)?.locked);
    }
  };

  const updateStaticWidget = (id, updates) => {
    pushUndo();
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === id
          ? { ...widget, content: { ...(widget.content || {}), ...updates } }
          : widget
      )
    );
  };

  const classicCardsWithContent = useMemo(
    () =>
      classicCards.map(card => {
        if (chartTypes.has(card.type)) {
          return {
            ...card,
            chart: classicChartData[card.type]
          };
        }
        return card;
      }),
    []
  );

  // Cross-widget filtering: widgets can broadcast filter events
  const handleWidgetFilter = filter => {
    setGlobalFilter(filter);
  };

  const renderWidgetBody = widget => {
    if (chartTypes.has(widget.type)) {
      // Data integration: use externalData if available, else chartData
      let data = externalData[widget.id] || chartData[widget.type];
      if (widget.script && typeof widget.script === 'string' && widget.script.trim()) {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('data', 'filter', widget.script);
          data = fn(data, globalFilter);
        } catch (e) {
          data = { error: 'Script error: ' + e.message };
        }
      }
      return (
        <Chart
          type={widget.type}
          data={data}
          options={widget.options}
          filter={globalFilter}
          onFilter={handleWidgetFilter}
        />
      );
    }
    const content = widget.content || widgetCatalog[widget.type]?.defaultContent;
    switch (widget.type) {
      case 'statValue':
        return <StaticValueWidget content={content} onChange={updates => updateStaticWidget(widget.id, updates)} />;
      case 'statText':
        return <StaticTextWidget content={content} onChange={updates => updateStaticWidget(widget.id, updates)} />;
      case 'statNumber':
        return <StaticNumberWidget content={content} onChange={updates => updateStaticWidget(widget.id, updates)} />;
      default:
        return <div className="chart-placeholder">Unsupported widget</div>;
    }
  };

  // Modal content for editing widget
  const renderEditModal = () => {
    if (!editWidgetDraft) return null;
    const { type } = editWidgetDraft;
    // Chart widgets
    if (chartTypes.has(type)) {
      // Chart property editing: type, title, color, data, custom script, and data integration
      return (
        <Modal open={!!editWidgetId} onClose={closeEditModal}>
          <h4 style={{ marginTop: 0, marginBottom: 24, fontWeight: 600, fontSize: 24 }}>Edit Chart Widget</h4>
          
          {/* Basic Settings */}
          <div style={{ marginBottom: 24 }}>
            <h6 style={{ fontWeight: 600, marginBottom: 16, color: '#5e35b1', borderBottom: '2px solid #5e35b1', paddingBottom: 8, display: 'flex', alignItems: 'center' }}>
              <i className="material-icons" style={{ fontSize: 18, marginRight: 6 }}>settings</i>
              Basic Settings
            </h6>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Chart Type</label>
              <select 
                value={editWidgetDraft.type} 
                onChange={e => setEditWidgetDraft(d => ({ ...d, type: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, backgroundColor: '#fff' }}
              >
                {[...chartTypes].map(ct => {
                  const chartName = ct.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                  return <option key={ct} value={ct}>{chartName}</option>;
                })}
              </select>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Title</label>
              <input 
                type="text"
                value={editWidgetDraft.title || ''} 
                onChange={e => setEditWidgetDraft(d => ({ ...d, title: e.target.value }))}
                placeholder="Enter chart title"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Primary Color</label>
                <input 
                  type="color" 
                  value={editWidgetDraft.color || '#007bff'} 
                  onChange={e => setEditWidgetDraft(d => ({ ...d, color: e.target.value }))}
                  style={{ width: '100%', height: 42, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 14 }}>
                  <input 
                    type="checkbox" 
                    checked={!!editWidgetDraft.showTooltips} 
                    onChange={e => setEditWidgetDraft(d => ({ ...d, showTooltips: e.target.checked }))}
                    className="filled-in"
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontWeight: 500 }}>Show Tooltips</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 14 }}>
                  <input 
                    type="checkbox" 
                    checked={!!editWidgetDraft.showLegend} 
                    onChange={e => setEditWidgetDraft(d => ({ ...d, showLegend: e.target.checked }))}
                    className="filled-in"
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontWeight: 500 }}>Show Legend</span>
                </label>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>X Axis Label</label>
                <input 
                  type="text"
                  value={editWidgetDraft.xAxisLabel || ''} 
                  onChange={e => setEditWidgetDraft(d => ({ ...d, xAxisLabel: e.target.value }))}
                  placeholder="X axis label"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Y Axis Label</label>
                <input 
                  type="text"
                  value={editWidgetDraft.yAxisLabel || ''} 
                  onChange={e => setEditWidgetDraft(d => ({ ...d, yAxisLabel: e.target.value }))}
                  placeholder="Y axis label"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>
            </div>
          </div>

          {/* Data Settings */}
          <div style={{ marginBottom: 24 }}>
            <h6 style={{ fontWeight: 600, marginBottom: 16, color: '#039be5', borderBottom: '2px solid #039be5', paddingBottom: 8, display: 'flex', alignItems: 'center' }}>
              <i className="material-icons" style={{ fontSize: 18, marginRight: 6 }}>storage</i>
              Data Settings
            </h6>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>External Data URL (API/CSV)</label>
              <input
                type="text"
                value={editWidgetDraft.externalUrl || ''}
                onChange={e => setEditWidgetDraft(d => ({ ...d, externalUrl: e.target.value }))}
                placeholder="https://api.example.com/data or Google Sheets CSV URL"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, marginBottom: 6 }}
              />
              <small style={{ color: '#666', fontSize: 12, display: 'block' }}>
                Supports public REST API (JSON array) or CSV (Google Sheets: File → Share → Publish to web → CSV)
              </small>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Data (JSON)</label>
              <textarea 
                rows={4} 
                value={JSON.stringify(editWidgetDraft.data || chartData[editWidgetDraft.type] || {}, null, 2)}
                onChange={e => {
                  try {
                    setEditWidgetDraft(d => ({ ...d, data: JSON.parse(e.target.value) }));
                  } catch { /* ignore */ }
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Consolas, Monaco, monospace', backgroundColor: '#f8f9fa' }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Or Upload CSV File</label>
              <input 
                type="file" 
                accept=".csv" 
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = evt => {
                    const text = evt.target.result;
                    const parsed = parseCSV(text);
                    setEditWidgetDraft(d => ({ ...d, data: parsed }));
                  };
                  reader.readAsText(file);
                }}
                style={{ display: 'block', padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: '100%', fontSize: 14 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Custom Script (JavaScript)</label>
              <textarea
                rows={4}
                placeholder="// Example: return data.filter(row => row.value > 50);"
                value={editWidgetDraft.script || ''}
                onChange={e => setEditWidgetDraft(d => ({ ...d, script: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'Consolas, Monaco, monospace', backgroundColor: '#f8f9fa' }}
              />
              <small style={{ color: '#666', fontSize: 12, display: 'block', marginTop: 6 }}>
                Function signature: <strong>(data, filter)</strong> → Return the transformed data to display
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <button className="btn-flat waves-effect" onClick={closeEditModal} style={{ fontSize: 14 }}>Cancel</button>
            <button className="btn waves-effect waves-light blue" onClick={saveEditWidget} style={{ fontSize: 14 }}>
              <i className="material-icons left" style={{ fontSize: 18 }}>save</i>
              Save Changes
            </button>
          </div>
        </Modal>
      );
    }
      
    // Static widgets
    if (type === 'statValue') {
      return (
        <Modal open={!!editWidgetId} onClose={closeEditModal}>
          <h4 style={{ marginTop: 0, marginBottom: 24, fontWeight: 600, fontSize: 24 }}>Edit Static Value</h4>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Label</label>
            <input 
              type="text"
              value={editWidgetDraft.content?.label || ''} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, content: { ...d.content, label: e.target.value } }))}
              placeholder="Enter label"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Value</label>
            <input 
              type="text"
              value={editWidgetDraft.content?.value || ''} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, content: { ...d.content, value: e.target.value } }))}
              placeholder="Enter value"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Color</label>
            <input 
              type="color" 
              value={editWidgetDraft.color || '#007bff'} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, color: e.target.value }))}
              style={{ width: '100%', height: 42, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <button className="btn-flat waves-effect" onClick={closeEditModal} style={{ fontSize: 14 }}>Cancel</button>
            <button className="btn waves-effect waves-light blue" onClick={saveEditWidget} style={{ fontSize: 14 }}>
              <i className="material-icons left" style={{ fontSize: 18 }}>save</i>
              Save Changes
            </button>
          </div>
        </Modal>
      );
    }
    if (type === 'statText') {
      return (
        <Modal open={!!editWidgetId} onClose={closeEditModal}>
          <h4 style={{ marginTop: 0, marginBottom: 24, fontWeight: 600, fontSize: 24 }}>Edit Static Text</h4>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Heading</label>
            <input 
              type="text"
              value={editWidgetDraft.content?.heading || ''} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, content: { ...d.content, heading: e.target.value } }))}
              placeholder="Enter heading"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Body</label>
            <textarea 
              value={editWidgetDraft.content?.body || ''} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, content: { ...d.content, body: e.target.value } }))}
              placeholder="Enter body text"
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Color</label>
            <input 
              type="color" 
              value={editWidgetDraft.color || '#007bff'} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, color: e.target.value }))}
              style={{ width: '100%', height: 42, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <button className="btn-flat waves-effect" onClick={closeEditModal} style={{ fontSize: 14 }}>Cancel</button>
            <button className="btn waves-effect waves-light blue" onClick={saveEditWidget} style={{ fontSize: 14 }}>
              <i className="material-icons left" style={{ fontSize: 18 }}>save</i>
              Save Changes
            </button>
          </div>
        </Modal>
      );
    }
    if (type === 'statNumber') {
      return (
        <Modal open={!!editWidgetId} onClose={closeEditModal}>
          <h4 style={{ marginTop: 0, marginBottom: 24, fontWeight: 600, fontSize: 24 }}>Edit Static Number</h4>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Label</label>
            <input 
              type="text"
              value={editWidgetDraft.content?.label || ''} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, content: { ...d.content, label: e.target.value } }))}
              placeholder="Enter label"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Value</label>
            <input 
              type="number" 
              value={editWidgetDraft.content?.value || ''} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, content: { ...d.content, value: e.target.value } }))}
              placeholder="Enter number"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Suffix</label>
            <input 
              type="text"
              value={editWidgetDraft.content?.suffix || ''} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, content: { ...d.content, suffix: e.target.value } }))}
              placeholder="e.g., %, $, km"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#333', fontSize: 14 }}>Color</label>
            <input 
              type="color" 
              value={editWidgetDraft.color || '#007bff'} 
              onChange={e => setEditWidgetDraft(d => ({ ...d, color: e.target.value }))}
              style={{ width: '100%', height: 42, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <button className="btn-flat waves-effect" onClick={closeEditModal} style={{ fontSize: 14 }}>Cancel</button>
            <button className="btn waves-effect waves-light blue" onClick={saveEditWidget} style={{ fontSize: 14 }}>
              <i className="material-icons left" style={{ fontSize: 18 }}>save</i>
              Save Changes
            </button>
          </div>
        </Modal>
      );
    }
    return null;
  };
useEffect(() => {
  if (!widgets || widgets.length === 0) return;

  widgets.forEach(widget => {
    if (chartTypes.has(widget.type) && widget.externalUrl?.trim()) {
      const url = widget.externalUrl.trim();
      if (externalData[widget.id]?.__src === url) return;

      fetch(url)
        .then(res => {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) return res.json();
          return res.text();
        })
        .then(data => {
          let parsed = data;
          if (typeof data === 'string') {
            parsed = parseCSV(data);
          }
          setExternalData(prev => ({
            ...prev,
            [widget.id]: { data: parsed, __src: url }
          }));
        })
        .catch(() => {
          setExternalData(prev => ({
            ...prev,
            [widget.id]: { error: 'Failed to fetch external data', __src: url }
          }));
        });
    }
  });
}, [widgets, externalData]);
  const renderCustomDashboard = () => (
    <>
      <header className="dashboard__header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        border: 'none'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 tabIndex={0} style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Create Custom Dashboard</h1>
          <p tabIndex={0} style={{ margin: 0, color: '#ffffff', opacity: 0.9, fontSize: '1.05rem' }}>Drag, resize, and curate the widgets that matter to you.</p>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#ffffff', opacity: 0.8, marginBottom: '12px', letterSpacing: '0.5px' }}>Quick Add Widgets</div>
          <div className="button-group" role="toolbar" aria-label="Add widget buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(widgetCatalog).map(([type, config]) => {
              const chartName = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
              return (
                <button 
                  key={type} 
                  type="button" 
                  onClick={() => addWidget(type)} 
                  aria-label={`Add ${chartName} widget`}
                  style={{ 
                    textTransform: 'none', 
                    fontWeight: 500,
                    background: '#ffffff !important',
                    color: '#667eea !important',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '1.2rem', color: '#667eea' }}>add</i>
                  {chartName}
                </button>
              );
            })}
            <button 
              type="button" 
              onClick={() => setMarketplaceOpen(true)} 
              aria-label="Open widget marketplace"
              style={{ 
                textTransform: 'none', 
                fontWeight: 600,
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              <i className="material-icons">store</i>
              Marketplace
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ color: '#ffffff', opacity: 0.9, fontSize: '0.95rem' }}>
            Signed in as <strong style={{ opacity: 1, fontWeight: 600 }}>{user.username}</strong>
          </span>
          <button 
            onClick={logout} 
            aria-label="Logout"
            style={{
              background: 'rgba(244, 67, 54, 0.9)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244, 67, 54, 1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(244, 67, 54, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 67, 54, 0.9)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <i className="material-icons" style={{ fontSize: '1.1rem' }}>logout</i>
            Logout
          </button>
        </div>
      </header>

      {/* Save/load layouts UI */}
      <section style={{ 
        margin: '0 0 24px 0', 
        background: '#ffffff', 
        padding: '24px', 
        borderRadius: '16px', 
        border: 'none', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
      }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#667eea', opacity: 0.8, marginBottom: '12px', letterSpacing: '0.5px' }}>Save & Load Layouts</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '200px', maxWidth: '300px' }}>
              <i className="material-icons" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#667eea', fontSize: '1.2rem', pointerEvents: 'none', zIndex: 1 }}>label</i>
              <input
                id="layout-name-input"
                type="text"
                placeholder="Enter layout name"
                value={layoutName}
                onChange={e => setLayoutName(e.target.value)}
                style={{ 
                  width: '100%',
                  paddingLeft: '48px',
                  paddingRight: '14px',
                  border: '2px solid #e0e0e0', 
                  borderRadius: '10px',
                  background: '#f8f9fa', 
                  color: '#333',
                  height: '44px',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.background = '#f8f9fa';
                }}
                aria-label="Layout name"
              />
            </div>
            <button 
              type="button" 
              onClick={saveCurrentLayout} 
              disabled={!layoutName.trim()} 
              aria-label="Save layout"
              style={{
                background: layoutName.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: layoutName.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: layoutName.trim() ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: layoutName.trim() ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (layoutName.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (layoutName.trim()) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>save</i>
              Save Layout
            </button>
          </div>
        </div>
        {layouts.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#667eea', opacity: 0.8, marginBottom: '12px', letterSpacing: '0.5px' }}>Saved Layouts</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {layouts.map(layout => (
                <div 
                  key={layout.name} 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    background: '#f8f9fa', 
                    borderRadius: '10px', 
                    padding: '8px 14px',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                >
                  <button 
                    type="button" 
                    style={{ 
                      marginRight: 10, 
                      minWidth: 'auto', 
                      padding: '6px 10px', 
                      height: '32px',
                      background: '#667eea',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} 
                    onClick={() => loadLayout(layout)} 
                    title="Load layout" 
                    aria-label={`Load layout ${layout.name}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#5568d3';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#667eea';
                    }}
                  >
                    <i className="material-icons" style={{ fontSize: '1rem' }}>refresh</i>
                  </button>
                  <span style={{ color: '#333', fontWeight: 600, marginRight: 10, fontSize: '0.95rem' }}>{layout.name}</span>
                  <button 
                    type="button" 
                    style={{ 
                      minWidth: 'auto', 
                      padding: '6px 10px', 
                      height: '32px',
                      background: '#f44336',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} 
                    onClick={() => deleteLayout(layout.name)} 
                    title="Delete layout" 
                    aria-label={`Delete layout ${layout.name}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#d32f2f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f44336';
                    }}
                  >
                    <i className="material-icons" style={{ fontSize: '1rem' }}>close</i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="grid-stack" ref={gridContainerRef} role="list" aria-label="Dashboard widgets">
        {widgets.map(widget => (
          <div
            key={widget.id}
            id={`widget-${widget.id}`}
            className="grid-stack-item"
            data-gs-x={widget.layout.x}
            data-gs-y={widget.layout.y}
            data-gs-w={widget.layout.w}
            data-gs-h={widget.layout.h}
            style={widget.hidden ? { display: 'none' } : {}}
            tabIndex={0}
            aria-label={`${widgetCatalog[widget.type]?.title || widget.type} widget`}
          >
            <div className="grid-stack-item-content widget-card">
              <div className="widget-card__header">
                <h3 tabIndex={0}>{widgetCatalog[widget.type]?.title}</h3>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    type="button" 
                    onClick={() => openEditModal(widget.id)} 
                    title="Edit widget" 
                    disabled={!canEditWidget(widget)} 
                    aria-label="Edit widget"
                    style={{
                      background: canEditWidget(widget) ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      cursor: canEditWidget(widget) ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: canEditWidget(widget) ? '0 2px 6px rgba(102, 126, 234, 0.3)' : 'none',
                      opacity: canEditWidget(widget) ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(102, 126, 234, 0.3)';
                      }
                    }}
                  >
                    ✎
                  </button>
                  <button 
                    type="button" 
                    onClick={() => duplicateWidget(widget.id)} 
                    title="Duplicate widget" 
                    disabled={!canEditWidget(widget)} 
                    aria-label="Duplicate widget"
                    style={{
                      background: canEditWidget(widget) ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : '#ccc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      cursor: canEditWidget(widget) ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: canEditWidget(widget) ? '0 2px 6px rgba(79, 172, 254, 0.3)' : 'none',
                      opacity: canEditWidget(widget) ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(79, 172, 254, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(79, 172, 254, 0.3)';
                      }
                    }}
                  >
                    ⧉
                  </button>
                  <button 
                    type="button" 
                    onClick={() => toggleWidgetVisibility(widget.id)} 
                    title={widget.hidden ? 'Show widget' : 'Hide widget'} 
                    aria-label={widget.hidden ? 'Show widget' : 'Hide widget'}
                    style={{
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      boxShadow: '0 2px 6px rgba(250, 112, 154, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(250, 112, 154, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(250, 112, 154, 0.3)';
                    }}
                  >
                    {widget.hidden ? '👁️' : '🙈'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => toggleWidgetLock(widget.id)} 
                    title={widget.locked ? 'Unlock widget' : 'Lock widget'} 
                    disabled={!canEditWidget(widget)} 
                    aria-label={widget.locked ? 'Unlock widget' : 'Lock widget'}
                    style={{
                      background: canEditWidget(widget) ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#ccc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      cursor: canEditWidget(widget) ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      boxShadow: canEditWidget(widget) ? '0 2px 6px rgba(240, 147, 251, 0.3)' : 'none',
                      opacity: canEditWidget(widget) ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(240, 147, 251, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(240, 147, 251, 0.3)';
                      }
                    }}
                  >
                    {widget.locked ? '🔓' : '🔒'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => removeWidget(widget.id)} 
                    title="Remove widget" 
                    disabled={!canEditWidget(widget)} 
                    aria-label="Remove widget"
                    style={{
                      background: canEditWidget(widget) ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' : '#ccc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      cursor: canEditWidget(widget) ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: canEditWidget(widget) ? '0 2px 6px rgba(244, 67, 54, 0.3)' : 'none',
                      opacity: canEditWidget(widget) ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(244, 67, 54, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canEditWidget(widget)) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(244, 67, 54, 0.3)';
                      }
                    }}
                  >
                    ✕
                  </button>
                  <button 
                    type="button" 
                    onClick={() => openDrilldown(widget)} 
                    title="Drill-down" 
                    aria-label="Drill-down"
                    style={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      boxShadow: '0 2px 6px rgba(17, 153, 142, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(17, 153, 142, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(17, 153, 142, 0.3)';
                    }}
                  >
                    🔎
                  </button>
                </div>
              </div>
              <div className="widget-card__body">{renderWidgetBody(widget)}</div>
            </div>
          </div>
        ))}
      </div>
      <WidgetMarketplace open={marketplaceOpen} onClose={() => setMarketplaceOpen(false)} onAddWidget={handleMarketplaceAdd} catalog={widgetCatalog} />
      {renderEditModal()}
    </>
  );

  const renderClassicDashboard = () => (
    <div className="classic-grid">
      {classicCardsWithContent.map(card => (
        <div key={card.id} className="classic-card">
          <div className="widget-card__header">
            <h3>{card.title}</h3>
          </div>
          <div className="widget-card__body">
            {chartTypes.has(card.type) ? (
              <Chart type={card.type} data={card.chart} />
            ) : card.type === 'statValue' ? (
              <div className="classic-stat">
                <span>{card.content.label}</span>
                <strong>{card.content.value}</strong>
              </div>
            ) : (
              <div className="classic-text">
                <h4>{card.content.heading}</h4>
                <p>{card.content.body}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (!mode) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h1 style={{ 
            color: '#ffffff', 
            fontSize: 48, 
            fontWeight: 700, 
            marginBottom: 12,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Welcome to Dashboard Builder
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: 18, 
            maxWidth: 600, 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Choose your preferred dashboard style to get started
          </p>
        </div>
        
        <div style={{ 
          width: '100%', 
          maxWidth: 1000, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 40,
          flexWrap: 'wrap'
        }}>
          <div 
            style={{ 
              width: '100%',
              maxWidth: 420,
              background: '#ffffff',
              borderRadius: 20,
              padding: 40,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
            onClick={() => setMode('custom')}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 16, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <i className="material-icons" style={{ fontSize: 48, color: '#ffffff' }}>dashboard_customize</i>
            </div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              marginBottom: 16, 
              color: '#333'
            }}>
              Create Custom Dashboard
            </h2>
            <p style={{ 
              fontSize: 16, 
              color: '#666', 
              lineHeight: 1.6,
              marginBottom: 0
            }}>
              Build your layout with draggable widgets, charts, and static notes.
            </p>
          </div>
          
          <div 
            style={{ 
              width: '100%',
              maxWidth: 420,
              background: '#ffffff',
              borderRadius: 20,
              padding: 40,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
            onClick={() => setMode('classic')}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 16, 
              background: 'linear-gradient(135deg, #039be5 0%, #0277bd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <i className="material-icons" style={{ fontSize: 48, color: '#ffffff' }}>view_quilt</i>
            </div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              marginBottom: 16, 
              color: '#333'
            }}>
              Create Classic Dashboard
            </h2>
            <p style={{ 
              fontSize: 16, 
              color: '#666', 
              lineHeight: 1.6,
              marginBottom: 0
            }}>
              Start from a ready-to-use layout with curated insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard theme-${theme}`}>
      {/* Main Header */}
      <div className="dashboard__header-bar" style={{ 
        background: 'var(--dashboard-header)', 
        padding: '20px 24px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        border: '1px solid var(--dashboard-border)',
        boxShadow: 'var(--dashboard-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              type="button" 
              onClick={() => setMode(null)}
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '48px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(17, 153, 142, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.3)';
              }}
            >
              <i className="material-icons" style={{ margin: 0 }}>arrow_back</i>
            </button>
            <h5 style={{ margin: 0, fontWeight: 600, color: 'var(--dashboard-text)' }}>
              {mode === 'custom' ? 'Custom Dashboard' : 'Classic Dashboard'}
            </h5>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'custom' : 'light')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              <i className="material-icons" style={{ fontSize: '1.2rem' }}>brightness_6</i>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
            <button
              type="button"
              aria-label="Customize theme colors"
              onClick={() => setThemeCustomizerOpen(true)}
              title="Customize Theme Colors"
              style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: '#555',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(168, 237, 234, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '48px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(168, 237, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 237, 234, 0.3)';
              }}
            >
              <i className="material-icons">palette</i>
            </button>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="dashboard__toolbar" style={{
        background: 'var(--dashboard-toolbar-bg)',
        padding: '16px 20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid var(--dashboard-border)',
        boxShadow: 'var(--dashboard-shadow)'
      }}>
        {/* Collaboration & Features */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--dashboard-text)', opacity: 0.6, marginBottom: '8px' }}>Collaboration & Features</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              aria-label="Share dashboard"
              onClick={() => setSharingOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(17, 153, 142, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(17, 153, 142, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(17, 153, 142, 0.3)';
              }}
            >
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>share</i> Share
            </button>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(240, 147, 251, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(240, 147, 251, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(240, 147, 251, 0.3)';
              }}
            >
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>notifications</i> Notifications
            </button>
            <button
              type="button"
              aria-label="Version history"
              onClick={() => setVersionModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(102, 126, 234, 0.3)';
              }}
            >
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>history</i> History
            </button>
            <button
              type="button"
              aria-label="Save version"
              onClick={() => {
                const name = prompt('Enter a name for this version (optional):') || '';
                saveVersion(name);
              }}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(79, 172, 254, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(79, 172, 254, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(79, 172, 254, 0.3)';
              }}
            >
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>save</i> Save Version
            </button>
            <button
              type="button"
              aria-label="AI Insights"
              onClick={() => setAIModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(250, 112, 154, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(250, 112, 154, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(250, 112, 154, 0.3)';
              }}
            >
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>psychology</i> AI Insights
            </button>
          </div>
        </div>

        {/* Custom Dashboard Tools */}
        {mode === 'custom' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--dashboard-text)', opacity: 0.6, marginBottom: '8px' }}>Edit & Export</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={handleUndo} 
                  disabled={undoStack.length === 0} 
                  title="Undo"
                  style={{
                    background: undoStack.length === 0 ? '#e0e0e0' : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    color: undoStack.length === 0 ? '#999' : '#555',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: undoStack.length === 0 ? 'none' : '0 4px 10px rgba(168, 237, 234, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textTransform: 'none',
                    opacity: undoStack.length === 0 ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (undoStack.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(168, 237, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (undoStack.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(168, 237, 234, 0.3)';
                    }
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '1.1rem' }}>undo</i> Undo
                </button>
                <button 
                  type="button" 
                  onClick={handleRedo} 
                  disabled={redoStack.length === 0} 
                  title="Redo"
                  style={{
                    background: redoStack.length === 0 ? '#e0e0e0' : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    color: redoStack.length === 0 ? '#999' : '#555',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: redoStack.length === 0 ? 'none' : '0 4px 10px rgba(255, 236, 210, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textTransform: 'none',
                    opacity: redoStack.length === 0 ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (redoStack.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(255, 236, 210, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (redoStack.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 236, 210, 0.3)';
                    }
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '1.1rem' }}>redo</i> Redo
                </button>
                <button 
                  type="button" 
                  onClick={exportAsImage} 
                  title="Export as Image"
                  style={{
                    background: 'linear-gradient(135deg, #dad4ec 0%, #f3e7e9 100%)',
                    color: '#555',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(218, 212, 236, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textTransform: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(218, 212, 236, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(218, 212, 236, 0.3)';
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '1.1rem' }}>image</i> Image
                </button>
                <button 
                  type="button" 
                  onClick={exportAsPDF} 
                  title="Export as PDF"
                  style={{
                    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                    color: '#555',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(224, 195, 252, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textTransform: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(224, 195, 252, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(224, 195, 252, 0.3)';
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '1.1rem' }}>picture_as_pdf</i> PDF
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--dashboard-text)', opacity: 0.6, marginBottom: '8px' }}>Filter</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div className="input-field" style={{ margin: 0, flex: '1 1 auto', minWidth: '200px', maxWidth: '400px' }}>
                  <i className="material-icons prefix" style={{ color: 'var(--dashboard-text)' }}>search</i>
                  <input
                    id="global-filter-input"
                    type="text"
                    value={globalFilter || ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Type to filter charts..."
                    style={{ 
                      marginBottom: 0,
                      paddingLeft: '3rem',
                      border: '1px solid var(--dashboard-border)', 
                      borderRadius: '6px',
                      background: 'var(--dashboard-bg)', 
                      color: 'var(--dashboard-text)',
                      height: '38px'
                    }}
                  />
                </div>
                <button type="button" className="btn waves-effect grey" onClick={() => setGlobalFilter(null)}>
                  <i className="material-icons">clear</i>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <AIInsightsModal
        open={aiModalOpen}
        onClose={() => setAIModalOpen(false)}
        insights={aiInsights}
        loading={aiLoading}
        fetchInsights={fetchInsights}
      />
      <DrilldownModal
        open={drilldownOpen}
        onClose={() => { setDrilldownOpen(false); setDrilldownWidget(null); }}
        widget={drilldownWidget}
        subDashboards={subDashboards}
        saveSubDashboard={saveSubDashboard}
        loadSubDashboard={loadSubDashboard}
        deleteSubDashboard={deleteSubDashboard}
      />
      <VersionHistoryModal
        open={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        versions={versions}
        restoreVersion={restoreVersion}
        deleteVersion={deleteVersion}
      />
      <NotificationsModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        addNotification={addNotification}
        removeNotification={removeNotification}
      />
      <SharingModal open={sharingOpen} onClose={() => setSharingOpen(false)} shareUrl={shareUrl} permission={sharePermission} setPermission={setSharePermission} />
      <ThemeCustomizerModal 
        open={themeCustomizerOpen} 
        onClose={() => setThemeCustomizerOpen(false)} 
        colors={customThemeColors}
        setColors={setCustomThemeColors}
        currentTheme={theme}
        setTheme={setTheme}
      />
      {mode === 'custom' ? renderCustomDashboard() : renderClassicDashboard()}
    </div>
  );
};

export default Dashboard;
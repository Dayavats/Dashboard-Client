import React from "react";
import Modal from "./Modal";

/**
 * AIInsightsModal - Modal to display AI-generated insights for the dashboard.
 * Props:
 *   open (bool): Whether the modal is open
 *   onClose (func): Close handler
 *   insights (array): Array of AI insight objects { title, description, [score|type|action] }
 *   loading (bool): Whether insights are loading
 *   fetchInsights (func): Handler to trigger insights fetch
 */
const AIInsightsModal = ({ open, onClose, insights = [], loading, fetchInsights }) => {
  return (
    <Modal open={open} onClose={onClose} title="AI Insights" width={520}>
      <div style={{ minHeight: 120 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <span role="status" aria-live="polite">Analyzing data and generating insights...</span>
          </div>
        ) : (
          <>
            {insights.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <p>No AI insights available yet.</p>
                <button type="button" onClick={fetchInsights} style={{ marginTop: 12 }}>Generate Insights</button>
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {insights.map((insight, idx) => (
                  <li key={idx} style={{ marginBottom: 18, background: "#f6fafd", borderRadius: 8, padding: 16, boxShadow: "0 1px 4px #0001" }}>
                    <h4 style={{ margin: 0 }}>{insight.title}</h4>
                    <p style={{ margin: "8px 0 0 0" }}>{insight.description}</p>
                    {insight.score !== undefined && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>Anomaly Score: {insight.score}</div>
                    )}
                    {insight.type && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>Type: {insight.type}</div>
                    )}
                    {insight.action && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>Suggested Action: {insight.action}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};

export default AIInsightsModal;

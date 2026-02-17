import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Chart from './components/Chart';

const Dashboard = () => {
  const [chartData, setChartData] = useState({});
  const [widgets, setWidgets] = useState([
    { id: 1, type: 'lineChart', title: 'Sales Trend' },
    { id: 2, type: 'barChart', title: 'Revenue' },
    { id: 3, type: 'pieChart', title: 'Market Share' }
  ]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onopen = () => console.log('✅ Connected to server');
    ws.onmessage = (event) => {
      try {
        setChartData(JSON.parse(event.data));
      } catch (err) {
        console.error('Error parsing WebSocket data:', err);
      }
    };
    ws.onerror = (error) => console.error('❌ WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket closed');
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  const addWidget = (type) => {
    const newId = Math.max(...widgets.map(w => w.id), 0) + 1;
    setWidgets([...widgets, { id: newId, type, title: type }]);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  return (
    <div className="dashboard">
      <h1>📊 Live Dashboard</h1>
      
      <div className="button-group">
        <button onClick={() => addWidget('lineChart')}>+ Line</button>
        <button onClick={() => addWidget('barChart')}>+ Bar</button>
        <button onClick={() => addWidget('pieChart')}>+ Pie</button>
        <button onClick={() => addWidget('areaChart')}>+ Area</button>
        <button onClick={() => addWidget('scatterChart')}>+ Scatter</button>
        <button onClick={() => addWidget('gaugeChart')}>+ Gauge</button>
      </div>

      <div className="grid-stack">
        {widgets.map(widget => (
          <div key={widget.id} className="grid-stack-item">
            <div className="grid-stack-item-content widget">
              <button className="close-btn" onClick={() => removeWidget(widget.id)}>✕</button>
              <h3>{chartData[widget.type]?.title || widget.title}</h3>
              <div className="chart-container">
                <Chart type={widget.type} data={chartData[widget.type]} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
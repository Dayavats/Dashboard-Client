import React from 'react';
import './Chart.css';
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  GaugeContainer,
  GaugeReferenceArc,
  GaugeValueArc,
  GaugeValueText
} from '@mui/x-charts';

const sanitizePoints = (points = []) =>
  points
    .map((point, index) => ({
      id: point.id ?? index,
      label: point.label ?? point.name ?? `Item ${index + 1}`,
      x: Number(point.x ?? index),
      y: Number(point.y ?? point.value ?? 0),
      value: Number(point.value ?? point.y ?? 0)
    }))
    .filter(point => Number.isFinite(point.value) || Number.isFinite(point.y));

const parseAxisValue = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const Chart = ({ type, data }) => {
  if (type === 'gaugeChart') {
    const gaugeValue = Number(data?.value ?? 0);
    return (
      <div className="chart-wrapper">
        <GaugeContainer width={220} height={160} startAngle={-90} endAngle={90} value={gaugeValue}>
          <GaugeReferenceArc />
          <GaugeValueArc />
          <GaugeValueText format={({ value }) => `${Math.round(value)}%`} />
        </GaugeContainer>
      </div>
    );
  }

  const dataset = sanitizePoints(data?.data);
  if (!dataset.length) {
    return <div className="chart-placeholder">Waiting for live data...</div>;
  }

  const yMin = parseAxisValue(data?.yMin);
  const yMax = parseAxisValue(data?.yMax);
  const hasAxisRange = yMin !== undefined || yMax !== undefined;
  const yAxis = hasAxisRange ? [{ min: yMin, max: yMax }] : undefined;

  const baseProps = { width: 520, height: 280, dataset };

  switch (type) {
    case 'lineChart':
    case 'areaChart':
      return (
        <div className="chart-wrapper">
          <LineChart
            {...baseProps}
            xAxis={[{ dataKey: 'x', scaleType: 'linear' }]}
            yAxis={yAxis}
            series={[{ dataKey: 'y', area: type === 'areaChart', label: data?.title }]}
          />
        </div>
      );

    case 'barChart':
      return (
        <div className="chart-wrapper">
          <BarChart
            {...baseProps}
            xAxis={[{ dataKey: 'label', scaleType: 'band' }]}
            yAxis={yAxis}
            series={[{ dataKey: 'value', label: data?.title }]}
          />
        </div>
      );

    case 'pieChart':
      return (
        <div className="chart-wrapper">
          <PieChart
            series={[
              {
                data: dataset.map(point => ({ id: point.id, value: point.value, label: point.label }))
              }
            ]}
            width={380}
            height={280}
          />
        </div>
      );

    case 'scatterChart':
      return (
        <div className="chart-wrapper">
          <ScatterChart
            {...baseProps}
            xAxis={[{ dataKey: 'x', scaleType: 'linear' }]}
            yAxis={[{ dataKey: 'y', min: yMin, max: yMax }]}
            series={[{ dataKey: 'y', label: data?.title }]}
          />
        </div>
      );

    default:
      return <div className="chart-placeholder">Unsupported widget</div>;
  }
};

export default Chart;
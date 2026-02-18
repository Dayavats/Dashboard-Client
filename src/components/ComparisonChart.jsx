import * as React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { LineChart, BarChart } from "@mui/x-charts";

const ComparisonChart = () => {
  const timeLabels = ["10:00", "11:00", "12:00", "13:00", "14:00"];

  const areaA = {
    dewPoint: [-30, -32, -31, -29, -28],
    humidity: [22, 25, 23, 24, 26],
    particles: [3200, 3100, 3300, 3400, 3250],
    temperature: [22, 23, 22, 24, 23]
  };

  const areaB = {
    dewPoint: [-25, -28, -27, -26, -24],
    humidity: [30, 32, 31, 33, 34],
    particles: [4100, 3900, 4200, 4300, 4150],
    temperature: [24, 25, 24, 26, 27]
  };

  const cardSx = { p: 2, minHeight: 360 };
  const particlesRange = { min: 0, max: 5000 };

  return (
    <Box p={1.5}>
      <Typography variant="h5" mb={3}>
        Area Comparison Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(360px, 1fr))" },
          gap: 3,
          alignItems: "stretch"
        }}
      >
        <Paper sx={cardSx}>
          <Typography variant="h6">Dew Point (degC)</Typography>
          <LineChart
            xAxis={[{ scaleType: "point", data: timeLabels }]}
            yAxis={[{ min: -60, max: 60 }]}
            series={[
              { data: areaA.dewPoint, label: "Area A" },
              { data: areaB.dewPoint, label: "Area B" }
            ]}
            height={300}
          />
        </Paper>

        <Paper sx={cardSx}>
          <Typography variant="h6">Relative Humidity (%RH)</Typography>
          <LineChart
            xAxis={[{ scaleType: "point", data: timeLabels }]}
            yAxis={[{ min: 0, max: 100 }]}
            series={[
              { data: areaA.humidity, label: "Area A" },
              { data: areaB.humidity, label: "Area B" }
            ]}
            height={300}
          />
        </Paper>

        <Paper sx={cardSx}>
          <Typography variant="h6">Airborne Particles (0.5um)</Typography>
          <BarChart
            xAxis={[{ scaleType: "band", data: timeLabels }]}
            yAxis={[particlesRange]}
            series={[
              { data: areaA.particles, label: "Area A" },
              { data: areaB.particles, label: "Area B" }
            ]}
            height={300}
          />
        </Paper>

        <Paper sx={cardSx}>
          <Typography variant="h6">Temperature (degC)</Typography>
          <LineChart
            xAxis={[{ scaleType: "point", data: timeLabels }]}
            yAxis={[{ min: 0, max: 100 }]}
            series={[
              { data: areaA.temperature, label: "Area A" },
              { data: areaB.temperature, label: "Area B" }
            ]}
            height={300}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default ComparisonChart;
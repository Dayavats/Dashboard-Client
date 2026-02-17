# Advanced React Dashboard

A highly customizable, feature-rich dashboard application built with React. This dashboard supports advanced analytics, real-time collaboration, extensibility, and modern UI/UX best practices.

## Features

### Core Dashboard
- **Custom & Classic Modes**: Choose between a fully customizable dashboard or a classic, curated layout.
- **Drag-and-Drop Widgets**: Add, move, resize, duplicate, hide/show, and lock/unlock widgets using GridStack.js.
- **Widget Editing**: Edit widget properties, colors, chart types, and data directly from the UI.
- **Undo/Redo**: Instantly revert or reapply changes to your dashboard layout and widgets.
- **Save/Load Layouts**: Save multiple dashboard layouts and switch between them at any time.
- **Export**: Export your dashboard as an image (PNG) or PDF.
- **Responsive & Accessible**: Fully responsive design with ARIA roles and keyboard navigation.
- **Theming**: Switch between light, dark, and custom themes.

### Data & Visualization
- **Chart Widgets**: Line, bar, pie, area, scatter, and gauge charts with advanced options.
- **Static Widgets**: Display static values, text, and numbers with custom labels and colors.
- **CSV Upload**: Import data into widgets via CSV files.
- **Data Integrations**: Fetch data from public REST APIs or Google Sheets (CSV URL).
- **Cross-Widget Filtering**: Apply global filters to all chart widgets.

### Extensibility & Marketplace
- **Widget Marketplace**: Browse and add pre-built widgets from a marketplace modal.
- **Custom Scripting**: Add custom JavaScript to transform widget data on the fly.

### Collaboration & Sharing
- **Real-Time Collaboration**: Sync dashboard changes live with other users via WebSocket.
- **User Authentication**: Simple login/logout and user context.
- **Role-Based Sharing**: Share dashboards with view/edit permissions via a shareable link.

### Advanced Features
- **Notifications**: Schedule time-based or data-triggered notifications (browser notifications).
- **Version History**: Save, view, restore, and delete previous dashboard versions (snapshots).
- **Drill-Down (Sub-Dashboards)**: Attach sub-dashboards to any widget and drill down for deeper analysis.
- **AI Insights**: Analyze dashboard data for anomalies and suggestions using built-in AI heuristics.

### Other Highlights
- **Accessibility**: All modals and controls are keyboard and screen-reader accessible.
- **Mobile Friendly**: Responsive layout adapts to mobile and tablet screens.
- **Local Persistence**: All user data, layouts, versions, and settings are stored in browser localStorage.

## Getting Started

1. **Install dependencies**
   ```bash
   cd client
   npm install
   ```
2. **Start the development server**
   ```bash
   npm start
   ```
3. **(Optional) Start the WebSocket server for collaboration**
   - See `server/` for a simple Node.js WebSocket server example.

## File Structure
- `src/Dashboard.jsx` — Main dashboard component with all features
- `src/components/Chart.jsx` — Chart rendering logic
- `src/components/AuthContext.js` — Authentication context
- `public/` — Static assets and HTML
- `server/` — Example backend for real-time collaboration

## Customization
- Add new widget types in `widgetCatalog` in `Dashboard.jsx`
- Extend chart options and types in `Chart.jsx`
- Modify theming in `Dashboard.css`

## License
MIT

---

**Enjoy your all-in-one analytics dashboard!**

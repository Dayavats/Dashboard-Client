import './App.css';

import Dashboard from './Dashboard';
import { AuthProvider } from './components/AuthContext';
import LoginForm from './components/LoginForm';
import React, { useContext } from 'react';
import AuthContext from './components/AuthContext';

const AppContent = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <LoginForm />;
  return <Dashboard user={user} />;
};


function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

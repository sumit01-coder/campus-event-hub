import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import Login from './src/pages/Login.jsx';

// Mock AuthContext
const AuthContext = React.createContext();

function Test() {
  return (
    <AuthContext.Provider value={{ login: () => {}, user: null }}>
      <StaticRouter location="/login">
        <Login />
      </StaticRouter>
    </AuthContext.Provider>
  );
}

try {
  console.log("Rendering...");
  const html = renderToString(<Test />);
  console.log("Render successful! Length:", html.length);
} catch (e) {
  console.error("RENDER ERROR:", e);
}

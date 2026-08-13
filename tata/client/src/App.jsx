import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "@clerk/react";
import Home          from "./components/pages/Home";
import Dashboard     from "./components/pages/Dashboard";
import About         from "./components/pages/About";
import Services      from "./components/pages/Services";
import MyExports     from "./components/pages/MyExports";
import ProtectedRoute from "./components/ProtectedRoute";
import { setAuthToken } from "./services/api";

function App() {
  const { getToken, isSignedIn } = useAuth();

  // Keep the shared axios instance in sync with the Clerk session.
  // Runs whenever sign-in state changes (login, logout, token refresh).
  useEffect(() => {
    if (!isSignedIn) {
      setAuthToken(null);
      return;
    }
    getToken().then((token) => setAuthToken(token));
  }, [isSignedIn, getToken]);

  return (
    <Router>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/about"    element={<About />} />
        <Route path="/services" element={<Services />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-exports"
          element={
            <ProtectedRoute>
              <MyExports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

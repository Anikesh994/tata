import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "@clerk/react";
import Home           from "./components/pages/Home";
import Dashboard      from "./components/pages/Dashboard";
import About          from "./components/pages/About";
import Services       from "./components/pages/Services";
import MyExports      from "./components/pages/MyExports";
import ProtectedRoute from "./components/ProtectedRoute";
import { registerTokenGetter } from "./services/api";

function App() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      registerTokenGetter(getToken);
    } else {
      registerTokenGetter(null);
    }
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

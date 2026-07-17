import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/Dashboard";
import About from "./components/pages/About";
import Services from "./components/pages/Services";
import MyExports from "./components/pages/MyExports";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/about"     element={<About />} />
        <Route path="/services"  element={<Services />} />

        {/* Dashboard — signed-in users only */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* My Exports — signed-in users only */}
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

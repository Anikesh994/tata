import { useAuth } from "@clerk/react";
import { RedirectToSignIn } from "@clerk/react";

/**
 * Wraps any route that requires authentication.
 * - If Clerk is still loading → show nothing (avoids flash)
 * - If signed out → redirect to Clerk sign-in modal / page
 * - If signed in → render children
 */
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  // Still bootstrapping Clerk — render nothing to avoid flash
  if (!isLoaded) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f1e",
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(56,189,248,0.2)",
          borderTopColor: "#38bdf8",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return children;
};

export default ProtectedRoute;

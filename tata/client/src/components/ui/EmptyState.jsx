/**
 * components/ui/EmptyState.jsx
 * Empty state for the My Exports page.
 * Keeps all existing CSS classes unchanged.
 */

const EmptyState = () => (
  <div className="me-empty">
    <span className="me-empty-icon">📂</span>
    <p className="me-empty-title">No exports yet</p>
    <p className="me-empty-sub">
      Head to the <a href="/dashboard" className="me-link">Dashboard</a> and click
      &ldquo;Export PDF&rdquo; to generate your first export.
    </p>
  </div>
);

export default EmptyState;

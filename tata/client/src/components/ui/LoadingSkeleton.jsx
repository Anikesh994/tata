/**
 * components/ui/LoadingSkeleton.jsx
 * Skeleton loading grid for the My Exports page.
 * Keeps all existing CSS classes unchanged.
 */

const LoadingSkeleton = () => (
  <div className="me-skeleton-grid">
    {[1, 2, 3].map((n) => (
      <div key={n} className="me-skeleton-card">
        <div className="me-skeleton-line me-skeleton-title" />
        <div className="me-skeleton-line me-skeleton-meta" />
        <div className="me-skeleton-line me-skeleton-meta" style={{ width: "55%" }} />
        <div className="me-skeleton-actions">
          <div className="me-skeleton-btn" />
          <div className="me-skeleton-btn" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;

/**
 * TabSkeleton Component
 * Provides a skeleton loading state for tab content
 */
export function TabSkeleton() {
  return (
    <div className="tab-skeleton" aria-busy="true" aria-label="Loading content">
      <div className="skeleton-header">
        <div className="skeleton-title" />
        <div className="skeleton-subtitle" />
      </div>
      <div className="skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
}

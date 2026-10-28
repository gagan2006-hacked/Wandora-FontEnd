export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return <div className="skeleton-stack" role="status" aria-label="Loading content">
    {Array.from({ length: rows }, (_, index) => <div className="skeleton-card" key={index} aria-hidden="true">
      <span className="skeleton skeleton-avatar" />
      <span className="skeleton-lines"><i className="skeleton" /><i className="skeleton" /><i className="skeleton skeleton-short" /></span>
    </div>)}
  </div>
}

import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm p-4 text-center" style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 className="mb-2" style={{ fontSize: 36 }}>404</h1>
        <h2 className="h4 mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">The page you are looking for does not exist or was moved.</p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-green">Go Home</Link>
          <Link to="/listings" className="btn btn-outline">Browse Listings</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

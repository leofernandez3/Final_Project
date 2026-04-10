import React from "react";
import { Link } from "react-router-dom";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="card border-0 shadow-sm p-4 text-center" style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2 className="h4 mb-3">Something Went Wrong</h2>
            <p className="text-muted mb-4">Please refresh the page. If the problem continues, try again later.</p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/" className="btn btn-green">Go Home</Link>
              <button className="btn btn-outline" onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;

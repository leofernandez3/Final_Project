function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="container d-flex align-items-center justify-content-between gap-2 py-3 small text-secondary">
        <span className="fw-semibold text-dark">KamerZoeker</span>
        <span>(c) {year} All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;


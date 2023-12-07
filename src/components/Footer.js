import React from 'react';
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          {/* Security and Privacy Policy */}
          <div className="col">
            <a href='/privacy.html' className="footer-link">
              Security and Privacy Policy
            </a>
          </div>

          {/* Acceptable Use Policy */}
          <div className="col">
            <a href="/acceptable-use-policy" className="footer-link">
              Acceptable Use Policy
            </a>
          </div>

          {/* DMCA Notice & Takedown Policy */}
          <div className="col">
            <a href="/dmca-policy" className="footer-link">
              DMCA Notice & Takedown Policy
            </a>
          </div>

          {/* DMCA Takedown Procedure & Tools */}
          <div className="col">
            <a href="/dmca-takedown-procedure" className="footer-link">
              DMCA Takedown Procedure
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

// components/layout/Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="tw-bg-purple-900 tw-text-white tw-py-8">
      <div className="tw-container tw-mx-auto tw-text-center">
        <p>© {new Date().getFullYear()} Futuredu. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
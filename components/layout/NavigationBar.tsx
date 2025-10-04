import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Modal, Badge, NavDropdown } from 'react-bootstrap';
import { 
  FaUser, FaBars, FaTimes, FaGraduationCap, FaBook, 
  FaPencilAlt, FaClipboardCheck, FaShoppingCart, FaChartLine 
} from 'react-icons/fa';
import { LuBrain } from "react-icons/lu";
import { MdDashboard } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useStatus } from '../../context/StatusContext';
import Image from 'next/image';

const NavigationBar = () => {
  const router = useRouter();
  const { isAuthenticated, username, logout } = useAuth();
  const { cartCount, unpaidCount } = useStatus();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('role');
      if (savedRole) {
        setRole(savedRole);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role');
    }
    setShowLogoutModal(false);
    router.push('/');
  };

  const toggleNavbar = () => {
    setExpanded(!expanded);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  const NavLink = ({ href, children, className = "", onClick, badge }: { 
    href: string; 
    children: React.ReactNode; 
    className?: string;
    onClick?: () => void;
    badge?: number;
  }) => (
    <Link href={href} passHref legacyBehavior>
      <Nav.Link 
        className={`${className} ${router.pathname === href ? 'tw-bg-purple-700' : ''} tw-relative`}
        onClick={onClick}
      >
        <div className="tw-flex tw-items-center tw-gap-2">
          {children}
          {badge !== undefined && badge > 0 && (
            <Badge 
              bg="danger" 
              pill 
              className="tw-absolute tw--top-1 tw--right-1 tw-text-xs tw-min-w-[18px] tw-h-[18px] tw-flex tw-items-center tw-justify-center"
              style={{ fontSize: '10px' }}
            >
              {badge}
            </Badge>
          )}
        </div>
      </Nav.Link>
    </Link>
  );

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'Audiowide';
          src: url('/assets/fonts/audiowide-regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        .futuredu-font {
          font-family: 'Audiowide', cursive, sans-serif;
        }
      `}</style>

      <Navbar 
        expand="lg" 
        expanded={expanded}
        className="tw-bg-purple-800 tw-shadow-lg tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-[1055] tw-m-0"
        style={{ height: '64px' }}
      >
        <Container fluid className="tw-px-4 tw-h-full">
          <div className="tw-flex tw-items-center tw-justify-between tw-w-full lg:tw-w-auto">
            <Link href="/" passHref legacyBehavior>
              <Navbar.Brand 
                className="tw-text-white tw-font-bold tw-flex tw-items-center tw-my-0 tw-transition-transform tw-duration-300 hover:tw-scale-105"
                onClick={handleNavClick}
              >
                <div className="tw-bg-white tw-rounded-xl tw-p-1 tw-mr-2 tw-shadow-lg tw-flex tw-items-center tw-justify-center" style={{ width: '48px', height: '48px' }}>
                  <Image 
                    src="/assets/images/Logo_Futuredu.png" 
                    alt="Futuredu Logo" 
                    width={46}
                    height={46}
                    className="tw-object-contain"
                  />
                </div>
                <span className="tw-text-white tw-text-xl tw-drop-shadow-lg futuredu-font">
                  FUTUREDU
                </span>
              </Navbar.Brand>
            </Link>
            
            <Navbar.Toggle 
              aria-controls="basic-navbar-nav" 
              onClick={toggleNavbar}
              className="tw-border-0 tw-p-0 lg:tw-hidden"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <div className="tw-bg-purple-600 tw-rounded-lg tw-p-2 tw-shadow-lg hover:tw-bg-purple-500 tw-transition-colors">
                {expanded ? 
                  <FaTimes className="tw-text-white tw-text-xl" /> : 
                  <FaBars className="tw-text-white tw-text-xl" />
                }
              </div>
            </Navbar.Toggle>
          </div>
          
          <Navbar.Collapse 
            id="basic-navbar-nav" 
            className="lg:tw-flex"
          >
            {/* Desktop Menu */}
            <div className="tw-hidden lg:tw-flex tw-w-full">
              <Nav className="tw-me-auto tw-flex tw-items-center tw-gap-1">
                {/* Show Dashboard only when authenticated, Home only when not */}
                {!isAuthenticated && (
                  <NavLink 
                    href="/" 
                    className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center"
                    onClick={handleNavClick}
                  >
                    <FaBook className="tw-mr-2" /> Home
                  </NavLink>
                )}

                {isAuthenticated && (
                  <NavLink 
                    href="/panel" 
                    className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center"
                    onClick={handleNavClick}
                  >
                    <MdDashboard className="tw-mr-2 tw-text-lg" /> Dashboard
                  </NavLink>
                )}
                
                <NavLink 
                  href="/products" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center"
                  onClick={handleNavClick}
                >
                  <FaPencilAlt className="tw-mr-2" /> Paket Belajar
                </NavLink>
                
                <NavLink 
                  href="/all-courses" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center"
                  onClick={handleNavClick}
                >
                  <FaGraduationCap className="tw-mr-2" /> Materi
                </NavLink>
                
                <NavLink 
                  href="/try-out" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center"
                  onClick={handleNavClick}
                >
                  <FaClipboardCheck className="tw-mr-2" /> Try Out
                </NavLink>

                <NavLink 
                  href="/diagnostic-test" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center"
                  onClick={handleNavClick}
                >
                  <LuBrain className="tw-mr-2 tw-text-lg" /> Asah Kemampuan
                </NavLink>
              </Nav>
              
              {/* Desktop - Logged-in User Menu Items */}
              {isAuthenticated && (
                <Nav className="tw-flex tw-items-center tw-gap-1 tw-mr-3">
                  <NavLink 
                    href="/keranjang" 
                    className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center tw-relative"
                    onClick={handleNavClick}
                    badge={cartCount}
                  >
                    <FaShoppingCart className="tw-mr-2" /> Keranjang
                  </NavLink>
                  
                  <NavLink 
                    href="/transaksi" 
                    className="tw-text-white tw-font-semibold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-lg tw-flex tw-items-center tw-relative"
                    onClick={handleNavClick}
                    badge={unpaidCount}
                  >
                    <FaChartLine className="tw-mr-2" /> Transaksi
                  </NavLink>
                </Nav>
              )}
              
              {/* Desktop - User Account Dropdown */}
              <Nav className="tw-flex tw-items-center">
                {isAuthenticated ? (
                  <NavDropdown
                    title={
                      <div className="tw-bg-purple-600 tw-px-4 tw-py-2 tw-rounded-lg tw-text-white tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-xl tw-flex tw-items-center tw-gap-2 tw-inline-flex">
                        <div className="tw-bg-white tw-rounded-full tw-p-1">
                          <FaUser className="tw-text-purple-700 tw-text-sm" />
                        </div>
                        <span className="tw-font-bold tw-text-sm tw-max-w-[100px] tw-truncate">{username}</span>
                        <svg className="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    }
                    id="account-dropdown"
                    align="end"
                    className="tw-no-caret"
                  >
                    <div className="tw-shadow-2xl tw-rounded-xl tw-overflow-hidden">
                      <Link href="/akun/data-diri" passHref legacyBehavior>
                        <NavDropdown.Item 
                          className="tw-text-purple-900 tw-font-semibold tw-py-3 tw-px-4 hover:tw-bg-purple-50 tw-transition-colors"
                          onClick={handleNavClick}
                        >
                          <div className="tw-flex tw-items-center tw-gap-3">
                            <div className="tw-bg-purple-100 tw-rounded-lg tw-p-2">
                              <FaUser className="tw-text-purple-700" />
                            </div>
                            <span>Profil Saya</span>
                          </div>
                        </NavDropdown.Item>
                      </Link>
                      
                      <NavDropdown.Divider />
                      
                      <NavDropdown.Item 
                        onClick={() => setShowLogoutModal(true)} 
                        className="tw-text-red-600 tw-font-semibold tw-py-3 tw-px-4 hover:tw-bg-red-50 tw-transition-colors"
                      >
                        <div className="tw-flex tw-items-center tw-gap-3">
                          <div className="tw-bg-red-100 tw-rounded-lg tw-p-2">
                            <FaTimes className="tw-text-red-600" />
                          </div>
                          <span>Keluar</span>
                        </div>
                      </NavDropdown.Item>
                    </div>
                  </NavDropdown>
                ) : (
                  <Link href="/login" passHref legacyBehavior>
                    <Nav.Link 
                      className="tw-bg-gradient-to-r tw-from-white tw-to-purple-100 tw-text-purple-900 tw-font-bold tw-px-6 tw-py-2 tw-rounded-lg tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300 hover:tw-scale-105 tw-flex tw-items-center tw-gap-2"
                      onClick={handleNavClick}
                    >
                      <FaUser className="tw-text-purple-800" /> Login
                    </Nav.Link>
                  </Link>
                )}
              </Nav>
            </div>

            {/* Mobile Menu */}
            <div className="lg:tw-hidden tw-w-full">
              <div className="tw-bg-purple-800 tw-py-3 tw-flex tw-flex-col tw-gap-2">
                {/* Show Dashboard only when authenticated, Home only when not */}
                {!isAuthenticated && (
                  <NavLink 
                    href="/" 
                    className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-w-full"
                    onClick={handleNavClick}
                  >
                    <FaBook className="tw-mr-3" /> Home
                  </NavLink>
                )}

                {isAuthenticated && (
                  <NavLink 
                    href="/panel" 
                    className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-w-full"
                    onClick={handleNavClick}
                  >
                    <MdDashboard className="tw-mr-3 tw-text-lg" /> Dashboard
                  </NavLink>
                )}
                
                <NavLink 
                  href="/products" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-w-full"
                  onClick={handleNavClick}
                >
                  <FaPencilAlt className="tw-mr-3" /> Paket Belajar
                </NavLink>
                
                <NavLink 
                  href="/all-courses" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-w-full"
                  onClick={handleNavClick}
                >
                  <FaGraduationCap className="tw-mr-3" /> Materi
                </NavLink>
                
                <NavLink 
                  href="/try-out" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-w-full"
                  onClick={handleNavClick}
                >
                  <FaClipboardCheck className="tw-mr-3" /> Try Out
                </NavLink>

                <NavLink 
                  href="/diagnostic-test" 
                  className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-w-full"
                  onClick={handleNavClick}
                >
                  <LuBrain className="tw-mr-3 tw-text-lg" /> Asah Kemampuan
                </NavLink>

                {/* Mobile - Logged-in User Menu Items */}
                {isAuthenticated && (
                  <>
                    <NavLink 
                      href="/keranjang" 
                      className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-justify-between tw-w-full"
                      onClick={handleNavClick}
                    >
                      <div className="tw-flex tw-items-center">
                        <FaShoppingCart className="tw-mr-3" /> Keranjang
                      </div>
                      {cartCount > 0 && (
                        <Badge bg="danger" pill>{cartCount}</Badge>
                      )}
                    </NavLink>
                    
                    <NavLink 
                      href="/transaksi" 
                      className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-justify-between tw-w-full"
                      onClick={handleNavClick}
                    >
                      <div className="tw-flex tw-items-center">
                        <FaChartLine className="tw-mr-3" /> Transaksi
                      </div>
                      {unpaidCount > 0 && (
                        <Badge bg="danger" pill>{unpaidCount}</Badge>
                      )}
                    </NavLink>

                    <div className="tw-border-t tw-border-purple-700 tw-my-2"></div>

                    <NavLink 
                      href="/akun/data-diri" 
                      className="tw-text-white tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-purple-700 tw-flex tw-items-center tw-w-full"
                      onClick={handleNavClick}
                    >
                      <FaUser className="tw-mr-3" /> Profil Saya
                    </NavLink>

                    <button
                      className="tw-text-red-300 tw-font-semibold tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-red-700 hover:tw-text-white tw-flex tw-items-center tw-w-full tw-text-left tw-border-0 tw-bg-transparent"
                      onClick={() => {
                        handleNavClick();
                        setShowLogoutModal(true);
                      }}
                    >
                      <FaTimes className="tw-mr-3" /> Keluar
                    </button>
                  </>
                )}

                {/* Mobile - Login Button */}
                {!isAuthenticated && (
                  <Link href="/login" passHref legacyBehavior>
                    <Nav.Link 
                      className="tw-bg-gradient-to-r tw-from-white tw-to-purple-100 tw-text-purple-900 tw-font-bold tw-px-6 tw-py-3 tw-rounded-lg tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-2 tw-w-full tw-justify-center tw-mt-2"
                      onClick={handleNavClick}
                    >
                      <FaUser className="tw-text-purple-800" /> Login
                    </Nav.Link>
                  </Link>
                )}
              </div>
            </div>
          </Navbar.Collapse>
        </Container> 
      </Navbar>
      
      {/* Spacer for fixed navbar */}
      <div style={{ height: '64px' }}></div>
      
      {/* Logout Confirmation Modal */}
      <Modal 
        show={showLogoutModal} 
        onHide={() => setShowLogoutModal(false)} 
        backdrop="static"
        centered
        style={{ zIndex: 1060 }}
      >
        <div className="tw-relative" style={{ zIndex: 1070 }}>
          <Modal.Header closeButton className="tw-bg-purple-800 tw-border-0 tw-text-white">
            <Modal.Title className="tw-font-bold tw-flex tw-items-center tw-gap-2">
              <div className="tw-bg-white tw-rounded-full tw-p-2">
                <FaUser className="tw-text-purple-700" />
              </div>
              Konfirmasi Keluar
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tw-bg-purple-50 tw-py-6">
            <p className="tw-text-purple-900 tw-text-lg tw-font-medium tw-mb-0">
              Apakah kamu yakin ingin keluar dari akun?
            </p>
          </Modal.Body>
          <Modal.Footer className="tw-bg-white tw-border-0 tw-gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowLogoutModal(false)}
              className="tw-bg-gray-500 tw-border-0 hover:tw-bg-gray-600 tw-rounded-lg tw-px-6 tw-py-2 tw-font-semibold tw-text-white tw-shadow-md hover:tw-shadow-lg tw-transition-all"
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              onClick={handleLogout}
              className="tw-bg-red-600 tw-border-0 hover:tw-bg-red-700 tw-rounded-lg tw-px-6 tw-py-2 tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
            >
              Keluar
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default NavigationBar;
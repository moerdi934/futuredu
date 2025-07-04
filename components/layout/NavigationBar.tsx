import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, NavDropdown, Modal, Badge } from 'react-bootstrap';
import { FaSearch, FaUser, FaBars, FaTimes, FaGraduationCap, FaBook, FaPencilAlt, FaClipboardCheck, FaBlog, FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useStatus } from '../../context/StatusContext';

const NavigationBar = () => {
  const router = useRouter();
  const { isAuthenticated, username, logout } = useAuth();
  const { cartCount, unpaidCount } = useStatus();
  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('role');
      if (savedRole) {
        setRole(savedRole);
      }
      
      const handleScroll = () => {
        if (window.scrollY > 20) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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

  const NavLink = ({ href, children, className = "", onClick }: { 
    href: string; 
    children: React.ReactNode; 
    className?: string;
    onClick?: () => void;
  }) => (
    <Link href={href} passHref legacyBehavior>
      <Nav.Link 
        className={`${className} ${router.pathname === href ? 'tw-bg-purple-700' : ''}`}
        onClick={onClick}
      >
        {children}
      </Nav.Link>
    </Link>
  );

  return (
    <>
      <Navbar 
        expand="lg" 
        expanded={expanded}
        className={`tw-bg-gradient-to-r tw-from-purple-950 tw-to-purple-800 tw-shadow-xl tw-py-0 tw-fixed tw-top-0 tw-w-full tw-z-40 tw-transition-all tw-duration-300 ${scrolled ? 'tw-shadow-2xl' : 'tw-shadow-lg'}`}
        style={{ minHeight: '60px', maxHeight: scrolled ? '56px' : '60px' }}
      >
        <Container fluid className="tw-p-0">
          <Link href="/" passHref legacyBehavior>
            <Navbar.Brand 
              className="tw-text-white tw-font-bold tw-flex tw-items-center tw-my-0 tw-ml-3 tw-mr-4 tw-transition-transform tw-duration-300 hover:tw-scale-105"
              onClick={handleNavClick}
            >
              <div className="tw-bg-gradient-to-br tw-from-purple-600 tw-to-indigo-700 tw-rounded-lg tw-p-1 tw-mr-2 tw-shadow-lg">
                <FaGraduationCap className="tw-text-white tw-text-xl" />
              </div>
              <span className="tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-white tw-to-purple-200 tw-font-extrabold tw-text-xl">
                Futuredu
              </span>
            </Navbar.Brand>
          </Link>
          
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            onClick={toggleNavbar}
            className="tw-border-0 tw-mr-3"
            style={{ outline: 'none', boxShadow: 'none' }}
          >
            <div className="tw-bg-purple-700 tw-rounded-md tw-p-1 tw-shadow-md">
              {expanded ? 
                <FaTimes className="tw-text-white tw-text-lg" /> : 
                <FaBars className="tw-text-white tw-text-lg" />
              }
            </div>
          </Navbar.Toggle>
          
          <Navbar.Collapse 
            id="basic-navbar-nav" 
            className={`tw-mt-0 tw-transition-all tw-duration-300 ${expanded ? 'tw-bg-purple-900 lg:tw-bg-transparent tw-px-3 tw-py-2 tw-rounded-b-lg tw-shadow-lg' : ''}`}
          >
            <Nav className="tw-me-auto tw-mb-2 lg:tw-mb-0 tw-flex tw-items-center">
              <NavLink 
                href="/" 
                className="tw-text-white tw-font-medium tw-mx-1 tw-px-3 tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-md tw-flex tw-items-center tw-py-1"
                onClick={handleNavClick}
              >
                <FaBook className="tw-mr-1" /> Home
              </NavLink>
              
              <NavLink 
                href="/products" 
                className="tw-text-white tw-font-medium tw-mx-1 tw-px-3 tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-md tw-flex tw-items-center tw-py-1"
                onClick={handleNavClick}
              >
                <FaPencilAlt className="tw-mr-1" /> Paket Belajar
              </NavLink>
              
              <NavLink 
                href="/ruang-belajar" 
                className="tw-text-white tw-font-medium tw-mx-1 tw-px-3 tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-md tw-flex tw-items-center tw-py-1"
                onClick={handleNavClick}
              >
                <FaGraduationCap className="tw-mr-1" /> Mulai Belajar
              </NavLink>
              
              <NavLink 
                href="/try-out" 
                className="tw-text-white tw-font-medium tw-mx-1 tw-px-3 tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-md tw-flex tw-items-center tw-py-1"
                onClick={handleNavClick}
              >
                <FaClipboardCheck className="tw-mr-1" /> Try Out
              </NavLink>
              
              <Nav.Link 
                onClick={handleShowModal} 
                className="tw-text-white tw-font-medium tw-mx-1 tw-px-3 tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-purple-700 hover:tw-shadow-md tw-flex tw-items-center tw-py-1"
              >
                <FaBlog className="tw-mr-1" /> Blog
              </Nav.Link>
            </Nav>
            
            <Form className="tw-flex tw-flex-grow-1 lg:tw-w-4/12 tw-mx-auto tw-my-1 lg:tw-my-0">
              <div className="tw-flex tw-w-full tw-relative tw-rounded-full tw-overflow-hidden tw-shadow-lg tw-bg-white">
                <FormControl
                  type="search"
                  placeholder="Mau belajar apa hari ini?"
                  aria-label="Search"
                  className="tw-border-0 tw-bg-white tw-text-purple-900 tw-placeholder-purple-400 tw-pr-12 tw-pl-4 tw-py-0 tw-text-sm tw-rounded-full"
                  style={{ height: '38px' }}
                />
                <Button 
                  variant="outline-light" 
                  className="tw-absolute tw-right-0 tw-top-0 tw-h-full tw-bg-gradient-to-r tw-from-purple-700 tw-to-purple-900 tw-rounded-r-full tw-border-0 tw-px-3 tw-transition-all tw-duration-300 hover:tw-from-purple-800 hover:tw-to-purple-950"
                >
                  <FaSearch className="tw-text-white" />
                </Button>
              </div>
            </Form>
            
            <Nav className="tw-ml-2 lg:tw-ml-4 tw-flex tw-items-center">
              {isAuthenticated ? (
                <>
                  <style jsx>{`
                    .custom-dropdown :global(.dropdown-toggle::after) {
                      position: absolute;
                      right: 12px;
                      top: 50%;
                      transform: translateY(-50%);
                    }
                  `}</style>
                  
                  <NavDropdown 
                    title={
                      <div className="tw-flex tw-items-center tw-relative" style={{ width: '140px', paddingRight: '15px' }}>
                        <div className="tw-bg-gradient-to-r tw-from-purple-700 tw-to-purple-900 tw-px-4 tw-py-1 tw-rounded-full tw-text-white tw-shadow-md tw-transition-all tw-duration-300 hover:tw-from-purple-800 hover:tw-to-purple-950 tw-flex tw-items-center tw-justify-between tw-w-full">
                          <div className="tw-flex tw-items-center">
                            <FaUser className="tw-mr-2 tw-text-sm" />
                            <span className="tw-font-medium tw-truncate">{username}</span>
                          </div>
                          <div style={{ width: '10px' }}></div>
                        </div>
                      </div>
                    } 
                    id="account-dropdown" 
                    className="tw-mx-auto lg:tw-mx-2 tw-flex custom-dropdown"
                    align="end"
                  >
                    <div className="tw-z-50 tw-py-1 tw-shadow-xl tw-rounded-xl tw-bg-white">
                      <Link href="/akun/data-diri" passHref legacyBehavior>
                        <NavDropdown.Item 
                          className="tw-text-purple-900 tw-font-medium tw-py-2 tw-text-sm hover:tw-bg-purple-50"
                          onClick={handleNavClick}
                        >
                          <div className="tw-flex tw-items-center tw-px-2">
                            <FaUser className="tw-mr-2 tw-text-purple-700" /> Akun
                          </div>
                        </NavDropdown.Item>
                      </Link>

                      <Link href="/keranjang" passHref legacyBehavior>
                        <NavDropdown.Item
                          className="tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2"
                          onClick={handleNavClick}
                        >
                          <div className="tw-flex tw-items-center">
                            <FaShoppingCart className="tw-mr-2 tw-text-purple-700" />
                            Keranjang
                          </div>
                          {cartCount > 0 && (
                            <Badge bg="warning" text="dark" pill>
                              {cartCount}
                            </Badge>
                          )}
                        </NavDropdown.Item>
                      </Link>

                      <Link href="/transaksi" passHref legacyBehavior>
                        <NavDropdown.Item
                          className="tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2"
                          onClick={handleNavClick}
                        >
                          <div className="tw-flex tw-items-center">
                            <FaClipboardCheck className="tw-mr-2 tw-text-purple-700" />
                            Transaksi
                          </div>
                          {unpaidCount > 0 && (
                            <Badge bg="danger" pill className="tw-ml-auto">
                              {unpaidCount}
                            </Badge>
                          )}
                        </NavDropdown.Item>
                      </Link>

                      <Link href="/my-courses" passHref legacyBehavior>
                        <NavDropdown.Item 
                          className="tw-text-purple-900 tw-font-medium tw-py-2 tw-text-sm hover:tw-bg-purple-50"
                          onClick={handleNavClick}
                        >
                          <div className="tw-flex tw-items-center tw-px-2">
                            <FaGraduationCap className="tw-mr-2 tw-text-purple-700" /> Paket Saya
                          </div>
                        </NavDropdown.Item>
                      </Link>

                      <Link href="/konsultasi" passHref legacyBehavior>
                        <NavDropdown.Item 
                          className="tw-text-purple-900 tw-font-medium tw-py-2 tw-text-sm hover:tw-bg-purple-50"
                          onClick={handleNavClick}
                        >
                          <div className="tw-flex tw-items-center tw-px-2">
                            <FaPencilAlt className="tw-mr-2 tw-text-purple-700" /> Konsultasi
                          </div>
                        </NavDropdown.Item>
                      </Link>
                      
                      {role && (
                        <>
                          <NavDropdown.Divider />
                          <Link href="/panel" passHref legacyBehavior>
                            <NavDropdown.Item 
                              className="tw-text-purple-900 tw-font-medium tw-py-2 tw-text-sm hover:tw-bg-purple-50"
                              onClick={handleNavClick}
                            >
                              <div className="tw-flex tw-items-center tw-px-2">
                                <FaClipboardCheck className="tw-mr-2 tw-text-purple-700" /> 
                                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                              </div>
                            </NavDropdown.Item>
                          </Link>
                        </>
                      )}
                      
                      <NavDropdown.Divider />
                      <NavDropdown.Item 
                        onClick={() => setShowLogoutModal(true)} 
                        className="tw-text-red-500 tw-font-medium tw-py-2 tw-text-sm hover:tw-bg-red-50"
                      >
                        <div className="tw-flex tw-items-center tw-px-2">
                          <FaTimes className="tw-mr-2" /> Keluar
                        </div>
                      </NavDropdown.Item>
                    </div>
                  </NavDropdown>
                </>
              ) : (
                <Link href="/login" passHref legacyBehavior>
                  <Nav.Link 
                    className="tw-bg-gradient-to-r tw-from-white tw-to-purple-100 tw-text-purple-900 tw-font-bold tw-px-4 tw-py-1 tw-rounded-full tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-300 tw-mx-2 tw-text-sm tw-flex tw-items-center"
                    onClick={handleNavClick}
                  >
                    <FaUser className="tw-mr-2 tw-text-purple-800" /> Login
                  </Nav.Link>
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container> 
      </Navbar>
      
      <div className="tw-h-16"></div>
      
      <Modal show={showModal} onHide={handleCloseModal} className="tw-z-50" centered>
        <Modal.Header closeButton className="tw-bg-gradient-to-br tw-from-purple-100 tw-to-purple-200 tw-border-b-0">
          <Modal.Title className="tw-text-purple-900 tw-font-bold tw-flex tw-items-center">
            <FaBlog className="tw-mr-2 tw-text-purple-700" /> Coming Soon
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-white">
          <p className="tw-text-purple-900 tw-py-2">Fitur blog akan segera hadir. Mohon tunggu update selanjutnya!</p>
        </Modal.Body>
        <Modal.Footer className="tw-bg-gradient-to-br tw-from-white tw-to-purple-50 tw-border-t-0">
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}
            className="tw-bg-gradient-to-r tw-from-purple-700 tw-to-purple-900 tw-border-0 hover:tw-from-purple-800 hover:tw-to-purple-950 tw-rounded-full tw-px-4 tw-font-medium tw-shadow-md"
          >
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Modal 
        show={showLogoutModal} 
        onHide={() => setShowLogoutModal(false)} 
        dialogClassName="tw-relative" 
        backdrop="static"
        centered
        style={{ zIndex: 1060 }}
      >
        <div style={{ position: 'relative', zIndex: 1070 }}>
          <Modal.Header closeButton className="tw-bg-gradient-to-br tw-from-purple-100 tw-to-purple-200 tw-border-b-0">
            <Modal.Title className="tw-text-purple-900 tw-font-bold tw-flex tw-items-center">
              <FaUser className="tw-mr-2 tw-text-purple-700" /> Konfirmasi Keluar
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-white">
            <p className="tw-text-purple-900 tw-py-2">Apakah kamu yakin ingin keluar dari akun?</p>
          </Modal.Body>
          <Modal.Footer className="tw-bg-gradient-to-br tw-from-white tw-to-purple-50 tw-border-t-0">
            <Button 
              variant="secondary" 
              onClick={() => setShowLogoutModal(false)}
              className="tw-bg-gray-300 tw-border-0 hover:tw-bg-gray-400 tw-rounded-full tw-px-4 tw-font-medium tw-text-gray-700 tw-shadow-md"
              style={{ position: 'relative', zIndex: 1080 }}
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              onClick={handleLogout}
              className="tw-bg-gradient-to-r tw-from-red-500 tw-to-red-700 tw-border-0 hover:tw-from-red-600 hover:tw-to-red-800 tw-rounded-full tw-px-4 tw-font-medium tw-shadow-md"
              style={{ position: 'relative', zIndex: 1080 }}
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
'use client';

import React, { useState, useMemo } from 'react';
import { Nav, Container, Button, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext'; // Sesuaikan path dengan struktur project Anda
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileQuestion,
  Newspaper,
  CreditCard,
  Calendar,
  MessageSquare,
  UserPlus,
  UserCog,
  Shield,
  UserCheck,
  BookOpen,
  Edit,
  FileText,
  BarChart,
  MessageCircle,
  HelpCircle,
  Award,
  FileEdit,
  PenTool,
  FolderEdit,
  Tags,
  FileBox,
  Mail,
  Bell,
  Phone,
  Share2,
  TicketCheck,
  DollarSign,
  Receipt,
  CreditCard as Payment,
  Percent,
  RefreshCcw,
  Wallet,
  Building,
  Tag,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  ListTodo,
  PartyPopper,
  Flag,
  Trophy,
  School,
  Command,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  LucideIcon
} from 'lucide-react';

// Types
interface SubMenuItem {
  icon: LucideIcon;
  text: string;
  path: string;
  roles?: string[];
}

interface MenuItem {
  icon: LucideIcon;
  text: string;
  path: string;
  roles?: string[];
  subItems?: SubMenuItem[];
}

type UserRole = 'admin' | 'teacher' | 'student';

// Menu Data
const menuData: MenuItem[] = [
  {
    icon: LayoutDashboard,
    text: 'Dashboard',
    path: '/panel',
    roles: ['admin', 'teacher', 'student']
  },
  {
    icon: Users,
    text: 'Users',
    path: '/panel/users',
    roles: ['admin'],
    subItems: [
      { icon: Users, text: 'Students', path: '/panel/users/students', roles: ['admin'] },
      { icon: UserPlus, text: 'Edit Student', path: '/panel/users/students/edit', roles: ['admin'] },
      { icon: UserCheck, text: 'Teachers', path: '/panel/users/teachers', roles: ['admin'] },
      { icon: UserCog, text: 'Edit Teacher', path: '/panel/users/teachers/edit', roles: ['admin'] },
      { icon: Shield, text: 'Admins', path: '/panel/users/admins', roles: ['admin'] },
      { icon: UserCog, text: 'Update Admin', path: '/panel/users/admins/edit', roles: ['admin'] },
      { icon: Shield, text: 'Roles', path: '/panel/users/roles', roles: ['admin'] }
    ]
  },
  {
    icon: GraduationCap,
    text: 'Courses',
    path: '/panel/courses',
    roles: ['admin', 'teacher', 'student'],
    subItems: [
      { icon: School, text: 'Classes', path: '/panel/courses/dashboard', roles: ['admin', 'teacher'] },
      { icon: GraduationCap, text: 'Edit Classes', path: '/panel/courses/edit-classes', roles: ['admin'] },
      { icon: BookOpen, text: 'Courses', path: '/panel/courses/list', roles: ['admin', 'teacher', 'student'] },
      { icon: Edit, text: 'Edit Courses', path: '/panel/courses/edit', roles: ['admin', 'teacher'] },
      { icon: FileText, text: 'Request Courses', path: '/panel/courses/requests', roles: ['admin', 'teacher', 'student'] },
      { icon: BarChart, text: 'Progress', path: '/panel/courses/progress', roles: ['admin', 'teacher', 'student'] },
      { icon: Tags, text: 'Course Categories', path: '/panel/courses/categories', roles: ['admin'] },
      { icon: FileBox, text: 'Packages', path: '/panel/courses/packages', roles: ['admin', 'student'] },
      { icon: MessageCircle, text: 'Discussion', path: '/panel/courses/discussion', roles: ['admin', 'teacher', 'student'] },
      { icon: HelpCircle, text: 'Q&A', path: '/panel/courses/qa', roles: ['admin', 'teacher', 'student'] },
      { icon: MessageCircle, text: 'Reviews', path: '/panel/courses/reviews', roles: ['admin', 'teacher', 'student'] },
      { icon: Award, text: 'Certificates', path: '/panel/courses/certificates', roles: ['admin', 'teacher', 'student'] }
    ]
  },
  {
    icon: FileQuestion,
    text: 'Exam',
    path: '/panel/exam',
    roles: ['admin', 'teacher', 'student'],
    subItems: [
      { icon: FileText, text: 'Exams', path: '/panel/exam/dashboard', roles: ['admin', 'teacher', 'student'] },
      { icon: FileEdit, text: 'Exam Schedules', path: '/panel/exam/exam-schedules', roles: ['admin', 'teacher'] },
      { icon: PenTool, text: 'Questions', path: '/panel/exam/question-dashboard', roles: ['admin', 'teacher'] },
      { icon: Edit, text: 'Edit Question', path: '/panel/exam/questions', roles: ['admin', 'teacher'] },
      { icon: FolderEdit, text: 'Exam Categories', path: '/panel/exam/categories', roles: ['admin'] },
      { icon: Tags, text: 'Question Categories', path: '/panel/exam/question-categories', roles: ['admin'] },
      { icon: Trophy, text: 'Ranking', path: '/panel/exam/ranking', roles: ['admin', 'teacher', 'student'] },
      { icon: Flag, text: 'Progress', path: '/panel/exam/progress', roles: ['admin', 'teacher', 'student'] }
    ]
  },
  {
    icon: Newspaper,
    text: 'Blog',
    path: '/panel/blog',
    roles: ['admin', 'teacher'],
    subItems: [
      { icon: FileText, text: 'Contents', path: '/panel/blog/contents', roles: ['admin', 'teacher'] },
      { icon: Tags, text: 'Categories', path: '/panel/blog/categories', roles: ['admin'] },
      { icon: FileEdit, text: 'Add Contents', path: '/panel/blog/contents/add', roles: ['admin', 'teacher'] },
      { icon: FileBox, text: 'Drafts', path: '/panel/blog/drafts', roles: ['admin', 'teacher'] },
      { icon: MessageCircle, text: 'Comments', path: '/panel/blog/comments', roles: ['admin', 'teacher'] },
      { icon: BarChart, text: 'Activity', path: '/panel/blog/activity', roles: ['admin'] },
      { icon: Tag, text: 'SEO', path: '/panel/blog/seo', roles: ['admin'] },
      { icon: DollarSign, text: 'Ads', path: '/panel/blog/ads', roles: ['admin'] }
    ]
  },
  {
    icon: CreditCard,
    text: 'Payment',
    path: '/panel/payment',
    roles: ['admin'],
    subItems: [
      { icon: DollarSign, text: 'Revenue', path: '/panel/payment/revenue', roles: ['admin'] },
      { icon: Receipt, text: 'Transactions', path: '/panel/payment/transactions', roles: ['admin'] },
      { icon: Payment, text: 'Payment Methods', path: '/panel/payment/methods', roles: ['admin'] },
      { icon: Percent, text: 'Taxes', path: '/panel/payment/taxes', roles: ['admin'] },
      { icon: Tag, text: 'Discounts', path: '/panel/payment/discounts', roles: ['admin'] },
      { icon: DollarSign, text: 'Commisions', path: '/panel/payment/commisions', roles: ['admin'] },
      { icon: RefreshCcw, text: 'Refunds', path: '/panel/payment/refunds', roles: ['admin'] },
      { icon: Wallet, text: 'Salaries', path: '/panel/payment/salaries', roles: ['admin'] },
      { icon: Building, text: 'Operational', path: '/panel/payment/operational', roles: ['admin'] },
      { icon: Tag, text: 'Promotion', path: '/panel/payment/promotion', roles: ['admin'] },
      { icon: PartyPopper, text: 'Events', path: '/panel/payment/events', roles: ['admin'] }
    ]
  },
  {
    icon: Calendar,
    text: 'Calendar',
    path: '/panel/calendar',
    roles: ['admin', 'teacher', 'student'],
    subItems: [
      { icon: CalendarDays, text: 'Calendar', path: '/panel/calendar/schedules', roles: ['admin', 'teacher', 'student'] },
      { icon: Users, text: 'Classes', path: '/panel/calendar/classes', roles: ['admin', 'teacher', 'student'] },
      { icon: FileQuestion, text: 'Exams', path: '/panel/calendar/exams', roles: ['admin', 'teacher', 'student'] },
      { icon: ListTodo, text: 'Tasks', path: '/panel/calendar/tasks', roles: ['admin', 'teacher', 'student'] },
      { icon: CalendarCheck, text: 'Events', path: '/panel/calendar/events', roles: ['admin', 'teacher', 'student'] },
      { icon: CalendarClock, text: 'Promotion', path: '/panel/calendar/promotion', roles: ['admin'] }
    ]
  },
  {
    icon: MessageSquare,
    text: 'Messages',
    path: '/panel/messages',
    roles: ['admin', 'teacher', 'student'],
    subItems: [
      { icon: MessageSquare, text: 'Messages In', path: '/panel/messages/inbox', roles: ['admin', 'teacher', 'student'] },
      { icon: Share2, text: 'Broadcast', path: '/panel/messages/broadcast', roles: ['admin'] },
      { icon: FileText, text: 'Templates', path: '/panel/messages/templates', roles: ['admin'] },
      { icon: Mail, text: 'Email', path: '/panel/messages/email', roles: ['admin', 'teacher', 'student'] },
      { icon: Bell, text: 'Notification', path: '/panel/messages/notifications', roles: ['admin', 'teacher', 'student'] },
      { icon: Phone, text: 'Phone', path: '/panel/messages/phone', roles: ['admin', 'teacher', 'student'] },
      { icon: Share2, text: 'Social Media', path: '/panel/messages/social', roles: ['admin'] },
      { icon: TicketCheck, text: 'Support Tickets', path: '/panel/messages/support', roles: ['admin', 'teacher', 'student'] }
    ]
  }
];

// Submenu Component
interface SidebarSubmenuProps {
  subItems: SubMenuItem[];
  userRole: UserRole;
}

const SidebarSubmenu: React.FC<SidebarSubmenuProps> = ({ subItems, userRole }) => {
  const filteredSubItems = subItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className="submenu ps-4 bg-purple-900">
      {filteredSubItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link 
            key={index} 
            href={item.path}
            className="submenu-item d-flex align-items-center text-decoration-none py-2 px-3 text-purple-200 hover:bg-purple-700 hover:text-white"
          >
            <Icon size={16} className="me-2" />
            <span>{item.text}</span>
          </Link>
        );
      })}
    </div>
  );
};

// Nav Item Component
interface SidebarNavItemProps {
  item: MenuItem;
  isExpanded: boolean;
  activeMenu: string | null;
  onMenuClick: (menuPath: string) => void;
  userRole: UserRole;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ 
  item, 
  isExpanded, 
  activeMenu,
  onMenuClick,
  userRole
}) => {
  const isActive = activeMenu === item.path;
  const Icon = item.icon;

  const handleClick = () => {
    onMenuClick(item.path);
  };

  const navLinkStyle = {
    marginLeft: '1.2rem',
    marginRight: '1.1rem',
    color: 'white',
    cursor: 'pointer'
  };

  const iconStyle = {
    color: 'white'
  };

  return (
    <div className="nav-item">
      <Nav.Link 
        className={`d-flex align-items-center justify-content-between ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        style={navLinkStyle}
      >
        <div className="d-flex align-items-center gap-2">
          <Icon size={20} style={iconStyle} />
          {isExpanded && <span>{item.text}</span>}
        </div>
        {isExpanded && item.subItems && (
          <div className="ms-2">
            {isActive ? <ChevronDown size={16} style={iconStyle} /> : <ChevronRight size={16} style={iconStyle} />}
          </div>
        )}
      </Nav.Link>
      {item.subItems && isExpanded && isActive && (
        <SidebarSubmenu subItems={item.subItems} userRole={userRole} />
      )}
    </div>
  );
};

// Header Component
interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isExpanded, onToggle }) => {
  return (
    <div className="sidebar-header border-bottom border-purple-700 p-3 mt-3">
      {isExpanded ? (
        <div className="d-flex flex-column">
          <div className="tw-flex tw-justify-end">
            <button 
              className="sidebar-toggle mb-3" 
              onClick={onToggle}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-center mt-2 mb-3">
            <Command size={24} className="text-white me-2" />
            <h5 className="mb-0 fw-bold text-white">CRM AdminX</h5>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center mb-3">
          <button 
            className="sidebar-toggle tw-mx-auto tw-py-1 mb-3" 
            onClick={onToggle}
          >
            <ChevronRight size={20} />
          </button>
          <Command size={24} className="text-white mt-2" />
        </div>
      )}
    </div>
  );
};

// Navigation Component with useAuth - FIXED
interface SidebarNavProps {
  isExpanded: boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ isExpanded }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { isAuthenticated, role } = useAuth(); // Menggunakan role langsung dari AuthContext
  console.log('is auth', isAuthenticated, 'role', role)

  const handleMenuClick = (menuPath: string) => {
    setActiveMenu(activeMenu === menuPath ? null : menuPath);
  };

  const filteredMenuItems = useMemo(() => {
    // Jika tidak authenticated, return empty array
    if (!isAuthenticated || !role) {
      return [];
    }

    // Ambil role dari AuthContext
    const userRole = role as UserRole;
    
    // Validasi role
    const validRoles: UserRole[] = ['admin', 'teacher', 'student'];
    if (!validRoles.includes(userRole)) {
      console.warn('Invalid user role:', userRole);
      return [];
    }

    const filtered = menuData.filter(item => 
      !item.roles || item.roles.includes(userRole)
    );
    
    console.log('User Role:', userRole);
    console.log('Filtered Menu Items:', filtered.length);
    
    return filtered;
  }, [isAuthenticated, role]);

  // User not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-3 text-white text-center">
        <p>Please login to access menu</p>
      </div>
    );
  }

  // No menu items
  if (filteredMenuItems.length === 0) {
    return (
      <div className="p-3 text-white text-center">
        <p>No menu items available for your role</p>
      </div>
    );
  }

  return (
    <Nav className="sidebar-nav flex-column mt-2 tw-text-white">
      {filteredMenuItems.map((item, index) => (
        <SidebarNavItem
          key={index}
          item={item}
          isExpanded={isExpanded}
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          userRole={role as UserRole}
        />
      ))}
    </Nav>
  );
};

// Footer Component with useAuth
interface SidebarFooterProps {
  isExpanded: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isExpanded }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth(); // Menggunakan logout dari useAuth

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="mt-auto p-3">
        <Button
          variant="outline-light"
          className="logout-crm w-100 d-flex align-items-center gap-2 justify-content-center border-white"
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut size={20} />
          {isExpanded && <span>Logout</span>}
        </Button>
      </div>

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Keluar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Apakah kamu yakin ingin keluar?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleLogout}>
            Keluar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// Main Sidebar Component
interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  return (
    <div className={`sidebar ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <SidebarHeader isExpanded={isExpanded} onToggle={onToggle} />
      <SidebarNav isExpanded={isExpanded} />
      <SidebarFooter isExpanded={isExpanded} />
    </div>
  );
};

// Main Layout Component
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <Sidebar 
        isExpanded={isExpanded} 
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      <main className={`${isExpanded ? 'main-content' : 'main-content-collapsed'}`}>
        <Container fluid className="p-4">
          {children}
        </Container>
      </main>
    </>
  );
};

export default MainLayout;
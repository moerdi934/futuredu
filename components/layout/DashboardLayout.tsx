// components/layout/DashboardLayout.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Nav, Container, Button, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';
import NavigationBar from './NavigationBar';

// Types
interface SubMenuItem {
  icon: any;
  text: string;
  path: string;
  roles?: string[];
}

interface MenuItem {
  icon: any;
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
      { icon: GraduationCap, text: 'Edit Classes', path: '/panel/courses/classes-page', roles: ['admin','teacher','student','Student'] },
      { icon: BookOpen, text: 'Courses', path: '/panel/courses/list', roles: ['admin', 'teacher', 'student'] },
      { icon: Edit, text: 'Edit Courses', path: '/panel/courses/courses-page', roles: ['admin', 'teacher'] },
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
      { icon: CreditCard, text: 'Payment Methods', path: '/panel/payment/methods', roles: ['admin'] },
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
    <div className="submenu tw-ps-3 tw-bg-purple-900 tw-mt-1">
      {filteredSubItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link 
            key={index} 
            href={item.path}
            className="submenu-item tw-flex tw-items-center tw-no-underline tw-py-2 tw-px-3 tw-my-1 tw-text-purple-200 hover:tw-bg-purple-700 hover:tw-text-white tw-transition-all tw-rounded-lg tw-border-2 tw-border-transparent hover:tw-border-purple-500"
          >
            <Icon size={16} className="tw-mr-2 tw-flex-shrink-0" />
            <span className="tw-text-sm tw-font-medium">{item.text}</span>
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

  return (
    <div className="nav-item tw-px-2">
      <Nav.Link 
        className={`tw-flex tw-items-center tw-px-3 tw-py-2.5 tw-my-1 tw-rounded-lg tw-text-white tw-transition-all tw-cursor-pointer tw-border-2 ${
          isActive 
            ? 'tw-bg-purple-700 tw-shadow-lg tw-border-purple-500' 
            : 'tw-border-transparent hover:tw-bg-purple-700 hover:tw-border-purple-500 hover:tw-shadow-md'
        } ${isExpanded ? 'tw-justify-between' : 'tw-justify-center'}`}
        onClick={handleClick}
      >
        <div className={`tw-flex tw-items-center tw-gap-2.5 ${!isExpanded && 'tw-justify-center'}`}>
          <Icon size={20} className="tw-flex-shrink-0" />
          {isExpanded && <span className="tw-text-sm tw-font-semibold tw-whitespace-nowrap">{item.text}</span>}
        </div>
        {isExpanded && item.subItems && (
          <div className="tw-ml-2">
            {isActive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
    <div className="sidebar-header tw-border-b-2 tw-border-purple-700 tw-p-3">
      <div className="tw-flex tw-justify-center">
        <button 
          className="toggle-btn-modern tw-group tw-relative tw-rounded-xl tw-text-white tw-transition-all tw-duration-300 tw-border-2 tw-border-purple-600 hover:tw-border-purple-400 tw-bg-gradient-to-br tw-from-purple-700 tw-to-purple-900 hover:tw-from-purple-600 hover:tw-to-purple-800 tw-shadow-lg hover:tw-shadow-2xl hover:tw-scale-110 lg:tw-p-3 tw-p-2" 
          onClick={onToggle}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <div className="tw-relative tw-flex tw-items-center tw-justify-center">
            {isExpanded ? (
              <>
                <ChevronLeft size={20} className="tw-transition-transform tw-duration-300 group-hover:tw--translate-x-1 chevron-main" />
                <ChevronLeft size={20} className="tw-absolute tw-transition-all tw-duration-300 tw-opacity-0 group-hover:tw-opacity-100 group-hover:tw--translate-x-2 chevron-double" />
              </>
            ) : (
              <>
                <ChevronRight size={20} className="tw-transition-transform tw-duration-300 group-hover:tw-translate-x-1 chevron-main" />
                <ChevronRight size={20} className="tw-absolute tw-transition-all tw-duration-300 tw-opacity-0 group-hover:tw-opacity-100 group-hover:tw-translate-x-2 chevron-double" />
              </>
            )}
          </div>
          <div className="tw-absolute tw-inset-0 tw-rounded-xl tw-bg-white tw-opacity-0 group-hover:tw-opacity-10 tw-transition-opacity tw-duration-300 ripple-effect"></div>
        </button>
      </div>
    </div>
  );
};

// Navigation Component
interface SidebarNavProps {
  isExpanded: boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ isExpanded }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { isAuthenticated, role } = useAuth();

  const handleMenuClick = (menuPath: string) => {
    setActiveMenu(activeMenu === menuPath ? null : menuPath);
  };

  const filteredMenuItems = useMemo(() => {
    if (!isAuthenticated || !role) {
      return [];
    }

    const userRole = role as UserRole;
    
    const validRoles: UserRole[] = ['admin', 'teacher', 'student'];
    if (!validRoles.includes(userRole)) {
      return [];
    }

    const filtered = menuData.filter(item => 
      !item.roles || item.roles.includes(userRole)
    );
    
    return filtered;
  }, [isAuthenticated, role]);

  if (!isAuthenticated) {
    return (
      <div className="tw-p-3 tw-text-white tw-text-center">
        <p className="tw-text-sm">Please login to access menu</p>
      </div>
    );
  }

  if (filteredMenuItems.length === 0) {
    return (
      <div className="tw-p-3 tw-text-white tw-text-center">
        <p className="tw-text-sm">No menu items available for your role</p>
      </div>
    );
  }

  return (
    <Nav className="sidebar-nav tw-flex tw-flex-col tw-mt-2 tw-text-white">
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

// Footer Component
interface SidebarFooterProps {
  isExpanded: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isExpanded }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="tw-mt-auto tw-p-3">
        <Button
          variant="outline-light"
          className={`logout-crm tw-w-full tw-flex tw-items-center tw-gap-2 tw-border-2 tw-border-white hover:tw-bg-purple-700 hover:tw-border-purple-400 tw-transition-all tw-font-semibold tw-py-2.5 tw-rounded-lg tw-shadow-md hover:tw-shadow-lg ${
            isExpanded ? 'tw-justify-center' : 'tw-justify-center tw-px-2'
          }`}
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut size={20} />
          {isExpanded && <span>Logout</span>}
        </Button>
      </div>

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <div className="tw-rounded-xl tw-overflow-hidden tw-border-4 tw-border-purple-300">
          <Modal.Header closeButton className="tw-bg-purple-800 tw-border-0 tw-text-white">
            <Modal.Title className="tw-font-bold tw-flex tw-items-center tw-gap-3">
              <div className="tw-bg-white tw-rounded-full tw-p-2 tw-shadow-lg tw-border-2 tw-border-purple-300">
                <LogOut className="tw-text-purple-700" />
              </div>
              Konfirmasi Keluar
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tw-bg-purple-50 tw-py-6">
            <p className="tw-text-purple-900 tw-text-lg tw-font-medium tw-mb-0 tw-text-center">
              Apakah kamu yakin ingin keluar?
            </p>
          </Modal.Body>
          <Modal.Footer className="tw-bg-white tw-border-0 tw-gap-3 tw-justify-center">
            <Button 
              variant="secondary" 
              onClick={() => setShowLogoutModal(false)}
              className="tw-bg-gray-500 tw-border-0 hover:tw-bg-gray-600 tw-rounded-lg tw-px-6 tw-py-2 tw-font-bold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              onClick={handleLogout}
              className="tw-bg-red-600 tw-border-0 hover:tw-bg-red-700 tw-rounded-lg tw-px-6 tw-py-2 tw-font-bold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
            >
              Keluar
            </Button>
          </Modal.Footer>
        </div>
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
    <div 
      className={`sidebar tw-bg-purple-800 tw-flex tw-flex-col tw-border-r-2 tw-border-purple-700 tw-shadow-lg ${
        isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'
      }`}
      style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        height: 'calc(100vh - 64px)',
        zIndex: 1050,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.3s ease',
        marginTop: 0,
        paddingTop: 0
      }}
    >
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
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    
    // Auto-collapse on small screens
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsExpanded(false);
    }
  }, []);

  const getSidebarWidth = () => {
    if (!isMounted || typeof window === 'undefined') {
      return isExpanded ? '280px' : '80px';
    }
    
    // Mobile screens - smaller widths
    if (window.innerWidth < 768) {
      return isExpanded ? '200px' : '60px';
    }
    
    // Desktop screens - normal widths
    return isExpanded ? '280px' : '80px';
  };

  return (
    <>
      <NavigationBar />
      
      <div style={{ paddingTop: '2px' }}>
        <Sidebar 
          isExpanded={isExpanded} 
          onToggle={() => setIsExpanded(!isExpanded)}
        />
        
        <main 
          className={`tw-transition-all tw-duration-300 tw-min-h-screen  ${
            isExpanded ? 'main-content' : 'main-content-collapsed'
          }`}
          style={{
            marginLeft: getSidebarWidth(),
            minHeight: 'calc(100vh - 64px)',
            paddingTop: '1rem',
            backgroundColor: '#e7eaeeff'
          }}
        >
          <Container fluid className="tw-p-3 sm:tw-p-4 lg:tw-p-6">
            {children}
          </Container>
        </main>
      </div>
    </>
  );
};

export default MainLayout;
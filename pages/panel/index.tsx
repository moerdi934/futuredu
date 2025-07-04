'use client';

import React from 'react';
import { Row, Col, Card, Table, Image } from 'react-bootstrap';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
// Types
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  trend: number;
}

interface Customer {
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  lastOrder: string;
  avatar: string;
}

type UserRole = 'admin' | 'teacher' | 'student';

// Dashboard Header Component
const DashboardHeader: React.FC<{ role?: string }> = ({ role }) => {
  return (
    <div className="mb-4">
      <h1 className="h3">Dashboard Overview</h1>
      <p className="text-muted">Welcome back, {role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'Student'}</p>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, trend }) => (
  <Card className="h-100">
    <Card.Body className="d-flex justify-content-between align-items-start">
      <div>
        <Card.Text className="text-muted mb-1">{title}</Card.Text>
        <h3 className="mb-2">{value}</h3>
        <Card.Text className={`small ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </Card.Text>
      </div>
      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
        <Icon className="text-primary" size={24} />
      </div>
    </Card.Body>
  </Card>
);

// Dashboard Stats Component
const DashboardStats: React.FC<{ role?: string }> = ({ role }) => {
  const stats = [
    { icon: Users, title: 'Total Customers', value: '1,482', trend: 12.5 },
    { icon: DollarSign, title: 'Revenue', value: '$86,589', trend: 8.2 },
    { icon: ShoppingCart, title: 'Orders', value: '684', trend: -2.4 },
    { icon: TrendingUp, title: 'Growth', value: '24.5%', trend: 4.1 },
  ];

  return (
    <Row className="g-3 mb-4">
      {stats.map((stat, index) => (
        <Col key={index} xs={12} md={6} lg={3}>
          <StatCard {...stat} />
        </Col>
      ))}
    </Row>
  );
};

// Recent Customers Component
const RecentCustomers: React.FC = () => {
  const customers: Customer[] = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      status: 'Active',
      lastOrder: '2024-03-15',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      status: 'Inactive',
      lastOrder: '2024-03-10',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      status: 'Active',
      lastOrder: '2024-03-14',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  ];

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-4">Recent Customers</Card.Title>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Image
                      src={customer.avatar}
                      alt={customer.name}
                      roundedCircle
                      width={32}
                      height={32}
                    />
                    <span>{customer.name}</span>
                  </div>
                </td>
                <td>{customer.email}</td>
                <td>
                  <span className={`badge ${customer.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                    {customer.status}
                  </span>
                </td>
                <td>{customer.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

// Main Admin Dashboard Component
function AdminDashboard() {
  const { isAuthenticated, role, logout } = useAuth();

  // Redirect if not authenticated or handle unauthorized access
  if (!isAuthenticated) {
    return <div className="p-5 text-center">Please login to access the dashboard</div>;
  }

  // Handle logout function
  const handleLogout = () => {
    logout();
    // You can add redirect logic here if needed
    // Example: router.push('/login');
  };

  return (
    <DashboardLayout 
      userRole={role as UserRole} 
      onLogout={handleLogout}
    >
      <div className="dashboard-container">
        <DashboardHeader role={role} />
        <DashboardStats role={role} />
        {role === 'admin' && <RecentCustomers />}
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
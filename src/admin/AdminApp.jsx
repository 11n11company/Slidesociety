import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminInventory from './AdminInventory';
import AdminCustomers from './AdminCustomers';
import AdminPayments from './AdminPayments';
import AdminInvoices from './AdminInvoices';
import AdminReviews from './AdminReviews';
import { authApi } from '../services/authApi';
import { RefreshCw } from 'lucide-react';

const PAGE_TITLES = {
  '/admin/dashboard': 'Command Dashboard',
  '/admin/orders': 'Order Management',
  '/admin/products': 'Hardware Catalog',
  '/admin/inventory': 'Inventory & Stock Logistics',
  '/admin/customers': 'Driver Accounts',
  '/admin/payments': 'Payment Transaction Ledger',
  '/admin/invoices': 'Tax Invoices Archive',
  '/admin/reviews': 'Customer Reviews Moderation'
};

export default function AdminApp({ onExitAdmin }) {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      return path === '/admin' ? '/admin/dashboard' : path;
    }
    return '/admin/dashboard';
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Synchronize route with browser history
  const navigate = (path) => {
    if (path === '/') {
      if (onExitAdmin) {
        onExitAdmin();
      } else {
        window.history.pushState(null, '', '/');
        window.location.href = '/';
      }
      return;
    }

    window.history.pushState(null, '', path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setCurrentRoute(path === '/admin' ? '/admin/dashboard' : path);
      } else if (onExitAdmin) {
        onExitAdmin();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onExitAdmin]);

  // Check existing session on load
  const verifySession = async () => {
    setCheckingAuth(true);
    try {
      const user = await authApi.getMe();
      if (user && user.role === 'ADMIN') {
        setCurrentUser(user);
        if (currentRoute === '/admin/login') {
          navigate('/admin/dashboard');
        }
      } else {
        setCurrentUser(null);
        if (currentRoute !== '/admin/login') {
          navigate('/admin/login');
        }
      }
    } catch (err) {
      setCurrentUser(null);
      if (currentRoute !== '/admin/login') {
        navigate('/admin/login');
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    verifySession();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    navigate('/admin/dashboard');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignored
    }
    setCurrentUser(null);
    navigate('/admin/login');
  };

  // Quick order inspector helper from Dashboard to Orders
  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    navigate('/admin/orders');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center space-y-3 text-neutral-400 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-[#e50914]" />
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-300">
          Authenticating Administrative Credentials...
        </span>
      </div>
    );
  }

  // Unauthenticated / Driver accounts -> Show Admin Login
  if (!currentUser || currentRoute === '/admin/login') {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigate={navigate}
      />
    );
  }

  const pageTitle = PAGE_TITLES[currentRoute] || 'Management Console';

  return (
    <AdminLayout
      currentRoute={currentRoute}
      onNavigate={navigate}
      currentUser={currentUser}
      onLogout={handleLogout}
      title={pageTitle}
    >
      {currentRoute === '/admin/dashboard' && (
        <AdminDashboard
          onNavigate={navigate}
          onViewOrder={handleViewOrder}
        />
      )}

      {currentRoute === '/admin/orders' && (
        <AdminOrders
          currentUser={currentUser}
          initialOrderId={selectedOrderId}
        />
      )}

      {currentRoute === '/admin/products' && (
        <AdminProducts
          currentUser={currentUser}
        />
      )}

      {currentRoute === '/admin/inventory' && (
        <AdminInventory
          currentUser={currentUser}
        />
      )}

      {currentRoute === '/admin/customers' && (
        <AdminCustomers
          currentUser={currentUser}
        />
      )}

      {currentRoute === '/admin/payments' && (
        <AdminPayments
          currentUser={currentUser}
          onNavigate={navigate}
        />
      )}

      {currentRoute === '/admin/invoices' && (
        <AdminInvoices
          currentUser={currentUser}
        />
      )}

      {currentRoute === '/admin/reviews' && (
        <AdminReviews
          currentUser={currentUser}
        />
      )}
    </AdminLayout>
  );
}


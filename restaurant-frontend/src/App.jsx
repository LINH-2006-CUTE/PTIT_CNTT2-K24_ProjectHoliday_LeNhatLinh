import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import { PrivateRoute, PublicOnlyRoute } from './components/RouteGuard';
import CustomerHome from './pages/CustomerHome';
import CustomerMenuPage from './pages/CustomerMenuPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerReservationPage from './pages/CustomerReservationPage';
import CustomerCheckoutPage from './pages/CustomerCheckoutPage';
import CustomerOrderHistoryPage from './pages/CustomerOrderHistoryPage';
import CustomerFavoritesPage from './pages/CustomerFavoritesPage';
import CustomerReviewsPage from './pages/CustomerReviewsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

// Waiter Pages
import WaiterDashboard from './pages/WaiterDashboard';
import WaiterTableManagement from './pages/WaiterTableManagement';
import WaiterOrderManagement from './pages/WaiterOrderManagement';
import WaiterReservationPage from './pages/WaiterReservationPage';
import WaiterCustomerPage from './pages/WaiterCustomerPage';
import WaiterNotificationPage from './pages/WaiterNotificationPage';
import WaiterProfilePage from './pages/WaiterProfilePage';

// Chef Pages
import ChefDashboard from './pages/ChefDashboard';
import ChefOrdersPage from './pages/ChefOrdersPage';
import ChefCookingQueuePage from './pages/ChefCookingQueuePage';
import ChefCompletedOrdersPage from './pages/ChefCompletedOrdersPage';
import ChefNotificationPage from './pages/ChefNotificationPage';
import ChefProfilePage from './pages/ChefProfilePage';

// Cashier Pages
import CashierDashboard from './pages/CashierDashboard';
import CashierOrdersPage from './pages/CashierOrdersPage';
import CashierPaymentsPage from './pages/CashierPaymentsPage';
import CashierInvoicesPage from './pages/CashierInvoicesPage';
import CashierPromotionsPage from './pages/CashierPromotionsPage';
import CashierCustomersPage from './pages/CashierCustomersPage';
import CashierReportsPage from './pages/CashierReportsPage';
import CashierNotificationsPage from './pages/CashierNotificationsPage';
import CashierProfilePage from './pages/CashierProfilePage';

// Dynamically selects the appropriate dashboard based on user role
const DashboardRoute = () => {
  const { user } = useAuth();
  if (user && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_MANAGER'))) {
    return <AdminDashboard />;
  }
  if (user && user.roles.includes('ROLE_CASHIER')) {
    return <Navigate to="/cashier/dashboard" replace />;
  }
  if (user && user.roles.includes('ROLE_CHEF')) {
    return <Navigate to="/chef/dashboard" replace />;
  }
  if (user && (user.roles.includes('ROLE_WAITER') || user.roles.includes('ROLE_STAFF'))) {
    return <Navigate to="/waiter/dashboard" replace />;
  }
  return <CustomerHome />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CartDrawer />
          <Routes>
            {/* Public Only routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Protected Customer, Waiter, Chef, Cashier & Admin Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<CustomerHome />} />
              <Route path="/home" element={<CustomerHome />} />
              <Route path="/menu" element={<CustomerMenuPage />} />
              <Route path="/reservation" element={<CustomerReservationPage />} />
              <Route path="/checkout" element={<CustomerCheckoutPage />} />
              <Route path="/orders" element={<CustomerOrderHistoryPage />} />
              <Route path="/favorites" element={<CustomerFavoritesPage />} />
              <Route path="/reviews" element={<CustomerReviewsPage />} />
              <Route path="/profile" element={<CustomerProfilePage />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />

              {/* WAITER PORTAL ROUTES */}
              <Route path="/waiter" element={<Navigate to="/waiter/dashboard" replace />} />
              <Route path="/waiter/dashboard" element={<WaiterDashboard />} />
              <Route path="/waiter/tables" element={<WaiterTableManagement />} />
              <Route path="/waiter/orders" element={<WaiterOrderManagement />} />
              <Route path="/waiter/reservations" element={<WaiterReservationPage />} />
              <Route path="/waiter/customers" element={<WaiterCustomerPage />} />
              <Route path="/waiter/notifications" element={<WaiterNotificationPage />} />
              <Route path="/waiter/profile" element={<WaiterProfilePage />} />

              {/* CHEF / KDS PORTAL ROUTES */}
              <Route path="/chef" element={<Navigate to="/chef/dashboard" replace />} />
              <Route path="/chef/dashboard" element={<ChefDashboard />} />
              <Route path="/chef/orders" element={<ChefOrdersPage />} />
              <Route path="/chef/queue" element={<ChefCookingQueuePage />} />
              <Route path="/chef/completed" element={<ChefCompletedOrdersPage />} />
              <Route path="/chef/notifications" element={<ChefNotificationPage />} />
              <Route path="/chef/profile" element={<ChefProfilePage />} />

              {/* CASHIER PORTAL ROUTES */}
              <Route path="/cashier" element={<Navigate to="/cashier/dashboard" replace />} />
              <Route path="/cashier/dashboard" element={<CashierDashboard />} />
              <Route path="/cashier/orders" element={<CashierOrdersPage />} />
              <Route path="/cashier/payments" element={<CashierPaymentsPage />} />
              <Route path="/cashier/invoices" element={<CashierInvoicesPage />} />
              <Route path="/cashier/promotions" element={<CashierPromotionsPage />} />
              <Route path="/cashier/customers" element={<CashierCustomersPage />} />
              <Route path="/cashier/reports" element={<CashierReportsPage />} />
              <Route path="/cashier/notifications" element={<CashierNotificationsPage />} />
              <Route path="/cashier/profile" element={<CashierProfilePage />} />

              {/* UNIFIED REDIRECTS FOR MANAGER ROUTES */}
              <Route path="/manager" element={<Navigate to="/admin" replace />} />
              <Route path="/manager/*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* Catch-all redirects */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

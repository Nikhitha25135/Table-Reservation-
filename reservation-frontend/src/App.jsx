import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';
import { RoleRoute } from './components/RouteGuards';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminReservations from './pages/AdminReservations';
import AdminTables from './pages/AdminTables';
import NotFound from './pages/NotFound';

function HomeRedirect() {
  const { user, initializing } = useAuth();
  if (initializing) return <Spinner full label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/book'} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/book"
            element={
              <RoleRoute role="customer">
                <CustomerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <AdminReservations />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/tables"
            element={
              <RoleRoute role="admin">
                <AdminTables />
              </RoleRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

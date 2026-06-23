import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Home       from './pages/Home';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Charities  from './pages/Charities';
import Draws      from './pages/Draws';
import AdminLayout    from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminDraws     from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners   from './pages/admin/AdminWinners';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/draws"     element={<Draws />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        }/>

        {/* Admin */}
        <Route path="/admin" element={
          <AdminRoute><AdminLayout /></AdminRoute>
        }>
          <Route index            element={<AdminDashboard />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="draws"     element={<AdminDraws />} />
          <Route path="charities" element={<AdminCharities />} />
          <Route path="winners"   element={<AdminWinners />} />
        </Route>
      </Routes>
    </>
  );
}
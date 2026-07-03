import { Routes, Route } from 'react-router-dom';
import MainSite from './routes/MainSite';
import AdminRoutes from './admin/AdminRoutes';
import StaffRoutes from './staff/StaffRoutes';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainSite />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/staff/*" element={<StaffRoutes />} />
    </Routes>
  );
}

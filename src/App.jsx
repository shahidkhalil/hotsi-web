import { Routes, Route } from 'react-router-dom';
import MainSite from './routes/MainSite';
import AdminRoutes from './admin/AdminRoutes';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainSite />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";

export default function AdminLayout() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  if (!token) return <Navigate to="/admin/login" replace />;

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <NavLink to="/admin/products">Товары</NavLink>
        <NavLink to="/admin/categories">Категории</NavLink>
        <NavLink to="/admin/orders">Заявки</NavLink>
        <button className="link-button" onClick={handleLogout}>
          Выйти
        </button>
      </nav>
      <div className="page">
        <Outlet />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

import { adminApi, type Order } from "../../api";
import { useAuth } from "../../auth";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Выполнена",
  cancelled: "Отменена",
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    adminApi
      .listOrders(token)
      .then(setOrders)
      .catch(() => setError("Ошибка загрузки"));
  }

  useEffect(load, [token]);

  async function handleStatusChange(id: number, status: string) {
    if (!token) return;
    await adminApi.updateOrderStatus(token, id, status);
    load();
  }

  return (
    <div>
      <h1>Заявки</h1>
      {error && <p className="form-error">{error}</p>}
      {orders.length === 0 && <p>Заявок пока нет.</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <strong>{order.customer_name}</strong>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <p>Телефон: {order.phone}</p>
            {order.comment && <p>Комментарий: {order.comment}</p>}
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.product_name} × {item.qty}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";

import { createOrder } from "../api";

export default function OrderForm({ productId }: { productId: number }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await createOrder({
        customer_name: name,
        phone,
        comment,
        items: [{ product_id: productId, qty }],
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    }
  }

  if (status === "sent") {
    return <p className="order-success">Заявка отправлена! Скоро с вами свяжутся.</p>;
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h3>Оформить заявку</h3>
      <label>
        Имя
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Телефон
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </label>
      <label>
        Количество
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          required
        />
      </label>
      <label>
        Комментарий (размер, пожелания)
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Отправка..." : "Отправить заявку"}
      </button>
    </form>
  );
}

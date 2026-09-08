from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderOut
from app.services.telegram import send_telegram_message

router = APIRouter()


def _format_order_message(order: Order) -> str:
    lines = [
        "🧵 Новая заявка на сайте",
        f"Клиент: {order.customer_name}",
        f"Телефон: {order.phone}",
    ]
    if order.comment:
        lines.append(f"Комментарий: {order.comment}")
    lines.append("")
    lines.append("Товары:")
    lines.extend(f"— {item.product_name} × {item.qty}" for item in order.items)
    return "\n".join(lines)


@router.post("/", response_model=OrderOut)
def create_order(
    payload: OrderCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
) -> Order:
    order = Order(
        customer_name=payload.customer_name,
        phone=payload.phone,
        comment=payload.comment,
        items=[OrderItem(product_id=item.product_id, qty=item.qty) for item in payload.items],
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    background_tasks.add_task(send_telegram_message, _format_order_message(order))
    return order

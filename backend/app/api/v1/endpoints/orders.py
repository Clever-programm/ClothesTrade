from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter()


@router.post("/", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    order = Order(
        customer_name=payload.customer_name,
        phone=payload.phone,
        comment=payload.comment,
        items=[OrderItem(product_id=item.product_id, qty=item.qty) for item in payload.items],
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    # TODO: notify via Telegram bot once telegram_bot_token is configured.
    return order

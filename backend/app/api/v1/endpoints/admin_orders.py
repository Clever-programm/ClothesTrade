from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderAdminOut, OrderStatusUpdate

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/", response_model=list[OrderAdminOut])
def list_orders(db: Session = Depends(get_db)) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.created_at.desc())))


@router.patch("/{order_id}", response_model=OrderAdminOut)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    try:
        order.status = OrderStatus(payload.status)
    except ValueError:
        valid = ", ".join(s.value for s in OrderStatus)
        raise HTTPException(
            status_code=400, detail=f"Статус должен быть одним из: {valid}"
        ) from None
    db.commit()
    db.refresh(order)
    return order

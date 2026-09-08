from pydantic import BaseModel, ConfigDict


class OrderItemIn(BaseModel):
    product_id: int
    qty: int = 1


class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    comment: str = ""
    items: list[OrderItemIn]


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    phone: str
    comment: str
    status: str


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int | None
    product_name: str
    qty: int


class OrderAdminOut(OrderOut):
    items: list[OrderItemOut] = []


class OrderStatusUpdate(BaseModel):
    status: str

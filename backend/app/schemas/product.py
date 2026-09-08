from pydantic import BaseModel, ConfigDict


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str
    price: float
    sizes_text: str
    is_active: bool
    category_id: int | None
    images: list[ProductImageOut] = []


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class CategoryCreate(BaseModel):
    name: str


class CategoryUpdate(BaseModel):
    name: str | None = None


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    sizes_text: str = ""
    category_id: int | None = None
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    sizes_text: str | None = None
    category_id: int | None = None
    is_active: bool | None = None

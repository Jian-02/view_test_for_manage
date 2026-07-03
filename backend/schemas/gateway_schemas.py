from pydantic import BaseModel
from typing import Optional, Dict


class GatewayCreate(BaseModel):
    name: str
    root_path: str


class GatewayUpdate(BaseModel):
    name: Optional[str] = None
    root_path: Optional[str] = None


class GatewayConfigUpdate(BaseModel):
    values: Dict[str, str]
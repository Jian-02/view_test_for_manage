from fastapi import APIRouter, HTTPException
import logging

from schemas.gateway_schemas import GatewayCreate, GatewayUpdate, GatewayConfigUpdate
from service import gateway_service, gateway_registry

logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)

importer_uri = "/gateway"
gateway_router = APIRouter(prefix=importer_uri)


def _resolve_root(gateway_id: str) -> str:
    gateway = gateway_registry.get_gateway(gateway_id)
    if not gateway:
        raise HTTPException(status_code=404, detail="Gateway not found")
    return gateway["root_path"]


# ── 게이트웨이 목록 ──

@gateway_router.get("/api/list")
async def list_gateways():
    try:
        gateways = gateway_registry.list_gateways()
        result = []
        for g in gateways:
            try:
                status = gateway_service.get_status(g["root_path"])
                likely_running = status["likely_running"]
            except Exception:
                likely_running = False
            result.append({**g, "likely_running": likely_running})
        return result
    except Exception as e:
        logger.error(f"Failed to list gateways: {e}")
        raise HTTPException(status_code=500, detail="Failed to list gateways")


@gateway_router.post("/api/list")
async def create_gateway(data: GatewayCreate):
    try:
        return gateway_registry.add_gateway(data.name, data.root_path)
    except Exception as e:
        logger.error(f"Failed to add gateway: {e}")
        raise HTTPException(status_code=500, detail="Failed to add gateway")


@gateway_router.put("/api/list/{gateway_id}")
async def edit_gateway(gateway_id: str, data: GatewayUpdate):
    updated = gateway_registry.update_gateway(gateway_id, data.name, data.root_path)
    if not updated:
        raise HTTPException(status_code=404, detail="Gateway not found")
    return updated


@gateway_router.delete("/api/list/{gateway_id}")
async def remove_gateway(gateway_id: str):
    ok = gateway_registry.delete_gateway(gateway_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Gateway not found")
    return {"message": "deleted"}


# ── 게이트웨이별 설정 / 상태 ──

@gateway_router.get("/api/{gateway_id}/config")
async def get_config(gateway_id: str):
    try:
        root = _resolve_root(gateway_id)
        return gateway_service.read_env(root)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to read gateway config: {e}")
        raise HTTPException(status_code=500, detail="Failed to read gateway config")


@gateway_router.post("/api/{gateway_id}/config")
async def update_config(gateway_id: str, data: GatewayConfigUpdate):
    try:
        root = _resolve_root(gateway_id)
        return gateway_service.update_env(root, data.values)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update gateway config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update gateway config")


@gateway_router.get("/api/{gateway_id}/status")
async def get_status(gateway_id: str):
    try:
        root = _resolve_root(gateway_id)
        return gateway_service.get_status(root)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get gateway status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get gateway status")
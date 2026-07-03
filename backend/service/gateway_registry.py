import json
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone

logger = logging.getLogger("uvicorn")

_REGISTRY_PATH = Path(__file__).resolve().parent.parent / "data" / "gateways.json"


def _load() -> list:
    if not _REGISTRY_PATH.exists():
        return []
    try:
        return json.loads(_REGISTRY_PATH.read_text(encoding="utf-8"))
    except Exception as e:
        logger.error(f"Failed to load gateway registry: {e}")
        return []


def _save(items: list):
    _REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    _REGISTRY_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def list_gateways() -> list:
    return _load()


def get_gateway(gateway_id: str):
    for g in _load():
        if g["id"] == gateway_id:
            return g
    return None


def add_gateway(name: str, root_path: str) -> dict:
    items = _load()
    new_item = {
        "id": uuid.uuid4().hex[:8],
        "name": name,
        "root_path": root_path,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    items.append(new_item)
    _save(items)
    return new_item


def update_gateway(gateway_id: str, name: str = None, root_path: str = None):
    items = _load()
    for g in items:
        if g["id"] == gateway_id:
            if name is not None:
                g["name"] = name
            if root_path is not None:
                g["root_path"] = root_path
            _save(items)
            return g
    return None


def delete_gateway(gateway_id: str) -> bool:
    items = _load()
    filtered = [g for g in items if g["id"] != gateway_id]
    if len(filtered) == len(items):
        return False
    _save(filtered)
    return True
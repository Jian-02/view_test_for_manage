import re
import logging
from pathlib import Path
from datetime import datetime, timezone

logger = logging.getLogger("uvicorn")

_KEY_PATTERN = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*)\s*=")


def _env_path(root_path: str) -> Path:
    return Path(root_path) / ".env"


def read_env(root_path: str) -> dict:
    path = _env_path(root_path)
    result: dict = {}
    if not path.exists():
        return result

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        match = _KEY_PATTERN.match(stripped)
        if not match:
            continue
        key = match.group(1)
        value = stripped[match.end():]
        if "#" in value:
            value = value.split("#", 1)[0]
        result[key] = value.strip()
    return result


def update_env(root_path: str, updates: dict) -> dict:
    path = _env_path(root_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    lines = path.read_text(encoding="utf-8").splitlines(keepends=True) if path.exists() else []
    updated_keys = set()
    new_lines = []

    for line in lines:
        match = _KEY_PATTERN.match(line.strip())
        if match and match.group(1) in updates and updates[match.group(1)] is not None:
            key = match.group(1)
            comment = ""
            if "#" in line:
                comment = "  #" + line.split("#", 1)[1].rstrip("\n")
            new_lines.append(f"{key}={updates[key]}{comment}\n")
            updated_keys.add(key)
        else:
            new_lines.append(line if line.endswith("\n") else line + "\n")

    for key, value in updates.items():
        if value is not None and key not in updated_keys:
            new_lines.append(f"{key}={value}\n")

    path.write_text("".join(new_lines), encoding="utf-8")
    logger.info(f"Gateway .env updated ({root_path}): {sorted(updates.keys())}")
    return read_env(root_path)


def _tail_lines(file_path: Path, n: int = 80) -> list:
    if not file_path.exists():
        return []
    try:
        return file_path.read_text(encoding="utf-8", errors="replace").splitlines()[-n:]
    except Exception as e:
        logger.warning(f"Failed to read log file {file_path}: {e}")
        return []


def _latest_log_file(log_dir: Path):
    if not log_dir.exists():
        return None
    candidates = sorted(log_dir.glob("gateway_*.log"))
    return candidates[-1] if candidates else None


def _safe_int(value, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def get_status(root_path: str) -> dict:
    env = read_env(root_path)
    root = Path(root_path)

    log_dir = Path(env.get("LOG_DIR", "./logs"))
    if not log_dir.is_absolute():
        log_dir = root / log_dir

    latest_log = _latest_log_file(log_dir)
    log_tail: list = []
    last_log_time = None
    seconds_since_log = None

    if latest_log:
        log_tail = _tail_lines(latest_log, 80)
        mtime = latest_log.stat().st_mtime
        last_log_time = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
        seconds_since_log = datetime.now(timezone.utc).timestamp() - mtime

    pq_path = Path(env.get("PQ_PATH", "./pq/queue.jsonl"))
    if not pq_path.is_absolute():
        pq_path = root / pq_path

    pq_size_bytes = pq_path.stat().st_size if pq_path.exists() else 0
    pq_pending_lines = 0
    if pq_path.exists():
        try:
            with open(pq_path, encoding="utf-8") as f:
                pq_pending_lines = sum(1 for line in f if line.strip())
        except Exception as e:
            logger.warning(f"Failed to read PQ file {pq_path}: {e}")

    health_interval = _safe_int(env.get("OPCUA_HEALTH_CHECK_INTERVAL"), 5)
    poll_interval = _safe_int(env.get("POLL_INTERVAL"), 5)
    threshold = max(health_interval, poll_interval) * 6 + 30

    likely_running = seconds_since_log is not None and seconds_since_log < threshold

    return {
        "gateway_root": str(root),
        "log_file": str(latest_log) if latest_log else None,
        "log_tail": log_tail,
        "last_log_time": last_log_time,
        "seconds_since_log": seconds_since_log,
        "likely_running": likely_running,
        "pq_path": str(pq_path),
        "pq_size_bytes": pq_size_bytes,
        "pq_pending_lines": pq_pending_lines,
    }
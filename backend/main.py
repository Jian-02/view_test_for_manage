import socket
import subprocess
import os
from dotenv import load_dotenv

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import uvicorn
from controller.home_controller import home_router
from controller.detail_controller import detail_router
from websocket.websocket import ws_router

import logging


# 로거 설정
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://192.168.30.8:8004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP router
app.include_router(home_router)
app.include_router(detail_router)

# Websocket router
app.include_router(ws_router)


#방화벽 port open 함수
def open_firewall_port(port):
    # port open command
    command = f'netsh advfirewall firewall add rule name="Open Port {port}" protocol=TCP dir=in localport={port} action=allow'
    subprocess.run(command, shell=True)
    logger.info(f"Port {port} has been opened in the firewall.")


def update_env_file(ip_address, port):
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
    frontend_env_path = os.path.join(frontend_dir, ".env")

    new_line = f"REACT_APP_API_BASE_URL=http://{ip_address}:{port}\n"

    try:
        if not os.path.exists(frontend_env_path):
            with open(frontend_env_path, 'w') as f:
                f.write(new_line)  # 기본 값을 바로 추가
            logger.info(f"Created .env file at {frontend_env_path} with {new_line.strip()}")
            return  # 새로운 파일이 생성되었으므로 이후 과정 필요 없음

        with open(frontend_env_path, "r") as f:
            lines = f.readlines()

        updated = False
        for i, line in enumerate(lines):
            if line.startswith("REACT_APP_API_BASE_URL="):
                lines[i] = new_line
                updated = True
                logger.info(f"Updated existing REACT_APP_API_BASE_URL to: {new_line.strip()}")
                break

        if not updated:
            lines.append(new_line)
            logger.info(f"Added new REACT_APP_API_BASE_URL with value: {new_line.strip()}")

        with open(frontend_env_path, "w") as f:
            f.writelines(lines)

        load_dotenv(frontend_env_path, override=True)

        logger.info(f".env file successfully updated at {frontend_env_path}")

    except Exception as e:
        logger.error(f"Failed to update .env file: {e}")

    with open(frontend_env_path, "r") as f:
        logger.debug("Updated .env file contents:")
        for line in f:
            logger.debug(line.strip())


if __name__ == "__main__":
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    port = 8004
    open_firewall_port(port)
    update_env_file(local_ip, port)
    uvicorn_configuration = uvicorn.Config(app, host=local_ip, port=port)
    uvicorn_server = uvicorn.Server(uvicorn_configuration)
    uvicorn_server.run()



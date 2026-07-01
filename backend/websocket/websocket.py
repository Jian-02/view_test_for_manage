from fastapi import APIRouter, WebSocket
from typing import List
from starlette.websockets import WebSocketDisconnect


ws_router = APIRouter()

connected_clients: List[WebSocket] = []
alert_clients: List[WebSocket] = []
@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # 클라이언트로부터의 메시지 수신 (필요시)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

async def send_message_to_clients(message: dict):
    for client in connected_clients:
        await client.send_text(message)

@ws_router.websocket("/alert")
async def alertsocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    alert_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # 클라이언트로부터의 메시지 수신 (필요시)
    except WebSocketDisconnect:
        alert_clients.remove(websocket)

async def send_alert_to_clients(message: dict):
    for client in alert_clients:
        await client.send_text(message)

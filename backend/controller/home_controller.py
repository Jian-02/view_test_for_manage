from fastapi import APIRouter, Request, HTTPException, Depends
import logging

from service.home_service import process_inference_data
from schemas.schemas import InferenceData, InferenceData2
from typing import Union
from sqlalchemy.orm import Session
from configuration.dbconfig import get_db

# 로거 설정
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)

importer_uri = "/home"
home_router = APIRouter(
    prefix=importer_uri
)

@home_router.post("/api/multi_client")
async def receive_inference_data(data: Union[InferenceData, InferenceData2], request: Request, db: Session = Depends(get_db)):
    try:
        client_host = request.client.host
        logger.info(f"Received data from {client_host}: {data.json()}")
        await process_inference_data(data, db)
    except Exception as e:
        logger.error(f"Failed to process data: {e}")
        raise HTTPException(status_code=500, detail="Failed to process data")


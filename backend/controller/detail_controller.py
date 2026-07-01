from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import StreamingResponse
import logging
from io import BytesIO
import gzip
import json


from toXLSX import DataProcessor
from urllib.parse import quote


from sqlalchemy.orm import Session
from configuration.dbconfig import get_db
from service.detail_service import select_detail_data

# 로거 설정
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)


importer_uri = "/detail"
detail_router = APIRouter(
    prefix=importer_uri
)

data_processor = DataProcessor(db_path="C:/Users/ITis/Desktop/my_workspace/pikeview/pikeview/backend/test.db")

#Detail
@detail_router.post("/api/update_data/{clientName}/{part}/{start_date}/{end_date}")
async def update_detail_data(
        clientName: str,
        part: str,
        start_date: str,
        end_date: str,
        db: Session = Depends(get_db),
        download_excel: bool = False):
    try:
        logger.info(f"clientName:{clientName}, part: {part}, start_date:{start_date}, end_date:{end_date} ")
        data = await select_detail_data(clientName, part, start_date, end_date, db)
        if download_excel:
            # paste.txt의 DataProcessor 클래스를 사용하여 엑셀 파일 생성
            output = BytesIO()
            wb = data_processor.process_data_to_excel(part, clientName, start_date, end_date)

            wb.save(output)
            output.seek(0)

            encoded_filename = quote(f"{clientName}_{part}_{start_date}_{end_date}.xlsx")
            headers = {
                'Content-Disposition': f"attachment; filename*=UTF-8''{encoded_filename}"
            }

            return StreamingResponse(
                output,
                headers=headers,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        else:
            # 데이터를 JSON 문자열로 변환
            json_data = json.dumps(data)

            # Gzip 압축
            compressed_data = gzip.compress(json_data.encode('utf-8'))

            compressed_size = len(compressed_data)
            logger.info(f"Compressed data size: {compressed_size} bytes")

            return Response(
                content=compressed_data,
                media_type="application/json",
                headers={"Content-Encoding": "gzip"}
            )
    except Exception as e:
        logger.error(f"Failed to retrieve or generate Excel file: {e}")
        raise HTTPException(status_code=500, detail="Failed to process request")


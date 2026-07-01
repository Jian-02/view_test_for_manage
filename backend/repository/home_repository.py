import json

from sqlalchemy import Float
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from sqlalchemy import  Column, Integer, String, MetaData, Table,  text
from configuration.dbconfig import engine
from schemas.schemas import  InferenceData
from websocket.websocket import send_message_to_clients
from websocket.websocket import send_alert_to_clients
import logging
from datetime import datetime


logger = logging.getLogger(__name__)

metadata = MetaData()
alertDataList = []

#table
def create_dynamic_table(data):
    try:
        columns = [Column('id', Integer, primary_key=True)]
        for key, value in data.items():
            if isinstance(value, int):
                columns.append(Column(key, Integer))
            elif isinstance(value, float):
                columns.append(Column(key, Float))
            else:
                columns.append(Column(key, String))

        table_name = f"inference_data_{data['ClientName'].split('-')[-1]}"
        if table_name not in metadata.tables:
            table = Table(table_name, metadata, *columns)
            metadata.create_all(engine, tables=[table])
        else:
            table = metadata.tables[table_name]

        return table
    except Exception as e:
        logger.error(f"Failed to create table: {e}")
        raise

async def insert_data(data, db):
    table = await create_dynamic_table(data)
    try:
        db.execute(table.insert().values(**{k: v for k, v in data.items() if k != 'client_id'}))
        db.commit()
        return table.name
    except SQLAlchemyError as e:
        db.rollback()
        print(f"An error occurred: {e}")
        return None


async def process_data_for_clients_1_to_5(data: InferenceData, table_name: str, db: Session):
    try:
        ##TODO 처음 데이터 삽입 때 예외처리 필요
        lastResult = db.execute(text(f"SELECT Result FROM {table_name} ORDER BY Datetime DESC LIMIT 1")).fetchone()
        lastResult = lastResult[0] if lastResult is not None else None  # None 처리
        defectCount = data.DefectCount
        print(defectCount)
        if lastResult == "1" and data.Result == "1":
            alertData = {"ClientName": table_name.replace('inferenct_data_', 'PikeZone'),
                         "Text": "연속불량",
                         "Datetime": datetime.strptime(data.Datetime, '%Y%m%d_%H%M%S').strftime("%Y.%m.%d %H:%M:%S")}

            alertDataList.insert(0, alertData)
            if len(alertDataList) > 50:
                alertDataList.pop()
            await send_alert_to_clients(json.dumps(alertDataList))
        # 다중불량
        # if int(defectCount) >= 2:
        #     alertData = {"ClientName": table_name.replace('inferenct_data_', 'PikeZone'),
        #                  "Text": f"다중불량 ({(defectCount)})",
        #                  "Datetime": datetime.strptime(data.Datetime, '%Y%m%d_%H%M%S').strftime("%Y.%m.%d %H:%M:%S")}
        #
        #     alertDataList.insert(0, alertData)
        #     if len(alertDataList) > 50:
        #         alertDataList.pop()
        #     await send_alert_to_clients(json.dumps(alertDataList))



        query = text(f"SELECT * FROM {table_name} WHERE Datetime = :datetime")
        existing_data = db.execute(query, {"datetime": data.Datetime}).fetchall()

        if existing_data:
            return {"message": "Data already exists"}
        else:
            table = Table(table_name, metadata, autoload_with=engine)
            insert_data = data.dict()
            insert_statement = table.insert().values(**insert_data)
            db.execute(insert_statement)
            db.commit()
            ### ok,ng,all count ###
            okCount = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE Result = 0")).fetchone()[0]
            ngCount = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE Result = 1")).fetchone()[0]
            clientName = db.execute(text(f"SELECT ClientName FROM {table_name}")).fetchone()[0]
            part = db.execute(text(f"SELECT Part FROM {table_name} ORDER BY id DESC LIMIT 1")).fetchone()[0]
            allCount = okCount + ngCount
            sendData = {"ClientName": clientName,
                        "Part": part,
                        "ALL": allCount,
                        "OK": okCount,
                        "NG": ngCount}
            print(sendData, "1_to_5")
            await send_message_to_clients(json.dumps(sendData))
            return {"message": "Data for clients 1-5 processed successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to insert data: {e}")
        raise e

async def process_data_for_clients_6_to_9(data: InferenceData, table_name: str, db: Session):
    try:
        query = text(f"SELECT * FROM {table_name} WHERE Datetime = :datetime")
        existing_data = db.execute(query, {"datetime": data.Datetime}).fetchall()

        if existing_data:
            return {"message": "Data already exists"}
        else:
            table = Table(table_name, metadata, autoload_with=engine)
            insert_data = data.dict()
            insert_statement = table.insert().values(**insert_data)
            db.execute(insert_statement)
            db.commit()
            ### ok,ng,all count ###
            okCount = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE Result = 0")).fetchone()[0]
            ngCount = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE Result = 1")).fetchone()[0]
            clientName = db.execute(text(f"SELECT ClientName FROM {table_name}")).fetchone()[0]
            part = db.execute(text(f"SELECT Part FROM {table_name} ORDER BY id DESC LIMIT 1")).fetchone()[0]
            allCount = okCount + ngCount
            sendData = {"ClientName": clientName,
                        "Part": part,
                        "ALL": allCount,
                        "OK": okCount,
                        "NG": ngCount}
            print(sendData,"6_to_9")
            await send_message_to_clients(json.dumps(sendData))
            return {"message": "Data for clients 6-9 processed successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to insert data: {e}")
        raise e


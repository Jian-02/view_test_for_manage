
from schemas.schemas import InferenceData, InferenceData2

from typing import Union
from configuration.dbconfig import get_db, get_table_names
from repository.home_repository import create_dynamic_table, process_data_for_clients_1_to_5, process_data_for_clients_6_to_9
from sqlalchemy.orm import Session

async def process_inference_data(data:Union[ InferenceData, InferenceData2], db: Session):
    client_number = int(data.ClientName.split("-")[-1])
    table_name = f"inference_data_{client_number}"

    existing_tables = get_table_names(db)

    if table_name not in existing_tables:
        create_dynamic_table(data.dict())

    if 1 <= client_number <= 5:
        return await process_data_for_clients_1_to_5(data, table_name, db)
    elif 6 <= client_number <= 9:
        return await process_data_for_clients_6_to_9(data, table_name, db)
    else:
        return {"message": "Invalid client number"}

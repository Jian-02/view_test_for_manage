import logging
from configuration.dbconfig import get_db, get_table_names
from repository.detail_repository import detail_update_data
from sqlalchemy.orm import Session
from datetime import datetime
from collections import Counter

logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)


async def select_detail_data(clientName:str, part:str, start_date:str, end_date:str, db:Session):
        existing_tables = get_table_names(db)
        table_name = f"inference_data_{clientName}"

        if part == '부품 전체':
            part = 'ALL'
        elif part == 'CABJ':
            part = 'CABJ'
        elif part == 'CABJ_Alpha':
            part = 'CABJ_Alpha'
        elif part == 'CABJ_Alpha_Z':
            part = 'CABJ_Alpha_Z'

        # datetime 객체로 변환
        start_date = datetime.strptime(start_date, '%Y%m%d_%H%M')
        end_date = datetime.strptime(end_date, '%Y%m%d_%H%M')
        if table_name not in existing_tables:
            logger.info(f"Not exist Table  {table_name} ")

            return {"message":"조회할 생산 라인이 없습니다." }

        else:
            data = detail_update_data(clientName, part, start_date, end_date, db)
            count_data = count_results(data)
            top_10_defects = get_top_10_defects(data[1])
            result = {
                "detail_data": data[1],
                "count_data": count_data,
                "top_10_defects": top_10_defects
            }
            return result
			
def count_results(data):
    # ok_count = sum(1 for item in data if item['Result'] == '0')
    # ng_count = sum(1 for item in data if item['Result'] == '1')
    # total_count = len(data)

    ng_count = len(data[1])
    total_count = data[0]
    ok_count = total_count - ng_count

    return {
        "ALL": total_count,
        "OK": ok_count,
        "NG": ng_count
    }

def get_top_10_defects(data):

    defect_columns = [
        'H_BootTear', 'H_BootCurl', 'H_BootBurr', 'H_BootAssembly', 'H_GreaseOut',
        'H_PBallDamage', 'H_PBallLot', 'H_CRingErr', 'H_CRingTwist', 'H_ORingErr',
        'H_ORingTwist', 'SocketDamage', 'SocketGroove', 'L_BootTear', 'L_BootCurl',
        'L_BootBurr', 'L_BootAssembly', 'L_GreaseOut', 'L_PBallDamage', 'L_CRingErr',
        'L_CRingTwist', 'L_ORingErr', 'L_ORingTwist'
    ]

    defect_names = {
        'H_BootTear': "1차 부트 찢어짐",
        'H_BootCurl': "1차 부트 말림",
        'H_BootBurr': "1차 부트 Burr 유/무",
        'H_BootAssembly': "1차 부트 조립 상태",
        'H_GreaseOut': "1차 목부 그리스 누유",
        'H_PBallDamage': "1차 P/Ball 찍힘 및 긁힘",
        'H_PBallLot': "1차 P/Ball 로트 타각 식별",
        'H_CRingErr': "1차 C/Ring 유/무",
        'H_CRingTwist': "1차 C/Ring 꼬임",
        'H_ORingErr': "1차 O/Ring 유/무",
        'H_ORingTwist': "1차 O/Ring 꼬임",
        'SocketDamage': "소켓 외경 찍힘 및 긁힘",
        'SocketGroove': "소켓 외경 홈 그루브 유무",
        'L_BootTear': "2차 부트 찢어짐",
        'L_BootCurl': "2차 부트 말림",
        'L_BootBurr': "2차 부트 Burr 유/무",
        'L_BootAssembly': "2차 부트 조립 상태",
        'L_GreaseOut': "2차 목부 그리스 누유",
        'L_PBallDamage': "2차 P/Ball 찍힘 및 긁힘",
        'L_CRingErr': "2차 C/Ring 유/무",
        'L_CRingTwist': "2차 C/Ring 꼬임",
        'L_ORingErr': "2차 O/Ring 유/무",
        'L_ORingTwist': "2차 O/Ring 꼬임"
    }

    defect_counts = Counter()
    # for item in data:
    #     if item.get('Result') == '1':
    #         for column in defect_columns:
    #             if item.get(column) == '1':
    #                 defect_counts[column] += 1
    for item in data:
        for column in defect_columns:
            if item.get(column) == '1':
                defect_counts[column] += 1

    top_10 = defect_counts.most_common(10)
    result = [{"country": defect_names.get(defect, defect), "불량": count} for defect, count in top_10]

    return result
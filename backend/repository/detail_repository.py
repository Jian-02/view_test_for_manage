from sqlalchemy.orm import Session

from sqlalchemy import  MetaData,text

import logging


logger = logging.getLogger(__name__)

metadata = MetaData()

#Select Parts & Date
def detail_update_data(clientName, part, start_date, end_date, db: Session):
    try:
        start_date = start_date.strftime('%Y%m%d_%H%M')
        end_date = end_date.strftime('%Y%m%d_%H%M')

        # 기본 쿼리 작성
        query = f"SELECT * FROM inference_data_{clientName} WHERE Datetime BETWEEN :start_date AND :end_date"
        query2 = f"SELECT COUNT(*) FROM inference_data_{clientName} WHERE Datetime BETWEEN :start_date AND :end_date"
        query3 = f"SELECT * FROM inference_data_{clientName} WHERE Datetime BETWEEN :start_date AND :end_date AND Result = 1"
        # part가 'ALL'이 아닐 경우에만 Part 조건 추가
        if part.upper() != 'ALL':

            query += " AND Part = :part"
            query2 += " AND Part = :part"
            query3 += " AND Part = :part"
            params = {"start_date": start_date, "end_date": end_date, "part": part}
        else:
            params = {"start_date": start_date, "end_date": end_date}

        query += " ORDER BY Datetime DESC"
        query2 += " ORDER BY Datetime DESC"
        query3 += " ORDER BY Datetime DESC"

        allCount = db.execute(text(query2), params).scalar()
        defect = db.execute(text(query3), params).fetchall()
        defect_list = [dict(row._mapping) for row in defect]
        result = []
        result.append(allCount)
        result.append(defect_list)

        return result
    except Exception as e:
        logger.error(f"Failed to retrieve data: {e}")
        return None

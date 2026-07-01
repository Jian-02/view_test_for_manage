from fastapi import Depends, FastAPI
from starlette.middleware.cors import CORSMiddleware
from typing import Union, Optional,Any
from pydantic import BaseModel

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import logging
import uvicorn

app = FastAPI()

origins = [
    "http://127.0.0.1:80"
]

relation = ["inference_data_121", "inference_data_6", "inference_data_46"]

# 로거 설정
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)

# SQLAlchemy 설정
DATABASE_URL = "sqlite:///./test.db"  # SQLite 데이터베이스 URL (파일 기반)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
metadata = MetaData()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Unwrapping pydantic model
# pydantic 모델 객체를 파이썬 딕셔너리로 바꿀 수 있다.
#
# 만약
#
# user_in = UserIn(username="john", password="secret", email="john.doe@example.com")
#
# 와 같이 정의가 되어 있다면,
#
# user_dict = user_in.dict()
#
# 와 같이 딕셔너리로 바꿀 수 있다.
#
# {
#     'username': 'john',
#     'password': 'secret',
#     'email': 'john.doe@example.com',
#     'full_name': None,
# }
# 만약 이러한 값들을 pydantic 모델에 집어넣고 싶다면 어떻게 해야할까? 원래였다면, 위에서 본 것과 같이 keyword로 직접 넣어주어야 했다.
#
# 하지만 아래와 같이 작성하면 그러한 귀찮음이 없어진다.
#
# UserInDB(**user_dict)
"""
UserInDB(
    username="john",
    password="secret",
    email="john.doe@example.com",
    full_name=None,
)
"""
# 위의 코드는 딕셔너리를 key/value 쌍으로 직접 넘겨주는 효과를 보이며, 바로 아래의 코드와 똑같이 작동한다.
#
# 추가적인 keyword argument도 넣을 수 있다.
#
# UserInDB(**user_in.dict(), hashed_password=hashed_password)



#################################################################################
#UNION 사용방법
#모델의 형식을 선언하거나 response model의 output 값으로 여러 개의 형식을 내보내고 싶을 경우가 있다.
#이를 가능하게 하는 것이 바로 Union이다.
##################################################################################

#Ex) DataType 사용
@app.get("/union_test/{value}")
def process_value(value: Union[int, str]) -> None:
    if isinstance(value, int):
        print(f"Processing an integer: {value}")
    elif isinstance(value, str):
        print(f"Processing a string: {value}")

process_value(42)       # Output: Processing an integer: 42
process_value("hello")  # Output: Processing a string: hello

#############################################################################################
#Optional 사용방법
#ptional은 Union의 한 축약형
#예를 들어, Optional[str]은 Union[str, None]과 동일, 이는 선택적 인자 또는 기본값이 None인 인자를 정의할 때 자주 사용
#############################################################################################
@app.get("/optional_test/{name}")
def greet(name: Optional[str] = None) -> str:
    if name:
        return f"Hello, {name}!"
    return "Hello, world!"

############################################################################################
#Depends 사용방법
#의존관계에 있는 코드간의 역전시키기 위한 DIP 원칙
#즉, 상위 -> 하위로 이어졌던 의존의 흐름을 하위 에서 상위의 방향으로 역전 시키는 것
# 이렇게 되면 상위계층이 하위 계층에 영향을 받지 않고 코드가 수정될 수 있음.
############################################################################################

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]

class CommonQueryParams:
    def __init__(self, q: Union[str, None] = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit


#Class로 Depends 사용하기
@app.get("/items/")
async def read_items(commons=Depends(CommonQueryParams)):
    response = {}
    if commons.q:
        response.update({"q": commons.q})
    items = fake_items_db[commons.skip : commons.skip + commons.limit]
    response.update({"items": items})
    return response

async def properties(offset: int =0, limit: int = 100):
    return {"offset": offset, "limit":limit}

#함수로 Depends 사용하기
#!!Depends는 매개변수 맨 마지막에 있어함.
@app.get("/books/{titile}")
async def get_books( title: str , params: dict = Depends(properties)):
    return {"title": title, "params": params}

@app.get("/authors/")
async def get_books(params: dict = Depends(properties)):
    return params

##############################################################
#response_model 사용법
#response에 모델을 담아 사용할 수 있다.
#아래의 코드를 보면 2개의 클래스가 있다 예제로 UserIn이라는 모델과 UserOut이라는 모델을 선언했다
#UserIn은 password가 있는 클래스 이며 UserOur는 password가 없는 클래스이다.
#따라서 response_model을 사용하여 password값을 포함하지 않고 response_model=UserOut 모델을 보내버린다.
#만약 이 모델이 다른 요청들의 필요에 의해 그대로 넘겨버리면 항상 password를 전송하는 위험부담이 생겨버린다.
#FastAPI는 Pydantic을 이용하여 내보낼 데이터에 포함되지 않은 속성값들을 필터하는 기능을 가진다고 한다.
#결과로


class UserIn(BaseModel):
    username: str
    password: str
    email: str
    full_name: str

class UserOut(BaseModel):
    username: str
    email: str
    full_name: str

@app.post("/user/", response_model=UserOut )
async def create_user(user: UserIn) -> Any:
    return user


################################################################################################
#class를 사용하지 않고 response_model_exclue를 사용하여 필드값 제거
#결과적으로 username과 full_name 필드만 반환
@app.post("/user/exclude/", response_model=UserOut, response_model_exclude={"email"})
async def create_user_exclude(user: UserIn) -> Any:
    print("exclude:", user)
    return user

#include를 사용하여 username과 full_name 필드만 포함
#결과적으로 username과 full_name 필드만 반환
@app.post("/user/include/", response_model=UserOut, response_model_include={"username", "full_name"})
async def create_user_include(user: UserIn) -> Any:
    print("include:", user )
    return user

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=80)
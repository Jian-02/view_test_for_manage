from fastapi import APIRouter

importer_uri = "/alarm"
detail_router = APIRouter(
    prefix=importer_uri
)


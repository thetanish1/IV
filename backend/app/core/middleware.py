import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.request")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

class LoggingAndRequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start_time = time.perf_counter()
        
        client_host = request.client.host if request.client else "unknown"
        
        try:
            response = await call_next(request)
            process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            
            logger.info(
                f"[{request_id}] {client_host} -> {request.method} {request.url.path} "
                f"status={response.status_code} duration={process_time_ms}ms"
            )
            
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time-Ms"] = str(process_time_ms)
            return response
        except Exception as exc:
            process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                f"[{request_id}] {client_host} -> {request.method} {request.url.path} "
                f"FAILED error={str(exc)} duration={process_time_ms}ms"
            )
            raise exc

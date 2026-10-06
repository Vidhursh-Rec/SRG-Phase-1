from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.chat import router as chat_router


app = FastAPI(
    title="SRG Support Bot API",
    version="1.0.0",
)


# Allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register chat routes
app.include_router(chat_router)


@app.get("/")
def root():
    return {
        "message": "SRG Support Bot API is running"
    }
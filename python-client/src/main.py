from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.blockchain_service import BlockchainService
import os

app = FastAPI(title="Greeter Blockchain API")

# Setup configuration from environment variables or use local defaults
RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
ARTIFACT_PATH = os.getenv("ARTIFACT_PATH", "../contracts/artifacts/contracts/Greeter.sol/Greeter.json")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")

try:
    blockchain_service = BlockchainService(
        rpc_url=RPC_URL,
        contract_address=CONTRACT_ADDRESS,
        artifact_path=ARTIFACT_PATH,
        private_key=PRIVATE_KEY
    )
except Exception as e:
    print(f"Warning: Blockchain service failed to initialize: {e}")
    blockchain_service = None # type: ignore

class GreetingRequest(BaseModel):
    greeting: str

class GreetingResponse(BaseModel):
    greeting: str

class TransactionResponse(BaseModel):
    transaction_hash: str
    status: str

@app.get("/greeting", response_model=GreetingResponse)
def get_greeting() -> GreetingResponse:
    """Read the current greeting from the blockchain."""
    if not blockchain_service:
        raise HTTPException(status_code=500, detail="Blockchain service unavailable")
    
    current_greeting = blockchain_service.get_greeting()
    return GreetingResponse(greeting=current_greeting)

@app.post("/greeting", response_model=TransactionResponse)
def set_greeting(request: GreetingRequest) -> TransactionResponse:
    """Send a transaction to update the greeting on the blockchain."""
    if not blockchain_service:
        raise HTTPException(status_code=500, detail="Blockchain service unavailable")
        
    try:
        tx_hash = blockchain_service.set_greeting(request.greeting)
        return TransactionResponse(transaction_hash=tx_hash, status="Success")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

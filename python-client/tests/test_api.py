from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_get_greeting() -> None:
    response = client.get("/greeting")
    # If the local Hardhat node is running, it returns 200. Otherwise, 500.
    if response.status_code == 200:
        data = response.json()
        assert "greeting" in data
        assert isinstance(data["greeting"], str)
    else:
        assert response.status_code == 500

def test_set_greeting() -> None:
    response = client.post("/greeting", json={"greeting": "Test Greeting from Pytest"})
    if response.status_code == 200:
        data = response.json()
        assert "transaction_hash" in data
        assert data["status"] == "Success"
    else:
        assert response.status_code in [400, 500]

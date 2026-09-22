import json
import os
from web3 import Web3
from typing import Any

class BlockchainService:
    def __init__(self, rpc_url: str, contract_address: str, artifact_path: str, private_key: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError("Failed to connect to the blockchain node.")

        self.contract_address = contract_address
        self.private_key = private_key
        
        # Load ABI
        if not os.path.exists(artifact_path):
            raise FileNotFoundError(f"Artifact not found at {artifact_path}")
            
        with open(artifact_path, 'r') as file:
            contract_json = json.load(file)
            contract_abi = contract_json['abi']

        self.contract = self.w3.eth.contract(address=self.contract_address, abi=contract_abi)
        self.account = self.w3.eth.account.from_key(private_key)

    def get_greeting(self) -> str:
        return str(self.contract.functions.greet().call())

    def set_greeting(self, new_greeting: str) -> str:
        transaction = self.contract.functions.setGreeting(new_greeting).build_transaction({
            'chainId': 31337,
            'gas': 3000000,
            'maxFeePerGas': self.w3.eth.gas_price,
            'maxPriorityFeePerGas': self.w3.to_wei(1, 'gwei'),
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status != 1:
            raise Exception("Transaction failed on the blockchain.")
            
        return tx_hash.hex()

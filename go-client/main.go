package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	"go-client/api" // The generated package

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const (
	rpcURL        = "http://127.0.0.1:8545"
	contractAddr  = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
	// Hardhat test account 0 (strip 0x prefix for Go crypto library)
	privateKeyHex = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" 
)

func main() {
	fmt.Println("Connecting to Hardhat JSON-RPC node...")
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}
	defer client.Close()

	address := common.HexToAddress(contractAddr)
	
	// Instantiate the contract using the generated bindings
	greeter, err := api.NewGreeter(address, client)
	if err != nil {
		log.Fatalf("Failed to instantiate contract: %v", err)
	}

	// 1. Read the current greeting (Call)
	fmt.Println("Reading current greeting...")
	greeting, err := greeter.Greet(&bind.CallOpts{Context: context.Background()})
	if err != nil {
		log.Fatalf("Failed to read greeting: %v", err)
	}
	fmt.Printf("📖 Current Greeting: '%s'\n", greeting)

	// 2. Write a new greeting (Send Transaction)
	fmt.Println("Preparing transaction...")
	
	// Load the private key
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		log.Fatalf("Failed to load private key: %v", err)
	}

	chainID := big.NewInt(31337) // Hardhat local chain ID
	
	// Create an authorized transactor (handles nonce, signing, etc.)
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatalf("Failed to create authorized transactor: %v", err)
	}

	// Fetch current gas price
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("Failed to suggest gas price: %v", err)
	}
	auth.GasPrice = gasPrice

	newGreeting := "Hello from Go Backend!"
	fmt.Printf("⏳ Attempting to set new greeting to: '%s'\n", newGreeting)
	
	// Send the transaction using the generated binding
	tx, err := greeter.SetGreeting(auth, newGreeting)
	if err != nil {
		log.Fatalf("Failed to send transaction: %v", err)
	}

	fmt.Printf("🚀 Transaction broadcasted! Hash: %s\n", tx.Hash().Hex())
	
	// Wait for the receipt (polling the node)
	fmt.Println("Waiting for transaction to be mined...")
	var receipt *bind.Receipt
	for {
		// Try to fetch the receipt
		receipt, err = client.TransactionReceipt(context.Background(), tx.Hash())
		if err == nil {
			break // Receipt found!
		}
		time.Sleep(1 * time.Second)
	}

	if receipt.Status == 1 {
		fmt.Println("✅ Transaction was mined successfully!")
	} else {
		fmt.Println("❌ Transaction failed on the blockchain!")
	}

	// 3. Read the updated greeting
	updatedGreeting, err := greeter.Greet(&bind.CallOpts{Context: context.Background()})
	if err != nil {
		log.Fatalf("Failed to read updated greeting: %v", err)
	}
	fmt.Printf("📖 Updated Greeting: '%s'\n", updatedGreeting)
}

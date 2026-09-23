package com.blockchain.example.service;

import com.blockchain.example.generated.Greeter;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import jakarta.annotation.PostConstruct;
import java.math.BigInteger;

@Service
public class GreeterService {

    private final Web3j web3j;
    private Greeter greeter;

    // Hardhat defaults
    private static final String CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    private static final String PRIVATE_KEY = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    private static final long CHAIN_ID = 31337;

    public GreeterService(Web3j web3j) {
        this.web3j = web3j;
    }

    @PostConstruct
    public void init() {
        // Load the private key to sign transactions securely
        Credentials credentials = Credentials.create(PRIVATE_KEY);

        // Transaction manager handles nonces, signing, and broadcasting
        TransactionManager txManager = new RawTransactionManager(web3j, credentials, CHAIN_ID);

        // Instantiate the strongly-typed, auto-generated contract wrapper
        this.greeter = Greeter.load(
                CONTRACT_ADDRESS,
                web3j,
                txManager,
                new DefaultGasProvider() // Simple gas strategy for local testing
        );
    }

    public String getGreeting() throws Exception {
        // Reading is a free, instantaneous 'eth_call'
        return greeter.greet().send();
    }

    public String setGreeting(String newGreeting) throws Exception {
        // Writing constructs a transaction, signs it, and waits for a receipt
        var receipt = greeter.setGreeting(newGreeting, BigInteger.ZERO).send();
        
        if (!receipt.isStatusOK()) {
            throw new RuntimeException("Transaction failed on the blockchain.");
        }
        
        return receipt.getTransactionHash();
    }
}

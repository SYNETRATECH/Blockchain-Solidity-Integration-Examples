package com.blockchain.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3Config {

    private static final String RPC_URL = "http://127.0.0.1:8545";

    @Bean
    public Web3j web3j() {
        // Initializes the connection to the Ethereum JSON-RPC node
        return Web3j.build(new HttpService(RPC_URL));
    }
}

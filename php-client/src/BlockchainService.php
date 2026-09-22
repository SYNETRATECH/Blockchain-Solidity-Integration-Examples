<?php

namespace App;

use Web3\Web3;
use Web3\Contract;
use Web3p\EthereumTx\Transaction;

class BlockchainService
{
    private Web3 $web3;
    private Contract $contract;
    private string $contractAddress;

    public function __construct(string $rpcUrl, string $contractAddress, string $artifactPath)
    {
        $this->web3 = new Web3($rpcUrl);
        $this->contractAddress = $contractAddress;

        if (!file_exists($artifactPath)) {
            throw new \Exception("Artifact not found at {$artifactPath}");
        }

        $artifactJson = file_get_contents($artifactPath);
        $artifact = json_decode($artifactJson, true);

        if (!isset($artifact['abi'])) {
            throw new \Exception("ABI not found in artifact");
        }

        $this->contract = new Contract($this->web3->provider, $artifact['abi']);
        $this->contract->at($this->contractAddress);
    }

    public function getGreeting(): string
    {
        $greeting = '';
        $this->contract->call('greet', function ($err, $result) use (&$greeting) {
            if ($err !== null) {
                throw new \Exception("Failed to read greeting: " . $err->getMessage());
            }
            $greeting = $result[0];
        });

        return $greeting;
    }

    public function setGreeting(string $newGreeting, string $fromAddress, string $privateKey): string
    {
        $nonce = null;
        $this->web3->eth->getTransactionCount($fromAddress, 'pending', function ($err, $result) use (&$nonce) {
            if ($err !== null) throw new \Exception($err->getMessage());
            $nonce = $result;
        });

        $gasPrice = null;
        $this->web3->eth->gasPrice(function ($err, $result) use (&$gasPrice) {
            if ($err !== null) throw new \Exception($err->getMessage());
            $gasPrice = $result;
        });

        // Get the encoded data for the contract function call
        $data = $this->contract->getData('setGreeting', $newGreeting);

        // Format parameters as hex strings
        $txParams = [
            'nonce' => '0x' . dechex((int) $nonce->toString()),
            'from' => $fromAddress,
            'to' => $this->contractAddress,
            'gas' => '0x2dc6c0', // 3,000,000 gas limit
            'gasPrice' => '0x' . dechex((int) $gasPrice->toString()),
            'value' => '0x0',
            'data' => '0x' . $data,
            'chainId' => 31337 // Hardhat Local Chain ID
        ];

        $transaction = new Transaction($txParams);
        $signedTx = $transaction->sign($privateKey);

        $txHash = '';
        $this->web3->eth->sendRawTransaction('0x' . $signedTx, function ($err, $result) use (&$txHash) {
            if ($err !== null) {
                throw new \Exception("Transaction failed: " . $err->getMessage());
            }
            $txHash = $result;
        });

        return $txHash;
    }
}

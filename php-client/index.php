<?php

require 'vendor/autoload.php';

use App\BlockchainService;

$rpcUrl = 'http://127.0.0.1:8545';
$contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
$artifactPath = '../contracts/artifacts/contracts/Greeter.sol/Greeter.json';
// Hardhat Test Account 0
$privateKey = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
$fromAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

try {
    echo "Connecting to Hardhat node...\n";
    $service = new BlockchainService($rpcUrl, $contractAddress, $artifactPath);

    echo "Reading current greeting...\n";
    $currentGreeting = $service->getGreeting();
    echo "📖 Current Greeting: '{$currentGreeting}'\n\n";

    $newGreeting = "Hello from PHP CLI!";
    echo "⏳ Attempting to set new greeting to: '{$newGreeting}'\n";
    
    $txHash = $service->setGreeting($newGreeting, $fromAddress, $privateKey);
    echo "🚀 Transaction broadcasted! Hash: {$txHash}\n";
    echo "Note: Web3.php is synchronous but we broadcasted it. Hardhat mines instantly.\n\n";

    echo "Reading updated greeting...\n";
    $updatedGreeting = $service->getGreeting();
    echo "📖 Updated Greeting: '{$updatedGreeting}'\n";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

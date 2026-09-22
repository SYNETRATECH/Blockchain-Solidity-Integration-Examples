'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, parseEther } from 'viem';

const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const abi = parseAbi([
  'function greet() view returns (string)',
  'function setGreeting(string _greeting) payable',
]);

export default function Home() {
  const [newGreeting, setNewGreeting] = useState('');
  const [tipAmount, setTipAmount] = useState('0');

  const { data: greeting } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'greet',
  });

  const { data: hash, isPending, mutate: writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleUpdate = (e: React.SyntheticEvent) => {
    e.preventDefault();
    writeContract({
      address: contractAddress,
      abi,
      functionName: 'setGreeting',
      args: [newGreeting],
      value: tipAmount ? parseEther(tipAmount) : BigInt(0),
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-100">
      <div className="w-full max-w-5xl items-center justify-between font-mono text-sm flex mb-12">
        <h1 className="text-2xl font-bold">Greeter & Tipper dApp</h1>
        <ConnectButton />
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-xl mb-4 font-semibold text-gray-800">Current Greeting:</h2>
        <p className="text-blue-600 text-lg mb-8 font-bold">{greeting as string || 'Loading...'}</p>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Greeting</label>
            <input
              type="text"
              value={newGreeting}
              onChange={(e) => setNewGreeting(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tip (ETH) - Optional</label>
            <input
              type="number"
              step="0.001"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Confirming with Wallet...' : isConfirming ? 'Waiting for block...' : 'Update Greeting'}
          </button>
        </form>

        {isConfirmed && (
          <div className="mt-4 p-4 text-green-800 bg-green-100 rounded-lg border border-green-200">
            Success! Greeting updated.
          </div>
        )}
      </div>
    </main>
  );
}

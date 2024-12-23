'use client';

import { SetStateAction, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Send, RefreshCw, Globe, ChevronDown, Clock, Coins } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

const networks = [
  { name: 'Ethereum Mainnet', chainId: '0x1', symbol: 'ETH' },
  { name: 'Goerli Testnet', chainId: '0x5', symbol: 'GoerliETH' },
  { name: 'Sepolia Testnet', chainId: '0xaa36a7', symbol: 'SepoliaETH' },
  { name: 'Polygon Mainnet', chainId: '0x89', symbol: 'MATIC' },
  { name: 'Mumbai Testnet', chainId: '0x13881', symbol: 'MATIC' },
];

export default function WalletPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [networkSymbol, setNetworkSymbol] = useState<string>('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  //const [tokenBalances, setTokenBalances] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (window.ethereum) {
      checkWalletConnection();
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } else {
      alert('Please install MetaMask to use this app.');
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletConnected(false);
      setAccount(null);
      setBalance('0');
    } else {
      setAccount(accounts[0]);
      fetchWalletData();
    }
  };

  const handleChainChanged = () => {
    fetchWalletData();
  };

  const checkWalletConnection = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const address = accounts[0].address;
        setAccount(address);
        setWalletConnected(true);
        fetchWalletData();
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setAccount(address);
      setWalletConnected(true);
      fetchWalletData();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const fetchWalletData = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (!account) return;
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
      const network = await provider.getNetwork();
      setCurrentNetwork(network.name);
      const currentNetworkData = networks.find(net => net.chainId === ethers.toBeHex(network.chainId));
      setNetworkSymbol(currentNetworkData?.symbol || '');
      // fetchTransactionHistory(provider);
      // Remove this line: fetchTokenBalances(provider);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  // const fetchTransactionHistory = async (provider: ethers.BrowserProvider) => {
  //   try {
  //     if (!account) return;
  //     const history = await provider.getTransactionReceipts({ address: account, fromBlock: -1000, toBlock: 'latest' });
  //     const formattedHistory = await Promise.all(history.map(async (tx) => {
  //       const block = await provider.getBlock(tx.blockNumber);
  //       return {
  //         hash: tx.hash,
  //         from: tx.from,
  //         to: tx.to || '',
  //         value: ethers.formatEther(tx.value || '0'),
  //         timestamp: block ? Number(block.timestamp) : 0,
  //       };
  //     }));
  //     setTransactions(formattedHistory);
  //   } catch (error) {
  //     console.error('Error fetching transaction history:', error);
  //   }
  // };

  // Remove the fetchTokenBalances function

  const sendFunds = async () => {
    if (!walletConnected || !account || !recipientAddress || !sendAmount) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(sendAmount)
      });
      await tx.wait();
      alert('Transaction successful!');
      fetchWalletData();
      setIsPopupOpen(false);
      setRecipientAddress('');
      setSendAmount('');
    } catch (error) {
      console.error('Error sending funds:', error);
      alert('Transaction failed!');
    }
  };

  const switchNetwork = async (chainId: string) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        alert('This network is not available in your MetaMask, please add it manually.');
      } else {
        console.error('Error switching network:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">NexWALL-ET Wallet</h1>
        {walletConnected && (
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              <span>{currentNetwork}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchWalletData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </header>

      <main className="flex-grow flex justify-center items-center px-4 py-8">
        {!walletConnected ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full mx-4 transform hover:scale-105 transition-transform duration-300">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Welcome to NexWALL-ET
              </h2>
              <p className="text-gray-300">
                Connect your wallet to access your digital assets and start transacting on the blockchain.
              </p>
              <Button 
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transform transition-all duration-300 hover:scale-105"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-8">
            {/* [Previous connected wallet UI remains the same] */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Wallet Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Connected Account</p>
                  <p className="font-mono text-sm truncate">{account}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Balance</p>
                  <p className="text-3xl font-bold">{parseFloat(balance).toFixed(4)} {networkSymbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Network</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <Globe className="mr-2 h-4 w-4" />
                        {currentNetwork}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {networks.map((network) => (
                        <DropdownMenuItem key={network.chainId} onSelect={() => switchNetwork(network.chainId)}>
                          {network.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <Button className="w-full" onClick={() => setIsPopupOpen(true)}>
                    <Send className="h-5 w-5 mr-2" />
                    Send {networkSymbol}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>To/From</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.hash}>
                      <TableCell>{tx.from.toLowerCase() === account?.toLowerCase() ? 'Sent' : 'Received'}</TableCell>
                      <TableCell>{parseFloat(tx.value).toFixed(4)} {networkSymbol}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.from.toLowerCase() === account?.toLowerCase() ? tx.to : tx.from}
                      </TableCell>
                      <TableCell>{new Date(tx.timestamp * 1000).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Send {networkSymbol}</DialogTitle>
            <DialogDescription>
              Enter the recipient's address and the amount you want to send.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Recipient
              </Label>
              <Input
                id="recipient"
                value={recipientAddress}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setRecipientAddress(e.target.value)}
                className="col-span-3 bg-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                value={sendAmount}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSendAmount(e.target.value)}
                className="col-span-3 bg-gray-700 text-white"
                type="number"
                step="0.0001"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={sendFunds} className="bg-green-600 hover:bg-green-700 text-white">
              Send {networkSymbol}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


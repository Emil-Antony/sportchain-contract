import { ethers } from "hardhat";
import nftabi from "../abis/sportnft.json"

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether')
  }

  async function main() {
    // Setup accounts & variables
    const args = process.argv.slice(2);  // Get arguments starting from the 3rd one

  // Ensure correct number of arguments are passed
    if (args.length !== 6) {
      console.error("Usage: node add-event.js <name> <costInEther> <tickets> <date> <time> <location>");
      process.exit(1);
    }
    const [name, cost, tickets, date, time, location] = args;
  
    // Deploy contract
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",provider);
    const sportNFT = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3", nftabi, signer);
  
    const transaction = await sportNFT.connect(signer).list(
      name,
      token(cost),
      tickets,
      date,
      time,
      location,
    )

  
    await transaction.wait()
  
    console.log(`Listed Event : ${name}`)

  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
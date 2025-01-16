import { ethers } from "hardhat";

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether');
  }

  async function main() {
    // Setup accounts & variables
    const [deployer] = await ethers.getSigners();
    const NAME = "SportChain";
    const SYMBOL = "SCT";
    const baseURI = "http://localhost:3000/nfts/";
  
    // Deploy contract
    const sportNFT = (await (await ethers.getContractFactory("sportnft")).deploy(NAME,SYMBOL,baseURI));
    await sportNFT.waitForDeployment();
    console.log(`Deployed SportNFT Contract at: ${await sportNFT.getAddress()}\n`)
  
    const occasions = [
      {
        name: "Match",
        cost: tokens(0.03),
        tickets: 0,
        date: "May 31",
        time: "6:00PM UTC",
        location: "Kaloor, Ernakulam"
      },
      {
        name: "Tokyo SL",
        cost: tokens(0.06),
        tickets: 100,
        date: "Jun 2",
        time: "1:00PM UTC",
        location: "Tokyo, Japan"
      }
    ]
    
    for (var i = 0; i < occasions.length; i++) {
      const transaction = await sportNFT.connect(deployer).list(
        occasions[i].name,
        occasions[i].cost,
        occasions[i].tickets,
        occasions[i].date,
        occasions[i].time,
        occasions[i].location,
      )
  
      await transaction.wait()
  
      console.log(`Listed Event ${i + 1}: ${occasions[i].name}`)
    }
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
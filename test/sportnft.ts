import { expect } from "chai";
import { ethers } from "hardhat";

const NAME = "sportnft";
const SYMBOL = "SNFT";
const occ_name = "IPL_Event";
const occ_cost = ethers.parseUnits('1','ether');
const occ_maxtickets = 50;
const occ_date = "Nov 20";
const occ_time = "11:00AM IST";
const occ_loc = "Kaloor,Ernakulam"

describe("sportnft", ()=>{
    let sportNFT;
    let deployer,buyer;
    beforeEach(async ()=>{
        [deployer,buyer]= await ethers.getSigners();
        sportNFT = (await (await ethers.getContractFactory("sportnft")).deploy(NAME,SYMBOL));
        const transaction = await sportNFT.connect(deployer).list(
            occ_name,
            occ_cost,
            occ_maxtickets,
            occ_date,
            occ_time,
            occ_loc
        );
        await transaction.wait();
    })

    describe("Deployment",async() => {
        
        it("sets the name", async() =>{
            expect(await sportNFT.name()).to.equal(NAME);
        })
        it("symbol set is pekachu", async() =>{
            expect(await sportNFT.symbol()).to.equal(SYMBOL);
        })
        it("Correct owner", async() =>{
            expect(await sportNFT.owner()).to.equal(deployer.address);
        })
    })

    describe("Occasions",() =>{
        it("updated the occassion", async()=> {
            const totalOccasions = await sportNFT.totalOccasions();
            expect(totalOccasions).to.equal(1);
        })

        it("Gets the occassions right", async() =>{
            const occasion = await sportNFT.getOccasion(1);
            expect(occasion.id).to.equal(1);
            expect(occasion.name).to.equal(occ_name);
            expect(occasion.cost).to.equal(occ_cost);
            expect(occasion.tickets).to.equal(occ_maxtickets);
            expect(occasion.maxTickets).to.equal(occ_maxtickets);
            expect(occasion.date).to.equal(occ_date);
            expect(occasion.time).to.equal(occ_time);
            expect(occasion.location).to.equal(occ_loc);
        })

        it("Authorised Sender", async()=>{
            expect(await sportNFT.owner()).to.equal(deployer.address);
        })

    })
    
    describe("minting NFT",() =>{
        const id = 1;
        const seat = 30;
        const amount = ethers.parseUnits('1','ether');
        beforeEach(async()=>{
            const buytransaction = await sportNFT.connect(buyer).mintNFT(
                id,
                seat,
                {value: amount}
            )
            await buytransaction.wait();
        })
        it("Update ticket count",async()=>{
            const occasion = await sportNFT.getOccasion(id);
            expect(occasion.tickets).to.equal(occ_maxtickets-1);
        })
        it("USer has bought",async()=>{
            const status = await sportNFT.hasTicket(1,buyer.address);
            expect(status).to.equal(true);
        })
        it("Seat is taken",async()=>{
            const holder = await sportNFT.seatTaken(id,seat);
            expect(holder).to.equal(buyer.address);
        })
        it("Seats are taken",async()=>{
            const seats = await sportNFT.getTakenSeats(id);
            expect(seats.length).to.equal(1);
            expect(seats[0]).to.equal(seat);
        })
        it("updates contract balance",async()=>{
            const val = await ethers.provider.getBalance(sportNFT.getAddress());
            expect(val).to.equal(amount);
        })
    })

    describe("Withdrawing", () => {
        const ID = 1
        const SEAT = 30
        const AMOUNT = ethers.parseUnits("1", 'ether');
        let balanceBefore
    
        beforeEach(async () => {
          balanceBefore = await ethers.provider.getBalance(deployer.address)
    
          let transaction = await sportNFT.connect(buyer).mintNFT(ID, SEAT, { value: AMOUNT })
          await transaction.wait()
    
          transaction = await sportNFT.connect(deployer).withdraw()
          await transaction.wait()
        })
    
        it('Updates the owner balance', async () => {
          const balanceAfter = await ethers.provider.getBalance(deployer.address)
          expect(balanceAfter).to.be.greaterThan(balanceBefore)
        })
    
        it('Updates the contract balance', async () => {
          const balance = await ethers.provider.getBalance(sportNFT.getAddress())
          expect(balance).to.equal(0)
        })
    })
})

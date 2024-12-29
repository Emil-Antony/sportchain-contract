// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract sportnft is ERC721{
    address public owner;
    uint256 public totalOccasions;
    uint public totalSupply;
    string private _baseTokenURI;
    event Minted(address indexed to, uint256 tokenId);
    
    struct Occasion{
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    mapping(uint => Occasion)occasions;
    mapping(uint => mapping(address => bool)) public hasTicket;
    mapping(uint => mapping(uint => address)) public seatTaken; // The seat of the occasion is taken by address:
    mapping(uint => uint256[]) public takenSeats; // The list of seats taken in that occasion
    mapping(uint256 => bool) private tokenExists;
    mapping(string => uint256) private occasionIDs;

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        string memory baseURI
        ) ERC721(_name, _symbol){
            owner = msg.sender;
            _baseTokenURI = baseURI;
    }

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location
    ) public onlyOwner returns (uint256){
        totalOccasions++;
        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            _maxTickets,
            _date,
            _time,
            _location
        );
        occasionIDs[_name]=totalOccasions;
        return totalOccasions;
    }
    function mintNFT(uint _id,uint _seat)public payable{
        require(_id != 0);
        require(_id <= totalOccasions);
        require(msg.value >= occasions[_id].cost);
        require(seatTaken[_id][_seat] == address(0));
        require(_seat != 0);
        require(_seat <= occasions[_id].maxTickets);

        occasions[_id].tickets -= 1;
        hasTicket[_id][msg.sender] = true;
        seatTaken[_id][_seat]=msg.sender;
        takenSeats[_id].push(_seat);
        totalSupply++;
        uint256 tokenId = _id * 1000 + _seat;

        emit Minted(msg.sender, tokenId);
        _safeMint(msg.sender, tokenId);
        tokenExists[tokenId] = true;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenExists[tokenId], "Token does not exist"); 
        uint256 occasionId = tokenId/1000; // Assuming maxTickets is consistent across occasions
        return string(abi.encodePacked(_baseURI(), "occasion", uint2str(occasionId), ".json"));
    }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }

    function getOccasion(uint id) public view returns (Occasion memory){
        return occasions[id];
    }
    function getTakenSeats(uint _id) public view returns(uint[] memory){
        return takenSeats[_id];
    }
    function getOccasionID(string memory _name) public view returns (uint256) {
        require(occasionIDs[_name] > 0, "Occasion does not exist");
        return occasionIDs[_name];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
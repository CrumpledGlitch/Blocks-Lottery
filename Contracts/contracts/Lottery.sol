//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Lottery{
    address public admin;
    address payable [] public contestants; 
    uint public Id;
    mapping(uint => address payable) public History;

    constructor(){
        admin = msg.sender;
        Id = 1;
    }

    function getBalance() public view returns (uint){
        return address(this).balance;
    }

    function enter() public payable {
        require(msg.value >= 0.001 ether);
        contestants.push(payable(msg.sender));
        
    }

    function random() public view returns (uint){
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, contestants)));
    }

    function pickWinner() public restricted{
        uint index = random() % contestants.length;
        //payable(contestants[index]).transfer(address(this).balance);
        contestants[index].transfer(address(this).balance);

         History[Id] = contestants[index];
         Id++;

        contestants = new address payable[](0);

    }


    function getContestants() public view returns(address payable[] memory){
        return contestants;
    }

    modifier restricted(){
        require(msg.sender == admin);
        _;
    }



}
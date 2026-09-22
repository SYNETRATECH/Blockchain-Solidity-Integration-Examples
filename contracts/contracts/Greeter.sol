// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Greeter {
    string private greeting;
    address public owner;

    event GreetingUpdated(address indexed updater, string oldGreeting, string newGreeting);
    event TipReceived(address indexed tipper, uint256 amount);

    constructor(string memory _greeting) {
        greeting = _greeting;
        owner = msg.sender;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public payable {
        string memory oldGreeting = greeting;
        greeting = _greeting;
        
        if (msg.value > 0) {
            emit TipReceived(msg.sender, msg.value);
            // Send the tip to the owner
            (bool success, ) = owner.call{value: msg.value}("");
            require(success, "Failed to send tip to owner");
        }
        
        emit GreetingUpdated(msg.sender, oldGreeting, _greeting);
    }
}

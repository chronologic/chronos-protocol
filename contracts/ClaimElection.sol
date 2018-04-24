pragma solidity ^0.4.21;

import "./Auth.sol";
import "../chronologic/contracts/DayToken.sol";
import "./PriorityQueue.sol";

contract ClaimElection is Auth {
    PriorityQueue pQueue;
    DayToken token;

    //constructor
    function ClaimElection() public {
        pQueue = new PriorityQueue();
    }

    function setToken(address _t) public auth {
        token = DayToken(_t);
    }

    struct Bond {
        uint256 value;
        // uint256 depositedAt;
    } 

    mapping (address => mapping(uint256 => Bond)) bonds;
    mapping (address => uint256) numBonds;

    // Timenode cooldown
    mapping (address => uint256) cooldown;

    function joinQueue(uint256 _amt)
        public returns (bool success)
    {
        uint256 tokenBal = token.balanceOf(msg.sender);
        require(tokenBal >= _amt);

        token.transferFrom(msg.sender, address(this), _amt);
        uint256 nextBond = numBonds[msg.sender]++;
        bonds[msg.sender][nextBond] = Bond({
            value: _amt
        });

        pQueue.insert(_amt, msg.sender);

        // startCooldown(msg.sender);
        return true;
    }

    function getNext()
        auth
        public returns (address)
    {
        if (pQueue.isEmpty()) {
            return address(0x0);
        }

        var (_, next) = pQueue.pop();

        return next;
    }



}
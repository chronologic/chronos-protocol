pragma solidity ^0.4.21;

import "../chronologic/contracts/DayToken.sol";

contract ClaimingPool {
    /// The ClaimingPool is a contract where TimeNodes can deposit ChronoLogic Day 
    /// token to be included in the claiming mechanism of the Pendulum protocol. 

    struct Deposit {
        bool deposited;
        uint256 lastClaimAt;
    }

    mapping (address => Deposit) deposits;

    address operator;

    // Address of the Day Token.
    DayToken dayToken;

    function ClaimingPool(address _dayTokenAddress) public {
        operator = msg.sender;
        dayToken = DayToken(_dayTokenAddress);
    }

    function depositDay() 
        public
    {
        require(deposits[msg.sender].deposited == false);

        require(dayToken.balanceOf(msg.sender) >= 33);

        // Send 33 Day Token to this address.
        dayToken.transfer(address(this), 33);
        deposits[msg.sender] = Deposit({
            deposited: true,
            lastClaimAt: block.number
        });
    }

    function canClaim(address _timeNode)
        public view returns (bool)
    {
        require(deposits[_timeNode].deposited == true);
        uint256 totalSupply = dayToken.getTotalSupply();
        uint256 dayTokenHeld = dayToken.balanceOf(_timeNode);
        uint256 frequency = calcFrequency(dayTokenHeld, totalSupply);
        uint256 blocksAgo = block.number - deposits[_timeNode].lastClaimAt;
        if (blocksAgo < frequency) { return false; }
        else { return true; }
    }

    function calcFrequency(
        uint256 _dayTokens,
        uint256 _totalSupply
    )
        private pure returns (uint256)
    {
        // Changes the range to 2 - 40.
        return ((_dayTokens * 38) / _totalSupply) + 2;
    }
}
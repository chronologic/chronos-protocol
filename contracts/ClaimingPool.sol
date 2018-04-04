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

    // Operator of the claiming pool.
    address public operator;

    // Address of the Day Token.
    DayToken public dayToken;

    // Slashed Day deposits.
    uint256 public slashedDay;

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
        require(
            dayToken.transferFrom(msg.sender, address(this), 33)
        );
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
        public pure returns (uint256)
    {
        // Changes the range to 2 - 40.
        return ((_dayTokens * 38) / _totalSupply) + 2;
    }

    function removeTimeNode(address _timeNode)
        public
    {
        // Operator gate for now.
        require(msg.sender == operator);
        require(deposits[_timeNode].deposited == true);
        deposits[_timeNode].deposited = false;
        slashedDay += 33;
    }

    function recoverSlashedDay()
        public 
    {
        // Operator gate for now.
        require(msg.sender == operator);
        require(slashedDay > 0);
        uint256 amt = slashedDay;
        delete slashedDay;
        dayToken.transfer(operator, amt);
    }
}
pragma solidity ^0.4.21;

contract ConditionDestination {
  function isGreater(uint a, uint b)
    public pure returns (bool)
  {
    return a > b;
  }
}
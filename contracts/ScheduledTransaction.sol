pragma solidity ^0.4.19;

contract ScheduledTransaction {
    bytes32 public ipfsHash;

    function init(bytes32 _ipfsHash) public payable {
        ipfsHash = _ipfsHash;
    }
}
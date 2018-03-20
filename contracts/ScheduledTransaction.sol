pragma solidity ^0.4.19;

contract ScheduledTransaction {
    bytes32 public ipfsHash;

    // disallow receiving ether
    function() public {revert();}

    function init(bytes32 _ipfsHash) public payable {
        ipfsHash = _ipfsHash;
    }

    function execute(bytes _serializedTransaction)
        public returns (bool)
    {
        // first verify the _serializedTransaction matches the stored hash
        return true;
    }

    function cancel()
        public returns (bool)
    {
        // check if msg.sender == owner
        return true;
    }

    function claim()
        public returns (bool)
    {
        return true;
    }

    function proxy(address _to, bytes _data)
        public payable returns (bool)
    {
        // require(msg.sender == owner);
        // require(isAfterWindow)
        return _to.call.value(msg.value)(_data);
    }

    // pull transactions?
}
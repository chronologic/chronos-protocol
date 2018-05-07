pragma experimental ABIEncoderV2;

contract ConditionalTransaction {
    address public receiver;
    bytes public callData;
    
    address[] public checkReceivers;
    bytes[] public checkCallData;

    function ConditionalTransaction(address _receiver, bytes _callData, address[] _checkReceivers, bytes[] _checkCallData) {
        receiver = _receiver;
        callData = _callData;
        
        checkReceivers = _checkReceivers;
        checkCallData = _checkCallData;
    }
    
    function canExecute() public constant returns(bool) {
        for (uint i=0; i<checkReceivers.length; i++) {
            bytes32 res = callWithData(checkReceivers[i], checkCallData[i]);
            if (res==0) return false;
        }
        return true;
    }
    
    function callWithData(address dest, bytes data) private returns (bytes32 c) {
        assembly {
            let freemem := mload(0x40)
            
            pop(
            call(      
                5000, //5k gas
                dest, //To addr
                0,    //No value
                add(data, 0x20),    //Inputs are stored at location x
                mload(data),
                freemem,    //Store output over input (saves space)
                0x20 //Outputs are 32 bytes long
            )
            )
    
            c := mload(freemem) //Assign output value to c
            mstore(0x40, add(freemem, 0x20)) // Set storage pointer to empty space
        }
    }
}
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
    
    function callWithData(address dest, bytes data) private constant returns (bytes32 c) {
        uint dataLoc;
        uint dataLen = data.length;
        uint free;
        
        assembly { 
            free := mload(0x40) //Free mem pointer
            dataLoc := add(data, 0x20) //Skip array header
        }
        
        memcpy(free, dataLoc, dataLen);
        
        assembly {
            let success := call(      
                                5000, //5k gas
                                dest, //To addr
                                0,    //No value
                                free,    //Inputs are stored at location x
                                dataLen, //Inputs are 68 bytes long
                                free,    //Store output over input (saves space)
                                0x20) //Outputs are 32 bytes long
    
            c := mload(free) //Assign output value to c
            mstore(0x40,add(free,dataLen)) // Set storage pointer to empty space
        }
    }
    
    function memcpy(uint dest, uint src, uint len) private {
        // Copy word-length chunks while possible
        for(; len >= 32; len -= 32) {
            assembly {
                mstore(dest, mload(src))
            }
            dest += 32;
            src += 32;
        }

        // Copy remaining bytes
        uint mask = 256 ** (32 - len) - 1;
        assembly {
            let srcpart := and(mload(src), not(mask))
            let destpart := and(mload(dest), mask)
            mstore(dest, or(destpart, srcpart))
        }
    }
}
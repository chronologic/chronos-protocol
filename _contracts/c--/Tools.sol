pragma solidity ^0.4.24;

library Tools {

    function callWithData(address _dest, bytes _data)
        public returns (bytes32 out)
    {
        assembly {
            let freemem := mload(0x40)

            pop(
                call(
                    5000, // 5k gas
                    _dest, // to
                    0, // no value
                    add(_data, 0x20), // inputs stored 32 bytes in
                    mload(_data),
                    freemem, // store output over input
                    0x20 // output is 32 bytes long
                )
            )

            out := mload(freemem)
            mstore(0x40, add(freemem, 0x20)) 
        }
    }

    function callWithDataBool(address _dest, bytes _data)
        public returns (bool success)
    {
        return callWithData(_dest, _data) == 1;
    }
    
}
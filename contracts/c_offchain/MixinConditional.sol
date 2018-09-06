pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Bytes.sol";

contract MixinConditional {
    using Bytes for bytes;

    function checkConditional(bytes _extraData)
        public view returns (bool)
    {
        address conditional;

        assembly {
            conditional := mload(add(_extraData, 0x80))
        }

        if (conditional == address(0x0)) {
            return true;
        }

        bytes memory conditionalData = _extraData.getBytesAtLocation(0xa0);

        return callAndGetReturnData(conditional, conditionalData) == 1;
    }

    function callAndGetReturnData(address _dest, bytes _data)
        private returns (bytes32 ret)
    {
        assembly {
            let freemem := mload(0x40)

            pop(
                call(
                    5000, //5k gas
                    _dest, //to
                    0, //no val
                    add(_data, 0x20),
                    mload(_data),
                    freemem,
                    0x20
                )
            )

            ret := mload(freemem)
            mstore(0x40, add(freemem, 0x20))
        }
    }
}
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

library Bytes {
    function getBytesAtLocation(bytes _data, uint256 _location)
        public pure returns (bytes)
    {
        uint256 start;
        assembly {
            start := mload(add(_data, _location))
        }

        // First get the locations based on `start` position.
        uint256 len = start + 0x20;
        uint256 data = len + 0x20;

        assembly {
            // Overwrite the values onto the locations.
            len := mload(add(_data, len))
            data := add(_data, data)
        }

        return toBytes(data, len);
    }

    function toBytes(uint256 _ptr, uint256 _len) 
        public pure returns (bytes)
    {
        bytes memory ret = new bytes(_len);

        uint256 retptr;

        assembly {
            retptr := add(ret, 0x20)
        }

        memcpy(retptr, _ptr, _len);
        return ret;
    }

    function memcpy(uint256 _dest, uint256 _src, uint256 _len)
        public pure
    {
        // Copy word-length chunks while possible
        for (; _len >= 0x20; _len -= 0x20) {
            assembly {
                mstore(_dest, mload(_src))
            }
            _dest += 0x20;
            _src += 0x20;
        }

        // Copy remaining bytes
        uint256 mask = 0x100 ** (0x20 - _len) - 1;
        assembly {
            let srcpart := and(mload(_src), not(mask))
            let destpart := and(mload(_dest), mask)
            mstore(_dest, or(destpart, srcpart))
        }
    }
}
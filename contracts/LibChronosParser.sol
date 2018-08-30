pragma solidity ^0.4.24;

import "./vendor/ZeroEx/LibBytes.sol";

library LibChronosParser {
    using LibBytes for bytes;

    function fields(bytes _data)
        returns (address to, uint256 value, uint256 gasLimit, uint256 gasPrice, bytes32 nonce, address gasToken, bytes callData, bytes extraData)
    {
        to = _data.readAddress(12);
        value = _data.readUint256(32);
        gasLimit = _data.readUint256(64);
        gasPrice = _data.readUint256(96);
        nonce = _data.readBytes32(128);
        gasToken = _data.readAddress(172);
        callData = new bytes(0);
        extraData = new bytes(0);
        // callData = _data.readBytesWithLength();
        // extraData = _data.readBytesWithLength();
    }

    function signature(bytes _data)
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        uint256 len = _data.length;

        assembly {
            r := mload(add(_data, sub(len, 0x40)))
            s := mload(add(_data, sub(len, 0x20)))
            v := mload(add(_data, sub(len, 0x1F)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28);
    }

    function signedBy(bytes _data)
        returns (address signer)
    {
        signer = address(0x0);
    }
}
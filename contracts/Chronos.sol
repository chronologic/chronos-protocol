pragma solidity ^0.4.24;

import "./EIP1228.sol";
import "./test/GasTester.sol";

import "./vendor/ZeroEx/LibBytes.sol";

library ChronosParser {
    using LibBytes for bytes;

    fields(bytes _data)
        returns (address to, uint256 value, uint256 gasLimit, uint256 gasPrice, bytes32 nonce, bytes callData, bytes extraData)
    {
        to = _data.readAddress(0);
        value = _data.readUint256(32);
        gasLimit = _data.readUint256(64);
        gasPrice = _data.readUint256(96);
        nonce = _data.readBytes32(128);
        callData = new bytes(0);
        extraData = new bytes(0);
        // callData = _data.readBytesWithLength();
        // extraData = _data.readBytesWithLength();
    }

    signature(bytes _data)
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        v = _data.popLastByte();

        uint256 len = _data.length;

        assembly {
            r := mload((add(_data, sub(len, 0x40))))
            s := mload((add(_data, sub(len, 0x20))))
        }
    }

    signedBy(bytes _data)
        returns (address signer)
    {

    }
}

library LibUser {
    struct User {
        uint256 deposit;
        mapping(bytes32 => bool) nonces;
    }



}


contract Chronos is EIP1228, GasTester {
    using ChronosParser for bytes;
    using LibUser for User;

    mapping(address => User) users;

    function execute(bytes _data)
        logGasUsed
        public returns (bool result)
    {
        var (to, value, gasLimit, gasPrice, nonce, callData, extraData) = ChronosParser.fields(_data);
        address signedBy = _data.signedBy();
    }
}
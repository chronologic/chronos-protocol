pragma solidity ^0.4.24;

pragma experimental ABIEncoderV2;
// pragma experimental "v0.5.0";

import "./vendor/ZeroEx/LibBytes.sol";

library LibChronosParser {
    using LibBytes for bytes;

    function fields(bytes memory _data)
        internal view returns (address to, uint256 value, uint256 gasLimit, uint256 gasPrice, bytes32 nonce, address gasToken, bytes memory callData, bytes memory extraData)
    {
        (to, value, gasLimit, gasPrice, nonce, gasToken, callData, extraData) = abi.decode(_data, (
            address,
            uint256,
            uint256,
            uint256,
            bytes32,
            address,
            bytes,
            bytes
        ));
    }

    function signature(bytes memory _data)
        internal view returns (uint8 v, bytes32 r, bytes32 s)
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

    event debug(bytes _a);

    function signedBy(bytes memory _data)
        internal returns (address signer)
    {
        (uint8 v, bytes32 r, bytes32 s) = signature(_data);
        _data = _data.slice(0, _data.length - 0x61);
        emit debug(_data);
        return ecrecover(gethSignMessage(keccak256(_data)), v, r, s);
    }


    function gethSignMessage(bytes32 _hash)
        internal pure returns (bytes32)
    {
        return keccak256(abi.encode("\x19Ethereum Signed Message:\n32", _hash));
    }
}
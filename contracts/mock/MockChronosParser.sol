pragma solidity ^0.4.24;

import "../LibChronosParser.sol";

/**
 * @dev MockChronosParser is used for testing LibChronosParser. 
 */
contract MockChronosParser {
    using LibChronosParser for bytes;

    function fields(bytes _data)
        public view returns (address to, uint256 value, uint256 gasLimit, uint256 gasPrice, bytes32 nonce, address gasToken, bytes callData, bytes extraData)
    {
        return _data.fields();
    }

    function signature(bytes _data)
        public view returns (uint8 v, bytes32 r, bytes32 s)
    {
        return _data.signature();
    }

    function signedBy(bytes _data)
        public view returns (address signer)
    {
        return _data.signedBy();
    }

}
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract C_Offchain {

    struct User {
        uint256 deposit;
        mapping (bytes32 => bool) nonces;
    }

    // /x19 /xc1 where /x19 is required and /xc1 for chronos v.1
    bytes2 constant public SIG_PREFIX = hex"19c1";

    bytes4 constant public CALL_PREFIX = bytes4(keccak256("execute(bytes,bytes)"));

    mapping(address => User) users;

    function deposit()
        public payable returns (bool)
    {
        users[msg.sender].deposit += msg.value;
    }

    function getDeposit(address _user)
        public view returns (uint256)
    {
        return users[_user].deposit;
    }

    event Execution(address _user, bytes32 _nonce, bool _success, uint256 _gasUsed);

    // event logGas(uint256 startGas, uint256 curGas, uint256 diff);

    /**
     * _addressArgs[0] - _to
     * _addressArgs[1] - _gasToken
     * _uintArgs[0] - _value
     * _uintArgs[1] - _gasPrice
     * _uintArgs[2] - _gasLimit
     * _bytesArgs[0] - _data
     * _bytesArgs[1] - _extraData
     * _bytesArgs[2] - _sig 
     */
    function execute(
        address[2] _addressArgs,
        uint256[3] _uintArgs,
        bytes _data,
        bytes _extraData,
        bytes _sig,
        bytes32 _nonce
    )
        public payable
    {
        uint256 startGas = gasleft();
        require(startGas >= _uintArgs[2]);

        address recovered = recover(
            getHash(_addressArgs, _uintArgs, _data, _nonce, _extraData),
            _sig,
            0
        );
                
        require(checkUserConditions(recovered, _nonce, _uintArgs));

        require(checkExecutionWindow(_extraData));
        // Roughly costs ~28k gas for calculations up to here
        // emit logGas(startGas, gasleft(), startGas - gasleft());
        bool success = _addressArgs[0].call.gas(_uintArgs[2]).value(_uintArgs[0])(_data);

        // uint256 afterExecuteGas = gasleft();

        uint256 gasUsed = 21000 + (startGas - gasleft());
        uint256 refundAmt = gasUsed * _uintArgs[1];
        address(msg.sender).transfer(refundAmt);

        emit Execution(recovered, _nonce, success, gasUsed);
        // roughly ~9800 for all calculation afterward.
        // emit logGas(afterExecuteGas, gasleft(), afterExecuteGas -gasleft());
    }

    event DebugExecutionWindow(uint256 _a, uint256 _b, uint256 _c);

    function checkExecutionWindow(bytes _extraData)
        public view returns (bool) 
    {
        uint256 temporalUnit;
        uint256 executionWindowStart;
        uint256 executionWindowLength;

        assembly {
            temporalUnit := mload(add(_extraData, 0x20))
            executionWindowStart := mload(add(_extraData, 0x40))
            executionWindowLength := mload(add(_extraData, 0x60))
        }

        // emit DebugExecutionWindow(temporalUnit, executionWindowStart, executionWindowLength);

        return true;
        // if (temporalUnit == 1) {
        //     return (
        //         block.number >= executionWindowStart &&
        //         block.number < executionWindowStart + executionWindowLength
        //     );
        // } else if (temporalUnit == 2) {
        //     return (
        //         block.timestamp >= executionWindowStart &&
        //         block.timestamp < executionWindowStart + executionWindowLength
        //     );
        // } else { revert("UNSUPPORTED TEMPORAL UNIT"); }
    }

    function checkUserConditions(address _recovered, bytes32 _nonce, uint[3] _uintArgs)
        internal returns (bool)
    {
        User storage user = users[_recovered];

        require(user.nonces[_nonce] == false);
        require(user.deposit >= (21000 + _uintArgs[2]) * _uintArgs[1]);

        user.nonces[_nonce] = true;
        return true;
    }

    // function verifySignature(bytes32 _hash, bytes _sigs)
    //     public view returns (bool)
    // {


    // }

    function gethSignMessage(bytes32 _hash)
        public pure returns (bytes32)
    {
        return keccak256("\x19Ethereum Signed Message:\n32", _hash);
    }

    event debug2(address c);

    function recover2(bytes32 _hash, uint8 _v, bytes32 _r, bytes32 _s)
        public returns (address)
    {
        return ecrecover(gethSignMessage(_hash), _v, r, s);
    }

    function recover(bytes32 _hash, bytes _sigs, uint256 _pos)
        public view returns (address)
    {
        // emit debug1(_sigs);
        uint8 v;
        bytes32 r;
        bytes32 s;
        (v, r, s) = sigSplit(_sigs, _pos);

        address recovered = ecrecover(gethSignMessage(_hash),v,r,s);
        // emit debug2(recovered);
        return recovered;
    }

    event debug1(bytes a);
    event debug(uint8 v, bytes32 r, bytes32 s);

    function sigSplit(bytes _sigs, uint256 _pos)
        public view returns (uint8 v, bytes32 r, bytes32 s)
    {
        // emit debug1(_sigs);
        uint pos = _pos + 1;

        // The signature is a compact form of 
        //  {bytes32 r}{bytes32 s}{uint8 v}
        // Compact meaning uint8 is not padded to bytes32
        assembly {
            r := mload(add(_sigs, mul(0x20, pos)))
            s := mload(add(_sigs, mul(0x40, pos)))

            v := and(mload(add(_sigs, mul(0x60, pos))), 1)
        }

        if (v < 27) { v += 27; }

        require(v == 27 || v == 28);

        // emit debug(v, r, s);
    }

    function getHash(
        address[2] _addressArgs,
        uint256[3] _uintArgs,
        bytes _data,
        bytes32 _nonce,
        bytes _extraData
    )
        public view returns (bytes32)
    {
        return keccak256(
            SIG_PREFIX,
            address(this),
            _addressArgs[0],
            _uintArgs[0],
            keccak256(_data),
            _nonce,
            _uintArgs[1],
            _uintArgs[2],
            _addressArgs[1],
            CALL_PREFIX,
            keccak256(_extraData)
            // new bytes()
        );
    }


}
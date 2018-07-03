pragma solidity ^0.4.24;

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

    function execute(
        address _to,
        uint256 _value,
        bytes _data,
        bytes32 _nonce,
        uint256 _gasPrice,
        uint256 _gasLimit,
        address _gasToken,
        bytes _sigs
    )
        public payable
    {
        uint256 startGas = gasleft();
        require(startGas >= _gasLimit);

        bytes32 sigHash = getHash(_to, _value, _data, _nonce, _gasPrice, _gasLimit, _gasToken);
        
        address recovered = recover(sigHash, _sigs, 0);

        User storage user = users[recovered];

        require(user.nonces[_nonce] == false);
        require(user.deposit >= (21000 + _gasLimit) * _gasPrice);

        user.nonces[_nonce] = true;
        
        bool success = _to.call.gas(_gasLimit).value(_value)(_data);

        uint256 gasUsed = 21000 + (startGas - gasleft());
        uint256 refundAmt = gasUsed * _gasPrice;
        address(msg.sender).transfer(refundAmt);

        emit Execution(recovered, _nonce, success, gasUsed);
    }

    // function verifySignature(bytes32 _hash, bytes _sigs)
    //     public view returns (bool)
    // {


    // }

    function gethSignMessage(bytes32 _hash)
        public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash));
    }

    function recover(bytes32 _hash, bytes _sigs, uint256 _pos)
        public pure returns (address)
    {
        uint8 v;
        bytes32 r;
        bytes32 s;
        (v, r, s) = sigSplit(_sigs, _pos);

        return ecrecover(gethSignMessage(_hash),v,r,s);
    }

    function sigSplit(bytes _sigs, uint256 _pos)
        public pure returns (uint8 v, bytes32 r, bytes32 s)
    {
        uint pos = _pos + 1;

        // The signature is a compact form of 
        //  {bytes32 r}{bytes32 s}{uint8 v}
        // Compact meaning uint8 is not padded to bytes32
        assembly {
            r := mload(add(_sigs, mul(0x20, pos)))
            s := mload(add(_sigs, mul(0x40, pos)))

            v := and(mload(add(_sigs, mul(0x60, pos))), 0xff)
        }

        if (v < 27) { v += 27; }

        require(v == 27 || v == 28);
    }

    function getHash(
        address _to,
        uint256 _value,
        bytes _data,
        bytes32 _nonce,
        uint256 _gasPrice,
        uint256 _gasLimit,
        address _gasToken
    )
        public view returns (bytes32)
    {
        return keccak256(
            SIG_PREFIX,
            address(this),
            _to,
            _value,
            keccak256(_data),
            _nonce,
            _gasPrice,
            _gasLimit,
            _gasToken,
            CALL_PREFIX
            // new bytes()
        );
    }


}
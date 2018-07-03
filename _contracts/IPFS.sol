pragma solidity ^0.4.19;

/**
 * @title IPFS
 * Contract to verify IPFS hashes on chain.
 * Cribbed from https://github.com/MrChico/verifyIPFS/blob/master/contracts/verifyIPFS.sol
 */
contract IPFS {
    // struct MultiHash {
    //     bytes32 digest;
    //     uint8 hashFunction;
    //     uint8 size;
    // }

    bytes constant Prefix1 = hex"0a";
    bytes constant Prefix2 = hex"080212";
    bytes constant Postfix = hex"18";
    bytes constant Sha256MultiHashPrefix = hex"12";
    bytes constant LengthPrefix = hex"20";
    bytes constant ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    function generateHash(bytes _data) 
        public constant returns (bytes32 sha256HashOfData)//(bytes b58Hash)
    {
        // Convert the string to bytes explicitly.
        // bytes memory data = _data;
        //
        bytes memory len1 = lengthEncode(_data.length);
        bytes memory len2 = lengthEncode(_data.length + 4 + 2*len1.length);
        return sha256(Prefix1, len2, Prefix2, len1, _data, Postfix, len1);
        // return concat(concat(Sha256MultiHashPrefix, LengthPrefix), toBytes(sha256(Prefix1, len2, Prefix2, len1, data, Postfix, len1)));
        // return base58(concat(concat(Sha256MultiHashPrefix, LengthPrefix), toBytes(sha256(
        //     Prefix1, len2, Prefix2, len1, data, Postfix, len1
        // ))));
    }

    function lengthEncode(uint256 _length)
        public constant returns (bytes)
    {
        if (_length < 128) {
            return bin(_length);
        } else {
            return concat(bin(_length % 128 + 128), bin(_length / 128));
        }
    }

    // function base58(bytes _source)
    //     public pure returns (bytes)
    // {
    //     if (_source.length == 0) {
    //         return new bytes(0);
    //     }
    //     uint8[] memory digits = new uint8[](40);
    //     digits[0] = 0;
    //     uint8 digitLength = 1;
    //     for (uint i = 0; i < _source.length; i++) {
    //         uint carry = uint8(_source[i]);
    //         for (uint j = 0; j < digitLength; j++) {
    //             carry += uint(digits[j]) * 256;
    //             digits[j] = uint8(carry % 58);
    //             carry = carry / 58;
    //         }

    //         while (carry > 0) {
    //             digits[digitLength] = uint8(carry % 58);
    //             digitLength++;
    //             // carry = carry / 58; // this line throws the invalid opcode
    //             carry = 0; // this fixes it
    //         }
    //     }
    //     return _source; // this is for testing
    //     // return toAlphabet(reverse(truncate(digits, digitLength)));
    // }

    // function truncate(uint8[] _array, uint8 _length)
    //     public pure returns (uint8[])
    // {
    //     uint8[] memory out = new uint8[](_length);
    //     for (uint i = 0; i < _length; i++) {
    //         out[i] = _array[i];
    //     }
    //     return out;
    // }

    // function reverse(uint8[] _in)
    //     public pure returns (uint8[])
    // {
    //     uint8[] memory out = new uint8[](_in.length);
    //     for (uint i = 0; i < _in.length; i++) {
    //         out[i] = _in[_in.length-1-i];
    //     }
    //     return out;
    // }

    // function toAlphabet(uint8[] _indices)
    //     public pure returns (bytes)
    // {
    //     bytes memory out = new bytes(_indices.length);
    //     for (uint i = 0; i < _indices.length; i++) {
    //         out[i] = ALPHABET[_indices[i]];
    //     }
    //     return out;
    // }

    function toBytes(bytes32 _in)
        public pure returns (bytes)
    {
        bytes memory out = new bytes(32);
        for (uint8 i = 0; i < 32; i++) {
            out[i] = _in[i];
        }
        return out;
    }

    function bin(uint256 _x) 
        public view returns (bytes)
    {
        if (_x == 0) {
            return new bytes(0);
        } else {
            byte s = byte(_x % 256);
            bytes memory res = new bytes(1);
            res[0] = s;
            return concat(bin(_x / 256), res);
        }
    }

    function concat(bytes _byteArray, bytes _byteArray2)
        public pure returns (bytes)
    {
        bytes memory resArray = new bytes(_byteArray.length + _byteArray2.length);
        for (uint16 i = 0; i < _byteArray.length; i++) {
            resArray[i] = _byteArray[i];
        }
        for (i; i < (_byteArray.length + _byteArray2.length); i++) {
            resArray[i] = _byteArray2[i - _byteArray.length];
        }
        return resArray;
    }
}
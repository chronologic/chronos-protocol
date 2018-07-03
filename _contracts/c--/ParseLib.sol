pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

library ParseLib {
    struct Transaction {
        address to;
        uint256 gas;
        uint256 gasPrice;
        uint256 value;

        uint256 temporalUnit;
        uint256 executionWindowStart;
        uint256 executionWindowLength;

        uint256 bounty;

        bytes data;
    }

    function inExecutionWindow(Transaction _T)
        public view returns (bool)
    {
        if (_T.temporalUnit == 1) {
            return (
                block.number >= _T.executionWindowStart &&
                block.number < _T.executionWindowStart + _T.executionWindowLength
            );
        } else if (_T.temporalUnit == 2) {
            return (
                block.timestamp >= _T.executionWindowStart &&
                block.timestamp < _T.executionWindowStart + _T.executionWindowLength
            );
        } else { return false; }
    }

    function payBounty(Transaction _T)
        public view returns (bool)
    {
        return msg.sender.transfer(_T.bounty);
    }

    function execute(Transaction _T) 
        public payable returns (bool)
    {
        require(_T.inExecutionWindow());
        require(_T.gasPrice == tx.gasprice);
        return _T.to.call.gas(_T.gas).value(_T.value)(_T.data);
    }

    function fromData(bytes _serializedTransaction)
        public returns (Transaction)
    {
        address to;
        uint256 callGas;
        uint256 gasPrice;
        uint256 value;
        uint256 temporalUnit;
        uint256 executionWindowStart;
        uint256 executionWindowLength;
        uint256 bounty;

        assembly {
            to := mload(add(_serializedTransaction, 0x20))
            callGas := mload(add(_serializedTransaction, 0x40))
            gasPrice := mload(add(_serializedTransaction, 0x60))
            value := mload(add(_serializedTransaction, 0x80))
            temporalUnit := mload(add(_serializedTransaction, 0xa0))
            executionWindowStart := mload(add(_serializedTransaction, 0xc0))
            executionWindowLength := mload(add(_serializedTransaction, 0x100))
            bounty := mload(add(_serializedTransaction, 0x120))
        }

        bytes memory data = getBytesAtLocation(_serializedTransaction, 0x160);

        return Transaction(
            to,
            callGas,
            gasPrice,
            value,
            temporalUnit,
            executionWindowStart,
            executionWindowLength,
            bounty,
            data
        );
    }

    function getBytesAtLocation(bytes _data, uint256 _location)
        public pure returns (bytes)
    {
        uint256 start;
        assembly {
            start := mload(add(_data), _location)
        }

        // First get the locations based on `start` position.
        uint256 len = start + 0x20;
        uint256 ret = len + 0x20;

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
        for (; _len >= 0x20; len -= 0x20) {
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
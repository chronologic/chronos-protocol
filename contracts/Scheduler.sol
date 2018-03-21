pragma solidity ^0.4.19;

import "./CloneFactory.sol";
import "./EventEmitter.sol";
import "./IPFS.sol";
import "./ScheduledTransaction.sol";

contract Scheduler is CloneFactory, EventEmitter {
    function () public { revert(); }

    address ipfs;
    address scheduledTxCore;

    function Scheduler(
        address _ipfsLib,
        address _scheduledTxCore
    ) public {
        ipfs = _ipfsLib;
        scheduledTxCore = _scheduledTxCore;
    }

    function schedule(bytes _serializedParams) 
        public payable returns (address scheduledTx)
    {
        // DEBUG(_serializedParams);
        // Deploy the ScheduledTransaction contract

        address recipient;
        uint256 value;
        uint256 callGas;
        uint256 gasPrice;
        uint256 executionWindowStart;
        uint256 executionWindowLength;
        uint256 bounty;
        uint256 fee;
        // No requiredDeposit - Use Day Token now

        assembly {
            recipient := mload(add(_serializedParams, 32))
            value := mload(add(_serializedParams,64))
            callGas := mload(add(_serializedParams, 96))
            gasPrice := mload(add(_serializedParams, 128))
            executionWindowStart := mload(add(_serializedParams, 160))
            executionWindowLength := mload(add(_serializedParams, 192))
            bounty := mload(add(_serializedParams, 224))
            fee := mload(add(_serializedParams, 256))
            // CallData = everything after this
        }

        logParameters(
            recipient,
            value,
            callGas,
            gasPrice,
            executionWindowStart,
            executionWindowLength,
            bounty,
            fee
        );

        // uint endowment = value + callGas * gasPrice + bounty + fee;
        // require(msg.value >= endowment);

        bytes32 ipfsHash = IPFS(ipfs).generateHash(string(_serializedParams));
        // DEBUG2(ipfsHash);
        scheduledTx = createTransaction();
        require(scheduledTx != 0x0);

        ScheduledTransaction(scheduledTx).init.value(msg.value)(ipfsHash, msg.sender);
        // Store in the request tracker
        logNewTransactionScheduled(scheduledTx, msg.sender);
    }

    event DEBUG(bytes __B);
    event DEBUG2(bytes32 _part);

    function createTransaction() public returns (address) {
        return createClone(scheduledTxCore);
    }
}

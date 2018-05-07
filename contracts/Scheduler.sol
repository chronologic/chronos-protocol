pragma solidity ^0.4.19;

import "./ClaimElection.sol";
import "./CloneFactory.sol";
import "./EventEmitter.sol";
import "./IPFS.sol";
import "./ScheduledTransaction.sol";

contract Scheduler is CloneFactory {
    function () public {revert();}

    // address public claimElection;
    address public eventEmitter;
    address public feeRecipient;
    address public ipfs;
    address public scheduledTxCore;

    function Scheduler(
        address _eventEmitter,
        address _feeRecipient,
        address _ipfsLib,
        address _scheduledTxCore
    ) public {
        // Deploy a new pQueue and claim election
        // claimElection = address(new ClaimElection());

        eventEmitter = _eventEmitter;
        feeRecipient = _feeRecipient;
        ipfs = _ipfsLib;
        scheduledTxCore = _scheduledTxCore;
    }

    function schedule(bytes _serializedTransaction) 
        public payable returns (address scheduledTx)
    {
        uint256 value;
        uint256 callGas;
        uint256 gasPrice;
        uint256 bounty;
        uint256 fee;

        assembly {
            value := mload(add(_serializedTransaction, 96))
            callGas := mload(add(_serializedTransaction, 128))
            gasPrice := mload(add(_serializedTransaction, 160))
            bounty := mload(add(_serializedTransaction, 256))
            fee := mload(add(_serializedTransaction, 288))
        }
        
        uint endowment = value + callGas * gasPrice + bounty + fee;
        require(msg.value >= endowment);
        
        bytes32 ipfsHash = IPFS(ipfs).generateHash(_serializedTransaction);

        scheduledTx = createTransaction();
        require(scheduledTx != 0x0);

        // Claim Logic Start
        // if (!ClaimElection(claimElection).isEmpty()) {
        //     address nextClaimingNode = ClaimElection(claimElection).getNext();
        // }
        // Claim Logic End

        ScheduledTransaction(scheduledTx).init.value(msg.value)(ipfsHash, msg.sender, address(this), address(0x17B17026C423a988C3D1375252C3021ff32F354C));

        // Record on the event emitter
        EventEmitter(eventEmitter).logNewTransactionScheduled(scheduledTx, _serializedTransaction, msg.sender);
    }

    function createTransaction() public returns (address) {
        return createClone(scheduledTxCore);
    }
}

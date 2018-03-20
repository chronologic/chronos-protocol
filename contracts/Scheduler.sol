pragma solidity ^0.4.19;

import "./IPFS.sol";
import "./ScheduledTransaction.sol";

contract Scheduler {
    function () public { revert(); }

    address ipfs;

    function Scheduler(address _ipfsLib) public {
        ipfs = _ipfsLib;
    }

    event DEBUG(bytes __B);

    function schedule(bytes _serializedParams) 
        public payable returns (address scheduledTx)
    {
        DEBUG(_serializedParams);
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

        Params(
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
        DEBUG2(ipfsHash);
        scheduledTx = createTransaction(ipfsHash);
        // require(scheduledTx != 0x0);

        ScheduledTransaction(scheduledTx).init.value(msg.value);
        // Store in the request tracker
        NewScheduledTransaction(scheduledTx, msg.sender);
    }

    event DEBUG2(bytes32 _part);


    function createTransaction(bytes32 _hash) public pure returns (address) {}

    event NewScheduledTransaction(address tx, address indexed creator);
    event Params(
        address recip,
        uint256 val,
        uint256 ga,
        uint256 gp,
        uint256 ews,
        uint256 ewl,
        uint256 b,
        uint256 f
    );
}

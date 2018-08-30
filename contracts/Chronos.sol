// pragma solidity ^0.4.24;

// import "./EIP1228.sol";
// import "./test/GasTester.sol";

// library LibUser {
//     struct User {
//         uint256 deposit;
//         mapping(bytes32 => bool) nonces;
//     }
// }

// contract UserBase {
//     using LibUser for User;

//     mapping(address => User) users;

//     function getDeposit(address _userAddr)
//         public view returns (uint256 deposit)
//     {
//         deposit = users[_userAddr].deposit;
//     }

//     function nonceUsed(address _userAddr, bytes32 _nonce)
//         public view returns (bool used)
//     {
//         used = users[_userAddr][_nonce];
//     }
// }


// contract Chronos is EIP1228, GasTester, UserBase {
//     using ChronosParser for bytes;

//     function execute(bytes _data)
//         logGasUsed
//         public returns (bool result)
//     {
//         var (to, value, gasLimit, gasPrice, nonce, callData, extraData) = ChronosParser.fields(_data);
//         address signedBy = _data.signedBy();
//     }
// }
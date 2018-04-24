pragma solidity ^0.4.20;

contract Auth {
    address public authorized;
    address public awaitingConfirm;

    modifier auth {
        require(msg.sender == authorized);
        _;
    }

    function Auth() {
        authorized = msg.sender;
    }

    function transferAuth(address _newAuthorized)
        auth
        public returns (bool)
    {
        awaitingConfirm = _newAuthorized;
        return true;
    }

    function acceptAuth()
        public returns (bool)
    {
        require(msg.sender == awaitingConfirm);
        delete awaitingConfirm;
        authorized = msg.sender;
        return true;
    }
}
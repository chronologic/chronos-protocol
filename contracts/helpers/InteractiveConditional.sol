pragma solidity 0.4.21;

contract InteractiveConditional {
    bool valid = false;

    function checkValid()
        public view returns (bool)
    {
        return valid;
    }

    function setValid(bool _valid)
        public
    {
        valid = _valid;
    }
}
pragma solidity ^0.4.21;

/**
 * PriorityQueue
 * Cribbed from https://github.com/omisego/plasma-mvp/blob/master/plasma/root_chain/contracts/DataStructures/PriorityQueue.sol
 */

contract PriorityQueue {

    modifier auth() {
        require(msg.sender == authorized);
        _;
    }

    // The authorized operator or contract using this Priority
    // Queue
    address authorized;

    // The heap
    uint256[] heap;

    // The size of the queue
    uint256 size;

    //constructor
    function PriorityQueue(address _authorized) public {
        authorized = _authorized;
    }

    // Return true if the priority queue is empty
    function isEmpty()
        public view returns (bool)
    {
        return size == 0;
    }

    // Returns the next in the priority queue
    function peek()
        public view returns (uint256)
    {
        require(!isEmpty());
        return heap[1];
    }

    function insert(uint256 _priority) 
        auth
        public returns (bool)
    {
        heap.push(_priority);
        size += 1; //todo SafeMath
        percUp(size);
        return true;
    }

    function percUp(uint256 _i)
        private
    {
        uint256 j = _i;

        uint256 newVal = heap[j];
        while (newVal < heap[j / 2]){
            heap[j] = heap[j / 2];
            j = j / 2;
        }
        if (j != _i) {
            heap[j] = newVal;
        }
    }

    function pop()
        auth
        public returns (uint256 retVal)
    {
        retVal = heap[1];
        heap[1] = heap[size];
        delete heap[size];
        size = size - 1; //todo SafeMath
        percDown(1);
        heap.length = heap.length -1;
        // retVal returns
    }

    function percDown(uint256 _i)
        private
    {
        uint256 j = _i;
        uint256 newVal = heap[j];
        uint256 mc = minChild(j);
        while (mc <= size && newVal > heap[mc]) {
            heap[j] = heap[mc];
            j = mc;
            mc = minChild(j);
        }
        if (j != _i) {
            heap[j] = newVal;
        }
    }

    function minChild(uint256 _i)
        private returns (uint256 mc)
    {
        if (_i * 2 + 1 > size) {
            mc = _i *2;
        } else {
            if (heap[_i * 2] < heap[_i * 2 + 1]) {
                mc = _i * 2;
            } else {
                mc = _i * 2 +1;
            }
        }
    }
}
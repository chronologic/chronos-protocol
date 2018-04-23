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

    struct Timenode {
        address at;
        uint256 bond;
    }

    // The heap
    Timenode[] heap;

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
        public view returns (uint256, address)
    {
        require(!isEmpty());
        return (heap[1].bond, heap[1].at);
    }

    function insert(uint256 _priority, address _tn) 
        auth
        public returns (bool)
    {
        heap.push(Timenode({
            at: _tn,
            bond: _priority
        }));
        size += 1; //todo SafeMath
        percUp(size);
        return true;
    }

    function getAtIndex(uint256 _idx)
        public view returns (uint256, address)
    {
        return (heap[_idx].bond, heap[_idx].at);
    }

    function percUp(uint256 _i)
        private
    {
        uint256 j = _i;

        var (newVal, newTn) = getAtIndex(j);
        while (newVal < heap[j / 2].bond){
            heap[j] = heap[j / 2];
            j = j / 2;
        }
        if (j != _i) {
            heap[j] = Timenode({
                at: newTn,
                bond: newVal
            });
        }
    }

    function pop()
        auth
        public returns (uint256 retVal, address retAddr)
    {
        (retVal, retAddr) = peek();
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
        var (newVal, newTn) = getAtIndex(j);
        uint256 mc = minChild(j);
        while (mc <= size && newVal > heap[mc].bond) {
            heap[j] = heap[mc];
            j = mc;
            mc = minChild(j);
        }
        if (j != _i) {
            heap[j] = Timenode({
                bond: newVal,
                at: newTn
            });
        }
    }

    function minChild(uint256 _i)
        private returns (uint256 mc)
    {
        if (_i * 2 + 1 > size) {
            mc = _i *2;
        } else {
            if (heap[_i * 2].bond < heap[_i * 2 + 1].bond) {
                mc = _i * 2;
            } else {
                mc = _i * 2 +1;
            }
        }
    }
}
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
    address public authorized;

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
        heap.push(Timenode({
            at: address(0x0),
            bond: 0
        }));
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
        return (heap[0].bond, heap[0].at);
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
        while(j > 0 && heap[j / 2].bond < newVal) {
            heap[j] = heap[j/2];
            j = j/2 ;
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
        heap[0] = heap[size];
        delete heap[size];
        size = size - 1; //todo SafeMath
        percDown(0);
        heap.length = heap.length -1;
        // retVal returns
    }

    function percDown(uint256 _i)
        private
    {
        uint256 j = _i;

        uint256 largest;
        uint256 left = 2*j +1;
        uint256 right = left +1;

        if (left < size && heap[left].bond > heap[j].bond) {
            largest = left;
        } else {
            largest = j;
        }

        if(right < size && heap[right].bond > heap[largest].bond) {
            largest = right;
        }

        if (largest != j) {
            var (newVal, newTn) = getAtIndex(j);
            heap[j] = heap[largest];
            heap[largest] = Timenode({
                at: newTn,
                bond: newVal
            });
            percDown(largest);
        }
    }
}
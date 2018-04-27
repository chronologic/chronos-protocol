pragma solidity ^0.4.21;

import "./Auth.sol";

/**
 * PriorityQueue
 * Cribbed from https://github.com/omisego/plasma-mvp/blob/master/plasma/root_chain/contracts/DataStructures/PriorityQueue.sol
 * Changed to be max value heap instead of min value, and use the `Timenode` struct.
 */

contract PriorityQueue is Auth {

    struct Timenode {
        address at;
        bytes32 id;
        bytes32 left;
        bytes32 right;
        uint256 bond;
    }

    struct Queue {
        bytes32 first;
        bytes32 last;
        uint256 size;
        uint256 minBond;
        uint256 maxBond;
        mapping( bytes32=>Timenode ) timeNodes;
    }

    Queue heap;

    event Enter(uint256 val, address addr);
    event Exit(uint256 val, address addr);
    event POP(uint256 val, address addr);

    function PriorityQueue() public {}

    // Return true if the priority queue is empty
    function isEmpty()
        public view returns (bool)
    {
        return heap.size == 0;
    }

    function queueSize()
        public view returns (uint256)
    {
      return heap.size;
    }

    function firstNode()
        public view returns (bytes32)
    {
      return heap.first;
    }

    function lastNode()
        public view returns (bytes32)
    {
      return heap.last;
    }

    function getTimeNode (bytes32 _timeNode)
        public view returns (bytes32 id, bytes32 left, bytes32 right, address at, uint256 bond)
    {
        return (heap.timeNodes[_timeNode].id, heap.timeNodes[_timeNode].left, heap.timeNodes[_timeNode].right, heap.timeNodes[_timeNode].at, heap.timeNodes[_timeNode].bond);
    }

    // Returns the next in the priority queue
    function peek()
        public view returns (uint256, address)
    {
        require(!isEmpty());
        return (heap.timeNodes[heap.first].bond, heap.timeNodes[heap.first].at);
    }

    function getAtIndex(bytes32 _idx)
        public view returns (uint256, address)
    {
        if (heap.timeNodes[_idx].at == 0x0) return;
        return (heap.timeNodes[_idx].bond, heap.timeNodes[_idx].at);
    }

    function validateInsertPosition( bytes32 _previousNode, uint256 _priority)
        public view returns (bool)
     {
        if(_previousNode != 0x0){
          require(heap.timeNodes[_previousNode].bond >= _priority);
          if ( _previousNode != heap.last) {
            require(heap.timeNodes[ heap.timeNodes[_previousNode].right ].bond < _priority);
          }
        } else {
          if(heap.first != 0x0) {
            require(heap.timeNodes[heap.first].bond < _priority); //Ensure older nodes, with same bond remain at the top of the line
          }
        }
        return true;
    }

    function insert(bytes32 _previousNode,uint256 _priority, address _tn)
        auth
        public returns (bool)
    {
        require(validateInsertPosition(_previousNode,_priority));
        bytes32 _idx = keccak256(_tn,_priority,block.timestamp);// reduce posibility of overwriting

        assert(heap.timeNodes[_idx].at == 0x0); // Ensure no overwriting

        heap.timeNodes[_idx] = Timenode(_tn, _idx, _previousNode, heap.timeNodes[_previousNode].right, _priority );
        heap.size = heap.size+1;

        if(heap.timeNodes[_idx].left != 0x0) {
          heap.timeNodes[_previousNode].right = _idx;
        } else {
          heap.first = _idx;
          heap.maxBond = _priority;
        }

        if(heap.timeNodes[_idx].right != 0x0) {
          heap.timeNodes[ heap.timeNodes[_idx].right ].left = _idx;
        } else {
          heap.last = _idx;
          heap.minBond = _priority;
        }
        emit Enter(_priority, _tn);
        return true;
    }

    function remove(bytes32 _timeNode)
        internal returns (bool)
    {
        if (_timeNode == 0x0) { //TODO should be handled correctly
          return true;
        }

        uint256 _priority = heap.timeNodes[_timeNode].bond;
        address _tn = heap.timeNodes[_timeNode].at;

        if (heap.timeNodes[_timeNode].left == 0x0) {
          heap.first = heap.timeNodes[_timeNode].right;
          heap.maxBond = heap.timeNodes[ heap.timeNodes[_timeNode].right ].bond;
          heap.timeNodes[ heap.timeNodes[_timeNode].right ].left = 0x0;
        } else {
          heap.timeNodes[ heap.timeNodes[_timeNode].left ].right = heap.timeNodes[_timeNode].right;
        }

        if (heap.timeNodes[_timeNode].right == 0x0) {
          heap.last = heap.timeNodes[_timeNode].left;
          heap.minBond = heap.timeNodes[ heap.timeNodes[_timeNode].left ].bond;
          heap.timeNodes[ heap.timeNodes[_timeNode].left ].right = 0x0;
        } else {
          heap.timeNodes[ heap.timeNodes[_timeNode].right ].left = heap.timeNodes[_timeNode].left;
        }

        delete(heap.timeNodes[_timeNode]);
        heap.size = heap.size-1;
        emit Exit(_priority, _tn);
        return true;
    }

    function pop()
        auth
        public returns (uint256 retVal, address retAddr)
    {
        (retVal, retAddr) = peek();
        assert(remove(heap.first));
        emit POP(retVal, retAddr);
        // retVal returns
    }

    function getInsertPosition(uint256 _bond)
        public view returns (bytes32 _previousNode)
    { //Should only be called from JS using(.call), to ensure maximum gasOptimization
        if (_bond > heap.maxBond) {
          return 0;
        }
        if (_bond <= heap.minBond) {
          return heap.last;
        }
        if ( (((heap.maxBond - heap.minBond)/2) + heap.minBond) > _bond ){
          return percUp(_bond);
        } else {
          return percDown(_bond);
        }
    }

    function percUp (uint256 _bond)
        public view returns (bytes32 _previousNode)
    {
        bytes32 activeNode = heap.timeNodes[heap.last].left;
        for ( uint256 i = heap.size-2; i>0; i--) {
          if( activeNode == 0x0) { //If it reaches the top of the queue, should never happen
            return 0;
          }
          if ( heap.timeNodes[activeNode].bond >= _bond) {
            return activeNode;
          }
          activeNode = heap.timeNodes[activeNode].left;
        }
    }

    function percDown (uint256 _bond)
        public view returns (bytes32 _previousNode)
    {
      bytes32 activeNode = heap.first;
      for ( uint256 i = 0; i < heap.size; i++) {
        if( activeNode == 0x0) { //If it reaches the end of the queue, should never happen
          return heap.last;
        }
        if ( heap.timeNodes[activeNode].bond < _bond) {
          return heap.timeNodes[activeNode].left;
        }
        activeNode = heap.timeNodes[activeNode].right;
      }
    }
}

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
        bytes8 id;
        bytes8 left;
        bytes8 right;
        uint256 bond;
    }

    struct Queue {
        bytes8 first;
        bytes8 last;
        uint256 size;
        uint256 minBond;
        uint256 maxBond;
        mapping( bytes8=>Timenode ) timeNodes;
    }

    Queue heap;

    event Enter(bytes8 id, uint256 val);
    event Exit(bytes8 id, uint256 val);
    event Pop(uint256 val, address addr);

    // function PriorityQueue() public {}

    /**
	 * isEmpty()
	 * Returns <bool> true if the PriorityQueue is empty.
	 */
    function isEmpty()
        public view returns (bool)
    {
        return heap.size == 0;
    }

    /**
	 * queueSize()
	 * Returns <uint256> number of nodes in the PriorityQueue.
	 */
    function queueSize()
        public view returns (uint256)
    {
      return heap.size;
    }

	/**
	 * firstNode()
	 * Returns <bytes8> UUID of the next node in the PriorityQueue.
	 */
    function firstNode()
        public view returns (bytes8)
    {
      return heap.first;
    }

	/**
	 * lastNode()
	 * Returns <bytes8> UUID of the last node in the PriorityQueue.
	 */
    function lastNode()
        public view returns (bytes8)
    {
      return heap.last;
    }

	/**
	 * getTimenode()
	 * Returns <(bytes8, bytes8, bytes8, address, uint256)> tuple containing the UUID,
	 * left node, right node, address of, and bond value of the Timenode.
	 */
    function getTimenode (bytes8 _timeNode)
        public view returns (bytes8 id, bytes8 left, bytes8 right, address at, uint256 bond)
    {
        return (heap.timeNodes[_timeNode].id, heap.timeNodes[_timeNode].left, heap.timeNodes[_timeNode].right, heap.timeNodes[_timeNode].at, heap.timeNodes[_timeNode].bond);
    }

    /**
	 * peek()
	 * Returns <(uint256, address)> tuple containing the bond value and address of the
	 * first Timenode in the PriorityQueue.
	 */
    function peek()
        public view returns (uint256, address)
    {
        require(!isEmpty());
        return (heap.timeNodes[heap.first].bond, heap.timeNodes[heap.first].at);
    }

	/**
	 * getAtIndex(<bytes8>)
	 * Returns <(uint256, address)> tuple containg the bond value and address
	 * of the node at index `_idx`.
	 */
    function getAtIndex(bytes8 _idx)
        public view returns (uint256, address)
    {
        if (heap.timeNodes[_idx].at == 0x0) return;
        return (heap.timeNodes[_idx].bond, heap.timeNodes[_idx].at);
    }

    function snapShotQueue()
        public view returns (uint256 length,bytes8[] ids,bytes8[] lefts,bytes8[] rights,uint256[] bonds)
    {
        bytes8[] memory _ids = new bytes8[](heap.size);
        bytes8[] memory _lefts = new bytes8[](heap.size);
        bytes8[] memory _rights = new bytes8[](heap.size);
        uint256[] memory _bonds = new uint256[](heap.size);
        bytes8 active = heap.first;
        for( uint i=0; i<heap.size; i++) {
          _ids[i] = heap.timeNodes[active].id;
          _lefts[i] = heap.timeNodes[active].left;
          _rights[i] = heap.timeNodes[active].right;
          _bonds[i] = heap.timeNodes[active].bond;
          active = heap.timeNodes[active].right;
        }
        return (heap.size, _ids, _lefts, _rights, _bonds);
    }

	/**
	 * validateInsertPosition(<bytes8, uint256>)
	 * Returns <bool> True if the this is the correct insert placement of the _priority value.
	 */
    function validateInsertPosition(bytes8 _previousNode, uint256 _priority)
        public view returns (bool)
     {
        if (_previousNode != 0x0) {
    			// If trying to insert at position not at index 0, require _priority <= previous bond value.
    			require(heap.timeNodes[_previousNode].bond >= _priority);
    			if (_previousNode != heap.last) {
    				bytes8 rightNode = heap.timeNodes[_previousNode].right;
    				// Always place a new insert behind the ones before it by requiring the _priority
    				// is greater than the right node's bond value.
    				require(heap.timeNodes[rightNode].bond < _priority);
    			}
        } else { // if _previousNode === 0x0, i.e. try insert at index 0.
    			if(heap.first != 0x0) {
    				 //Ensure older nodes, with same bond value remain at the top of the line.
    				require(heap.timeNodes[heap.first].bond < _priority);
    			}
        }
        return true;
    }

	/**
	 * insert(<bytes8, uint256, address>)
	 * Returns <bool> True if the insert is successful.
	 */
    function insert(bytes8 _previousNode, uint256 _priority, address _tn)
        auth
        public returns (bool)
    {
        require(validateInsertPosition(_previousNode,_priority));
        bytes8 _idx = bytes8(keccak256(_tn, _priority, block.timestamp));// reduce posibility of overwriting

        assert(heap.timeNodes[_idx].at == 0x0); // Ensure no overwriting

        bytes8 _right;
        if (_previousNode == 0x0) {
          _right = heap.first;
        } else {
          _right = heap.timeNodes[_previousNode].right;
        }

        heap.timeNodes[_idx] = Timenode(_tn, _idx, _previousNode, _right, _priority );
        heap.size++;

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
        emit Enter(_idx, _priority);
        return true;
    }

    function remove(bytes8 _timeNode)
        internal returns (bool)
    {
        if (_timeNode == 0x0) { //TODO should be handled correctly
          return true;
        }

        uint256 _priority = heap.timeNodes[_timeNode].bond;

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
        heap.size--;
        emit Exit(_timeNode, _priority);
        return true;
    }

    function pop()
        auth
        public returns (uint256 retVal, address retAddr)
    {
        (retVal, retAddr) = peek();
        assert(remove(heap.first));
        emit Pop(retVal, retAddr);
        // retVal returns
    }

    function getInsertPosition(uint256 _bond)
        public view returns (bytes8 _previousNode)
    { //Should only be called from JS using(.call), to ensure maximum gasOptimization
        if (_bond > heap.maxBond) {
			//highest bond will be inserted in index 0
          	return 0;
        }
        if (_bond <= heap.minBond) {
			//lowest bond inserted into last index
          	return heap.last;
        }

		// find middle
		uint256 mid = (heap.maxBond - heap.minBond) /2;
        if ((mid + heap.minBond) > _bond ) {
          	return percUp(_bond);
        } else {
          	return percDown(_bond);
        }
    }

    function percUp (uint256 _bond)
        public view returns (bytes8 _previousNode)
    {
        bytes8 activeNode = heap.timeNodes[heap.last].left;
        for (uint256 i = heap.size-2; i>0; i--) {
          	if(activeNode == 0x0) { //If it reaches the top of the queue, should never happen
            	return 0;
          	}
          	if (heap.timeNodes[activeNode].bond >= _bond) {
            	return activeNode;
          	}
          	activeNode = heap.timeNodes[activeNode].left;
        }
    }

    function percDown (uint256 _bond)
        public view returns (bytes8 _previousNode)
    {
      	bytes8 activeNode = heap.first;
      	for (uint256 i = 0; i < heap.size; i++) {
    			if(activeNode == 0x0) { //If it reaches the end of the queue, should never happen
    				return heap.last;
    			}
    			if (heap.timeNodes[activeNode].bond < _bond) {
    				return heap.timeNodes[activeNode].left;
    			}
    			activeNode = heap.timeNodes[activeNode].right;
    		}
    }
}

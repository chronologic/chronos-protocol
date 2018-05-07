const pQueueABI = require('../build/contracts/PriorityQueue.json').abi;

const Bond = function (_id = 0,_left = 0,_right = 0,_value = 0) {
  return {
    id: _id,
    left: _left,
    right: _right,
    bond: _value
  }
}

const PQueue = function (web3, queueAddress) {
  this.list = [];
  this.watcher = null;
  this.address = queueAddress;
  this.web3 = web3;
  this.instance = new web3.eth.Contract(pQueueABI, this.address);
  this.synchronize(this);

  Object.defineProperty(this, 'queueLength', { get: function() { return this.list.length; } });
}

PQueue.prototype.synchronize = async (self) => {
  await self.snapShotQueue(self);
  // await queue.watchNetwork();
}

PQueue.prototype.watchNetwork = async () => {
  const fromBlock = await this.web3.eth.getBlockNumber( (e,r) => r);
  console.log(blockNumber);
  this.watcher = await this.instance.Enter({},{fromBlock})
}

PQueue.prototype.getPreviousNode = (newbond) => {
  if(list.length === 0) {
    return 0;
  }
  this.list.find( (bond, idx) => {
    console.log(bond,idx)
    // if(bond)
  })
}

PQueue.prototype.getNodeIndex = (id) => {
  this.list.find( (bond, idx) => {
    console.log(bond,idx)
    // if(bond)
  })
}

PQueue.prototype.snapShotQueue = async (self) => {
  const list = await self.instance.methods.snapShotQueue().call( (e,r) => r);
  for(let i=0;i<list[0];i++) {
    self.addBond(new Bond(ids[i], lefts[i], rights[i], bonds[i]));
  }
}

PQueue.prototype.addBond = (bond) => {
  let idx, pos;
  if (Number(bond.left) > 0) {
    idx = getNodeIndex(bond.left);
    pos = 'left';
  } else if (Number(bond.right) > 0) {
    idx = getNodeIndex(bond.right)
    pos = 'right';
  } else {
    idx = 0;
  }
  this.list.splice(idx,0,bond);
}

PQueue.prototype.removeBond = (id) => {
  const idx = getNodeIndex(id);
  this.list.splice(idx,1);
}

module.exports = PQueue;

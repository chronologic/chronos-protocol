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
  this.watcher = {};
  this.address = queueAddress;
  this.web3 = web3;
  this.instance = new web3.eth.Contract(pQueueABI, this.address);
  this.synchronize(this);

  Object.defineProperty(this, 'queueLength', { get: function() { return this.list.length; } });
}

PQueue.prototype.synchronize = async (self) => {
  self = self ? self : this;
  await self.snapShotQueue(self);
  await self.watchNetwork(self);
}

PQueue.prototype.watchNetwork = async (self) => {
  self = self ? self : this;
  const fromBlock = await self.web3.eth.getBlockNumber( (e,r) => r);
  self.watcher.Enter = await self.instance.events.Enter({filter:{},fromBlock});//Dependent on Websocket provider
  self.watcher.Exit = await self.instance.events.Exit({filter:{},fromBlock});//Dependent on Websocket provider
  self.watcher.Shift = await self.instance.events.Shift({filter:{},fromBlock});//Dependent on Websocket provider
  console.log()
  self.watcher.Enter
  .on('data', async (d) => {
    const timeNode = await self.instance.methods.getTimenode(d.returnValues.id).call();
    const bond = new Bond(timeNode.id, timeNode.left, timeNode.right, timeNode.bond);
    self.addBond(bond,self);
  })
  .on('error', (e) => {
    console.error(e)
  })
  self.watcher.Exit
  .on('data', async (d) => {
    self.removeBond(d.returnValues.id,self);
  })
  .on('error', (e) => {
    console.error(e)
  })
  self.watcher.Shift
  .on('data', async (d) => {
    const timeNode = await self.instance.methods.getTimenode(d.returnValues.id).call();
    const bond = new Bond(timeNode.id, timeNode.left, timeNode.right, timeNode.bond);
    self.updateBond(bond,self);
  })
  .on('error', (e) => {
    console.error(e)
  })
}

PQueue.prototype.getPreviousNode = (newbond, self) => {
  self = self ? self : this;
  if(self.list.length === 0) {
    return null;
  }
  return self.list.find( (bond, idx) => (!self.list[idx+1] || self.list[idx].bond >= newbond) && (!self.list[idx+1] || newbond > self.list[idx+1].bond) );
}

PQueue.prototype.getNodeIndex = (id, self) => {
  self = self ? self : this;
  let found = 0;

  self.list.find( (bond, idx) => {
    if (bond.id === id) {
      found = idx;
    }
  })
  return found;
}

PQueue.prototype.snapShotQueue = async (self) => {
  self = self ? self : this;
  const list = await self.instance.methods.snapShotQueue().call( (e,r) => r);
  for(let i=0;i<list[0];i++) {
    self.addBond(new Bond(ids[i], lefts[i], rights[i], bonds[i]));
  }
}

PQueue.prototype.addBond = (bond, self) => {
  self = self ? self : this;
  let idx, pos;
  if(Number(bond.id) == 0){//Do not add empty bonds
    return;
  }
  if (Number(bond.right) > 0) {
    idx = self.getNodeIndex(bond.right, self)
    pos = 'right';
  } else  if (Number(bond.left) > 0) {
    idx = self.getNodeIndex(bond.left, self);
    pos = 'left';
  } else {
    idx = 0;
  }
  switch (pos) {
    case 'left':
      self.list.splice(idx+1,0,bond);
      break;
    case 'right':
      self.list.splice(idx,0,bond);
      break;
    default :
      self.list.unshift(bond);
  }
}

PQueue.prototype.removeBond = (id, self) => {
  self = self ? self : this;
  const idx = self.getNodeIndex(id, self);
  self.list.splice(idx,1);
}

PQueue.prototype.updateBond = (bond, self) => {
  self = self ? self : this;
  self.removeBond(bond.id, self);
  self.addBond(bond, self);
}

module.exports = PQueue;

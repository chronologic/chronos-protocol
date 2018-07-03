/** Chai */
require('chai').use(require('chai-as-promised')).should();
const { expect } = require('chai');

const C1 = artifacts.require('C_Offchain.sol');

contract('Chronos Offchain', () => {

  const [
    me,
    second,
    third,
    fourth,
    fifth,
   ] = web3.eth.accounts;

  let c1;

  it('deploys the contract', async () => {
    c1 = await C1.new();
    expect(c1.address).to.exist;
  })

  it('allows for a deposit', async () => {
    await c1.deposit({
      from: me,
      value: web3.toWei('1', 'ether'),
      gas: 3000000,
      gasPrice: web3.toWei('3', 'gwei'),
    })

    const depositAmt = await c1.getDeposit(me);
    expect(depositAmt.toString()).to.equal(web3.toWei('1', 'ether'));
  })

  it('tests recover', async () => {
    const hashToSign = web3.sha3('randomString');
    // console.log(hashToSign);
    const sig = web3.eth.sign(me, hashToSign);
    // console.log(sig);
    // const res = await c1.sigSplit(sig, 0);
    // console.log(res);
    const res = await c1.recover(hashToSign, sig, 0);
    expect(res).to.equal(me);
  })

  it('tests deposit', async () => {
    
  })
})
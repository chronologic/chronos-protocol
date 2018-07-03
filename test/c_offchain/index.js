/** Chai */
require('chai').use(require('chai-as-promised')).should();
const { expect } = require('chai');

// const { encodeC1 } = require('../../contracts/c_offchain/makeData');

const { utils } = require('ethers');

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

  it('tests execution', async () => {
    const methodPrefix = await c1.CALL_PREFIX();
    // console.log(methodPrefix);

    const Params = {
      from: c1.address,
      to: third,
      value: 23,
      data: '0xAABBCCDDEEFF',
      nonce: web3.sha3('1'),
      gasPrice: web3.toWei('3', 'gwei'),
      gasLimit: 3000000,
      gasToken: '0x' + '00'.repeat(20),
      methodPrefix,
    }

    const dataHashed = utils.solidityKeccak256(
      [
        'bytes2',
        'address',
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'address',
        'bytes4',
        // 'bytes',
      ],
      [
        '0x19c1',
        Params.from,
        Params.to,
        Params.value,
        web3.sha3(Params.data, { encoding: 'hex' }),
        Params.nonce,
        Params.gasPrice,
        Params.gasLimit,
        Params.gasToken,
        Params.methodPrefix,
        // '',
      ]
    )

    // console.log(await c1.SIG_PREFIX());
    // console.log(data);

    // const dataHashed = web3.sha3(data.slice(0, 6), { encoding: 'hex' });
    const contractHashed = await c1.getHash(
      Params.to,
      Params.value,
      Params.data,
      Params.nonce,
      Params.gasPrice,
      Params.gasLimit,
      Params.gasToken,
    );

    expect(dataHashed).to.equal(contractHashed);



  })
})
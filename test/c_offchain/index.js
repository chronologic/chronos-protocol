/** Chai */
require('chai').use(require('chai-as-promised')).should();
const { expect } = require('chai');

// const { encodeC1 } = require('../../contracts/c_offchain/makeData');

const { utils } = require('ethers');

const C1 = artifacts.require('C_Offchain.sol');

let depositGasUsed;
let executionGasUsed;

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
    const res = await c1.deposit({
      from: me,
      value: web3.toWei('1', 'ether'),
      gas: 3000000,
      gasPrice: web3.toWei('3', 'gwei'),
    })

    depositGasUsed = res.receipt.gasUsed

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

    const curBlock = await new Promise((resolve) => {
      web3.eth.getBlock('latest', (e,r) => {
        resolve(r);
      })
    })

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
      temporalUnit: 1,
      executionWindowStart: curBlock.number + 30,
      executionWindowLength: 400,
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
        'uint256',
        'uint256',
        'uint256',
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
        Params.temporalUnit,
        Params.executionWindowStart,
        Params.executionWindowLength,
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
      utils.solidityKeccak256(Params.temporalUnit,Params.executionWindowStart, Params.executionWindowLength)
    );

    expect(dataHashed).to.equal(contractHashed);

    // console.log(dataHashed)
    // console.log(contractHashed)

  //   const sig = web3.eth.sign(me, dataHashed);

  //   // console.log(sig)

  //   const recovered = await c1.recover(dataHashed, sig, 0);

  //   expect(recovered).to.equal(me);
  //   // console.log(recovered)
  //   // console.log(me)

  //   const res = await c1.execute(
  //     Params.to,
  //     Params.value,
  //     Params.data,
  //     Params.nonce,
  //     Params.gasPrice,
  //     Params.gasLimit,
  //     Params.gasToken,
  //     sig,
  //     {
  //       from: second,
  //       gas: 3500000,
  //       gasPrice: Params.gasPrice,
  //     }
  //   );

  //   const { _user, _nonce, _success, _gasUsed } = res.logs[0].args;

  //   expect(_user).to.equal(me);
  //   expect(_nonce).to.equal(Params.nonce);
  //   expect(_success).to.equal(true);
  //   console.log(_gasUsed.toNumber());

  //   executionGasUsed = res.receipt.gasUsed;
  })

  // after(() => {
  //   console.log('DEPOSIT GAS USED: ' + depositGasUsed);
  //   console.log('EXECUTION GAS USED: '+ executionGasUsed);
  // })
})
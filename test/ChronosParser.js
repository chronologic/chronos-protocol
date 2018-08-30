const MockChronosParser = artifacts.require('./MockChronosParser.sol');

const { assert } = require('chai');

contract('ChronosParser', (accounts) => {
  
  // Abstract this to a helper file.
  const privateKey = web3.utils.randomHex(64);
  const sig = web3.eth.accounts.sign('data', privateKey);
  // console.log(sig);
  // console.log(web3.eth.accounts.privateKeyToAccount(privateKey).address);
  const testParams = {
    to: web3.utils.randomHex(20),
    value: 1,
    gasLimit: 2,
    gasPrice: 3,
    nonce: web3.utils.randomHex(32),
    gasToken: web3.utils.randomHex(20),
    callData: web3.utils.randomHex(40),
    extraData: web3.utils.randomHex(36),
    signature: sig.signature,
  }

  const encoded = web3.eth.abi.encodeParameters(
    [
      'address',
      'uint256',
      'uint256',
      'uint256',
      'bytes32',
      'address',
      'bytes',
      'bytes',
      'bytes',
    ],
    [
      testParams.to,
      testParams.value,
      testParams.gasLimit,
      testParams.gasPrice,
      testParams.nonce,
      testParams.gasToken,
      testParams.callData,
      testParams.extraData,
      testParams.signature,
    ],
  );
  // Abstract this to a helper file ^

  let mockChronosParser;
  
  it('Deploys successfully', async () => {
    mockChronosParser = await MockChronosParser.new();
    assert.exists(mockChronosParser.address, "Deployed correctly with an address.");
  })

  it('Recovers the field from a correctly formatted byte string', async () => {
    const fields = await mockChronosParser.fields(encoded);
    Object.keys(fields).forEach((key) => {
      // This try / catch block may look very strange so it's
      // worth an explanation. The `fields` object will contain 
      // two sets of the return values. One set is sorted by a
      // numerical key, the other is sorted by the name of the variable.
      // However, the numerical key is actually `typeof key === 'string'`
      // so we can't catch it with a `typeof` check. So, we 
      // try to parse it and if it parses into a number, we
      // simply skip the assert, otherwise we have an "actual"
      // key and we can test it.
      if (Number.isNaN(parseInt(key, 10))) {
        if (typeof fields[key] === 'string') {
          fields[key] = fields[key].toLowerCase();
        }
        if (key === 'callData' || key === 'extraData') {
          return;
        }
        assert.equal(fields[key], testParams[key], `Failed on key: ${key}`);
      }
    });
  })

  it('Recovers the signature from a correctly formatted byte string', async () => {
    const signature = await mockChronosParser.signature(encoded);
    Object.keys(signature).forEach((key) => {
      // Same as the note above.
      if (Number.isNaN(parseInt(key, 10))) {
        if (key === 'v') {
          signature[key] = "0x" + signature[key].toString(16);
        }
        assert.equal(signature[key], sig[key]);
      }
    })
  })

  it('Recovers the signer from a correctly formatted byte string', async () => {

  })
})

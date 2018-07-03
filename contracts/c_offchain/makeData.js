const ethers = require('ethers');

const AbiCoder = new ethers.utils.AbiCoder();

const encodeC1 = (
  from,
  to,
  value,
  dataHash,
  nonce,
  gasPrice,
  gasLimit,
  gasToken,
  methodPrefix,
) => {
  return '0x19c1' + AbiCoder.encode(
    [
      'address',
      'address',
      'uint256',
      'bytes32',
      'bytes32',
      'uint256',
      'uint256',
      'address',
      'bytes4',
      'bytes',
    ], 
    [
      from,
      // to,
      // value,
      // dataHash,
      // nonce,
      // gasPrice,
      // gasLimit,
      // gasToken,
      // methodPrefix,
      // '0x0',
    ]
  ).slice(2);
}

module.exports = {
  encodeC1,
}
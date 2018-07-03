const ethers = require('ethers');

const AbiCoder = new ethers.utils.AbiCoder();

const encodeC1 = (
  to,
  value,
  data,
  nonce,
  gasPrice,
  gasLimit,
  gasToken
) => {
  AbiCoder.encode(
    [
      'bytes4',
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
      '0x19c1',
      '0x0',
      to,
      value,
      dataHash,
      nonce,
      gasPrice,
      gasLimit,
      gasToken,
      '0x00',
      '0x0',
    ]
  )
}
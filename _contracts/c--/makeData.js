const ethers = require('ethers');

const AbiCoder = new ethers.utils.AbiCoder();

const encode = (
  to,
  gas,
  gasPrice,
  value,
  temporalUnit,
  executionWindowStart,
  executionWindowLength,
  bounty,
  owner,
  data,
) => {
  return AbiCoder.encode(
    [
      'address',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'address',
      'bytes',

    ],
    [
      to,
      gas,
      gasPrice,
      value,
      temporalUnit,
      executionWindowStart,
      executionWindowLength,
      bounty,
      owner,
      data,
    ]
  );
}
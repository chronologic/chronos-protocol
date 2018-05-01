[<img src="https://s3.amazonaws.com/chronologic.network/ChronoLogic_logo.svg" width="128px">](https://github.com/chronologic)

_Time is a brisk wind, for each hour it brings something new... but who can understand and measure its sharp breath, its mystery and its design? -Paracelsus_

__WARNING:__ Chronos is undergoing heavy development and has just recently exited from a PoC phase into something more substantial. Proceed with caution...

# Chronos

[![Join the chat at https://gitter.im/chronologic/chronos](https://badges.gitter.im/chronologic/chronos.svg)](https://gitter.im/chronologic/chronos?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Chronos is a next generation scheduling protocol built on Ethereum smart contracts. It allows users to schedule calls to happen at a future time, for developers to employ this functionality in their own DApps and smart contracts, and for a second layer market of _Timenodes_ to compete for the execution of these transactions and be rewarded with the bounty. It was inspired by our work on the Ethereum Alarm Clock and represents ChronoLogic's attempt to rebuild the protocol from the ground up with the goal of optimization in mind. It uses novel claiming mechanisms and will include both temporal and conditional transaction scheduling.

Here is an early diagram of the architecture:

![](eacv2.png)

### FAQ
[How does this use IPFS?](ipfs.txt)

[What is the encoding format used for transactions?](encoding.txt)

### Development Guide

#### How to build and run locally
1. Install NPM, truffle and git if not present on the system
2. Clone the repo using `git clone`
3. `npm install` - Install all NodeJS dependencies
4. `truffle compile` - To compile the contracts using Truffle's build int solidity compiler
5. `truffle test` - To run the tests located in the `test/` directory

### Contributing

Pull requests are always welcome. If you found any issues while using our DAapp, please report using the `Issues` tab on Github.

### Questions or Concerns?

Since this is alpha software, we highly encourage you to test it, use it and try to break it. We would love your feedback if you get stuck somewhere or you think something is not working the way it should be. Please open an issue if you need to report a bug or would like to leave a suggestion. Pull requests are welcome.


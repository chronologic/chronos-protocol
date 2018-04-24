[<img src="https://s3.amazonaws.com/chronologic.network/ChronoLogic_logo.svg" width="128px">](https://github.com/chronologic)

_Time is a brisk wind, for each hour it brings something new... but who can understand and measure its sharp breath, its mystery and its design? -Paracelsus_

# Chronos

[![Join the chat at https://gitter.im/chronologic/chronos](https://badges.gitter.im/chronologic/chronos.svg)](https://gitter.im/chronologic/chronos?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Chronos is a next generation scheduling protocol built on Ethereum smart contracts. It allows users to schedule calls to happen at a future time, for developers to employ this functionality in their own DApps and smart contracts, and for a second layer market of _Timenodes_ to compete for the execution of these transactions and be rewarded with the bounty. It was inspired by our work on the Ethereum Alarm Clock and represents ChronoLogic's attempt to rebuild the protocol from the ground up with the goal of optimization in mind. It uses novel claiming mechanisms and will include both temporal and conditional transaction scheduling.

Here is an early diagram of the architecture:

![](eacv2.png)

### FAQ
[How does this use IPFS?](ipfs.txt)

[What is the encoding format used for transactions?](encoding.txt)

### TODOs
 - [ ] write blog
 - [X] add temporalUnit into encoding
 - [X] document encoding
 - [X] document IPFS use
 - [X] Fix timenode to run IPFS node and read serialization
 - [ ] Claiming mechanism (using DAY ?) - to be determined
 - [ ] new docs (General Overview + dev docs)
 - [ ] multiplexer - to be determined
 - [ ] calculate the amount of gas used to execute, will be different numbers from before

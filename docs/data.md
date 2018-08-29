# Data

The data format for PoC3 Chronos.

| Parameter | Bytes    | Type    |
|-----------|----------|---------| 
| to        | 0 - 32   | address |
| value     | 33 - 64  | uint256 |
| gasLimit  | 65 - 96  | uint256 |
| gasPrice  | 97 - 128 | uint256 |
| gasToken  | 129 - 160| address |
| callData  | 161 - *1 | bytes   |
| extraData | *1 - *2  | bytes   |
| signatures| *2 - *3  | bytes   |

In the above table *1, *2, *3 are used to reflect
the location at the offset of length parameter. 

Read `*1` as offset of `callData.length`.

Read `*2` as offset of `extraData.length`.

Read `*3` as offset of `signatures.length`.
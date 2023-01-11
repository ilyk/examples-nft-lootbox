// SPDX-License-Identifier: MIT
pragma solidity =0.8.10;

import {VRFMock} from "./VRFMock.sol";

contract LinkMock {
    function transferAndCall(
        address to,
        uint256,
        bytes calldata data
    ) external returns (bool success) {
        VRFMock(to).random(msg.sender, data);
        return true;
    }

    function balanceOf(address) external view returns (uint256 balance) {
        return 100;
    }
}

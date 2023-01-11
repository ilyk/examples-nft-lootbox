// SPDX-License-Identifier: MIT
pragma solidity =0.8.10;

import {VRFConsumerBase} from "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import {VRFRequestIDBase} from "@chainlink/contracts/src/v0.8/VRFRequestIDBase.sol";

contract VRFMock is VRFRequestIDBase {
    uint256 public randomValue = 42;
    mapping(bytes32 => uint256) private nonces;

    function setRandom(uint256 _randomValue) external {
        randomValue = _randomValue;
    }

    function random(address to, bytes calldata data) external {
        bytes32 _keyHash;
        (_keyHash,) = abi.decode(data, (bytes32, uint256));
        uint256 vRFSeed = makeVRFInputSeed(_keyHash, 0, to, nonces[_keyHash]);
        nonces[_keyHash] = nonces[_keyHash] + 1;
        bytes32 requestId = makeRequestId(_keyHash, vRFSeed);

        VRFConsumerBase(to).rawFulfillRandomness(requestId, randomValue);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity =0.8.10;

import {ICWERC1155} from "../ICWERC1155.sol";
import {ERC1155} from '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract MockNFT is ICWERC1155, ERC1155("") {
    mapping(uint256 => uint16) public cardAttributes;
    mapping(uint8 => mapping(uint8 => mapping(uint8 => uint256))) toId;
    uint256 public override currentTokenID = 1;

    function charToId(uint8 border, uint8 background, uint8 character) public view returns(uint256) {
        return toId[border][background][character];
    }

    function mintCards(
        address account,
        uint8 border,
        uint8 background,
        uint8 character,
        uint256 amount,
        bytes memory data
    ) external {
        uint256 tokenId = toId[border][background][character];
        if (tokenId == 0) {
            tokenId = currentTokenID;
            currentTokenID++;
            toId[border][background][character] = tokenId;
            cardAttributes[tokenId] = uint16(border | background | (character << 4));
        }

        _mint(account, tokenId, amount, data);
    }
}

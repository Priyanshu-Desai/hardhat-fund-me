// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *  @author Priyanshu Desai
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */

contract FundMe {
    using PriceConvertor for uint256;

    uint256 constant MINIMUM_USD = 10 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address private immutable i_owner;

    AggregatorV3Interface public priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }   

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "sorry, you must pay a minimum of USD 10."
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function getVersion() public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return priceFeed.version();
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        payable(msg.sender).transfer(address(this).balance);
    }
}
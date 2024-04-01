// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);

    function description() external view returns (string memory);

    function version() external view returns (uint256);

    function getRoundData(
        uint80 _roundId
    )
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract RoyaltyTokenWithMultipleOwners {
    // Instance Variables
    struct RoyaltyUser {
        string aadharNumber;
        uint256 validityDate;
        uint256 months;
    }
    string public title; // Title of the Patent
    address[] public owners; // Address of the Owner of the patent
    bool public isValidPatent; // It is to say whether the patent is accepted by the Patent Office. Initially it is FALSE
    bool public isAvailableForRoyalty;
    uint256 public monthlyPayInDollars;
    mapping(address => RoyaltyUser) public royaltyUsers;

    // Constructor
    constructor(string memory _title, address[] memory _owners) {
        title = _title;
        owners = _owners;
        monthlyPayInDollars = 10;
        isAvailableForRoyalty = true;
        isValidPatent = false;
    }

    // Modifier
    modifier onlyValidPatent() {
        require(isValidPatent, "Not a valid patent");
        _;
    }
    modifier onlyAvailableForRoyalty() {
        require(isAvailableForRoyalty, "Not available for royalty");
        _;
    }

    // Methods
    function toggleToValidPatent() public {
        isValidPatent = true;
    }

    function toggleAvailabityForRoyalty(bool flag) public {
        isAvailableForRoyalty = flag;
    }

    function changeMonthlyPay(uint256 amount) public {
        monthlyPayInDollars = amount;
    }

    function calculateFutureTimestamp(
        uint256 initialTimestamp,
        uint256 monthsAhead
    ) internal pure returns (uint256) {
        return initialTimestamp + (2628000 * monthsAhead); // 30.44 days per month
    }

    function royaltyPayment(
        uint256 _months,
        string memory senderAadhar
    ) public payable onlyValidPatent onlyAvailableForRoyalty {
        uint256 requiredWei = DollarInWei(monthlyPayInDollars * _months);

        require(msg.value >= requiredWei, "Insufficient ETH sent");

        royaltyUsers[msg.sender] = RoyaltyUser(
            senderAadhar,
            calculateFutureTimestamp(block.timestamp, _months),
            _months
        );

        uint shareAmount = requiredWei / owners.length;

        for (uint i = 0; i < owners.length; i++) {
            (bool callSuccess, ) = payable(owners[i]).call{value: shareAmount}(
                ""
            );
            require(callSuccess, "Failed to send payment to owner");
        }
    }

    function getPrice() public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function DollarInWei(uint256 dollar) public view returns (uint256) {
        return (dollar * 1e36) / getPrice();
    }

    receive() external payable {}

    fallback() external payable {}
}
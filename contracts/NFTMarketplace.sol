// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;
    Counters.Counter public _soldItems;

    address payable owner;
    uint256 listingFee = 0.025 ether;

    mapping(uint256 => MarketItems) private allMarketItems;

    struct MarketItems {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        address payable seller;
        bool sold;
    }

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        owner = payable(msg.sender);
    }

    event MarketItemAdded(
        uint256 indexed tokenId,
        uint256 price,
        address owner,
        address seller,
        bool sold
    );

    function setListingFee(uint256 amount) public {
        require(
            payable(msg.sender) == owner,
            "Only the contract owner can set listing fee"
        );
        listingFee = amount;
    }

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function createToken(string memory _tokenURI, uint256 _price)
        public
        payable
        returns (uint256)
    {
        require(listingFee == msg.value, "Amount must be Equal to listing Fee");
        require(
            _price > 0,
            "The price of this token must be greater than zero"
        );

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        createMarketplaceItem(newTokenId, _price);
        return newTokenId;
    }

    function createMarketplaceItem(uint256 _tokenId, uint256 _price) private {
        MarketItems memory newMarketItem = MarketItems(
            _tokenId,
            _price,
            payable(address(this)),
            payable(msg.sender),
            false
        );

        _transfer(msg.sender, address(this), _tokenId);

        allMarketItems[_tokenId] = newMarketItem;
        emit MarketItemAdded(
            _tokenId,
            _price,
            address(this),
            msg.sender,
            false
        );
    }

    function resellToken(uint256 _tokenId, uint256 _price) public payable {
        require(
            payable(msg.sender) == allMarketItems[_tokenId].owner,
            "You can only transfer tokens you own"
        );
        require(
            msg.value == listingFee,
            "Amount must be equal to the listing fee"
        );

        _transfer(msg.sender, address(this), _tokenId);
        _soldItems.decrement();

        allMarketItems[_tokenId].price = _price;
        allMarketItems[_tokenId].owner = payable(address(this));
        allMarketItems[_tokenId].seller = payable(msg.sender);
        allMarketItems[_tokenId].sold = false;

        emit MarketItemAdded(
            _tokenId,
            _price,
            address(this),
            msg.sender,
            false
        );
    }

    function createMarketSale(uint256 _tokenId) public payable returns (bool) {
        MarketItems memory currentItem = allMarketItems[_tokenId];
        address payable seller = currentItem.seller;
        uint256 price = currentItem.price;
        require(
            msg.value == price,
            "Amount must be equal to the Price of the Token"
        );

        _transfer(address(this), msg.sender, _tokenId);

        allMarketItems[_tokenId].owner = payable(msg.sender);
        allMarketItems[_tokenId].seller = payable(address(0));
        allMarketItems[_tokenId].sold = true;

        owner.transfer(listingFee);
        seller.transfer(msg.value);

        _soldItems.increment();

        return true;
    }

    function fetchMarketItems() public view returns (MarketItems[] memory) {
        uint256 availableItems = _tokenIds.current() - _soldItems.current();
        MarketItems[] memory allItems = new MarketItems[](availableItems);

        // MarketItems[] memory allItems;

        for (uint256 i; i < availableItems; i++) {
            if (allMarketItems[i + 1].sold == false) {
                allItems[i] = allMarketItems[i + 1];
            }
        }
        return allItems;
    }

    function fetchMyNFTs() public view returns (MarketItems[] memory) {
        uint256 _myItemsCount;
        for (uint256 i; i < _tokenIds.current(); i++) {
            if (allMarketItems[i + 1].owner == payable(msg.sender)) {
                _myItemsCount++;
            }
        }

        MarketItems[] memory allItems = new MarketItems[](_myItemsCount);
        uint256 _countPivot;
        for (uint256 i; i < _tokenIds.current(); i++) {
            if (allMarketItems[i + 1].owner == payable(msg.sender)) {
                allItems[_countPivot] = allMarketItems[i + 1];
                _countPivot++;
            }
        }

        return allItems;
    }

    function fetchListedItems() public view returns (MarketItems[] memory) {
        uint256 _myItemsCount;
        for (uint256 i; i < _tokenIds.current(); i++) {
            if (allMarketItems[i + 1].seller == payable(msg.sender)) {
                _myItemsCount++;
            }
        }

        MarketItems[] memory allItems = new MarketItems[](_myItemsCount);
        uint256 _countPivot;
        for (uint256 i; i < _tokenIds.current(); i++) {
            if (allMarketItems[i + 1].seller == payable(msg.sender)) {
                allItems[_countPivot] = allMarketItems[i + 1];
                _countPivot++;
            }
        }

        return allItems;
    }

    receive() external payable {}
}

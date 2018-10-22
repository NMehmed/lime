pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract CryptoCars is Ownable {
    struct Car {
        uint256 price;
        address owner;
        string model;
        bool doWeOwnIt;
    }
    struct ArrOfCars {
        uint length;
        string[] cars;
        mapping(bytes32 => uint256) carIndex;
    }
    mapping(bytes32 => Car) public cars;
    mapping(address => ArrOfCars) public owners;
    
    /**
     * events
     */

    event LogCarBought(address buyer, uint256 paied, string slogan);
    event LogWithdrawal(uint256 amount, uint256 timestamp);

    /**
     * modifiers
     */
    
    modifier onlyAvailableCars(string model) {
        bytes32 modelHash = keccak256(model);
        require((cars[modelHash].doWeOwnIt), "We don't own that car!!");
        _;
    }

    /**
     * functions
     */

    function buy(string carModel) public payable {
        bytes32 carModelHash = keccak256(carModel);
        
        if (msg.sender == owner) {
            buyForUs(carModel, carModelHash, msg.sender, msg.value);
        } else {
            buyFromUs(carModel, carModelHash, msg.sender, msg.value);
        }
    }
    
    function buyForUs(string carModel, bytes32 carModelHash, address sender, uint256 value) private {
        require((value > 0), "Price should be positive");
        
        cars[carModelHash] = Car({ price: value, owner: sender, model: carModel, doWeOwnIt: true });
        owners[sender].length++;
        owners[sender].cars.push(carModel);
        owners[sender].carIndex[carModelHash] = owners[msg.sender].length - 1;
    }
    
    function buyFromUs(string carModel, bytes32 carModelHash, address sender, uint256 value) private {
        require((cars[carModelHash].doWeOwnIt), "We don't own that car");
        require((msg.value >= 2 * cars[carModelHash].price), "You have to pay at least twice the price");
        
        address oldOwner = cars[carModelHash].owner;
        
        cars[carModelHash] = Car({ price: value, owner: sender, model: carModel, doWeOwnIt: true });
        owners[sender].length++;
        owners[sender].cars.push(carModel);
        owners[sender].carIndex[carModelHash] = owners[msg.sender].length - 1;
        
        owners[oldOwner].length--;
        uint256 soldCarIndex = owners[oldOwner].carIndex[carModelHash];
        delete owners[oldOwner].cars[soldCarIndex];
        
        if (owners[oldOwner].length > 0){
            owners[oldOwner].cars[soldCarIndex] = owners[oldOwner].cars[owners[oldOwner].length];
            bytes32 hashOf = keccak256(owners[oldOwner].cars[soldCarIndex]);
            owners[oldOwner].carIndex[hashOf] = soldCarIndex;
        }
    }
    
    function getUserCars(address _address) public view returns(uint256) {
        return owners[_address].length;
    }
    
    function getUserCar(address _address, uint256 _index) public view returns(string) {
        require((owners[_address].cars.length > _index), 'index not available');

        return owners[_address].cars[_index];
    }
    
    function whoOwnsTheCar(string model) public view onlyAvailableCars(model) returns(address, uint256) {
        bytes32 modelHash = keccak256(model);
        
        return (cars[modelHash].owner, cars[modelHash].price);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        require(balance > 0, "Contract balance is 0");

        owner.transfer(address(this).balance);

        emit LogWithdrawal(balance, now);
    }
}
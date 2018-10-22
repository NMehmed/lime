const etherlime = require('etherlime');
const LimeFactory = require('../build/LimeFactory.json');
const Billboard = require('../build/Billboard.json')
const CryptoCars = require('../build/CryptoCars.json')


const deploy = async (network, secret) => {

	// const deployer = new etherlime.EtherlimeGanacheDeployer();
	// const result = await deployer.deploy(LimeFactory);
	// const contractWrapper = await deployer.deploy(CryptoCars);
	// etherlime deploy --secret=581E9E4071E09103F01E7980E66F7204796D94BFC7EE74EDAADE81379010E06B --network=rinkeby

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, '03ff02f814d54ffab39b8edfd7b90416');
	const estimateGas = await deployer.estimateGas(CryptoCars);
	console.log(estimateGas);
	const contractWrapper = await deployer.deploy(CryptoCars);
	// const setPriceInitialtransaction = await contractWrapper.contract.setPrice(50);
	// await contractWrapper.verboseWaitForTransaction(setPriceInitialtransaction, 'Initial Set Price Transaction');
	// const ONE_ETHER = ethers.utils.bigNumberify('1000000000000000000');
	// const contract = contractWrapper.contract
    // await contract.buy('vw', {value: 1})
    // await contract.buy('vw1', {value: 1})
	// const whoOwnsTheCarResult = await contract.whoOwnsTheCar('vw')
	// const getUserCarsResult = await contract.getUserCars('0xD9995BAE12FEe327256FFec1e3184d492bD94C31')
	// const getUserCarResult = await contract.getUserCar('0xD9995BAE12FEe327256FFec1e3184d492bD94C31', 1)
	// console.log(getUserCarResult)
};

module.exports = {
	deploy
};
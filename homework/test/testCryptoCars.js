const CryptoCars = require('../build/CryptoCars.json');
const etherlime = require('etherlime');

describe('CryptoCars', () => {
    const owner = accounts[0];
    const ownerAddress = owner.wallet.signingKey.address
    const notOwner = accounts[1];
    const notOwnerAddress = notOwner.wallet.signingKey.address

    let deployer;
    let provider;
    let deployedContractWrapper;
    let contract;

    let port = 8545;
    let defaultOverrideOptions = {
        gasLimit: 17592186044415
    }

    const ONE_ETHER = ethers.utils.bigNumberify('1000000000000000000')
    const TWO_ETHERS = ethers.utils.bigNumberify('2000000000000000000')


    const carModel = 'vw'

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(owner.secretKey, port, defaultOverrideOptions)
        provider = deployer.provider
        deployedContractWrapper = await deployer.deploy(CryptoCars)
        contract = deployedContractWrapper.contract
        console.log('CALLED')
    })

    context('initialization', () => {
    })

    describe('buy', () => {
        context('when owner buys a car', async () => {
            it('should buy car', async () => {
                await contract.buy(carModel, { value: ONE_ETHER })

                const ownerAddressAndPrice = await contract.whoOwnsTheCar(carModel)
                const carOwnerAddress = ownerAddressAndPrice[0]
                const carPrice = ownerAddressAndPrice[1]

                assert.strictEqual(ownerAddress, carOwnerAddress)
                assert(carPrice.eq(ONE_ETHER))
            })

            it('should revert when value is zero or less', async () => {
                await assert.revert(contract.buy(carModel, { value: ethers.utils.bigNumberify('0') }))
            })
        })

        context('when someone else buys car from owner', () => {
            let _notOwnerWallet
            let _contract

            beforeEach(async () => {
                _notOwnerWallet = new ethers.Wallet(notOwner.secretKey, provider)
                _contract = new ethers.Contract(contract.address, CryptoCars.abi, _notOwnerWallet)
                const carModel = 'vw'
                await contract.buy(carModel, { value: ONE_ETHER })
            })

            it('should cost twice the price', async () => {
                const tx = await _contract.buy(carModel, { value: TWO_ETHERS })
                console.log('HIT')
                console.log(tx)

                const newOwnerAndPrice = await _contract.whoOwnsTheCar(carModel)
                const newOwnerAddress = newOwnerAndPrice[0]
                const carPrice = newOwnerAndPrice[1]

                assert.strictEqual(notOwnerAddress, newOwnerAddress)
                assert(carPrice.eq(TWO_ETHERS))
            })

            it('should revert when price is less than twice', async () => {
                await assert.revert(_contract.buy(carModel, { value: ONE_ETHER }))
            })

            it('should revert when car is not available', async () => {
                await assert.revert(_contract.buy('unknown', { value: ONE_ETHER }))
            })
        })
    })

    describe('getUserCars', () => {
        context('when user dont have any cars', () => {
            it('should return 0', async () => {
                const numOfCars = await contract.getUserCars(ownerAddress)

                assert(numOfCars.eq(ethers.utils.bigNumberify('0')))
            })
        })

        context('when user has cars', () => {
            beforeEach(async () => {
                await contract.buy('vw1', { value: ONE_ETHER })
                await contract.buy('vw2', { value: ONE_ETHER })
            })

            it('should return car count', async () => {
                const numOfCars = await contract.getUserCars(ownerAddress)

                assert(numOfCars.eq(ethers.utils.bigNumberify('2')))
            })
        })
    })

    describe('getUserCar', () => {
        context('when user has a car', () => {
            beforeEach(async () => {
                await contract.buy(carModel, { value: ONE_ETHER })
            })

            it('should return car model', async () => {
                const returnedCar = await contract.getUserCar(ownerAddress, ethers.utils.bigNumberify('0'))

                assert.strictEqual(carModel, returnedCar)
            })
        })

        context('when user does not have a car', () => {
            it('should revert', async () => {
                assert.revert(contract.getUserCar(ownerAddress, ethers.utils.bigNumberify('0')))
            })
        })
    })

    describe('withdraw', () => {
        it('should withdraw successfully and check event', async () => {
            await contract.buy(carModel, { value: ONE_ETHER })

            let tx = await contract.withdraw(defaultOverrideOptions)

            let txReceipt = await provider.getTransactionReceipt(tx.hash)

            // check for event
            let isEmitted = utils.hasEvent(txReceipt, contract, 'LogWithdrawal')

            assert(isEmitted, 'Event LogWithdrawal not emitted')

            // parse logs
            let logs = utils.parseLogs(txReceipt, contract, 'LogWithdrawal')

            // check log details
            assert(ethers.utils.bigNumberify(logs[0].amount).eq(ONE_ETHER), "Amount does not match")
            assert(!ethers.utils.bigNumberify(logs[0].timestamp).isZero(), "Timestamp should be set")
        })

        it('should throw trying to withraw when balance is empty', async () => {
            await assert.revert(contract.withdraw());
        })

        it('should throw when non-authorized user tries to withdraw', async () => {
            let _notOwnerWallet = new ethers.Wallet(notOwner.secretKey, provider);
            let _contract = new ethers.Contract(contract.address, CryptoCars.abi, _notOwnerWallet);
            await assert.revert(_contract.withdraw());
        })
    })
})
declare let require: any
import { Component } from '@angular/core'
import * as ethers from 'ethers'
const CryptoCars = require('./contract_interfaces/CryptoCars.json')

@Component({
  selector: 'dapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public billboardContent: string = null
  public address: string
  public newSlogan: string
  public privateKey: string
  public currentBlock: number
  public gasPrice: string
  public infuraApiKey = '03ff02f814d54ffab39b8edfd7b90416'
  public infuraProvider: ethers.providers.InfuraProvider
  public contractAddress = '0xBd61f70Ad45908Dec634Ac0A831CA09E2cE877c4'
  public deployedContract: ethers.Contract
  public cars: Array<string>
  public moneySpent: number
  public carModel: string
  public buyerAddress: string
  public carPrice: number


  constructor() {
    this.infuraProvider = new ethers.providers.InfuraProvider('rinkeby', this.infuraApiKey);
    this.infuraProvider.on('block', blockNumber => {
      this.currentBlock = blockNumber;
    });
    this.deployedContract = new ethers.Contract(this.contractAddress, CryptoCars.abi, this.infuraProvider);
  }

  public async getUserCarsAndMoneySpent() {
    let userCarsLength = await this.deployedContract.getUserCars(this.address)
    userCarsLength = userCarsLength.toNumber()
    let tasks = []

    for (var i = 0; i < userCarsLength; i++) {
      tasks.push(this.getUserCar(this.address, i))
    }

    Promise.all(tasks).then(result => {
      this.cars = result
    })

    const money = await this.deployedContract.getUserMoneySpent(this.address)
    this.moneySpent = money.toNumber()
  }

  public async getUserCar(address, index) {
    const userCar = await this.deployedContract.getUserCar(address, ethers.utils.bigNumberify(index))

    return userCar
  }

  public async whoOwnsTheCarAndHowMuchItCosts() {
    const result = await this.deployedContract.whoOwnsTheCar(this.carModel)

    this.buyerAddress = result[0]
    this.carPrice = result[1].toNumber()
  }
}
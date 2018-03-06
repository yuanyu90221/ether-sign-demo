const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const bluebird = require('bluebird');
const url = `10.0.0.123`;
const PORT = 8540;
// connect to test Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider(`http://${url}:${PORT}`));

// Compile the source code
const input = fs.readFileSync('./contracts/SampleContract.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':SampleContract'].bytecode;
// console.log(bytecode);
const abi = JSON.parse(output.contracts[':SampleContract'].interface);
let getGasPrice = bluebird.promisify(web3.eth.getGasPrice);
// Contract Object
const contract = new web3.eth.Contract(abi);

// Deploy contract instance
web3.eth.estimateGas({
  from: web3.eth.coinbase,
  data: `0x${bytecode}`
}).then((gas)=> {
  console.log(`current gas`,gas);
  // console.log(contract);
  getGasPrice().then((gasPrice)=>{
    console.log(`gasPrice: `,gasPrice);
    contract.deploy({
      data: `0x` + bytecode
    }).send({
      from: '0x0002cC6A7ceC1276E76a76385ad78a76e619dC49',
      gas: gas,
      gasPrice: gasPrice
    }, function(err, transactionHash){
      console.log(transactionHash);
    }).on('error', (err)=>{
      console.log(err);
    }).on('transactionHash', (transactionHash)=> {
      console.log(transactionHash);
    }).on('receipt',(receipt) => {
      console.log(receipt.contractAddress);
    }).on('confirmation', (confirmationNumber, receipt) => {
      console.log(confirmationNumber,`final`);
      if (confirmationNumber ==24) {
        let ContractDeployed = new web3.eth.Contract(abi, receipt.contractAddress);
        ContractDeployed.methods.setValue(200).send({from:'0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e',value:"20000000000000000"}).then((receipt)=>{
          console.log('setValue');
          // console.log(receipt);
          ContractDeployed.methods.getValue().call().then(console.log);
        })
        
      }
    }).then((newContractInstance)=> {
      // console.log(newContractInstance.options.address); 
      // console.log(`last`);    
    })
  })
  
});

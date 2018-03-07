# Sign Smart Contract & Deploy Smart Contract with web3.js api

1 Deploy Smart Contract

```code
  // need to use web3.eth.Contract Object
  // Contract Object
  const contract = new web3.eth.Contract(abi);
  // Deploy Method
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
    })

```

2 Sign Raw Transaction

```code
  無論SignTransaction或是deployContract均需要
  先用web3.eth.estimateGas估計gasLimit發送transaction
  而deployContract還需要
  利用web3.eth.getGasPrice來估計GasPrice來發送Transaction
```

  以下是發送Raw Transaction的範例

```code
getGasPrice().then((gas)=>{
  web3.eth.signTransaction({
    from: '0x0002cC6A7ceC1276E76a76385ad78a76e619dC49',
    gasPrice: gas.toString(10),
    gas: "21200",
    to: '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e',
    value: "300000000000000000",
    data: "0x"
  }).then((result)=> {
    console.log(result.tx);
    web3.eth.sendSignedTransaction(result.raw, (err, hash)=> {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`test send raw transaction tx:${hash}`);
      // process.exit(0);
      console.log(`final transaction`);    
    })
  });
})
```

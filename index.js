const Web3 = require('web3');
const rlp = require('rlp');
const Ec = require('elliptic').ec;
const ec = new Ec('secp256k1');
const bluebird = require('bluebird');
// gen Key pair
const keys = ec.genKeyPair();
// console.log(keys.priv.toString('hex'));

// console.log(keys.pub);
const web3 = new Web3();
let rpcURL = 'https://ropsten.infura.io';
let testNet = 'http://10.0.0.123:8540';
web3.setProvider(new Web3.providers.HttpProvider(testNet));

let getAccounts = bluebird.promisify(web3.eth.getAccounts);
let getGasPrice = bluebird.promisify(web3.eth.getGasPrice);

getAccounts().then((result)=>{
  result.forEach(address=>{
    web3.eth.getBalance(address, (error, balance) => {
      let formattedBalance = Number(balance)/Math.pow(10,18);
      console.log(address, formattedBalance, 'ether');
    })
  })
})
const util = require('ethereumjs-util');
const tx = require('ethereumjs-tx');
// setup private key
let privateKey = '0xc0dec0dec0dec0dec0dec0dec0dec0dec0dec0dec0dec0dec0dec0dec0dec0de';
// console.log(`privateKey: ${privateKey}`);
// derived public key
// let publicKey = util.bufferToHex(util.privateToPublic(privateKey));
// console.log(`publicKey: ${publicKey}`);
// get address from public key last 160 bit
// let address = `0x${util.bufferToHex(util.sha3(publicKey)).slice(26)}`;
// console.log(`address: ${address}`);
// web3.eth.estimateGas({
//   to: '0x0002cC6A7ceC1276E76a76385ad78a76e619dC49',
//   data: '0xc0de'
// }).then((gas)=> {
//   console.log(gas);  
// });
// web3.eth.getTransactionCount("0x0002cC6A7ceC1276E76a76385ad78a76e619dC49").then((number)=>{
//   console.log(`current count: `, number);
// })
// getTxCountFromAddress("0x0002cC6A7ceC1276E76a76385ad78a76e619dC49");
// getTxCountFromAddress("0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e")
function getTxCountFromAddress(address) {
  web3.eth.getTransactionCount(address).then((number)=>{
    console.log(`current count from ${address}:  ${number}`);
  })
}
// function getNonceFromAddress(address) {
//   return web3.eth.getTransactionCount(address);
// }
// set up rawTx with 0xc0de as message
getGasPrice().then((gas)=>{
  let rawTx = {
    nonce: '0x'+paddingZero(Number(13).toString(16)),
    gasPrice: '0x'+paddingZero(0),
    gasLimit: '0x'+ paddingZero(Number(25765).toString(16)),
    from: '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e',
    to: '0x0002cC6A7ceC1276E76a76385ad78a76e619dC49',
    value: '0x'+paddingZero(Number(2000000000000000000).toString(16))
  };
  // console.log(`rawTx:`,rawTx);
  // console.log(gas.toString(10));
  // sign data
  let p = new Buffer(`${privateKey.substr(2)}`,'hex');
  // let transaction = new tx(rawTx);
  // transaction.sign(p);
  let arrBuf = putDataIntoBufferArray(rawTx);
  // console.log(arrBuf);
  let signResult = rlp.encode(arrBuf);
  let signedResult = keys.sign(signResult);
  let data = `0x${Buffer.from(signedResult.toDER()).toString('hex')}`;
  // console.log(data);
  // console.log(signedResult.r.toString(16), signedResult.s.toString(16));
  rawTx.data = data;
  rawTx.r = `0x${signedResult.r.toString(16)}`;
  rawTx.s = `0x${signedResult.s.toString(16)}`;
  console.log(rawTx);
  // let transaction = new tx(rawTx);
  // transaction.sign(keys.priv.toString('hex'));
  // arrBuf = putDataIntoBufferArray(rawTx);
  // signResult = rlp.encode(arrBuf);
  // let rawTxData = keys.sign(signResult);
  // console.log(rawTxData);
  // console.log(`0x${Buffer.from(rawTxData.toDER()).toString('hex')}`)
  // web3.eth.sendSignedTransaction(`0x${transaction.serialize().toString('hex')}`, function(err, hash) {
  //   if(err) {
  //     console.log(err);
  //     return;
  //   }
  //   console.log(`test send raw transaction tx:${hash}`);  
  // });
  // sender = '0x0002cC6A7ceC1276E76a76385ad78a76e619dC49'
  web3.eth.signTransaction({
    from: '0x0002cC6A7ceC1276E76a76385ad78a76e619dC49',
    gasPrice: gas.toString(10),
    gas: "21200",
    to: '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e',
    value: "2000000000000000000",
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

// encodeTx
// let encodeTx = rlp.encode(rawTx);
// console.log(encodeTx);

// console.log(util.bufferToHex(transaction.hash(true)));
// console.log(web3.eth);
// console.log(web3.eth.getTransactionReceipt('0x77a4f46ff7bf8c084c34293fd654c60e107df42c5bcd2666f75c0b47a9352be5').contractAddress);
//0x950041c1599529a9f64cf2be59ffb86072f00111
function putDataIntoBufferArray(data) {
  let keys = Object.keys(data);
  let values = Object.values(data);
  // console.log(keys);
  // console.log(values);
  let results = [];
  values.forEach((value)=> {
    results.push(passToBuffer(value));
  })
  return results;
}

function paddingZero(str) {
  return (str.length%2 == 0) ? str:'0'+str;
}
function passToBuffer(data) {
  let temp = data;
  if (data.slice(0,2)=='0x')
    temp = data.slice(2);
  temp = Buffer.from(temp,'hex');

  if (temp.toString('hex') === '00') {
    temp = Buffer.allocUnsafe(0);
  }
  return temp;
}
function passBufferArrayToHexArray(arrBuf) {
  return arrBuf.map((data)=>{
    return data.toString('hex');
  });
}
// let arrBuf = putDataIntoBufferArray(rawTx);
// console.log(arrBuf);
// let signResult = rlp.encode(arrBuf);
// let singedResult = keys.sign(signResult);
// console.log(singedResult);
// console.log(singedResult.toDER());
// console.log(signResult.toString('hex'));
// console.log(`0x${transaction.serialize().toString('hex')}`)
// web3.eth.sendSignedTransaction(`0x${transaction.serialize().toString('hex')}`, (err, hash) => {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log(`test send raw transaction tx:${hash}`);
//   // process.exit(0);
// })

// let decodeResult = rlp.decode(signResult)
// console.log(passBufferArrayToHexArray(decodeResult));
// console.log(passBufferArrayToHexArray(arrBuf));

// web3.eth.signTransaction({
//   from: '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e',
//   gasPrice: "0",
//   gas: "21200",
//   to: '0x0002cC6A7ceC1276E76a76385ad78a76e619dC49',
//   value: "1000000000000000000",
//   data: "0xc0ed"
// }).then((result)=> {
//   // console.log(result.raw);
//   web3.eth.sendSignedTransaction(result.raw, (err, hash)=> {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     console.log(`test send raw transaction tx:${hash}`);
//     // process.exit(0);
//     console.log(`final transaction`);    
//   })
// });

// web3.eth.getTransaction('0x829b765cf9947fb35edfd49fde57e507b770e8b108368af9d7562d6eded2e938', (err, tx)=> {
//   console.log(tx);
//   // process.exit(0);
// });

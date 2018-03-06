pragma solidity ^0.4.17;

contract SampleContract {
  // This value is visible in etherscan.io explorer
  uint public value;
  // Anyone can call this contract and override the value of the previous caller
  function setValue(uint value_) public payable {
      value = value_;
  }

  function getValue() public view returns(uint) {
    return value;
  }
}
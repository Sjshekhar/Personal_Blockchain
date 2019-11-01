const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction{
  constructor() {
this.id = ChainUtil.id();
this.input = null;
this.output = [];
  }

  static transactionWithOutputs(senderWallet, output) {
    const transaction = new this();
    transaction.output.push(...output);
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  static newTransaction(senderWallet, recipient, amount) {
    if(amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    return Transaction.transactionWithOutputs(senderWallet, [
      {amount: senderWallet.balance - amount, address: senderWallet.publicKey},
      {amount, address: recipient}
    ]);
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.output))
    }
  }

  static rewardTransaction(minerWallet, blockchainWallet) {
    return Transaction.transactionWithOutputs(blockchainWallet, [{
      amount: MINING_REWARD, address: minerWallet.publicKey
    }]);
  }

  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtil.hash(transaction.output))
  }

  update(senderWallet, recipient, amount) {
    const senderOutput = this.output.find(output => output.address === senderWallet.publicKey);

    if(amount > senderOutput.amount) {
      console.log(`Amount ${amount} exceeds balance.`);
      return;
    }

    senderOutput.amount = senderOutput.amount - amount;
    this.output.push({amount, address: recipient});
    Transaction.signTransaction(this, senderWallet);

    return this;
  }
}

module.exports = Transaction;

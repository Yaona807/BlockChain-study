// 参考
// EnterChain
// JavaScriptで作るオリジナル仮想通貨① 基本構造の作成と検証
// https://enterchain.online/

const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(timestamp, data, previousHash) {
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }
	// ハッシュ値の計算
    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

	// ジェネシスブロックの作成
    createGenesisBlock() {
        return new Block("05/02/2019", "GenesisBlock", "0");
    }

	// 最後に追加したブロックを取得
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

	// ブロックの追加
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

	// チェーンの妥当性をチェック
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
			// 現在のブロックのハッシュが書き換わっていないか 
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
			// 現在のブロックに含まれる一つ前のハッシュと一つ前のブロックのハッシュが同じかどうか
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let originalCoin = new Blockchain();
originalCoin.addBlock(new Block("06/02/2019", {SendCoinToA: 3}));
originalCoin.addBlock(new Block("07/03/2019", {SendCoinToB: 8}));

console.log(JSON.stringify(originalCoin, null, 2));
console.log('ブロックの中身が正常な状態:' + originalCoin.isChainValid());

originalCoin.chain[1].data = {SendCoinToA: 200};
console.log(JSON.stringify(originalCoin, null, 2));
console.log('ブロックの中身を書き換えた状態:' + originalCoin.isChainValid());

// ブロックのデータを書き換えた状態で、更にハッシュ値を再計算する
originalCoin.chain[1].hash = originalCoin.chain[1].calculateHash();
console.log(JSON.stringify(originalCoin, null, 2));
console.log('ハッシュ値を再計算した場合:' + originalCoin.isChainValid());

// 実行した結果
/**
 * {
  "chain": [
    {
      "timestamp": "05/02/2019",
      "data": "GenesisBlock",
      "previousHash": "0",
      "hash": "125382495ef973ca5a10e9072963cc8d1f39693bc0271dbd889876b4aa498d64"
    },
    {
      "timestamp": "06/02/2019",
      "data": {
        "SendCoinToA": 3
      },
      "previousHash": "125382495ef973ca5a10e9072963cc8d1f39693bc0271dbd889876b4aa498d64",
      "hash": "9357a90d3df4676a000ac24e5fe1c61a2ceabcb1bd2a7235006bec8515c15c9e"
    },
    {
      "timestamp": "07/03/2019",
      "data": {
        "SendCoinToB": 8
      },
      "previousHash": "9357a90d3df4676a000ac24e5fe1c61a2ceabcb1bd2a7235006bec8515c15c9e",
      "hash": "038a24ad189aaf8093ec4e67fe300e8798d28e052ad76ddd9b438cc77d002d00"
    }
  ]
}
ブロックの中身が正常な状態:true
{
  "chain": [
    {
      "timestamp": "05/02/2019",
      "data": "GenesisBlock",
      "previousHash": "0",
      "hash": "125382495ef973ca5a10e9072963cc8d1f39693bc0271dbd889876b4aa498d64"
    },
    {
      "timestamp": "06/02/2019",
      "data": {
        "SendCoinToA": 200
      },
      "previousHash": "125382495ef973ca5a10e9072963cc8d1f39693bc0271dbd889876b4aa498d64",
      "hash": "9357a90d3df4676a000ac24e5fe1c61a2ceabcb1bd2a7235006bec8515c15c9e"
    },
    {
      "timestamp": "07/03/2019",
      "data": {
        "SendCoinToB": 8
      },
      "previousHash": "9357a90d3df4676a000ac24e5fe1c61a2ceabcb1bd2a7235006bec8515c15c9e",
      "hash": "038a24ad189aaf8093ec4e67fe300e8798d28e052ad76ddd9b438cc77d002d00"
    }
  ]
}
ブロックの中身を書き換えた状態:false
{
  "chain": [
    {
      "timestamp": "05/02/2019",
      "data": "GenesisBlock",
      "previousHash": "0",
      "hash": "125382495ef973ca5a10e9072963cc8d1f39693bc0271dbd889876b4aa498d64"
    },
    {
      "timestamp": "06/02/2019",
      "data": {
        "SendCoinToA": 200
      },
      "previousHash": "125382495ef973ca5a10e9072963cc8d1f39693bc0271dbd889876b4aa498d64",
      "hash": "09f96986321b8f9188bc65211e39debbcf5b92cf03899373bedc6b68d7ae2404"
    },
    {
      "timestamp": "07/03/2019",
      "data": {
        "SendCoinToB": 8
      },
      "previousHash": "9357a90d3df4676a000ac24e5fe1c61a2ceabcb1bd2a7235006bec8515c15c9e",
      "hash": "038a24ad189aaf8093ec4e67fe300e8798d28e052ad76ddd9b438cc77d002d00"
    }
  ]
}
ハッシュ値を再計算した場合:false
 */
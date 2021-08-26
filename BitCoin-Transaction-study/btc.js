// 参考
// ブラウザでBTC送金トランザクション
// https://memo.appri.me/programming/btc-tx-on-browser
// ブロックチェーン実戦入門　ビットコインからイーサリアム、DApp開発まで
// https://www.amazon.co.jp/gp/product/B08LCWD7FY/ref=ppx_yo_dt_b_d_asin_title_o01?ie=UTF8&psc=1

// BitcoinJSライブラリの初期化
const btc = require('bitcoinjs-lib');

// 対象ネットワークの設定（今回はビットコインのテストネットワーク）
const network = btc.networks.testnet;

// トランザクションをGETしたりPOSTしたりするパブリックノードのAPIエンドポイント
// 今回はビットコインのテストネットワーク用のBlockCypherのAPIを使用
const blockCypherTestnetApiEndpoint = 'https://api.blockcypher.com/v1/btc/test3/';

// 送金側と受取側のそれぞれの鍵ペアを作成
// 鍵ペアを作成したら、それ以降は利用しない
var getKeys = function(){
	// BitcoinJSライブラリのECPairクラスを用いてmakeRandomメソッドを呼び、
	// テストネットワーク用のランダムな鍵ペアを作成
	const aliceKeys = btc.ECPair.makeRandom({
		network: network
	});
	const bobKeys = btc.ECPair.makeRandom({
		network: network
	});
	const alicePrivate = aliceKeys.toWIF();
	// キーペア生成:
	const aliceKeyPair = btc.ECPair.fromWIF(alicePrivate, network)
	// アドレス取得:
	const { aliceAddress } = btc.payments.p2pkh({
		pubkey: aliceKeyPair.publicKey,
		network,
	});
	console.log("アリスのPublicKey:", aliceAddress);
	console.log("アリスのPrivateKey:", alicePrivate);
	
	const bobPrivate = bobKeys.toWIF();
	// キーペア生成:
	const bobKeyPair = btc.ECPair.fromWIF(bobPrivate, network)
	// アドレス取得:
	const { bobAddress } = btc.payments.p2pkh({
		pubkey: bobKeyPair.publicKey,
		network,
	});
	console.log("ボブのPublicKey:", bobAddress);
	console.log("ボブのPrivateKey:", bobPrivate);
};

// getKeys();
/**
 * 実行した結果
 * Alice
 * public:
 * motJTD4bnjGweSo4myHQypjZuT92rWWhXi 
 * private:
 * cVkzAWiARj8bCg1X4jrADStgEkimFmepCWQ5fCTzpDJCSYwm7M7g 
 * Bob
 * public:
 * ms9U6jpkAHtBZZpDyXZouUyWLSfjmvsW1c
 * private:
 * cTZRExxxSBTsozP8nd3zHZvb4ircqv5Q6APRL9qPvYYr5LBLnxSJ
 * ビットコイン返還先
 * mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB
 */

// アリスとボブの鍵を用意
// ボブのアドレスにビットコインを準備しておく
const alicePublic = 'motJTD4bnjGweSo4myHQypjZuT92rWWhXi';
const alicePrivateKey = 'cVkzAWiARj8bCg1X4jrADStgEkimFmepCWQ5fCTzpDJCSYwm7M7g'; 
const bobPublic = 'ms9U6jpkAHtBZZpDyXZouUyWLSfjmvsW1c';
const bobPrivateKey = 'cTZRExxxSBTsozP8nd3zHZvb4ircqv5Q6APRL9qPvYYr5LBLnxSJ'

// BlockCypherのAPIを使用し、ビットコインのテストネットにおける
// ボブのアドレスの未使用アウトプットを取得
var request = require('request');
var getOutputs = function(){
	var url = blockCypherTestnetApiEndpoint + 'addrs/' + 
	bobPublic + '?unspentOnly=true';
	return new Promise(function(resolve, reject){
		request.get(url,function(err,res,body){
			if (err){
				reject(err);
			}
			resolve(body);
		});
	});
};

getOutputs().then(function (res){
	
	// ビットコインのトランザクションを準備
	// 未使用アウトプットの1つめを使用し、インプットへ追加
	const utxo = JSON.parse(res.toString()).txrefs;
	const transaction = new btc.TransactionBuilder(network);
	transaction.addInput(utxo[0].tx_hash, utxo[0].tx_output_n);
	// MAXビットコイン（プログラムを実行前）
	// 1Satoshi = 0.00000001BTC
	const utxoSatoshi = utxo[0].value;
	// 送信する量(utxoSatoshiの10％)
	const sendSatoshi = utxoSatoshi / 10;
	// 手数料として払う量(0.0001BTC)
	const feeSatoshi = 10000;
	// 戻す量
	const backSatoshi = utxoSatoshi - (sendSatoshi+feeSatoshi);

	// アウトプットの追加
	// インプットとアウトプットの差額がトランザクションの手数料になる
	transaction.addOutput(alicePublic,sendSatoshi);
	transaction.addOutput(bobPublic,backSatoshi);

	// トランザクションインプットに署名
	transaction.sign(0,btc.ECPair.fromWIF(bobPrivateKey,network));

	// トランザクションの16進数表記の作成
	const transactionHex = transaction.build().toHex();
	
	// ネットワークにトランザクションをブロードキャスト
	const txPushUrl = blockCypherTestnetApiEndpoint + 'txs/push';
	request.post({
		url: txPushUrl,
			json:{
				tx: transactionHex
			}
		}, function(err, res, body) {
			if(err){
				console.log(err);
			}
			console.log(res);
			console.log(body);
	});	
})

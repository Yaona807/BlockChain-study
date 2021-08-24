'''
参考
ブロックチェーン技術及び関連技術（ブロックチェーン実装あり） - Qiita
https://qiita.com/michimichix521/items/1485f05a45a37d7ffe08
'''

import hashlib

class Block:
	def __init__(self, index, timestamp, data, previousHash = ""):
		self.index = index
		self.previousHash = previousHash
		self.timestamp = timestamp
		self.data = data
		self.hash = self.calculateHash()
	
	# ハッシュ値の計算
	# ハッシュ値の元となるデータが1ビットでも異なると全く異なる値となる
	# ハッシュ値から入力データを計算することや推測することは困難であるという性質を備える
	# sha256はどんな入力データに対しても長さが256ビットのハッシュ値を出力する。
	# そのため、大きなサイズのデータ同士を比較することなく一致性を確認できるようになる
	# ハッシュ値を用いることによってデータの識別や改ざん検知が容易になる
	def calculateHash(self):
		return (hashlib.sha256((str(self.index) + str(self.previousHash) + str(self.timestamp) + str(self.data)).encode('utf-8')).hexdigest())

	def setdict(self):
		d = {"index":self.index, "previousHash":self.previousHash, "timestamp":self.timestamp, "data":self.data, "hash":self.hash}
		return d
	

class Blockchain:
	def __init__(self):
		self.chain = [self.createGenesisBlock().setdict()]

	# ブロックチェーン上の最初のブロックを生成
	def createGenesisBlock(self):
		return Block(0, "2021/08/24", "Genesis block", "0")

	# 一番後ろに繋がっているブロック
	def getLatestBlock(self):
		return self.chain[len(self.chain) - 1]
	
	# ブロックの追加
	def addBlock(self, newBlock):
		newBlock.previousHash = self.getLatestBlock()["hash"]
		newBlock.hash = newBlock.calculateHash()
		self.chain.append(newBlock.setdict())

def main():
	coin = Blockchain()

	coin.addBlock(Block(1, "2021/08/24", "amount: 10"))
	coin.addBlock(Block(2, "2021/08/25", "amount: 100"))
	coin.addBlock(Block(3, "2021/08/26", "amount: 10000"))

	for block in coin.chain:
		print(block)
		'''
		実行結果
		{'index': 0, 'previousHash': '0', 'timestamp': '2021/08/24', 'data': 'Genesis block', 'hash': '44e3811fe65a8596ca1b6414fadfb6f38bfd24bb54f9574ee5e82e9b7b3876e5'}
		{'index': 1, 'previousHash': '44e3811fe65a8596ca1b6414fadfb6f38bfd24bb54f9574ee5e82e9b7b3876e5', 'timestamp': '2021/08/24', 'data': 'amount: 10', 'hash': '9b057d5d043988bba41859ebf38cfee58ce7c5e1d25e3a667a6b093da16e7355'}
		{'index': 2, 'previousHash': '9b057d5d043988bba41859ebf38cfee58ce7c5e1d25e3a667a6b093da16e7355', 'timestamp': '2021/08/25', 'data': 'amount: 100', 'hash': '2b808d6db2f0e588fa8457c391da02bb464530b78604b4e46d673454e1d92c36'}
		{'index': 3, 'previousHash': '2b808d6db2f0e588fa8457c391da02bb464530b78604b4e46d673454e1d92c36', 'timestamp': '2021/08/26', 'data': 'amount: 10000', 'hash': '16e952f32d9de7b21e69ee67147680ad30b91dfdebcdf2d65874fec09d50c216'}
		
		一文字変えた場合（完全に異なる）
		{'index': 0, 'previousHash': '0', 'timestamp': '2021/08/24', 'data': 'Genesis block', 'hash': '44e3811fe65a8596ca1b6414fadfb6f38bfd24bb54f9574ee5e82e9b7b3876e5'}
		{'index': 1, 'previousHash': '44e3811fe65a8596ca1b6414fadfb6f38bfd24bb54f9574ee5e82e9b7b3876e5', 'timestamp': '2021/08/24', 'data': 'amount: 1', 'hash': '11b64728eaba296c55cbfb294a9b81d670a7c266681356a735fbfb3a27318af2'}
		{'index': 2, 'previousHash': '11b64728eaba296c55cbfb294a9b81d670a7c266681356a735fbfb3a27318af2', 'timestamp': '2021/08/25', 'data': 'amount: 100', 'hash': 'afd17dc3f9b251904bbda335bf613b92efb7bd781e0951115b9919c863057d1f'}
		{'index': 3, 'previousHash': 'afd17dc3f9b251904bbda335bf613b92efb7bd781e0951115b9919c863057d1f', 'timestamp': '2021/08/26', 'data': 'amount: 10000', 'hash': '24d9f9d1738c923ae6f3f27bdff33675a994fa738406cfa0081ab868ee2bdf44'}
		'''

if __name__ == "__main__":
	main()

access(all) contract KittyKombatLite {

    /// Contract Paths
    access(all) let PlayerStoragePath: StoragePath
    access(all) let PlayerPublicPath: PublicPath

    /// Contract Events
    access(all) event CoinsAdded(player: Address, amount: UFix64)
    access(all) event UpgradePurchased(player: Address, upgradeName: String, cost: UFix64)
    access(all) event PassiveCoinsClaimed(player: Address, amount: UFix64)
    
    /// Contract Fields
    access(self) var availableUpgrades: {String: Upgrade}

    access(all) struct Upgrade {
        access(all) let name: String
        access(all) let description: String
        access(all) let cost: UFix64
        access(all) let multiplier: UFix64

        init(name: String, description: String, cost: UFix64, multiplier: UFix64) {
            self.name = name
            self.description = description
            self.cost = cost
            self.multiplier = multiplier
        }
    }

    access(all) resource interface PlayerPublic {
        access(all) var coins: UFix64
        access(all) var upgrades: {String: Int}
        access(all) var lastManualAdd: UFix64
        access(all) var lastPassiveClaim: UFix64
    }

    access(all) resource Player: PlayerPublic {
        access(all) var coins: UFix64
        access(all) var upgrades: {String: Int}
        access(all) var lastManualAdd: UFix64
        access(all) var lastPassiveClaim: UFix64

        access(all) fun addCoins(amount: UFix64) {
            pre {
                amount > 0.0: "Amount must be greater than zero"
                amount <= 100.0: "Amount exceeds maximum allowed per transaction"
                getCurrentBlock().timestamp >= self.lastManualAdd + 2.0: "Not enough time has passed"
            }
            self.coins = self.coins + amount
            self.lastManualAdd = getCurrentBlock().timestamp
            emit CoinsAdded(player: self.owner!.address, amount: amount)
        }

        access(all) fun purchaseUpgrade(upgradeName: String) {
            pre {
                KittyKombatLite.availableUpgrades[upgradeName] != nil: "Upgrade does not exist"
                self.coins >= KittyKombatLite.availableUpgrades[upgradeName]!.cost: "Not enough coins to buy upgrade"
            }
            let upgrade = KittyKombatLite.availableUpgrades[upgradeName]!
            self.coins = self.coins - upgrade.cost
            if(self.upgrades[upgradeName] == nil) {
                self.upgrades[upgradeName] = 1
            } else {
                self.upgrades[upgradeName] = self.upgrades[upgradeName]! + 1
            }
            emit UpgradePurchased(player: self.owner!.address, upgradeName: upgradeName, cost: upgrade.cost)
        }

        // Claim passive coins based on upgrades
        access(all) fun claimPassiveCoins() {
            pre {
                getCurrentBlock().timestamp >= self.lastPassiveClaim + 3600.0: "Not enough time has passed"
            }

            var totalMultiplier = 1.0

            for upgrade in self.upgrades.keys {
                let count = self.upgrades[upgrade]!
                let upgradeMultiplier = KittyKombatLite.availableUpgrades[upgrade]!.multiplier
                totalMultiplier = totalMultiplier + (UFix64(count) * (upgradeMultiplier - 1.0))
            }

            let passiveEarnings: UFix64 = 10.0 * totalMultiplier
            self.coins = self.coins + passiveEarnings
            self.lastPassiveClaim = getCurrentBlock().timestamp
            emit PassiveCoinsClaimed(player: self.owner!.address, amount: passiveEarnings)
        }

        init() {
            self.coins = 0.0
            self.upgrades = {}
            self.lastManualAdd = 0.0
            self.lastPassiveClaim = 0.0
        }
    }

    access(all) fun createPlayer(): @Player {
        return <-create Player()
    }

    access(all) fun getAvailableUpgrades(): {String: Upgrade} {
        return KittyKombatLite.availableUpgrades
    }

    access(all) fun getAvailableUpgrade(upgradeName: String): Upgrade? {
        return KittyKombatLite.availableUpgrades[upgradeName]
    }

    init() {
        self.PlayerStoragePath = /storage/kittyKombatLitePlayer_1
        self.PlayerPublicPath = /public/kittyKombatLitePlayer_1

        self.availableUpgrades = {
            "Speed Booster": Upgrade(name: "Speed Booster", description: "Increase passive earnings by 10%", cost: 100.0, multiplier: 1.1),
            "Mega Tapper": Upgrade(name: "Mega Tapper", description: "Increase passive earnings by 100%", cost: 2000.0, multiplier: 2.0)
        }
    }
}
access(all) contract KittyKombatLite {

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

    
    access(all) var passiveInterval: UFix64
    access(all) var availableUpgrades: {String: Upgrade}

    access(all) resource Player {
        access(all) var coins: UFix64
        access(all) var upgrades: {String: Int}
        access(all) var lastPassiveClaim: UFix64

        access(all) fun addCoins(amount: UFix64) {
            pre {
                amount > 0.0: "Amount must be greater than zero"
            }
            self.coins = self.coins + amount
        }

        access(all) fun purchaseUpgrade(upgradeName: String) {
            pre {
                let upgrade = KittyKombatLite.availableUpgrades[upgradeName]: "Upgrade does not exist"
                self.coins >= upgrade.cost: "Not enough coins to buy upgrade"
            }
            let upgrade = KittyKombatLite.availableUpgrades[upgradeName]
            self.coins = self.coins - upgrade.cost
            self.upgrades[upgradeName] = self.upgrades[upgradeName] + 1
        }
    }

    init() {
        self.passiveInterval = 3600.0
        self.availableUpgrades = {}
    }
}
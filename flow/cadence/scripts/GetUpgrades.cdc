import "KittyKombatLite"

access(all) fun main(): {String: KittyKombatLite.Upgrade} {
    return KittyKombatLite.getAvailableUpgrades()
}
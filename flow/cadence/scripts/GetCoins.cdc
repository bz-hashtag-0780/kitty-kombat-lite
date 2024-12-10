import "KittyKombatLite"

access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)
    let player = account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath)
        ?? panic("Could not borrow a reference to the player")
    
    return player.coins
}
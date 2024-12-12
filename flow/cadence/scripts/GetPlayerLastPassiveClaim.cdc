import "KittyKombatLite"

access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)
    if(account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath) == nil) {
        return 0.0
    }
    let player = account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath)
        ?? panic("Could not borrow a reference to the player")
					
    return player.lastPassiveClaim
}
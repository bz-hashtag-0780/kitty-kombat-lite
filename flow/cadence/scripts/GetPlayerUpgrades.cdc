import "KittyKombatLite"

access(all) fun main(address: Address): &{String: Int}? {
    let account = getAccount(address)
    if(account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath) == nil) {
        let upgrades: {String: Int} = {}
        return nil
    }
    let player = account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath)
        ?? panic("Could not borrow a reference to the player")
					
    return player.upgrades
}
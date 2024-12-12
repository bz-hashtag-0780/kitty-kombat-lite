import "KittyKombatLite"

transaction(upgradeName: String) {
    prepare(acct: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        if acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) == nil {
            acct.storage.save(<- KittyKombatLite.createPlayer(), to: KittyKombatLite.PlayerStoragePath)
            let playerCap = acct.capabilities.storage.issue<&KittyKombatLite.Player>(KittyKombatLite.PlayerStoragePath)
            acct.capabilities.publish(playerCap, at: KittyKombatLite.PlayerPublicPath)
        }

        let playerRef = acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) ?? panic("Could not borrow a reference to the player")
        
        playerRef.purchaseUpgrade(upgradeName: upgradeName)
    }

    execute {}
}
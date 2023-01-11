const CWLootBox = artifacts.require("CWLootBox");
const VRFMock = artifacts.require("VRFMock");
const LinkMock = artifacts.require("LinkMock");

const VRF = {
    "bsc": {
        "vrf": "0x747973a5A2a4Ae1D3a8fDF5479f1514F65Db9C31",
        "link": "0x404460C6A5EdE2D891e8297795264fDe62ADBB75",
        "keyhash": "0xc251acd21ec4fb7f31bb8868288bfdbaeb4fbfec2df3735ddbd4f7dc8d60103c",
        "fee": "0.2"
    }
}

module.exports = async function (deployer, network) {
    let vrf
    if (network === "development" || network === "test" || network === "development-fork") {
        vrf = {
            "keyhash": "0x0",
            "fee": "0"
        }
        await deployer.deploy(VRFMock).then(v => vrf["vrf"] = v.address)
        await deployer.deploy(LinkMock).then(v => vrf["link"] = v.address)
    } else {
        vrf = VRF[network]
    }

    const lb = await deployer.deploy(CWLootBox,
        "CWLootBox",
        "CWLootBox",
        "https://chainwars.gg/nfts/lootbox/",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        vrf.vrf,
        vrf.link,
        vrf.keyhash,
        web3.utils.toWei(vrf.fee)
    )
    await lb.initializer()
};

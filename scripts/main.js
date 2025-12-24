// solo
// ShopSystemMod v1.4

var coins=0,coinLabel=null,shopLevelLabel=null,vipLabelUI=null,currentCategory="all",purchaseHistory=[],totalSpent=0,totalEarned=0,saleItems=[],MAX_SALE_ITEMS=4,saleEndTime=0,SALE_DURATION=600,currentShopDialog=null,currentContentTable=null,saleTimerLabel=null,dailyQuests=[],questProgress={},lastQuestReset=0,refundableItems=[],MAX_REFUND_HISTORY=3,REFUND_TIME_LIMIT=120,itemCooldowns={},favoriteItems=[],vipLevel=0,vipExp=0,itemLevels={},comboStreak=0,lastPurchaseTime=0,priceHistory={},notifications=[],coupons=[],shopReputation=0,shopLevel=1,dynamicPrices={},insuranceActive=false,ownedPets=[],petCoins=0,petLastCollect=0,redeemedCodes=[],workProgress=0,dailyWorkDone=false,lastWorkReset=0,settingsDialog=null,currentSettingsTab="stats",totalWavesCompleted=0,unlockedItems=[],activeCoupon=null,isRefreshing=false,saleUpdatePending=false,activeWorkListener=null,currentWorkActivity=null,totalKills=0,totalBuildings=0,mostPurchasedItem="",auctionItems=[],auctionEndTimes={},auctionBids={},auctionTimers={},currentPlanet="serpulo",petMissions=[],converterUnlocked=false,expeditions=[],bossWaveAvailable=true,prestigeLevel=0,prestigePoints=0,dailyChallenges=[],challengeProgress={},lastChallengeReset=0,milestoneRewards=[],craftingRecipes=[],ownedRecipes=[],lastOfflineCheck=0,offlineEarnings=0,maxOfflineTime=14400,ownedCosmetics=[],equippedCosmetic=null,cosmeticEffects={},achievementProgress={};

var selectedQuantities={};

var customSounds = {
    switch: null,
    coins: null,
    pop: null
};

function loadCustomSounds() {
    try {
        customSounds.switch = Vars.tree.loadSound("switch");
        customSounds.coins = Vars.tree.loadSound("coins");
        customSounds.pop = Vars.tree.loadSound("pop");
    } catch(e) {}
}

function playSound(soundName, volume, pitch) {
    try {
        if (customSounds[soundName] != null) {
            customSounds[soundName].at(
                Vars.player.x, 
                Vars.player.y, 
                pitch || 1.0, 
                volume || 0.5
            );
        }
    } catch(e) {}
}

const VIP_LEVELS=[{level:1,expNeeded:100,perks:"2x Coin",discount:5},{level:2,expNeeded:300,perks:"3x Coin",discount:10},{level:3,expNeeded:600,perks:"4x Coin",discount:15},{level:4,expNeeded:1000,perks:"5x Coin",discount:20},{level:5,expNeeded:1500,perks:"6x Coin",discount:25}];

const PETS=[
{name:"Cat",cost:500,earnRate:2,description:"2 coins/min",unlockWave:3,unlockShopLvl:1,planet:"serpulo"},
{name:"Dog",cost:800,earnRate:3,description:"3 coins/min",unlockWave:5,unlockShopLvl:1,planet:"serpulo"},
{name:"Eagle",cost:1500,earnRate:5,description:"5 coins/min",unlockWave:10,unlockShopLvl:2,planet:"serpulo"},
{name:"Fox",cost:3000,earnRate:8,description:"8 coins/min",unlockWave:15,unlockShopLvl:3,planet:"serpulo"},
{name:"Bear",cost:5000,earnRate:12,description:"12 coins/min",unlockWave:20,unlockShopLvl:4,planet:"serpulo"},
{name:"Panther",cost:8000,earnRate:18,description:"18 coins/min",unlockWave:25,unlockShopLvl:5,planet:"serpulo"},
{name:"Lion",cost:15000,earnRate:30,description:"30 coins/min",unlockWave:35,unlockShopLvl:7,planet:"serpulo"},
{name:"Wolf",cost:12000,earnRate:25,description:"25 coins/min",unlockWave:30,unlockShopLvl:6,planet:"serpulo"},
{name:"Phoenix",cost:20000,earnRate:40,description:"40 coins/min",unlockWave:40,unlockShopLvl:8,planet:"serpulo"},
{name:"Cobra",cost:6000,earnRate:15,description:"15 coins/min",unlockWave:22,unlockShopLvl:5,planet:"erekir"},
{name:"Hawk",cost:10000,earnRate:22,description:"22 coins/min",unlockWave:28,unlockShopLvl:6,planet:"erekir"},
{name:"Tiger",cost:18000,earnRate:35,description:"35 coins/min",unlockWave:38,unlockShopLvl:8,planet:"erekir"},
{name:"Dragon",cost:50000,earnRate:100,description:"100 coins/min",unlockWave:60,unlockShopLvl:12,planet:"both"}
];

const COSMETICS=[
{name:"Golden Aura",cost:5000,type:"effect",description:"Golden glow around core",effect:"golden_glow",unlockWave:25,unlockShopLvl:5},
{name:"Blue Flames",cost:8000,type:"effect",description:"Blue fire particles",effect:"blue_flames",unlockWave:30,unlockShopLvl:6},
{name:"Rainbow Trail",cost:12000,type:"effect",description:"Rainbow particle trail",effect:"rainbow_trail",unlockWave:35,unlockShopLvl:7},
{name:"Lightning Effect",cost:15000,type:"effect",description:"Lightning strikes",effect:"lightning",unlockWave:40,unlockShopLvl:8},
{name:"Prestige Crown",cost:0,type:"badge",description:"Show prestige level",effect:"prestige_crown",unlockPrestige:1},
{name:"VIP Star",cost:0,type:"badge",description:"VIP status symbol",effect:"vip_star",unlockVIP:3}
];

const PRESTIGE_PERKS=[
{level:1,cost:10,name:"Coin Master",bonus:"10% more coins",effect:{type:"coinBonus",value:0.10}},
{level:2,cost:25,name:"Pet Expert",bonus:"20% pet earnings",effect:{type:"petBonus",value:0.20}},
{level:3,cost:40,name:"Shop Discount",bonus:"15% all prices",effect:{type:"discount",value:0.15}},
{level:4,cost:60,name:"Wave Bonus",bonus:"Double wave coins",effect:{type:"waveBonus",value:2.0}},
{level:5,cost:100,name:"Ultimate VIP",bonus:"Permanent 2x VIP",effect:{type:"vipBonus",value:2.0}}
];

const PET_MISSIONS=[
{name:"Scout Mission",duration:120,reward:40,requirements:{minPets:1}},
{name:"Resource Hunt",duration:240,reward:90,requirements:{minPets:2}},
{name:"Treasure Search",duration:480,reward:200,requirements:{minPets:3}},
{name:"Epic Journey",duration:900,reward:450,requirements:{minPets:5}}
];

const WORK_ACTIVITIES=[{name:"Wave Defense",desc:"Complete 5 waves",reward:50,progress:5,type:"waves"},{name:"Enemy Hunter",desc:"Kill 30 enemies",reward:30,progress:30,type:"kills"},{name:"Builder",desc:"Place 20 buildings",reward:40,progress:20,type:"builds"}];

const REDEEM_CODES={"WELCOME2024":50,"FREEGOLD":100,"EPICWIN":200,"VIPACCESS":300,"MEGABONUS":500,"LEGENDARY":1000,"BLESSED2024":150,"GIFT888":250,"LUCKY999":350,"SamielXD15":15,"NEWBIE10":10,"START25":25,"COINS50":50,"EREKIR100":100,"SERPULO50":50,"HALAL2024":777,"OFFLINE100":100,"PRESTIGE50":50,"COSMETIC200":200};

const ACHIEVEMENTS=[
{id:"kill100",name:"Warrior",desc:"Kill 100 enemies",target:100,reward:50,type:"kills"},
{id:"wave20",name:"Survivor",desc:"Complete 20 waves",target:20,reward:100,type:"waves"},
{id:"earn500",name:"Earner",desc:"Earn 500 coins",target:500,reward:75,type:"earn"},
{id:"pet5",name:"Pet Collector",desc:"Own 5 pets",target:5,reward:150,type:"pets"},
{id:"spend1000",name:"Big Spender",desc:"Spend 1000 coins",target:1000,reward:200,type:"spend"},
{id:"vip3",name:"VIP Status",desc:"Reach VIP level 3",target:3,reward:250,type:"vip"},
{id:"converter",name:"Master Trader",desc:"Use converter 10 times",target:10,reward:300,type:"convert"},
{id:"prestige1",name:"Prestige Power",desc:"Reach prestige 1",target:1,reward:500,type:"prestige"},
{id:"cosmetic3",name:"Fashion Icon",desc:"Own 3 cosmetics",target:3,reward:400,type:"cosmetics"}
];// dwa

const DAILY_CHALLENGES=[
{name:"Speed Runner",desc:"Complete 10 waves quickly",target:10,reward:100,type:"waves"},
{name:"Mass Destroyer",desc:"Kill 50 enemies",target:50,reward:80,type:"kills"},
{name:"Construction Pro",desc:"Build 30 structures",target:30,reward:90,type:"builds"},
{name:"Coin Master",desc:"Earn 200 coins",target:200,reward:120,type:"earn"}
];

const MILESTONE_REWARDS=[
{milestone:100,reward:50,claimed:false,description:"Earn 100 coins"},
{milestone:500,reward:150,claimed:false,description:"Earn 500 coins"},
{milestone:1000,reward:300,claimed:false,description:"Earn 1000 coins"},
{milestone:2500,reward:750,claimed:false,description:"Earn 2500 coins"},
{milestone:5000,reward:1500,claimed:false,description:"Earn 5000 coins"},
{milestone:10000,reward:3000,claimed:false,description:"Earn 10000 coins"}
];

const CRAFTING_RECIPES=[
{id:"surge_craft",name:"Craft Surge Alloy",inputs:[{item:"copper",amount:100},{item:"lead",amount:100},{item:"titanium",amount:50}],output:{item:Items.surgeAlloy,amount:10},cost:200,unlock:25},
{id:"phase_craft",name:"Craft Phase Fabric",inputs:[{item:"thorium",amount:50},{item:"titanium",amount:80}],output:{item:Items.phaseFabric,amount:15},cost:150,unlock:20},
{id:"plastanium_craft",name:"Craft Plastanium",inputs:[{item:"titanium",amount:60},{item:"coal",amount:40}],output:{item:Items.plastanium,amount:20},cost:100,unlock:15}
];

const QUEST_TEMPLATES=[{id:"kill30",name:"Destroyer",desc:"Kill 30 enemies",target:30,reward:20,type:"kills"},{id:"wave5",name:"Survivor",desc:"Complete 5 waves",target:5,reward:25,type:"waves"},{id:"spend50",name:"Shopper",desc:"Spend 50 coins",target:50,reward:15,type:"spend"}];

const COIN_RATES={enemyKill:1,waveComplete:5,sectorCapture:50};

const COOLDOWN_TIMES={"Copper":60,"Lead":60,"Coal":60,"Titanium":60,"Thorium":60,"Beryllium":60,"Tungsten":60,"Oxide":60,"Carbide":60,"Skip Wave":300,"Repair":180};

const BULK_DISCOUNTS=[{min:100,max:499,bonus:0.10,label:"+10%"},{min:500,max:999,bonus:0.20,label:"+20%"},{min:1000,max:999999,bonus:0.30,label:"+30%"}];

const BOSS_WAVES=[
{name:"Mega Fortress",cost:500,reward:150,description:"Spawn tough boss",difficulty:"Easy"},
{name:"Ultimate Reign",cost:1000,reward:350,description:"Spawn powerful boss",difficulty:"Hard"},
{name:"Apex Predator",cost:2000,reward:800,description:"Spawn extreme boss",difficulty:"Extreme"}
];

const CONVERTER_RECIPES=[
{from:"copper",to:"beryllium",fromItem:Items.copper,toItem:Items.beryllium,rate:2,unlock:15},
{from:"beryllium",to:"copper",fromItem:Items.beryllium,toItem:Items.copper,rate:2,unlock:15},
{from:"lead",to:"tungsten",fromItem:Items.lead,toItem:Items.tungsten,rate:3,unlock:20},
{from:"tungsten",to:"lead",fromItem:Items.tungsten,toItem:Items.lead,rate:3,unlock:20},
{from:"titanium",to:"oxide",fromItem:Items.titanium,toItem:Items.oxide,rate:4,unlock:25},
{from:"oxide",to:"titanium",fromItem:Items.oxide,toItem:Items.titanium,rate:4,unlock:25}
];

const EXPEDITION_TYPES=[
{name:"Quick Scout",duration:180,reward:80,requirements:{minWave:10}},
{name:"Resource Raid",duration:300,reward:150,requirements:{minWave:20}},
{name:"Deep Exploration",duration:600,reward:350,requirements:{minWave:35}}
];

const AUCTION_EXCLUSIVE=[
{name:"Plastanium",cost:5000,type:"resource",item:Items.plastanium,amount:50,description:"plastanium",unlockWave:30,unlockShopLvl:6,planet:"serpulo"},
{name:"Phase Fabric",cost:8000,type:"resource",item:Items.phaseFabric,amount:30,description:"phase fabric",unlockWave:40,unlockShopLvl:8,planet:"serpulo"},
{name:"Surge Alloy",cost:12000,type:"resource",item:Items.surgeAlloy,amount:20,description:"surge alloy",unlockWave:50,unlockShopLvl:10,planet:"serpulo"},
{name:"Carbide",cost:6000,type:"resource",item:Items.carbide,amount:40,description:"carbide",unlockWave:32,unlockShopLvl:7,planet:"erekir"}
];

const shopCategories={
serpulo_resources:[
{name:"Copper",cost:5,type:"resource",item:Items.copper,amount:10,description:"copper",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:0,unlockShopLvl:1,baseRate:10,planet:"serpulo"},
{name:"Lead",cost:8,type:"resource",item:Items.lead,amount:10,description:"lead",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:5,unlockShopLvl:1,baseRate:10,planet:"serpulo"},
{name:"Coal",cost:15,type:"resource",item:Items.coal,amount:10,description:"coal",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:8,unlockShopLvl:2,baseRate:10,planet:"serpulo"},
{name:"Titanium",cost:25,type:"resource",item:Items.titanium,amount:10,description:"titanium",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:12,unlockShopLvl:3,baseRate:10,planet:"serpulo"},
{name:"Thorium",cost:40,type:"resource",item:Items.thorium,amount:10,description:"thorium",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:20,unlockShopLvl:4,baseRate:10,planet:"serpulo"}
],
erekir_resources:[
{name:"Beryllium",cost:6,type:"resource",item:Items.beryllium,amount:10,description:"beryllium",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:0,unlockShopLvl:1,baseRate:10,planet:"erekir"},
{name:"Tungsten",cost:12,type:"resource",item:Items.tungsten,amount:10,description:"tungsten",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:6,unlockShopLvl:2,baseRate:10,planet:"erekir"},
{name:"Oxide",cost:20,type:"resource",item:Items.oxide,amount:10,description:"oxide",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:10,unlockShopLvl:3,baseRate:10,planet:"erekir"},
{name:"Carbide",cost:35,type:"resource",item:Items.carbide,amount:10,description:"carbide",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:18,unlockShopLvl:4,baseRate:10,planet:"erekir"}
],
serpulo_units:[
{name:"Flare",cost:300,type:"unit",unit:UnitTypes.flare,amount:5,description:"flare",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:0,unlockShopLvl:1,planet:"serpulo"},
{name:"Dagger",cost:400,type:"unit",unit:UnitTypes.dagger,amount:3,description:"dagger",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:3,unlockShopLvl:1,planet:"serpulo"},
{name:"Mace",cost:600,type:"unit",unit:UnitTypes.mace,amount:2,description:"mace",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:10,unlockShopLvl:2,planet:"serpulo"}
],
erekir_units:[
{name:"Stell",cost:350,type:"unit",unit:UnitTypes.stell,amount:4,description:"stell",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:0,unlockShopLvl:1,planet:"erekir"},
{name:"Locus",cost:500,type:"unit",unit:UnitTypes.locus,amount:3,description:"locus",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:5,unlockShopLvl:2,planet:"erekir"},
{name:"Merui",cost:800,type:"unit",unit:UnitTypes.merui,amount:2,description:"merui",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:12,unlockShopLvl:3,planet:"erekir"}
],
boosts:[
{name:"Skip Wave",cost:1250,type:"boost",effect:"skipWaves",value:1,description:"Skip wave",unlockWave:15,unlockShopLvl:3,planet:"both"},
{name:"Repair",cost:750,type:"boost",effect:"heal",value:0.25,description:"Heal buildings",unlockWave:8,unlockShopLvl:2,planet:"both"}
],
special:[]
};

// OFFLINE EARNINGS SYSTEM
function calculateOfflineEarnings() {
    let now = Date.now();
    if(lastOfflineCheck === 0) {
        lastOfflineCheck = now;
        saveCoins();
        return 0;
    }
    
    let timeAway = Math.floor((now - lastOfflineCheck) / 1000);
    if(timeAway < 60) return 0;
    
    if(timeAway > maxOfflineTime) {
        timeAway = maxOfflineTime;
    }
    
    let totalEarnRate = 0;
    ownedPets.forEach(petName => {
        let pet = PETS.find(p => p.name === petName);
        if(pet) totalEarnRate += pet.earnRate;
    });
    
    if(totalEarnRate === 0) return 0;
    
    let minutesAway = Math.floor(timeAway / 60);
    let baseEarnings = totalEarnRate * minutesAway;
    
    let vipMultiplier = getVIPMultiplier();
    baseEarnings = Math.floor(baseEarnings * (vipMultiplier * 0.5));
    
    baseEarnings = Math.floor(baseEarnings * (1 + (shopLevel * 0.05)));
    
    // Prestige bonus
    baseEarnings = Math.floor(baseEarnings * (1 + (prestigeLevel * 0.1)));
    
    lastOfflineCheck = now;
    return baseEarnings;
}

function showOfflineEarningsDialog(earnings, minutesAway) {
    if(earnings <= 0) return;
    
    let d = new BaseDialog("WELCOME BACK!");
    d.cont.background(Styles.black8);
    
    d.cont.add("[lime]═══════════════").pad(5).row();
    d.cont.add("[gold]OFFLINE EARNINGS").pad(10).row();
    d.cont.add("[lime]═══════════════").pad(5).row();
    
    let hours = Math.floor(minutesAway / 60);
    let mins = minutesAway % 60;
    let timeText = "";
    if(hours > 0) timeText += hours + "h ";
    timeText += mins + "m";
    
    d.cont.add("[white]Away for: [accent]" + timeText).pad(10).row();
    d.cont.image().color(Color.gold).height(3).growX().pad(10).row();
    
    d.cont.add("[yellow]Your pets earned:").pad(10).row();
    d.cont.add("[gold]" + earnings + " Coins!").pad(5).row();
    
    let maxEarnings = Math.floor(maxOfflineTime / 60) * getTotalPetEarnRate();
    let efficiency = Math.floor((minutesAway / maxOfflineTime) * 100);
    if(efficiency > 100) efficiency = 100;
    
    d.cont.add("").pad(10).row();
    d.cont.add("[lightgray]Efficiency: [accent]" + efficiency + "%").pad(5).row();
    d.cont.add("[lightgray]Max offline: [accent]" + Math.floor(maxOfflineTime/60) + " minutes").pad(5).row();
    
    d.buttons.button("[green]CLAIM", () => {
        coins += earnings;
        totalEarned += earnings;
        offlineEarnings = 0;
        playSound("coins", 1.0, 1.2);
        Vars.ui.showInfoToast("[gold]+" + earnings + " Coins!", 3);
        checkMilestones();
        saveCoins();
        d.hide();
    }).size(200, 60);
    
    d.show();
}

function getTotalPetEarnRate() {
    let total = 0;
    ownedPets.forEach(petName => {
        let pet = PETS.find(p => p.name === petName);
        if(pet) total += pet.earnRate;
    });
    return total;
    }// telu

// PRESTIGE SYSTEM
function canPrestige() {
    return shopLevel >= 15 && totalEarned >= 50000;
}

function doPrestige() {
    if(!canPrestige()) {
        Vars.ui.showInfoToast("[red]Need Shop Lvl 15 & 50k earned!", 3);
        playSound("pop", 0.5, 0.8);
        return;
    }
    
    let d = new BaseDialog("PRESTIGE");
    d.cont.background(Styles.black8);
    
    d.cont.add("[gold]═══ PRESTIGE ═══").pad(10).row();
    d.cont.add("[yellow]Reset progress for permanent bonuses!").pad(5).row();
    d.cont.image().color(Color.gold).height(3).growX().pad(10).row();
    
    d.cont.add("[white]You will keep:").pad(10).row();
    d.cont.add("[lime]✓ VIP Level & Exp").left().padLeft(20).row();
    d.cont.add("[lime]✓ Prestige Points").left().padLeft(20).row();
    d.cont.add("[lime]✓ Cosmetics Owned").left().padLeft(20).row();
    d.cont.add("[lime]✓ Achievements").left().padLeft(20).row();
    d.cont.add("[lime]✓ Redeemed Codes").left().padLeft(20).row();
    
    d.cont.add("").pad(10).row();
    d.cont.add("[red]You will lose:").pad(10).row();
    d.cont.add("[orange]✗ All Coins").left().padLeft(20).row();
    d.cont.add("[orange]✗ Shop Level").left().padLeft(20).row();
    d.cont.add("[orange]✗ Pets").left().padLeft(20).row();
    d.cont.add("[orange]✗ Item Levels").left().padLeft(20).row();
    
    d.cont.add("").pad(10).row();
    let earnedPoints = Math.floor(shopLevel / 3) + Math.floor(totalEarned / 10000);
    d.cont.add("[gold]You'll earn: " + earnedPoints + " Prestige Points").pad(10).row();
    
    d.buttons.button("[red]Cancel", () => {
        playSound("pop", 0.5, 0.8);
        d.hide();
    }).size(140, 60);
    
    d.buttons.button("[gold]PRESTIGE!", () => {
        prestigeLevel++;
        prestigePoints += earnedPoints;
        
        // Reset everything
        coins = 0;
        totalSpent = 0;
        totalEarned = 0;
        shopLevel = 1;
        shopReputation = 0;
        ownedPets = [];
        itemLevels = {};
        purchaseHistory = [];
        itemCooldowns = {};
        petMissions = [];
        auctionItems = [];
        dailyWorkDone = false;
        workProgress = 0;
        
        playSound("switch", 1.0, 1.5);
        Vars.ui.showInfoToast("[gold]PRESTIGE " + prestigeLevel + "!", 4);
        updateAchievement("prestige", 1);
        
        // Unlock prestige cosmetic
        if(prestigeLevel >= 1 && ownedCosmetics.indexOf("Prestige Crown") === -1) {
            ownedCosmetics.push("Prestige Crown");
            Vars.ui.showInfoToast("[gold]Unlocked: Prestige Crown!", 3);
        }
        
        saveCoins();
        d.hide();
        if(currentShopDialog) currentShopDialog.hide();
    }).size(140, 60);
    
    d.show();
}

function buyPrestigePerk(perkIndex) {
    let perk = PRESTIGE_PERKS[perkIndex];
    if(!perk) return;
    
    if(prestigePoints < perk.cost) {
        Vars.ui.showInfoToast("[red]Need " + perk.cost + " prestige points!", 2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    
    prestigePoints -= perk.cost;
    playSound("coins", 0.9, 1.3);
    Vars.ui.showInfoToast("[gold]Unlocked: " + perk.name + "!", 3);
    saveCoins();
    
    if(currentShopDialog) refreshShop();
}

function getPrestigeBonus(type) {
    let bonus = 0;
    PRESTIGE_PERKS.forEach((perk, i) => {
        if(prestigePoints >= perk.cost && perk.effect.type === type) {
            bonus += perk.effect.value;
        }
    });
    return bonus;
}

// COSMETICS SYSTEM
function isCosmeticUnlocked(cosmetic) {
    if(cosmetic.unlockWave && totalWavesCompleted < cosmetic.unlockWave) return false;
    if(cosmetic.unlockShopLvl && shopLevel < cosmetic.unlockShopLvl) return false;
    if(cosmetic.unlockPrestige && prestigeLevel < cosmetic.unlockPrestige) return false;
    if(cosmetic.unlockVIP && vipLevel < cosmetic.unlockVIP) return false;
    return true;
}

function buyCosmetic(cosmeticName) {
    let cosmetic = COSMETICS.find(c => c.name === cosmeticName);
    if(!cosmetic) return;
    
    if(!isCosmeticUnlocked(cosmetic)) {
        Vars.ui.showInfoToast("[red]Cosmetic locked!", 2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    
    if(ownedCosmetics.indexOf(cosmeticName) !== -1) {
        Vars.ui.showInfoToast("[yellow]Already owned!", 2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    
    if(cosmetic.cost > 0 && coins < cosmetic.cost) {
        Vars.ui.showInfoToast("[red]Need " + cosmetic.cost + " coins!", 2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    
    if(cosmetic.cost > 0) {
        coins -= cosmetic.cost;
        totalSpent += cosmetic.cost;
    }
    
    ownedCosmetics.push(cosmeticName);
    playSound("coins", 1.0, 1.2);
    Vars.ui.showInfoToast("[lime]Unlocked: " + cosmeticName + "!", 3);
    
    updateAchievement("cosmetics", 1);
    addVIPExp(15);
    saveCoins();
    
    if(currentShopDialog) refreshShop();
}

function equipCosmetic(cosmeticName) {
    if(ownedCosmetics.indexOf(cosmeticName) === -1) return;
    
    if(equippedCosmetic === cosmeticName) {
        equippedCosmetic = null;
        playSound("pop", 0.5, 0.9);
        Vars.ui.showInfoToast("[yellow]Cosmetic unequipped", 2);
    } else {
        equippedCosmetic = cosmeticName;
        playSound("pop", 0.7, 1.1);
        Vars.ui.showInfoToast("[cyan]Equipped: " + cosmeticName, 2);
        startCosmeticEffect(cosmeticName);
    }
    
    saveCoins();
    if(currentShopDialog) refreshShop();
}

function startCosmeticEffect(cosmeticName) {
    let cosmetic = COSMETICS.find(c => c.name === cosmeticName);
    if(!cosmetic) return;
    
    // Visual effects timer
    if(!cosmeticEffects[cosmetic.effect]) {
        cosmeticEffects[cosmetic.effect] = Timer.schedule(() => {
            applyCosmeticVisual(cosmetic.effect);
        }, 0, 2); // Every 2 seconds
    }
}

function applyCosmeticVisual(effect) {
    if(equippedCosmetic === null) return;
    
    try {
        let core = Vars.player.team().core();
        if(!core) return;
        
        switch(effect) {
            case "golden_glow":
                Effects.effect(Fx.healWaveMend, core.x, core.y);
                break;
            case "blue_flames":
                Effects.effect(Fx.burning, core.x, core.y);
                break;
            case "lightning":
                Effects.effect(Fx.chainLightning, core.x, core.y);
                break;
        }
    } catch(e) {}
}

Events.on(ClientLoadEvent,()=>{
    loadCoins();
    loadCustomSounds();
    initAchievements();
    createShopUI();
    setupCoinEarning();
    generateSale();
    startSaleTimer();
    initializeQuests();
    startPetSystem();
    checkDailyWork();
    generateAuction();
    startAuctionTimers();
    detectPlanet();
    setupShopCommands();
    setupShopKeybind();
    addPauseMenuButton();
    initDailyChallenges();
    initMilestones();
    
    // Check offline earnings
    Timer.schedule(() => {
        let earnings = calculateOfflineEarnings();
        if(earnings > 0) {
            offlineEarnings = earnings;
            let minutesAway = Math.floor((Date.now() - (lastOfflineCheck - earnings * 60000)) / 60000);
            showOfflineEarningsDialog(earnings, minutesAway);
        }
    }, 2);
});

Events.on(WorldLoadEvent,()=>{
    Timer.schedule(()=>saveCoins(),0,60);
    detectPlanet();
});

function detectPlanet(){
    try{
        if(Vars.state && Vars.state.rules && Vars.state.rules.planet){
            let planet = Vars.state.rules.planet;
            if(planet.name == "erekir"){
                currentPlanet = "erekir";
            }else{
                currentPlanet = "serpulo";
            }
        }
    }catch(e){
        currentPlanet = "serpulo";
    }
}

function setupShopCommands(){
    Events.on(PlayerChatEvent, e => {
        if(e.message == "/shop" || e.message == "/store"){
            openShop();
        }
    });
}

function setupShopKeybind(){
    Core.app.post(() => {
        try{
            Core.input.addProcessor(new InputProcessor(){
                keyDown(keycode){
                    if(keycode == KeyCode.k){
                        openShop();
                        return true;
                    }
                    return false;
                },
                keyUp(keycode){return false;},
                keyTyped(character){return false;},
                touchDown(screenX, screenY, pointer, button){return false;},
                touchUp(screenX, screenY, pointer, button){return false;},
                touchDragged(screenX, screenY, pointer){return false;},
                mouseMoved(screenX, screenY){return false;},
                scrolled(amountX, amountY){return false;}
            });
        }catch(e){}
    });
}

function addPauseMenuButton(){
    try{
        let shopButtonAdded = false;
        Events.run(Trigger.update, () => {
            if(Vars.ui && Vars.ui.paused && Vars.ui.paused.shown && !shopButtonAdded){
                Core.app.post(() => {
                    try{
                        let pauseTable = Vars.ui.paused.cont;
                        pauseTable.row();
                        pauseTable.button("@shop (Press K)", Styles.cleart, () => {
                            Vars.ui.paused.hide();
                            openShop();
                        }).size(220, 60).padTop(10);
                        shopButtonAdded = true;
                    }catch(e){}
                });
            }
            if(Vars.ui && Vars.ui.paused && !Vars.ui.paused.shown){
                shopButtonAdded = false;
            }
        });
    }catch(e){}
            }// pat

function initAchievements(){
    ACHIEVEMENTS.forEach(a=>{
        if(!achievementProgress[a.id])achievementProgress[a.id]={current:0,claimed:false};
    });
}

function initDailyChallenges(){
    let now=Date.now();
    if(now-lastChallengeReset>86400000){
        DAILY_CHALLENGES.forEach(challenge=>{
            if(!challengeProgress[challenge.name]){
                challengeProgress[challenge.name]={current:0,completed:false,claimed:false};
            }else{
                challengeProgress[challenge.name]={current:0,completed:false,claimed:false};
            }
        });
        lastChallengeReset=now;
        saveCoins();
    }
}

function initMilestones(){
    MILESTONE_REWARDS.forEach(m=>{
        if(!milestoneRewards.find(mr=>mr.milestone==m.milestone)){
            milestoneRewards.push({milestone:m.milestone,reward:m.reward,claimed:false,description:m.description});
        }
    });
}

function checkDailyWork(){
    let now=Date.now(),day=86400000;
    if(now-lastWorkReset>day){
        dailyWorkDone=false;
        workProgress=0;
        currentWorkActivity=null;
        lastWorkReset=now;
        saveCoins();
    }
}

function isItemUnlocked(item){
    if(!item)return false;
    return totalWavesCompleted>=(item.unlockWave||0)&&shopLevel>=(item.unlockShopLvl||1);
}

function getVIPMultiplier(){
    let base = 1;
    if(vipLevel>=5) base = 6;
    else if(vipLevel>=4) base = 5;
    else if(vipLevel>=3) base = 4;
    else if(vipLevel>=2) base = 3;
    else if(vipLevel>=1) base = 2;
    
    // Prestige bonus
    let prestigeBonus = getPrestigeBonus("vipBonus");
    return base * (1 + prestigeBonus);
}

function getVIPDiscount(){
    let vip=VIP_LEVELS.find(v=>v.level==vipLevel);
    let baseDiscount = vip?vip.discount:0;
    
    // Prestige discount bonus
    let prestigeDiscount = getPrestigeBonus("discount") * 100;
    return baseDiscount + prestigeDiscount;
}

function addVIPExp(amount){
    vipExp+=amount;
    if(vipLevel<VIP_LEVELS.length){
        let nextLevel=VIP_LEVELS[vipLevel];
        if(vipExp>=nextLevel.expNeeded){
            vipLevel++;
            vipExp=0;
            playSound("switch", 1.0, 1.5);
            Vars.ui.showInfoToast("[gold]VIP LEVEL "+vipLevel+"!",3);
            updateAchievement("vip",1);
            
            // Unlock VIP cosmetic
            if(vipLevel >= 3 && ownedCosmetics.indexOf("VIP Star") === -1) {
                ownedCosmetics.push("VIP Star");
                Vars.ui.showInfoToast("[gold]Unlocked: VIP Star cosmetic!", 3);
            }
            
            saveCoins();
        }
    }
}

function getItemLevel(itemName){return itemLevels[itemName]||1;}

function getItemPrice(item){
    let lvl=getItemLevel(item.name);
    let basePrice = item.cost;
    if(lvl > 1) {
        basePrice = Math.floor(item.cost*Math.pow(item.costMultiplier||2.0,lvl-1));
    }
    
    // Apply prestige discount
    let discount = getPrestigeBonus("discount");
    basePrice = Math.floor(basePrice * (1 - discount));
    
    return basePrice;
}

function getItemAmount(item){
    let lvl=getItemLevel(item.name);
    if(!item.amount&&!item.value)return lvl;
    let base=item.amount||item.value||1;
    return Math.floor(base*Math.pow(item.amountMultiplier||1.5,lvl-1));
}

function addShopRep(amount){
    shopReputation+=amount;
    let oldLevel=shopLevel;
    shopLevel=Math.floor(shopReputation/100)+1;
    if(shopLevel>oldLevel){
        playSound("switch", 0.8, 1.3);
        Vars.ui.showInfoToast("[gold]Shop Level "+shopLevel+"!",3);
    }
    saveCoins();
}

function buyPet(petName){
    let pet=PETS.find(p=>p.name==petName);
    if(!pet||!isItemUnlocked(pet))return;
    if(ownedPets.indexOf(petName)!==-1){
        Vars.ui.showInfoToast("[yellow]Already owned!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    if(coins<pet.cost){
        Vars.ui.showInfoToast("[red]Need "+pet.cost+" coins!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    coins-=pet.cost;
    totalSpent+=pet.cost;
    ownedPets.push(petName);
    playSound("coins", 0.9, 1.0);
    Vars.ui.showInfoToast("[lime]"+petName+" adopted!",3);
    addVIPExp(10);
    addShopRep(5);
    updateAchievement("pets",1);
    saveCoins();
    if(currentShopDialog){
        refreshShop();
    }
}

function startPetMission(missionIndex){
    let mission=PET_MISSIONS[missionIndex];
    if(!mission)return;
    if(ownedPets.length<mission.requirements.minPets){
        Vars.ui.showInfoToast("[red]Need "+mission.requirements.minPets+" pets!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    let activeMission=petMissions.find(m=>m.name==mission.name&&!m.completed);
    if(activeMission){
        Vars.ui.showInfoToast("[yellow]Mission already active!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    petMissions.push({
        name:mission.name,
        reward:mission.reward,
        endTime:Date.now()+mission.duration*1000,
        completed:false,
        claimed:false
    });
    playSound("pop", 0.7, 1.0);
    Vars.ui.showInfoToast("[cyan]Pet mission started!",2);
    saveCoins();
    Timer.schedule(()=>{
        checkPetMissions();
    },mission.duration);
}

function checkPetMissions(){
    let now=Date.now();
    petMissions.forEach(mission=>{
        if(!mission.completed&&now>=mission.endTime){
            mission.completed=true;
            playSound("coins", 0.8, 1.2);
            Vars.ui.showInfoToast("[lime]Pet mission complete!",2);
            saveCoins();
        }
    });
}

function claimPetMission(missionName){
    let mission=petMissions.find(m=>m.name==missionName&&m.completed&&!m.claimed);
    if(!mission)return;
    
    let reward = mission.reward;
    
    // Prestige coin bonus
    let coinBonus = getPrestigeBonus("coinBonus");
    reward = Math.floor(reward * (1 + coinBonus));
    
    coins+=reward;
    totalEarned+=reward;
    mission.claimed=true;
    playSound("coins", 0.9, 1.1);
    Vars.ui.showInfoToast("[gold]+"+reward+" Coins!",2);
    addVIPExp(5);
    checkMilestones();
    saveCoins();
    if(currentShopDialog){
        refreshShop();
    }
}

function redeemCode(code){
    if(redeemedCodes.indexOf(code)!==-1){
        Vars.ui.showInfoToast("[red]Code already used!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    let reward=REDEEM_CODES[code];
    if(!reward){
        Vars.ui.showInfoToast("[red]Invalid code!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    coins+=reward;
    totalEarned+=reward;
    redeemedCodes.push(code);
    playSound("coins", 1.0, 1.3);
    Vars.ui.showInfoToast("[gold]Code: +"+reward+" Coins!",3);
    checkMilestones();
    saveCoins();
}

function updateAchievement(type,amt){
    ACHIEVEMENTS.forEach(a=>{
        if(a.type==type&&!achievementProgress[a.id].claimed){
            achievementProgress[a.id].current+=amt;
            saveCoins();
        }
    });
}

function claimAchievement(aid){
    let a=ACHIEVEMENTS.find(x=>x.id==aid);
    if(!a)return;
    let p=achievementProgress[aid];
    if(p.current>=a.target&&!p.claimed){
        coins+=a.reward;
        totalEarned+=a.reward;
        p.claimed=true;
        addVIPExp(15);
        addShopRep(5);
        playSound("coins", 0.9, 1.4);
        Vars.ui.showInfoToast("[gold]+"+a.reward+" Coins!",3);
        checkMilestones();
        saveCoins();
    }
}

function updateChallengeProgress(type,amt){
    DAILY_CHALLENGES.forEach(challenge=>{
        if(challenge.type==type&&challengeProgress[challenge.name]&&!challengeProgress[challenge.name].completed){
            challengeProgress[challenge.name].current+=amt;
            if(challengeProgress[challenge.name].current>=challenge.target){
                challengeProgress[challenge.name].completed=true;
                playSound("switch", 0.7, 1.2);
                Vars.ui.showInfoToast("[lime]Challenge Complete: "+challenge.name,2);
            }
            saveCoins();
        }
    });
}

function claimChallenge(challengeName){
    let challenge=DAILY_CHALLENGES.find(c=>c.name==challengeName);
    if(!challenge)return;
    let progress=challengeProgress[challengeName];
    if(!progress||!progress.completed||progress.claimed)return;
    
    let reward = challenge.reward;
    
    // Prestige coin bonus
    let coinBonus = getPrestigeBonus("coinBonus");
    reward = Math.floor(reward * (1 + coinBonus));
    
    coins+=reward;
    totalEarned+=reward;
    progress.claimed=true;
    playSound("coins", 0.9, 1.3);
    Vars.ui.showInfoToast("[gold]+"+reward+" Coins!",2);
    addVIPExp(10);
    checkMilestones();
    saveCoins();
}

function checkMilestones(){
    milestoneRewards.forEach(m=>{
        if(totalEarned>=m.milestone&&!m.claimed){
            m.canClaim=true;
        }
    });
}

function claimMilestone(milestone){
    let m=milestoneRewards.find(mr=>mr.milestone==milestone);
    if(!m||m.claimed||totalEarned<m.milestone)return;
    coins+=m.reward;
    totalEarned+=m.reward;
    m.claimed=true;
    playSound("coins", 1.0, 1.5);
    Vars.ui.showInfoToast("[gold]Milestone! +"+m.reward+" Coins!",3);
    addVIPExp(20);
    saveCoins();
}

function useConverter(recipeIndex,amount){
    let recipe=CONVERTER_RECIPES[recipeIndex];
    if(!recipe||totalWavesCompleted<recipe.unlock)return;
    let core=Vars.player.team().core();
    if(!core)return;
    let fromAmount=amount*recipe.rate;
    if(core.items.get(recipe.fromItem)<fromAmount){
        Vars.ui.showInfoToast("[red]Need "+fromAmount+" "+recipe.from+"!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    core.items.remove(recipe.fromItem,fromAmount);
    core.items.add(recipe.toItem,amount);
    playSound("coins", 0.6, 1.0);
    Vars.ui.showInfoToast("[lime]Converted "+fromAmount+" "+recipe.from+" to "+amount+" "+recipe.to+"!",2);
    updateAchievement("convert",1);
    saveCoins();
}

function craftItem(recipeId){
    let recipe=CRAFTING_RECIPES.find(r=>r.id==recipeId);
    if(!recipe||totalWavesCompleted<recipe.unlock)return;
    let core=Vars.player.team().core();
    if(!core)return;
    let canCraft=true;
    recipe.inputs.forEach(input=>{
        let itemObj=Items[input.item];
        if(core.items.get(itemObj)<input.amount){
            canCraft=false;
        }
    });
    if(!canCraft){
        Vars.ui.showInfoToast("[red]Not enough resources!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    if(coins<recipe.cost){
        Vars.ui.showInfoToast("[red]Need "+recipe.cost+" coins!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    coins-=recipe.cost;
    totalSpent+=recipe.cost;
    recipe.inputs.forEach(input=>{
        let itemObj=Items[input.item];
        core.items.remove(itemObj,input.amount);
    });
    core.items.add(recipe.output.item,recipe.output.amount);
    playSound("coins", 0.8, 1.1);
    Vars.ui.showInfoToast("[lime]Crafted "+recipe.output.amount+" "+recipe.output.item.name+"!",2);
    addVIPExp(15);
    saveCoins();
}// lima

function generateAuction(){
    auctionItems=[];
    let available=AUCTION_EXCLUSIVE.filter(item=>isItemUnlocked(item));
    if(available.length==0)return;
    let numAuctions=Math.min(3,available.length);
    for(let i=0;i<numAuctions;i++){
        let item=available[Math.floor(Math.random()*available.length)];
        let startPrice=Math.floor(item.cost*0.5);
        let buyNowPrice=Math.floor(item.cost*1.5);
        let auctionId="auction_"+Date.now()+"_"+i;
        auctionItems.push({
            id:auctionId,
            item:item,
            startPrice:startPrice,
            buyNowPrice:buyNowPrice,
            currentBid:startPrice,
            highestBidder:"System"
        });
        auctionEndTimes[auctionId]=300;
        auctionBids[auctionId]=startPrice;
    }
    saveCoins();
}

function startAuctionTimers(){
    Timer.schedule(()=>{
        auctionItems.forEach(auction=>{
            if(auctionEndTimes[auction.id]>0){
                auctionEndTimes[auction.id]--;
                if(auctionEndTimes[auction.id]<=0){
                    endAuction(auction);
                }
            }
        });
    },0,1);
}

function placeBid(auctionId,bidAmount){
    let auction=auctionItems.find(a=>a.id==auctionId);
    if(!auction){
        Vars.ui.showInfoToast("[red]Auction not found!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    if(auctionEndTimes[auctionId]<=0){
        Vars.ui.showInfoToast("[red]Auction ended!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    let minBid=auction.currentBid+Math.floor(auction.startPrice*0.1);
    if(bidAmount<minBid){
        Vars.ui.showInfoToast("[red]Bid at least "+minBid+"!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    if(coins<bidAmount){
        Vars.ui.showInfoToast("[red]Not enough coins!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    auction.currentBid=bidAmount;
    auction.highestBidder="Player";
    auctionBids[auctionId]=bidAmount;
    playSound("pop", 0.6, 1.0);
    Vars.ui.showInfoToast("[lime]Bid placed: "+bidAmount+"!",2);
    saveCoins();
    refreshShop();
}

function buyNowAuction(auctionId){
    let auction=auctionItems.find(a=>a.id==auctionId);
    if(!auction)return;
    if(coins<auction.buyNowPrice){
        Vars.ui.showInfoToast("[red]Need "+auction.buyNowPrice+" coins!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    coins-=auction.buyNowPrice;
    totalSpent+=auction.buyNowPrice;
    let core=Vars.player.team().core();
    if(core&&auction.item.item){
        core.items.add(auction.item.item,auction.item.amount);
    }
    auctionEndTimes[auctionId]=0;
    auctionItems=auctionItems.filter(a=>a.id!=auctionId);
    playSound("coins", 1.0, 1.0);
    Vars.ui.showInfoToast("[gold]Bought "+auction.item.name+"!",3);
    addVIPExp(20);
    addShopRep(10);
    saveCoins();
    refreshShop();
}

function endAuction(auction){
    if(auction.highestBidder=="Player"){
        coins-=auction.currentBid;
        totalSpent+=auction.currentBid;
        let core=Vars.player.team().core();
        if(core&&auction.item.item){
            core.items.add(auction.item.item,auction.item.amount);
        }
        playSound("coins", 0.9, 1.1);
        Vars.ui.showInfoToast("[gold]Won auction: "+auction.item.name+"!",3);
        addVIPExp(15);
        addShopRep(8);
    }
    auctionItems=auctionItems.filter(a=>a.id!=auction.id);
    if(auctionItems.length<2){
        generateAuction();
    }
    saveCoins();
}

function startWorkActivity(activityIndex){
    let activity=WORK_ACTIVITIES[activityIndex];
    if(!activity||dailyWorkDone){
        Vars.ui.showInfoToast("[yellow]Come back tomorrow!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    workProgress=0;
    currentWorkActivity=activity;
    playSound("pop", 0.7, 1.0);
    Vars.ui.showInfoToast("[cyan]Working on: "+activity.name,3);
    if(activeWorkListener){Events.remove(activeWorkListener);}
    if(activity.type=="kills"){
        activeWorkListener=Events.on(UnitDestroyEvent,e=>{
            if(e.unit.team!=Vars.player.team()&&currentWorkActivity&&currentWorkActivity.name==activity.name){
                workProgress++;
                if(workProgress>=activity.progress)completeWork(activity);
            }
        });
    }else if(activity.type=="waves"){
        activeWorkListener=Events.on(WaveEvent,()=>{
            if(currentWorkActivity&&currentWorkActivity.name==activity.name){
                workProgress++;
                if(workProgress>=activity.progress)completeWork(activity);
            }
        });
    }else if(activity.type=="builds"){
        activeWorkListener=Events.on(BlockBuildEndEvent,e=>{
            if(e.team==Vars.player.team()&&currentWorkActivity&&currentWorkActivity.name==activity.name){
                workProgress++;
                if(workProgress>=activity.progress)completeWork(activity);
            }
        });
    }
}

function completeWork(activity){
    let reward = activity.reward;
    
    // Prestige coin bonus
    let coinBonus = getPrestigeBonus("coinBonus");
    reward = Math.floor(reward * (1 + coinBonus));
    
    coins+=reward;
    totalEarned+=reward;
    dailyWorkDone=true;
    workProgress=0;
    currentWorkActivity=null;
    if(activeWorkListener){Events.remove(activeWorkListener);activeWorkListener=null;}
    playSound("coins", 1.0, 1.2);
    Vars.ui.showInfoToast("[green]"+activity.name+" complete! +"+reward+" Coins",3);
    checkMilestones();
    saveCoins();
}

function isFavorite(itemName){return favoriteItems.indexOf(itemName)!==-1;}

function toggleFavorite(itemName){
    let idx=favoriteItems.indexOf(itemName);
    if(idx===-1){
        favoriteItems.push(itemName);
        playSound("pop", 0.5, 1.2);
    }else{
        favoriteItems.splice(idx,1);
        playSound("pop", 0.5, 0.8);
    }
    saveCoins();
}

function getBulkDiscount(quantity){
    for(let i=0;i<BULK_DISCOUNTS.length;i++){
        let tier=BULK_DISCOUNTS[i];
        if(quantity>=tier.min&&quantity<=tier.max){
            return tier;
        }
    }
    return null;
}

function calculateResourcePurchase(item,quantity){
    let baseRate=item.baseRate||10;
    let baseAmount=quantity;
    let baseCost=Math.ceil(quantity/baseRate)*getItemPrice(item);
    let discount=getBulkDiscount(quantity);
    let bonusAmount=0;
    let bonusLabel="";
    if(discount){
        bonusAmount=Math.floor(baseAmount*discount.bonus);
        bonusLabel=discount.label;
    }
    let totalAmount=baseAmount+bonusAmount;
    return{cost:baseCost,baseAmount:baseAmount,bonusAmount:bonusAmount,totalAmount:totalAmount,bonusLabel:bonusLabel};
}

function getSelectedQuantity(itemName){
    if(!selectedQuantities[itemName]){
        selectedQuantities[itemName]=10;
    }
    return selectedQuantities[itemName];
}

function setSelectedQuantity(itemName,quantity){
    if(quantity<10)quantity=10;
    selectedQuantities[itemName]=quantity;
}

function isOnCooldown(itemName){
    if(!COOLDOWN_TIMES[itemName]||!itemCooldowns[itemName])return false;
    return(Date.now()-itemCooldowns[itemName])/1000<COOLDOWN_TIMES[itemName];
}

function getCooldownRemaining(itemName){
    if(!isOnCooldown(itemName))return 0;
    return Math.ceil(COOLDOWN_TIMES[itemName]-(Date.now()-itemCooldowns[itemName])/1000);
}

function generateSale(){
    saleItems=[];
    saleEndTime=SALE_DURATION;
    let all=[];
    Object.keys(shopCategories).forEach(c=>{
        shopCategories[c].forEach(i=>{
            if(i&&isItemUnlocked(i))all.push(i);
        });
    });
    if(all.length==0)return;
    for(let i=0;i<MAX_SALE_ITEMS&&i<all.length;i++){
        let item=all[Math.floor(Math.random()*all.length)];
        saleItems.push({item:item,discount:Mathf.random(20,50)});
    }
}

function startSaleTimer(){
    Timer.schedule(()=>{
        if(saleEndTime>0){
            saleEndTime--;
            if(saleEndTime<=0){
                generateSale();
                Vars.ui.showInfoToast("[yellow]NEW SALE!",2);
            }
        }
    },0,1);
}

function startPetSystem(){
    Timer.schedule(()=>{
        if(ownedPets.length>0){
            petCoins++;
            if(petCoins>=60){
                let totalEarn=0;
                ownedPets.forEach(petName=>{
                    let pet=PETS.find(p=>p.name==petName);
                    if(pet)totalEarn+=pet.earnRate;
                });
                
                // Prestige pet bonus
                let petBonus = getPrestigeBonus("petBonus");
                totalEarn = Math.floor(totalEarn * (1 + petBonus));
                
                coins+=totalEarn;
                totalEarned+=totalEarn;
                petCoins=0;
                playSound("coins", 0.3, 1.0);
                Vars.ui.showInfoToast("[lime]Pets: +"+totalEarn+" Coins",2);
                checkMilestones();
                saveCoins();
            }
        }
        checkPetMissions();
    },0,1);
}

function setupCoinEarning(){
    Events.on(UnitDestroyEvent,e=>{
        if(e.unit.team!=Vars.player.team()){
            totalKills++;
            let earn=COIN_RATES.enemyKill*getVIPMultiplier();
            
            // Prestige coin bonus
            let coinBonus = getPrestigeBonus("coinBonus");
            earn = Math.floor(earn * (1 + coinBonus));
            
            coins+=earn;
            totalEarned+=earn;
            updateQuestProgress("kills",1);
            updateQuestProgress("earn",earn);
            updateAchievement("kills",1);
            updateAchievement("earn",earn);
            updateChallengeProgress("kills",1);
            updateChallengeProgress("earn",earn);
            addVIPExp(1);
            addShopRep(1);
            playSound("coins", 0.3, 1.5);
            checkMilestones();
            saveCoins();
        }
    });
    Events.on(WaveEvent,()=>{
        totalWavesCompleted++;
        let earn=COIN_RATES.waveComplete*getVIPMultiplier();
        
        // Prestige wave bonus
        let waveBonus = getPrestigeBonus("waveBonus");
        if(waveBonus > 0) {
            earn = Math.floor(earn * waveBonus);
        }
        
        // Prestige coin bonus
        let coinBonus = getPrestigeBonus("coinBonus");
        earn = Math.floor(earn * (1 + coinBonus));
        
        coins+=earn;
        totalEarned+=earn;
        updateQuestProgress("waves",1);
        updateQuestProgress("earn",earn);
        updateAchievement("waves",1);
        updateAchievement("earn",earn);
        updateChallengeProgress("waves",1);
        updateChallengeProgress("earn",earn);
        addVIPExp(5);
        addShopRep(2);
        playSound("coins", 0.6, 1.2);
        checkMilestones();
        saveCoins();
        Vars.ui.showInfoToast("Coins +"+earn+" | Wave "+totalWavesCompleted,2);
    });
    Events.on(BlockBuildEndEvent,e=>{
        if(e.team==Vars.player.team()){
            totalBuildings++;
            updateChallengeProgress("builds",1);
            saveCoins();
        }
    });
}

function initializeQuests(){
    let now=Date.now();
    if(now-lastQuestReset>86400000){
        dailyQuests=[];
        questProgress={};
        for(let i=0;i<3;i++){
            let template=QUEST_TEMPLATES[Math.floor(Math.random()*QUEST_TEMPLATES.length)];
            dailyQuests.push(template);
            questProgress[template.id]={current:0,completed:false,claimed:false};
        }
        lastQuestReset=now;
        saveCoins();
    }
}

function updateQuestProgress(type,amount){
    dailyQuests.forEach(q=>{
        if(q.type==type&&questProgress[q.id]&&!questProgress[q.id].completed){
            questProgress[q.id].current+=amount;
            if(questProgress[q.id].current>=q.target){
                questProgress[q.id].completed=true;
                Vars.ui.showInfoToast("[lime]Quest Complete: "+q.name,2);
            }
            saveCoins();
        }
    });
}

function claimQuestReward(qid){
    let q=dailyQuests.find(x=>x.id==qid);
    if(!q)return;
    let p=questProgress[qid];
    if(p.completed&&!p.claimed){
        let reward = q.reward;
        
        // Prestige coin bonus
        let coinBonus = getPrestigeBonus("coinBonus");
        reward = Math.floor(reward * (1 + coinBonus));
        
        coins+=reward;
        totalEarned+=reward;
        p.claimed=true;
        addVIPExp(5);
        addShopRep(2);
        playSound("coins", 0.8, 1.1);
        Vars.ui.showInfoToast("[gold]+"+reward+" Coins!",2);
        checkMilestones();
        saveCoins();
    }
}

function createShopUI(){
    let mainTable=new Table();
    mainTable.background(Styles.black8);
    mainTable.defaults().pad(4).minWidth(150);

    let row1=new Table();
    row1.background(Styles.black6);
    coinLabel=row1.add("[yellow]"+coins+" C").padLeft(10).padRight(20).get();
    row1.add("|").padLeft(6).padRight(6);
    vipLabelUI=row1.add("[gold]VIP "+vipLevel).padLeft(10).padRight(20).get();
    mainTable.add(row1).growX().height(20).row();

    let row2=new Table();
    row2.background(Styles.black6);
    shopLevelLabel=row2.add("[lime]Shop Lv "+shopLevel).pad(20).get();
    mainTable.add(row2).growX().height(20).row();

    mainTable.button("SHOP [K]",()=>{
        playSound("switch", 0.6, 1.0);
        openShop();
    }).minWidth(120).height(30).pad(2).get();

    mainTable.update(()=>{
        mainTable.setPosition(Core.graphics.getWidth() - 115, Core.graphics.getHeight() / 2 + 480);
        coinLabel.setText("[yellow]"+coins+" C");
        vipLabelUI.setText("[gold]VIP "+vipLevel);
        shopLevelLabel.setText("[lime]Shop Lv "+shopLevel);
        mainTable.visible=Vars.ui.hudfrag.shown;
    });

    Vars.ui.hudGroup.addChild(mainTable);
}// nem

function openShop(){
    if(settingsDialog)settingsDialog.hide();
    let d=new BaseDialog("SHOP");
    currentShopDialog=d;
    d.cont.clear();
    let topBar=new Table();
    topBar.background(Styles.black8);
    topBar.add("[green]Coins: "+coins).pad(5);
    topBar.add().growX();
    topBar.add("[cyan]Wave: "+totalWavesCompleted).pad(5);
    topBar.add().growX();
    topBar.add("[lime]Shop: "+shopLevel).pad(5);
    topBar.add().growX();
    if(prestigeLevel > 0) {
        topBar.add("[gold]P"+prestigeLevel).pad(5);
        topBar.add().growX();
    }
    topBar.add("[accent]"+currentPlanet.toUpperCase()).pad(5);
    d.cont.add(topBar).growX().pad(5).row();
    if(saleItems.length>0){
        let saleBar=new Table();
        saleBar.background(Styles.black6);
        let m=Math.floor(saleEndTime/60),s=saleEndTime%60;
        saleBar.add("[yellow]SALE | "+m+"m "+s+"s").pad(5);
        d.cont.add(saleBar).growX().pad(5).row();
    }
    d.cont.image().color(Color.gold).height(3).growX().pad(5).row();
    let tb=new Table();
    tb.defaults().size(120,55).pad(3);
    tb.button("All",()=>{playSound("pop", 0.5, 1.0);currentCategory="all";refreshShop();}).checked(b=>currentCategory=="all");
    tb.button("Serpulo",()=>{playSound("pop", 0.5, 1.0);currentCategory="serpulo";refreshShop();}).checked(b=>currentCategory=="serpulo");
    tb.row();
    tb.button("Erekir",()=>{playSound("pop", 0.5, 1.0);currentCategory="erekir";refreshShop();}).checked(b=>currentCategory=="erekir");
    tb.button("Boosts",()=>{playSound("pop", 0.5, 1.0);currentCategory="boosts";refreshShop();}).checked(b=>currentCategory=="boosts");
    tb.row();
    tb.button("Pets",()=>{playSound("pop", 0.5, 1.0);currentCategory="pets";refreshShop();}).checked(b=>currentCategory=="pets");
    tb.button("Auction",()=>{playSound("pop", 0.5, 1.0);currentCategory="auction";refreshShop();}).checked(b=>currentCategory=="auction");
    tb.row();
    tb.button("Converter",()=>{playSound("pop", 0.5, 1.0);currentCategory="converter";refreshShop();}).checked(b=>currentCategory=="converter");
    tb.button("Crafting",()=>{playSound("pop", 0.5, 1.0);currentCategory="crafting";refreshShop();}).checked(b=>currentCategory=="crafting");
    tb.row();
    tb.button("Cosmetics",()=>{playSound("pop", 0.5, 1.0);currentCategory="cosmetics";refreshShop();}).checked(b=>currentCategory=="cosmetics");
    tb.button("Prestige",()=>{playSound("pop", 0.5, 1.0);currentCategory="prestige";refreshShop();}).checked(b=>currentCategory=="prestige");
    tb.row();
    tb.button("Favorites",()=>{playSound("pop", 0.5, 1.0);currentCategory="favorites";refreshShop();}).checked(b=>currentCategory=="favorites");
    d.cont.add(tb).growX().pad(5).row();
    d.cont.image().color(Color.gray).height(2).growX().pad(5).row();
    let ct=new Table();
    currentContentTable=ct;
    refreshShop();
    let sc=new ScrollPane(ct);
    sc.setScrollingDisabled(true,false);
    d.cont.add(sc).grow().pad(10).row();
    d.buttons.defaults().size(110,60).pad(4);
    d.buttons.button("Stats",()=>{playSound("pop", 0.6, 1.0);openStats();});
    d.buttons.button("Rewards",()=>{playSound("pop", 0.6, 1.0);openRewards();});
    d.buttons.button("Code",()=>{playSound("pop", 0.6, 1.0);showRedeemDialog();});
    d.buttons.button("Close",()=>{playSound("switch", 0.6, 0.9);d.hide();});
    d.hidden(()=>{currentShopDialog=null;currentContentTable=null;});
    d.show();
}

function refreshShop(){
    if(!currentContentTable)return;
    currentContentTable.clear();
    currentContentTable.defaults().width(500).minHeight(85).pad(5);
    switch(currentCategory){
        case"all":showAllItems();break;
        case"serpulo":showSerpuloCategory();break;
        case"erekir":showErekirCategory();break;
        case"boosts":showCategoryItems(shopCategories.boosts,"BOOSTS");break;
        case"pets":showPets();break;
        case"auction":showAuction();break;
        case"converter":showConverter();break;
        case"crafting":showCrafting();break;
        case"cosmetics":showCosmetics();break;
        case"prestige":showPrestige();break;
        case"favorites":showFavorites();break;
    }
}

function showPrestige(){
    let t=currentContentTable;
    t.add("[gold]═══ PRESTIGE SYSTEM ═══").pad(10).row();
    t.add("[yellow]Reset for permanent power!").pad(5).row();
    t.add("").pad(10).row();
    t.add("[white]Current Prestige: [gold]"+prestigeLevel).pad(5).row();
    t.add("[white]Prestige Points: [lime]"+prestigePoints).pad(5).row();
    t.add("").pad(10).row();
    if(canPrestige()) {
        let earnedPoints = Math.floor(shopLevel / 3) + Math.floor(totalEarned / 10000);
        t.add("[lime]Ready to Prestige!").pad(5).row();
        t.add("[accent]You'll earn: "+earnedPoints+" points").pad(5).row();
        t.button("[gold]PRESTIGE NOW",()=>{doPrestige();}).size(300,60).pad(10);
        t.row();
    } else {
        t.add("[red]Requirements:").pad(5).row();
        t.add("[white]Shop Level 15 (Current: "+shopLevel+")").pad(3).row();
        t.add("[white]50,000 Earned (Current: "+totalEarned+")").pad(3).row();
    }
    t.add("").pad(10).row();
    t.add("[cyan]═══ PRESTIGE PERKS ═══").pad(10).row();
    PRESTIGE_PERKS.forEach((perk,i)=>{
        let canBuy = prestigePoints >= perk.cost;
        let txt = "[white]"+perk.name+" ["+perk.cost+" PP]\n[lightgray]"+perk.bonus+"\n"+(canBuy?"[lime]TAP TO UNLOCK":"[red]LOCKED");
        let btn = t.button(txt,()=>{if(canBuy){buyPrestigePerk(i);}}).left().minHeight(85).get();
        btn.disabled = !canBuy;
        if(!canBuy) btn.setColor(Color.valueOf("444444"));
        else btn.setColor(Color.valueOf("FFD700"));
        t.row();
    });
}

function showCosmetics(){
    let t=currentContentTable;
    t.add("[cyan]═══ COSMETICS SHOP ═══").pad(10).row();
    t.add("[lightgray]Visual effects only!").pad(5).row();
    t.add("").pad(10).row();
    if(equippedCosmetic) {
        t.add("[lime]Equipped: "+equippedCosmetic).pad(5).row();
        t.button("[yellow]Unequip",()=>{equipCosmetic(equippedCosmetic);}).size(200,50).pad(5);
        t.row();
        t.add("").pad(10).row();
    }
    COSMETICS.forEach(cosmetic=>{
        let unlocked = isCosmeticUnlocked(cosmetic);
        let owned = ownedCosmetics.indexOf(cosmetic.name) !== -1;
        let equipped = equippedCosmetic === cosmetic.name;
        if(!unlocked) {
            let req = "";
            if(cosmetic.unlockWave) req = "Wave "+cosmetic.unlockWave;
            if(cosmetic.unlockShopLvl) req += " Shop "+cosmetic.unlockShopLvl;
            if(cosmetic.unlockPrestige) req = "Prestige "+cosmetic.unlockPrestige;
            if(cosmetic.unlockVIP) req = "VIP "+cosmetic.unlockVIP;
            let txt = "[gray]"+cosmetic.name+"\n[lightgray]"+cosmetic.description+"\n[red]"+req;
            let btn = t.button(txt,()=>{}).left().minHeight(85).get();
            btn.disabled = true;
            btn.setColor(Color.valueOf("333333"));
            t.row();
        } else if(owned) {
            let txt = "[white]"+cosmetic.name+"\n[lightgray]"+cosmetic.description+"\n"+(equipped?"[gold]EQUIPPED":"[lime]TAP TO EQUIP");
            let btn = t.button(txt,()=>{equipCosmetic(cosmetic.name);}).left().minHeight(85).get();
            if(equipped) btn.setColor(Color.valueOf("FFD700"));
            else btn.setColor(Color.valueOf("4CAF50"));
            t.row();
        } else {
            let costText = cosmetic.cost > 0 ? "[yellow]"+cosmetic.cost+" Coins" : "[lime]FREE";
            let txt = "[white]"+cosmetic.name+"\n[lightgray]"+cosmetic.description+"\n"+costText;
            t.button(txt,()=>{buyCosmetic(cosmetic.name);}).left().minHeight(85);
            t.row();
        }
    });
}

function addLockedItem(t,item){
    if(!item)return;
    let req="[red]🔒 Wave "+item.unlockWave+" & Shop Lvl "+item.unlockShopLvl;
    let txt="[gray]"+item.name+"\n[lightgray]"+item.description+"\n"+req;
    let btn=t.button(txt,()=>{
        Vars.ui.showInfoToast("[red]Locked! Need Wave "+item.unlockWave,2);
        playSound("pop", 0.5, 0.8);
    }).left().minHeight(85).get();
    btn.disabled=true;
    btn.setColor(Color.valueOf("333333"));
    t.row();
}

function addShopItem(t,item,discount){
    if(!item||!isItemUnlocked(item))return;
    let itemTable=new Table();
    itemTable.background(Styles.black6);
    let starBtn=itemTable.button(isFavorite(item.name)?"[yellow]★":"[gray]☆",()=>{toggleFavorite(item.name);refreshShop();}).size(40,40).pad(5).get();
    let basePrice=getItemPrice(item);
    let finalPrice=discount>0?Math.floor(basePrice*(1-discount/100)):basePrice;
    let lvl=getItemLevel(item.name);
    let amount=getItemAmount(item);
    let displayName=amount+" "+item.description;
    let onCD=isOnCooldown(item.name);
    let cdTime=getCooldownRemaining(item.name);
    let priceText=discount>0?"[gray]"+basePrice+" [yellow]"+finalPrice+" (-"+Math.floor(discount)+"%)":"[yellow]"+finalPrice+" Coins";
    let levelText=lvl>1?" [accent]LVL"+lvl:"";
    let cdText=onCD?" [red]CD:"+cdTime+"s":"";
    let itemText="[white]"+displayName+levelText+"\n[lightgray]"+item.description+"\n"+priceText+cdText;
    let btn=itemTable.button(itemText,()=>{
        if(!onCD){purchaseItem(item,finalPrice,discount);}
    }).left().growX().minHeight(85).get();
    btn.disabled=onCD;
    if(onCD)btn.setColor(Color.valueOf("666666"));
    else if(discount>0)btn.setColor(Color.valueOf("FF6B6B"));
    t.add(itemTable).growX().pad(5).row();
}

function addResourceShopItem(t,item,discount){
    if(!item||!isItemUnlocked(item))return;
    let itemTable=new Table();
    itemTable.background(Styles.black6);
    let topRow=new Table();
    let starBtn=topRow.button(isFavorite(item.name)?"[yellow]★":"[gray]☆",()=>{toggleFavorite(item.name);refreshShop();}).size(40,40).pad(5).get();
    topRow.add("[white]"+item.name).left().padLeft(10).growX();
    topRow.add("[lightgray]"+item.baseRate+" = "+getItemPrice(item)+" coins").right().padRight(10);
    itemTable.add(topRow).growX().pad(5).row();
    let qty=getSelectedQuantity(item.name);
    let quantityLabel=null;
    let costLabel=null;
    let bonusLabel=null;
    let onCD=isOnCooldown(item.name);
    let cdTime=getCooldownRemaining(item.name);
    let updateLabels=function(){
        let calc=calculateResourcePurchase(item,qty);
        quantityLabel.setText("[accent]"+qty);
        let costText="[yellow]"+calc.cost+" Coins";
        if(discount>0){
            let discountedCost=Math.floor(calc.cost*(1-discount/100));
            costText="[gray]"+calc.cost+" [yellow]"+discountedCost+" (-"+Math.floor(discount)+"%)";
        }
        costLabel.setText(costText);
        if(calc.bonusAmount>0){
            bonusLabel.setText("[lime]Bonus: +"+calc.bonusAmount+" "+item.description+" "+calc.bonusLabel);
        }else{
            bonusLabel.setText("");
        }
    };
    let selectorTable=new Table();
    selectorTable.button("[-100]",()=>{playSound("pop", 0.4, 0.9);qty-=100;if(qty<10)qty=10;setSelectedQuantity(item.name,qty);updateLabels();}).size(70,45).pad(2);
    selectorTable.button("[-10]",()=>{playSound("pop", 0.4, 0.9);qty-=10;if(qty<10)qty=10;setSelectedQuantity(item.name,qty);updateLabels();}).size(70,45).pad(2);
    selectorTable.button("[RESET]",()=>{playSound("pop", 0.5, 1.0);qty=10;setSelectedQuantity(item.name,qty);updateLabels();}).size(70,45).pad(2);
    quantityLabel=selectorTable.add("[accent]"+qty).pad(3).minWidth(60).get();
    selectorTable.button("[+10]",()=>{playSound("pop", 0.4, 1.1);qty+=10;setSelectedQuantity(item.name,qty);updateLabels();}).size(70,45).pad(2);
    selectorTable.button("[+100]",()=>{playSound("pop", 0.4, 1.1);qty+=100;setSelectedQuantity(item.name,qty);updateLabels();}).size(70,45).pad(2);
    selectorTable.button("[MAX]",()=>{playSound("pop", 0.5, 1.2);let maxQty=Math.floor((coins/getItemPrice(item))*(item.baseRate||10));if(maxQty<10)maxQty=10;qty=maxQty;setSelectedQuantity(item.name,qty);updateLabels();}).size(70,45).pad(2);
    itemTable.add(selectorTable).pad(3).row();
    costLabel=itemTable.add("").pad(3).get();
    itemTable.row();
    bonusLabel=itemTable.add("").pad(3).get();
    itemTable.row();
    if(onCD){itemTable.add("[red]Cooldown: "+cdTime+"s").pad(3).row();}
    let buyBtn=itemTable.button(onCD?"[gray]ON COOLDOWN":"[green]BUY",()=>{
        if(!onCD){purchaseResource(item,qty,discount);updateLabels();}
    }).size(200,50).pad(5).get();
    buyBtn.disabled=onCD;
    updateLabels();
    t.add(itemTable).growX().pad(5).row();
}

function purchaseResource(item,quantity,discount){
    let calc=calculateResourcePurchase(item,quantity);
    let finalCost=calc.cost;
    if(discount>0){finalCost=Math.floor(calc.cost*(1-discount/100));}
    if(coins<finalCost){
        Vars.ui.showInfoToast("[red]Need "+finalCost+" coins!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    coins-=finalCost;
    totalSpent+=finalCost;
    purchaseHistory.unshift({name:item.name,cost:finalCost,time:Date.now()});
    if(purchaseHistory.length>20)purchaseHistory.pop();
    if(COOLDOWN_TIMES[item.name])itemCooldowns[item.name]=Date.now();
    updateQuestProgress("spend",finalCost);
    updateAchievement("spend",finalCost);
    updateChallengeProgress("spend",finalCost);
    addVIPExp(Math.floor(finalCost/10));
    addShopRep(Math.floor(finalCost/20));
    let core=Vars.player.team().core();
    if(core&&item.item){
        core.items.add(item.item,calc.totalAmount);
        let bonusText=calc.bonusAmount>0?" (+"+calc.bonusAmount+" bonus!)":"";
        playSound("coins", 0.7, 1.0);
        Vars.ui.showInfoToast("[green]+"+calc.totalAmount+" "+item.item.name+bonusText,2);
    }
    saveCoins();
    refreshShop();
}

function purchaseItem(item,price,discount){
    if(coins<price){
        Vars.ui.showInfoToast("[red]Need "+price+" coins!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    if(isOnCooldown(item.name)){
        Vars.ui.showInfoToast("[red]On cooldown!",2);
        playSound("pop", 0.5, 0.8);
        return;
    }
    coins-=price;
    totalSpent+=price;
    purchaseHistory.unshift({name:item.name,cost:price,time:Date.now()});
    if(purchaseHistory.length>20)purchaseHistory.pop();
    if(COOLDOWN_TIMES[item.name])itemCooldowns[item.name]=Date.now();
    updateQuestProgress("spend",price);
    updateAchievement("spend",price);
    updateChallengeProgress("spend",price);
    addVIPExp(Math.floor(price/10));
    addShopRep(Math.floor(price/20));
    executeItemEffect(item);
    playSound("coins", 0.7, 1.0);
    saveCoins();
    Vars.ui.showInfoToast("[green]Bought "+item.name+"!",2);
    refreshShop();
}

function executeItemEffect(item){
    switch(item.type){
        case"resource":giveResource(item);break;
        case"unit":spawnUnits(item);break;
        case"boost":applyBoost(item);break;
        case"special":applySpecial(item);break;
    }
}

function giveResource(i){
    let c=Vars.player.team().core();
    if(c&&i.item){
        let amount=getItemAmount(i);
        c.items.add(i.item,amount);
        Vars.ui.showInfoToast("[green]+"+amount+" "+i.item.name,2);
    }
}

function spawnUnits(i){
    let c=Vars.player.team().core();
    if(c&&i.unit){
        let amt=getItemAmount(i);
        for(let j=0;j<amt;j++){
            let a=Mathf.random(360);
            let d=Mathf.random(80,150);
            i.unit.spawn(Vars.player.team(),c.x+Angles.trnsx(a,d),c.y+Angles.trnsy(a,d));
        }
        Vars.ui.showInfoToast("[green]Spawned "+amt+" "+i.description,2);
    }
}

function applyBoost(i){
    if(i.effect=="heal"){
        let h=0;
        Groups.build.each(b=>{
            if(b.team==Vars.player.team()&&b.damaged()){
                b.heal(b.maxHealth*getItemAmount(i));
                h++;
            }
        });
        Vars.ui.showInfoToast("[green]Healed "+h+" buildings",2);
    }else if(i.effect=="skipWaves"){
        for(let j=0;j<getItemAmount(i);j++)Vars.logic.skipWave();
        Vars.ui.showInfoToast("[green]Skipped wave!",2);
    }
}

function applySpecial(i){
    if(i.effect=="buyCoins"){
        coins+=i.value;
        totalEarned+=i.value;
        Vars.ui.showInfoToast("[gold]+"+i.value+" Coins!",2);
    }
        }// pito

function showAllItems(){
    let t=currentContentTable;
    t.add("[accent]ALL ITEMS").pad(10).row();
    if(saleItems.length>0){
        t.add("[yellow]FLASH SALE").pad(10).row();
        saleItems.forEach(si=>{
            if(si.item.type=="resource"){addResourceShopItem(t,si.item,si.discount);}
            else{addShopItem(t,si.item,si.discount);}
        });
        t.add("").pad(5).row();
    }
    Object.keys(shopCategories).forEach(cat=>{
        let allItems=shopCategories[cat];
        let unlocked=allItems.filter(item=>item&&isItemUnlocked(item));
        let locked=allItems.filter(item=>item&&!isItemUnlocked(item));
        if(unlocked.length>0||locked.length>0){
            t.add("[accent]"+cat.toUpperCase().replace("_"," ")).pad(5).row();
            unlocked.slice(0,3).forEach(item=>{
                if(item.type=="resource"){addResourceShopItem(t,item,0);}
                else{addShopItem(t,item,0);}
            });
            locked.slice(0,2).forEach(item=>{addLockedItem(t,item);});
            t.add("").pad(5).row();
        }
    });
}

function showSerpuloCategory(){
    let t=currentContentTable;
    t.add("[cyan]SERPULO ITEMS").pad(10).row();
    let serpuloItems=[];
    serpuloItems=serpuloItems.concat(shopCategories.serpulo_resources||[]);
    serpuloItems=serpuloItems.concat(shopCategories.serpulo_units||[]);
    let unlocked=serpuloItems.filter(item=>item&&isItemUnlocked(item));
    let locked=serpuloItems.filter(item=>item&&!isItemUnlocked(item));
    if(unlocked.length>0){
        t.add("[lime]UNLOCKED").pad(5).row();
        unlocked.forEach(item=>{
            if(item.type=="resource"){addResourceShopItem(t,item,0);}
            else{addShopItem(t,item,0);}
        });
    }
    if(locked.length>0){
        t.add("[red]LOCKED ITEMS").pad(10).row();
        locked.forEach(item=>{addLockedItem(t,item);});
    }
}

function showErekirCategory(){
    let t=currentContentTable;
    t.add("[gold]EREKIR ITEMS").pad(10).row();
    let erekirItems=[];
    erekirItems=erekirItems.concat(shopCategories.erekir_resources||[]);
    erekirItems=erekirItems.concat(shopCategories.erekir_units||[]);
    let unlocked=erekirItems.filter(item=>item&&isItemUnlocked(item));
    let locked=erekirItems.filter(item=>item&&!isItemUnlocked(item));
    if(unlocked.length>0){
        t.add("[lime]UNLOCKED").pad(5).row();
        unlocked.forEach(item=>{
            if(item.type=="resource"){addResourceShopItem(t,item,0);}
            else{addShopItem(t,item,0);}
        });
    }
    if(locked.length>0){
        t.add("[red]LOCKED ITEMS").pad(10).row();
        locked.forEach(item=>{addLockedItem(t,item);});
    }
}

function showCategoryItems(items,title){
    let t=currentContentTable;
    t.add("[accent]"+title).pad(10).row();
    if(!items||items.length==0){t.add("[gray]No items").pad(10).row();return;}
    let unlocked=items.filter(item=>item&&isItemUnlocked(item));
    let locked=items.filter(item=>item&&!isItemUnlocked(item));
    if(unlocked.length>0){
        unlocked.forEach(item=>{
            if(item.type=="resource"){addResourceShopItem(t,item,0);}
            else{addShopItem(t,item,0);}
        });
    }
    if(locked.length>0){
        t.add("[red]LOCKED ITEMS").pad(10).row();
        locked.forEach(item=>{addLockedItem(t,item);});
    }
}

function showFavorites(){
    let t=currentContentTable;
    t.add("[yellow]FAVORITES").pad(10).row();
    if(favoriteItems.length==0){
        t.add("[gray]No favorites yet").pad(5).row();
        t.add("[lightgray]Click star on items").pad(5).row();
        return;
    }
    let allItems=[];
    Object.keys(shopCategories).forEach(cat=>{
        shopCategories[cat].forEach(item=>{
            if(item&&isFavorite(item.name)&&isItemUnlocked(item)){allItems.push(item);}
        });
    });
    PETS.forEach(pet=>{
        if(isFavorite(pet.name)&&isItemUnlocked(pet)){allItems.push(pet);}
    });
    if(allItems.length==0){t.add("[gray]All locked").pad(10).row();return;}
    allItems.forEach(item=>{
        if(item.type=="resource"){addResourceShopItem(t,item,0);}
        else if(item.earnRate){addPetItem(t,item);}
        else{addShopItem(t,item,0);}
    });
}

function showPets(){
    let t=currentContentTable;
    t.add("[lime]PETS & MISSIONS").pad(10).row();
    t.add("[lightgray]Earn coins passively!").pad(5).row();
    t.add("").pad(5).row();
    t.button("[cyan]Pet Missions",()=>{playSound("pop", 0.6, 1.0);showPetMissionsDialog();}).size(300,60).pad(5).row();
    t.add("").pad(5).row();
    let serpuloPets=PETS.filter(pet=>pet.planet=="serpulo"||pet.planet=="both");
    let erekirPets=PETS.filter(pet=>pet.planet=="erekir");
    if(serpuloPets.length>0){
        t.add("[cyan]SERPULO PETS").pad(5).row();
        serpuloPets.forEach(pet=>{
            if(isItemUnlocked(pet)){addPetItem(t,pet);}
            else{addLockedItem(t,pet);}
        });
        t.add("").pad(5).row();
    }
    if(erekirPets.length>0){
        t.add("[gold]EREKIR PETS").pad(5).row();
        erekirPets.forEach(pet=>{
            if(isItemUnlocked(pet)){addPetItem(t,pet);}
            else{addLockedItem(t,pet);}
        });
    }
}

function addPetItem(t,pet){
    let owned=ownedPets.indexOf(pet.name)!==-1;
    let itemTable=new Table();
    itemTable.background(Styles.black6);
    itemTable.button(isFavorite(pet.name)?"[yellow]★":"[gray]☆",()=>{toggleFavorite(pet.name);refreshShop();}).size(40,40).pad(5);
    let statusText=owned?"[lime]OWNED":"[yellow]"+pet.cost+" Coins";
    let txt="[white]"+pet.name+"\n[lightgray]"+pet.description+"\n"+statusText;
    let btn=itemTable.button(txt,()=>{
        if(!owned){buyPet(pet.name);}
        else{Vars.ui.showInfoToast("[yellow]Already owned!",2);playSound("pop", 0.5, 0.8);}
    }).left().growX().minHeight(85).get();
    if(owned){btn.setColor(Color.valueOf("228B22"));}
    t.add(itemTable).growX().pad(5).row();
}

function showPetMissionsDialog(){
    let d=new BaseDialog("PET MISSIONS");
    d.cont.add("[lime]Send pets on missions!").pad(10).row();
    d.cont.add("[lightgray]Earn rewards").pad(5).row();
    d.cont.image().color(Color.gold).height(2).growX().pad(5).row();
    let ct=new Table();
    ct.defaults().width(500).pad(5);
    PET_MISSIONS.forEach((mission,i)=>{
        let activeMission=petMissions.find(m=>m.name==mission.name&&!m.completed);
        let completedMission=petMissions.find(m=>m.name==mission.name&&m.completed&&!m.claimed);
        let canStart=ownedPets.length>=mission.requirements.minPets;
        let statusText="";
        if(activeMission){
            let timeLeft=Math.ceil((activeMission.endTime-Date.now())/1000);
            let mins=Math.floor(timeLeft/60);
            let secs=timeLeft%60;
            statusText="[yellow]Active: "+mins+"m "+secs+"s";
        }else if(completedMission){
            statusText="[lime]CLAIM REWARD!";
        }else if(!canStart){
            statusText="[red]Need "+mission.requirements.minPets+" pets";
        }else{
            statusText="[cyan]Start Mission";
        }
        let txt="[white]"+mission.name+"\n[lightgray]"+Math.floor(mission.duration/60)+" min | "+mission.reward+" coins\n"+statusText;
        ct.button(txt,()=>{
            if(completedMission){claimPetMission(mission.name);d.hide();}
            else if(!activeMission&&canStart){startPetMission(i);d.hide();}
        }).left().minHeight(85);
        ct.row();
    });
    let sc=new ScrollPane(ct);
    sc.setScrollingDisabled(true,false);
    d.cont.add(sc).grow().pad(10).row();
    d.buttons.button("Close",()=>{d.hide();}).size(150,60);
    d.show();
}

function showAuction(){
    let t=currentContentTable;
    t.add("[gold]AUCTION HOUSE").pad(10).row();
    t.add("[lightgray]Bid on items!").pad(5).row();
    t.add("").pad(5).row();
    if(auctionItems.length==0){
        t.add("[gray]No auctions").pad(10).row();
        t.button("[cyan]Generate",()=>{playSound("switch", 0.7, 1.0);generateAuction();refreshShop();}).size(300,60);
        return;
    }
    auctionItems.forEach(auction=>{
        let timeLeft=auctionEndTimes[auction.id]||0;
        let minutes=Math.floor(timeLeft/60);
        let seconds=timeLeft%60;
        let auctionTable=new Table();
        auctionTable.background(Styles.black6);
        auctionTable.add("[accent]"+auction.item.name).pad(5).row();
        auctionTable.add("[lightgray]"+auction.item.amount+" "+auction.item.description).pad(3).row();
        auctionTable.add("[yellow]Bid: "+auction.currentBid).pad(3).row();
        auctionTable.add("[white]Buy: [lime]"+auction.buyNowPrice).pad(3).row();
        auctionTable.add("[cyan]Time: "+minutes+"m "+seconds+"s").pad(3).row();
        let btnTable=new Table();
        btnTable.defaults().size(140,50).pad(3);
        btnTable.button("[yellow]Bid",()=>{playSound("pop", 0.6, 1.0);showBidDialog(auction);});
        btnTable.button("[lime]Buy",()=>{buyNowAuction(auction.id);});
        auctionTable.add(btnTable).pad(5).row();
        t.add(auctionTable).growX().pad(5).row();
    });
}

function showBidDialog(auction){
    let d=new BaseDialog("BID");
    d.cont.add("[yellow]"+auction.item.name).pad(10).row();
    d.cont.add("[white]Current: "+auction.currentBid).pad(5).row();
    let minBid=auction.currentBid+Math.floor(auction.startPrice*0.1);
    d.cont.add("[gray]Min: "+minBid).pad(5).row();
    let bidField=d.cont.field(minBid+"",txt=>{}).width(300).get();
    d.cont.row();
    d.buttons.button("Cancel",()=>{playSound("pop", 0.5, 0.8);d.hide();}).size(140,60);
    d.buttons.button("[green]Bid",()=>{
        let bidAmount=parseInt(bidField.getText());
        if(!isNaN(bidAmount)){placeBid(auction.id,bidAmount);d.hide();refreshShop();}
    }).size(140,60);
    d.show();
}

function showConverter(){
    let t=currentContentTable;
    t.add("[cyan]CONVERTER").pad(10).row();
    t.add("[lightgray]Exchange resources").pad(5).row();
    t.add("").pad(5).row();
    CONVERTER_RECIPES.forEach((recipe,i)=>{
        if(totalWavesCompleted>=recipe.unlock){
            let txt="[white]"+recipe.rate+" "+recipe.from.toUpperCase()+" → 1 "+recipe.to.toUpperCase()+"\n[lightgray]Convert";
            t.button(txt,()=>{playSound("pop", 0.6, 1.0);showConverterDialog(i);}).left().minHeight(85);
            t.row();
        }else{
            let txt="[gray]"+recipe.rate+" "+recipe.from.toUpperCase()+" → 1 "+recipe.to.toUpperCase()+"\n[red]Wave "+recipe.unlock;
            let btn=t.button(txt,()=>{}).left().minHeight(85).get();
            btn.disabled=true;
            btn.setColor(Color.valueOf("333333"));
            t.row();
        }
    });
}

function showConverterDialog(recipeIndex){
    let recipe=CONVERTER_RECIPES[recipeIndex];
    let d=new BaseDialog("CONVERTER");
    d.cont.add("[cyan]"+recipe.from.toUpperCase()+" → "+recipe.to.toUpperCase()).pad(10).row();
    d.cont.add("[lightgray]Rate: "+recipe.rate+":1").pad(5).row();
    d.cont.add("[white]Amount:").pad(5).row();
    let amountField=d.cont.field("10",txt=>{}).width(300).get();
    d.cont.row();
    d.buttons.button("Cancel",()=>{d.hide();}).size(140,60);
    d.buttons.button("[green]Convert",()=>{
        let amount=parseInt(amountField.getText());
        if(!isNaN(amount)&&amount>0){useConverter(recipeIndex,amount);d.hide();}
    }).size(140,60);
    d.show();
}

function showCrafting(){
    let t=currentContentTable;
    t.add("[gold]CRAFTING").pad(10).row();
    t.add("[lightgray]Craft materials").pad(5).row();
    t.add("").pad(5).row();
    CRAFTING_RECIPES.forEach(recipe=>{
        if(totalWavesCompleted>=recipe.unlock){
            let inputText="";
            recipe.inputs.forEach((input,i)=>{
                inputText+=input.amount+" "+input.item;
                if(i<recipe.inputs.length-1)inputText+=" + ";
            });
            let txt="[white]"+recipe.name+"\n[lightgray]"+inputText+"\n[yellow]"+recipe.cost+" coins";
            t.button(txt,()=>{craftItem(recipe.id);}).left().minHeight(100);
            t.row();
        }else{
            let txt="[gray]"+recipe.name+"\n[red]Wave "+recipe.unlock;
            let btn=t.button(txt,()=>{}).left().minHeight(85).get();
            btn.disabled=true;
            btn.setColor(Color.valueOf("333333"));
            t.row();
        }
    });
}

function openStats(){
    if(currentShopDialog)currentShopDialog.hide();
    let d=new BaseDialog("STATS");
    settingsDialog=d;
    d.cont.clear();
    let ct=new Table();
    ct.defaults().width(500).pad(5).left();
    ct.add("[yellow]ECONOMY").row();
    ct.add("[white]Coins: [green]"+coins).row();
    ct.add("[white]Earned: [lime]"+totalEarned).row();
    ct.add("[white]Spent: [orange]"+totalSpent).row();
    ct.add("").pad(5).row();
    ct.add("[yellow]PROGRESSION").row();
    ct.add("[white]Prestige: [gold]"+prestigeLevel+" ("+prestigePoints+" PP)").row();
    ct.add("[white]VIP: [gold]"+vipLevel).row();
    ct.add("[white]Shop: [lime]"+shopLevel).row();
    ct.add("").pad(5).row();
    ct.add("[yellow]GAMEPLAY").row();
    ct.add("[white]Waves: [cyan]"+totalWavesCompleted).row();
    ct.add("[white]Kills: [red]"+totalKills).row();
    ct.add("").pad(5).row();
    ct.add("[yellow]COLLECTION").row();
    ct.add("[white]Pets: [lime]"+ownedPets.length+"/"+PETS.length).row();
    ct.add("[white]Cosmetics: [cyan]"+ownedCosmetics.length+"/"+COSMETICS.length).row();
    let sc=new ScrollPane(ct);
    sc.setScrollingDisabled(true,false);
    d.cont.add(sc).grow().pad(10).row();
    d.buttons.button("Close",()=>{playSound("switch", 0.6, 0.9);d.hide();}).size(150,60);
    d.hidden(()=>{settingsDialog=null;});
    d.show();
}

function showRedeemDialog(){
    let d=new BaseDialog("CODE");
    d.cont.add("[yellow]Enter Code").pad(10).row();
    let f=d.cont.field("",txt=>{}).width(350).get();
    d.cont.row();
    d.buttons.button("Cancel",()=>{d.hide();}).size(140,60);
    d.buttons.button("[green]Redeem",()=>{
        let c=f.getText().trim();
        if(c.length>0){redeemCode(c);d.hide();}
    }).size(140,60);
    d.show();
            }// WALO - TAMPER-RESISTANT SAVE/LOAD SYSTEM

// Simple hash function for save validation
function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// Generate hash from save data
function generateSaveHash(data) {
    var hashString = [
        data.coins,
        data.vipLevel,
        data.shopLevel,
        data.totalEarned,
        data.totalSpent,
        data.totalWavesCompleted,
        data.ownedPets ? data.ownedPets.length : 0,
        data.prestigeLevel || 0,
        data.prestigePoints || 0
    ].join('|');
    return simpleHash(hashString);
}

// Clamp values to prevent impossible stats
function clampSaveData(data) {
    data.coins = Math.max(0, Math.min(data.coins || 0, 999999999));
    data.vipLevel = Math.max(0, Math.min(data.vipLevel || 0, 5));
    data.vipExp = Math.max(0, Math.min(data.vipExp || 0, 2000));
    data.shopLevel = Math.max(1, Math.min(data.shopLevel || 1, 100));
    data.shopReputation = Math.max(0, Math.min(data.shopReputation || 0, 10000));
    data.totalSpent = Math.max(0, Math.min(data.totalSpent || 0, 999999999));
    data.totalEarned = Math.max(0, Math.min(data.totalEarned || 0, 999999999));
    data.totalWavesCompleted = Math.max(0, Math.min(data.totalWavesCompleted || 0, 10000));
    data.totalKills = Math.max(0, Math.min(data.totalKills || 0, 999999));
    data.totalBuildings = Math.max(0, Math.min(data.totalBuildings || 0, 999999));
    data.petCoins = Math.max(0, Math.min(data.petCoins || 0, 120));
    data.workProgress = Math.max(0, Math.min(data.workProgress || 0, 1000));
    data.prestigeLevel = Math.max(0, Math.min(data.prestigeLevel || 0, 50));
    data.prestigePoints = Math.max(0, Math.min(data.prestigePoints || 0, 10000));
    
    if (!Array.isArray(data.ownedPets)) data.ownedPets = [];
    if (!Array.isArray(data.favoriteItems)) data.favoriteItems = [];
    if (!Array.isArray(data.redeemedCodes)) data.redeemedCodes = [];
    if (!Array.isArray(data.purchaseHistory)) data.purchaseHistory = [];
    if (!Array.isArray(data.ownedCosmetics)) data.ownedCosmetics = [];
    
    data.ownedPets = (data.ownedPets || []).slice(0, 20);
    data.favoriteItems = (data.favoriteItems || []).slice(0, 50);
    data.redeemedCodes = (data.redeemedCodes || []).slice(0, 100);
    data.purchaseHistory = (data.purchaseHistory || []).slice(0, 20);
    data.ownedCosmetics = (data.ownedCosmetics || []).slice(0, 20);
    
    if (typeof data.itemLevels !== 'object') data.itemLevels = {};
    if (typeof data.itemCooldowns !== 'object') data.itemCooldowns = {};
    if (typeof data.questProgress !== 'object') data.questProgress = {};
    if (typeof data.achievementProgress !== 'object') data.achievementProgress = {};
    if (typeof data.challengeProgress !== 'object') data.challengeProgress = {};
    if (typeof data.auctionEndTimes !== 'object') data.auctionEndTimes = {};
    if (typeof data.auctionBids !== 'object') data.auctionBids = {};
    if (typeof data.selectedQuantities !== 'object') data.selectedQuantities = {};
    
    data.dailyWorkDone = !!data.dailyWorkDone;
    
    return data;
}

// Validate save integrity
function validateSaveIntegrity(data) {
    if (!data._hash) {
        print("[ShopSystem] No hash found - old save or corrupted");
        return false;
    }
    
    var currentHash = generateSaveHash(data);
    
    if (data._hash !== currentHash) {
        print("[ShopSystem] Hash mismatch! Save may be tampered");
        print("[ShopSystem] Expected: " + currentHash + ", Got: " + data._hash);
        return false;
    }
    
    if (data.coins < 0 || data.coins > 999999999) return false;
    if (data.vipLevel < 0 || data.vipLevel > 5) return false;
    if (data.shopLevel < 1 || data.shopLevel > 100) return false;
    if (data.totalEarned < data.totalSpent) return false;
    
    return true;
}

// Reset all values to safe defaults
function resetToDefaults() {
    coins = 0;
    vipLevel = 0;
    vipExp = 0;
    shopLevel = 1;
    shopReputation = 0;
    totalSpent = 0;
    totalEarned = 0;
    totalWavesCompleted = 0;
    totalKills = 0;
    totalBuildings = 0;
    purchaseHistory = [];
    itemLevels = {};
    itemCooldowns = {};
    favoriteItems = [];
    ownedPets = [];
    petCoins = 0;
    redeemedCodes = [];
    dailyWorkDone = false;
    workProgress = 0;
    lastWorkReset = Date.now();
    dailyQuests = [];
    questProgress = {};
    lastQuestReset = Date.now();
    achievementProgress = {};
    petMissions = [];
    auctionItems = [];
    auctionEndTimes = {};
    auctionBids = {};
    challengeProgress = {};
    lastChallengeReset = Date.now();
    milestoneRewards = [];
    MILESTONE_REWARDS.forEach(function(m) {
        milestoneRewards.push({
            milestone: m.milestone,
            reward: m.reward,
            claimed: false,
            description: m.description
        });
    });
    selectedQuantities = {};
    currentPlanet = "serpulo";
    prestigeLevel = 0;
    prestigePoints = 0;
    ownedCosmetics = [];
    equippedCosmetic = null;
    lastOfflineCheck = Date.now();
}

function saveCoins() {
    try {
        var cleanAuctionItems = [];
        if (auctionItems && auctionItems.length > 0) {
            auctionItems.forEach(function(a) {
                if (a && a.item) {
                    cleanAuctionItems.push({
                        id: a.id,
                        itemName: a.item.name,
                        startPrice: a.startPrice,
                        buyNowPrice: a.buyNowPrice,
                        currentBid: a.currentBid,
                        highestBidder: a.highestBidder
                    });
                }
            });
        }
        
        var cleanPetMissions = [];
        if (petMissions && petMissions.length > 0) {
            petMissions.forEach(function(m) {
                cleanPetMissions.push({
                    name: m.name,
                    reward: m.reward,
                    endTime: m.endTime,
                    completed: m.completed,
                    claimed: m.claimed
                });
            });
        }
        
        var saveData = {
            coins: coins,
            vipLevel: vipLevel,
            vipExp: vipExp,
            shopLevel: shopLevel,
            shopReputation: shopReputation,
            totalSpent: totalSpent,
            totalEarned: totalEarned,
            totalWavesCompleted: totalWavesCompleted,
            totalKills: totalKills,
            totalBuildings: totalBuildings,
            purchaseHistory: purchaseHistory.slice(0, 20),
            itemLevels: itemLevels,
            itemCooldowns: itemCooldowns,
            favoriteItems: favoriteItems,
            ownedPets: ownedPets,
            petCoins: petCoins,
            redeemedCodes: redeemedCodes,
            dailyWorkDone: dailyWorkDone,
            workProgress: workProgress,
            lastWorkReset: lastWorkReset,
            dailyQuests: dailyQuests,
            questProgress: questProgress,
            lastQuestReset: lastQuestReset,
            achievementProgress: achievementProgress,
            cleanPetMissions: cleanPetMissions,
            cleanAuctionItems: cleanAuctionItems,
            auctionEndTimes: auctionEndTimes,
            auctionBids: auctionBids,
            challengeProgress: challengeProgress,
            lastChallengeReset: lastChallengeReset,
            milestoneRewards: milestoneRewards,
            selectedQuantities: selectedQuantities,
            currentPlanet: currentPlanet,
            prestigeLevel: prestigeLevel || 0,
            prestigePoints: prestigePoints || 0,
            ownedCosmetics: ownedCosmetics || [],
            equippedCosmetic: equippedCosmetic,
            lastOfflineCheck: lastOfflineCheck || Date.now(),
            _version: "1.4.1"
        };
        
        saveData = clampSaveData(saveData);
        saveData._hash = generateSaveHash(saveData);
        
        Vars.dataDirectory.child("shop-save.json").writeString(JSON.stringify(saveData));
        print("[ShopSystem] Saved (Protected) to shop-save.json");
    } catch (e) {
        print("[ShopSystem] Save error: " + e);
    }
}

function loadCoins() {
    try {
        var f = Vars.dataDirectory.child("shop-save.json");
        if (f.exists()) {
            var d = JSON.parse(f.readString());
            
            if (!validateSaveIntegrity(d)) {
                print("[ShopSystem] TAMPER DETECTED! Resetting to safe defaults...");
                Vars.ui.showInfoToast("[red]Save file corrupted! Reset to defaults.", 5);
                playSound("pop", 0.5, 0.8);
                resetToDefaults();
                saveCoins();
                return;
            }
            
            d = clampSaveData(d);
            
            coins = d.coins || 0;
            vipLevel = d.vipLevel || 0;
            vipExp = d.vipExp || 0;
            shopLevel = d.shopLevel || 1;
            shopReputation = d.shopReputation || 0;
            totalSpent = d.totalSpent || 0;
            totalEarned = d.totalEarned || 0;
            totalWavesCompleted = d.totalWavesCompleted || 0;
            totalKills = d.totalKills || 0;
            totalBuildings = d.totalBuildings || 0;
            purchaseHistory = d.purchaseHistory || [];
            itemLevels = d.itemLevels || {};
            itemCooldowns = d.itemCooldowns || {};
            favoriteItems = d.favoriteItems || [];
            ownedPets = d.ownedPets || [];
            petCoins = d.petCoins || 0;
            redeemedCodes = d.redeemedCodes || [];
            dailyWorkDone = d.dailyWorkDone || false;
            workProgress = d.workProgress || 0;
            lastWorkReset = d.lastWorkReset || 0;
            dailyQuests = d.dailyQuests || [];
            questProgress = d.questProgress || {};
            lastQuestReset = d.lastQuestReset || 0;
            achievementProgress = d.achievementProgress || {};
            auctionEndTimes = d.auctionEndTimes || {};
            auctionBids = d.auctionBids || {};
            currentPlanet = d.currentPlanet || "serpulo";
            challengeProgress = d.challengeProgress || {};
            lastChallengeReset = d.lastChallengeReset || 0;
            selectedQuantities = d.selectedQuantities || {};
            prestigeLevel = d.prestigeLevel || 0;
            prestigePoints = d.prestigePoints || 0;
            ownedCosmetics = d.ownedCosmetics || [];
            equippedCosmetic = d.equippedCosmetic || null;
            lastOfflineCheck = d.lastOfflineCheck || Date.now();
            
            if (d.milestoneRewards) {
                milestoneRewards = d.milestoneRewards;
            }
            
            if (d.cleanPetMissions) {
                petMissions = d.cleanPetMissions;
            }
            
            auctionItems = [];
            if (d.cleanAuctionItems && d.cleanAuctionItems.length > 0) {
                d.cleanAuctionItems.forEach(function(clean) {
                    var foundItem = AUCTION_EXCLUSIVE.find(function(i) {
                        return i.name == clean.itemName;
                    });
                    if (foundItem) {
                        auctionItems.push({
                            id: clean.id,
                            item: foundItem,
                            startPrice: clean.startPrice,
                            buyNowPrice: clean.buyNowPrice,
                            currentBid: clean.currentBid,
                            highestBidder: clean.highestBidder
                        });
                    }
                });
            }
            
            print("[ShopSystem v1.4.1] Loaded (Verified) from shop-save.json");
        } else {
            print("[ShopSystem v1.4.1] No save file, creating new");
            resetToDefaults();
            saveCoins();
        }
    } catch (e) {
        print("[ShopSystem] Load error: " + e);
        print("[ShopSystem] Resetting to safe defaults...");
        resetToDefaults();
        saveCoins();
    }
        }

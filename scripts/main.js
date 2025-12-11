// ShopSystemMod v1.2
var coins=0,coinLabel=null,shopLevelLabel=null,vipLabelUI=null,currentCategory="all",purchaseHistory=[],totalSpent=0,totalEarned=0,saleItems=[],MAX_SALE_ITEMS=4,saleEndTime=0,SALE_DURATION=600,currentShopDialog=null,currentContentTable=null,saleTimerLabel=null,dailyQuests=[],questProgress={},lastQuestReset=0,refundableItems=[],MAX_REFUND_HISTORY=3,loginStreak=0,lastLogin=0,achievementProgress={},REFUND_TIME_LIMIT=120,itemCooldowns={},favoriteItems=[],vipLevel=0,vipExp=0,itemLevels={},comboStreak=0,lastPurchaseTime=0,priceHistory={},notifications=[],coupons=[],shopReputation=0,shopLevel=1,dynamicPrices={},insuranceActive=false,ownedPets=[],petCoins=0,petLastCollect=0,redeemedCodes=[],workProgress=0,dailyWorkDone=false,lastWorkReset=0,settingsDialog=null,currentSettingsTab="stats",totalWavesCompleted=0,unlockedItems=[],activeCoupon=null,isRefreshing=false,saleUpdatePending=false,loginRewardClaimed=false,activeWorkListener=null,currentWorkActivity=null,totalKills=0,totalBuildings=0,mostPurchasedItem="",auctionItems=[],auctionEndTimes={},auctionBids={},auctionTimers={};

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
{name:"Cat",cost:800,earnRate:2,description:"2 coins/min",unlockWave:5,unlockShopLvl:1},
{name:"Dog",cost:1500,earnRate:4,description:"4 coins/min",unlockWave:10,unlockShopLvl:2},
{name:"Bird",cost:3000,earnRate:8,description:"8 coins/min",unlockWave:15,unlockShopLvl:3},
{name:"Dragon",cost:7000,earnRate:15,description:"15 coins/min",unlockWave:25,unlockShopLvl:5},
{name:"Fox",cost:12000,earnRate:25,description:"25 coins/min",unlockWave:35,unlockShopLvl:7},
{name:"Wolf",cost:20000,earnRate:40,description:"40 coins/min",unlockWave:45,unlockShopLvl:9},
{name:"Loyal Protector",cost:35000,earnRate:70,description:"70 coins/min",unlockWave:60,unlockShopLvl:12}
];

const WORK_ACTIVITIES=[{name:"Wave Defense",desc:"Complete 5 waves",reward:50,progress:5,type:"waves"},{name:"Enemy Hunter",desc:"Kill 30 enemies",reward:30,progress:30,type:"kills"},{name:"Builder",desc:"Place 20 buildings",reward:40,progress:20,type:"builds"}];

const REDEEM_CODES={"WELCOME2024":50,"FREEGOLD":100,"EPICWIN":200,"VIPACCESS":300,"MEGABONUS":500,"LEGENDARY":1000,"BLESSED2024":150,"GIFT888":250,"LUCKY999":350,"SamielXD15":15,"NEWBIE10":10,"START25":25,"COINS50":50};

const ACHIEVEMENTS=[{id:"kill100",name:"Warrior",desc:"Kill 100 enemies",target:100,reward:50,type:"kills"},{id:"wave20",name:"Survivor",desc:"Complete 20 waves",target:20,reward:100,type:"waves"},{id:"earn500",name:"Earner",desc:"Earn 500 coins",target:500,reward:75,type:"earn"}];

const QUEST_TEMPLATES=[{id:"kill30",name:"Destroyer",desc:"Kill 30 enemies",target:30,reward:20,type:"kills"},{id:"wave5",name:"Survivor",desc:"Complete 5 waves",target:5,reward:25,type:"waves"},{id:"spend50",name:"Shopper",desc:"Spend 50 coins",target:50,reward:15,type:"spend"}];

const LOGIN_REWARDS=[10,15,20,25,30,40,50,75,100,150];
const COIN_RATES={enemyKill:1,waveComplete:5,sectorCapture:50};

const COOLDOWN_TIMES={"Copper":60,"Lead":60,"Coal":60,"Titanium":60,"Thorium":60,"Skip Wave":300,"Repair":180};

const BULK_DISCOUNTS=[{min:100,max:499,bonus:0.10,label:"+10%"},{min:500,max:999,bonus:0.20,label:"+20%"},{min:1000,max:999999,bonus:0.30,label:"+30%"}];

const AUCTION_EXCLUSIVE=[
{name:"Plastanium",cost:5000,type:"resource",item:Items.plastanium,amount:50,description:"plastanium",unlockWave:30,unlockShopLvl:6},
{name:"Phase Fabric",cost:8000,type:"resource",item:Items.phaseFabric,amount:30,description:"phase fabric",unlockWave:40,unlockShopLvl:8},
{name:"Surge Alloy",cost:12000,type:"resource",item:Items.surgeAlloy,amount:20,description:"surge alloy",unlockWave:50,unlockShopLvl:10}
];

const shopCategories={
resources:[
{name:"Copper",cost:5,type:"resource",item:Items.copper,amount:10,description:"copper",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:0,unlockShopLvl:1,baseRate:10},
{name:"Lead",cost:8,type:"resource",item:Items.lead,amount:10,description:"lead",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:5,unlockShopLvl:1,baseRate:10},
{name:"Coal",cost:15,type:"resource",item:Items.coal,amount:10,description:"coal",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:8,unlockShopLvl:2,baseRate:10},
{name:"Titanium",cost:25,type:"resource",item:Items.titanium,amount:10,description:"titanium",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:12,unlockShopLvl:3,baseRate:10},
{name:"Thorium",cost:40,type:"resource",item:Items.thorium,amount:10,description:"thorium",maxLevel:5,costMultiplier:2.0,amountMultiplier:1.5,unlockWave:20,unlockShopLvl:4,baseRate:10}
],
units:[
{name:"Flare",cost:300,type:"unit",unit:UnitTypes.flare,amount:5,description:"flare",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:0,unlockShopLvl:1},
{name:"Dagger",cost:400,type:"unit",unit:UnitTypes.dagger,amount:3,description:"dagger",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:3,unlockShopLvl:1},
{name:"Mace",cost:600,type:"unit",unit:UnitTypes.mace,amount:2,description:"mace",maxLevel:5,costMultiplier:1.9,amountMultiplier:1.4,unlockWave:10,unlockShopLvl:2}
],
boosts:[
{name:"Skip Wave",cost:1250,type:"boost",effect:"skipWaves",value:1,description:"Skip wave",unlockWave:15,unlockShopLvl:3},
{name:"Repair",cost:750,type:"boost",effect:"heal",value:0.25,description:"Heal buildings",unlockWave:8,unlockShopLvl:2}
],
special:[]
};

Events.on(ClientLoadEvent,()=>{
loadCoins();
loadCustomSounds();
checkDailyLogin();
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
});

Events.on(WorldLoadEvent,()=>{Timer.schedule(()=>saveCoins(),0,60)});

function initAchievements(){ACHIEVEMENTS.forEach(a=>{if(!achievementProgress[a.id])achievementProgress[a.id]={current:0,claimed:false}})}

function checkDailyLogin(){let now=Date.now(),day=86400000;if(now-lastLogin>day*2){loginStreak=0;loginRewardClaimed=false}else if(now-lastLogin>day){loginStreak++;loginRewardClaimed=false}lastLogin=now;saveCoins()}

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

mainTable.button("SHOP",()=>{
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
}function claimDailyLoginReward(){
if(loginRewardClaimed){
Vars.ui.showInfoToast("[yellow]Already claimed!",2);
playSound("pop", 0.5, 0.8);
return;
}
let reward=LOGIN_REWARDS[Math.min(loginStreak-1,9)]||10;
let vipMult=getVIPMultiplier();
reward=Math.floor(reward*vipMult);
coins+=reward;
totalEarned+=reward;
loginRewardClaimed=true;
addVIPExp(10);
playSound("coins", 0.8, 1.2);
Vars.ui.showInfoToast("[lime]Day "+loginStreak+" +"+reward+" Coins!",3);
saveCoins();
}

function checkDailyWork(){let now=Date.now(),day=86400000;if(now-lastWorkReset>day){dailyWorkDone=false;workProgress=0;currentWorkActivity=null;lastWorkReset=now;saveCoins()}}

function isItemUnlocked(item){if(!item)return false;return totalWavesCompleted>=(item.unlockWave||0)&&shopLevel>=(item.unlockShopLvl||1)}

function getVIPMultiplier(){if(vipLevel>=5)return 6;if(vipLevel>=4)return 5;if(vipLevel>=3)return 4;if(vipLevel>=2)return 3;if(vipLevel>=1)return 2;return 1}

function getVIPDiscount(){let vip=VIP_LEVELS.find(v=>v.level==vipLevel);return vip?vip.discount:0}

function addVIPExp(amount){
vipExp+=amount;
if(vipLevel<VIP_LEVELS.length){
let nextLevel=VIP_LEVELS[vipLevel];
if(vipExp>=nextLevel.expNeeded){
vipLevel++;
vipExp=0;
playSound("switch", 1.0, 1.5);
Vars.ui.showInfoToast("[gold]VIP LEVEL "+vipLevel+"!",3);
saveCoins();
}
}
}

function getItemLevel(itemName){return itemLevels[itemName]||1}

function getItemPrice(item){let lvl=getItemLevel(item.name);if(lvl<=1)return item.cost;return Math.floor(item.cost*Math.pow(item.costMultiplier||2.0,lvl-1))}

function getItemAmount(item){let lvl=getItemLevel(item.name);if(!item.amount&&!item.value)return lvl;let base=item.amount||item.value||1;return Math.floor(base*Math.pow(item.amountMultiplier||1.5,lvl-1))}

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
saveCoins();
}

function updateAchievement(type,amt){ACHIEVEMENTS.forEach(a=>{if(a.type==type&&!achievementProgress[a.id].claimed){achievementProgress[a.id].current+=amt;saveCoins()}})}

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
saveCoins();
}
}

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
if(activeWorkListener){Events.remove(activeWorkListener)}
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
coins+=activity.reward;
totalEarned+=activity.reward;
dailyWorkDone=true;
workProgress=0;
currentWorkActivity=null;
if(activeWorkListener){Events.remove(activeWorkListener);activeWorkListener=null}
playSound("coins", 1.0, 1.2);
Vars.ui.showInfoToast("[green]"+activity.name+" complete! +"+activity.reward+" Coins",3);
saveCoins();
}

function isFavorite(itemName){return favoriteItems.indexOf(itemName)!==-1}

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

function getBulkDiscount(quantity){for(let i=0;i<BULK_DISCOUNTS.length;i++){let tier=BULK_DISCOUNTS[i];if(quantity>=tier.min&&quantity<=tier.max){return tier}}return null}

function calculateResourcePurchase(item,quantity){let baseRate=item.baseRate||10;let baseAmount=quantity;let baseCost=Math.ceil(quantity/baseRate)*item.cost;let discount=getBulkDiscount(quantity);let bonusAmount=0;let bonusLabel="";if(discount){bonusAmount=Math.floor(baseAmount*discount.bonus);bonusLabel=discount.label}let totalAmount=baseAmount+bonusAmount;return{cost:baseCost,baseAmount:baseAmount,bonusAmount:bonusAmount,totalAmount:totalAmount,bonusLabel:bonusLabel}}

function getSelectedQuantity(itemName){if(!selectedQuantities[itemName]){selectedQuantities[itemName]=10}return selectedQuantities[itemName]}

function setSelectedQuantity(itemName,quantity){if(quantity<10)quantity=10;selectedQuantities[itemName]=quantity}

function isOnCooldown(itemName){if(!COOLDOWN_TIMES[itemName]||!itemCooldowns[itemName])return false;return(Date.now()-itemCooldowns[itemName])/1000<COOLDOWN_TIMES[itemName]}

function getCooldownRemaining(itemName){if(!isOnCooldown(itemName))return 0;return Math.ceil(COOLDOWN_TIMES[itemName]-(Date.now()-itemCooldowns[itemName])/1000)}

function generateSale(){saleItems=[];saleEndTime=SALE_DURATION;let all=[];Object.keys(shopCategories).forEach(c=>{shopCategories[c].forEach(i=>{if(i&&isItemUnlocked(i))all.push(i)})});if(all.length==0)return;for(let i=0;i<MAX_SALE_ITEMS&&i<all.length;i++){let item=all[Math.floor(Math.random()*all.length)];saleItems.push({item:item,discount:Mathf.random(20,50)})}}

function startSaleTimer(){Timer.schedule(()=>{if(saleEndTime>0){saleEndTime--;if(saleEndTime<=0){generateSale();Vars.ui.showInfoToast("[yellow]NEW SALE!",2)}}},0,1)}

function startPetSystem(){Timer.schedule(()=>{if(ownedPets.length>0){petCoins++;if(petCoins>=60){let totalEarn=0;ownedPets.forEach(petName=>{let pet=PETS.find(p=>p.name==petName);if(pet)totalEarn+=pet.earnRate});coins+=totalEarn;totalEarned+=totalEarn;petCoins=0;playSound("coins", 0.3, 1.0);Vars.ui.showInfoToast("[lime]Pets: +"+totalEarn+" Coins",2);saveCoins()}}},0,1)}function setupCoinEarning(){
Events.on(UnitDestroyEvent,e=>{
if(e.unit.team!=Vars.player.team()){
totalKills++;
let earn=COIN_RATES.enemyKill*getVIPMultiplier();
coins+=earn;
totalEarned+=earn;
updateQuestProgress("kills",1);
updateQuestProgress("earn",earn);
updateAchievement("kills",1);
updateAchievement("earn",earn);
addVIPExp(1);
addShopRep(1);
playSound("coins", 0.3, 1.5);
saveCoins();
}
});
Events.on(WaveEvent,()=>{
totalWavesCompleted++;
let earn=COIN_RATES.waveComplete*getVIPMultiplier();
coins+=earn;
totalEarned+=earn;
updateQuestProgress("waves",1);
updateQuestProgress("earn",earn);
updateAchievement("waves",1);
updateAchievement("earn",earn);
addVIPExp(5);
addShopRep(2);
playSound("coins", 0.6, 1.2);
saveCoins();
Vars.ui.showInfoToast("Coins +"+earn+" | Wave "+totalWavesCompleted,2);
});
Events.on(BlockBuildEndEvent,e=>{
if(e.team==Vars.player.team()){
totalBuildings++;
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
coins+=q.reward;
totalEarned+=q.reward;
p.claimed=true;
addVIPExp(5);
addShopRep(2);
playSound("coins", 0.8, 1.1);
Vars.ui.showInfoToast("[gold]+"+q.reward+" Coins!",2);
saveCoins();
}
}

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
tb.button("All",()=>{playSound("pop", 0.5, 1.0);currentCategory="all";refreshShop()}).checked(b=>currentCategory=="all");
tb.button("Resources",()=>{playSound("pop", 0.5, 1.0);currentCategory="resources";refreshShop()}).checked(b=>currentCategory=="resources");
tb.row();
tb.button("Units",()=>{playSound("pop", 0.5, 1.0);currentCategory="units";refreshShop()}).checked(b=>currentCategory=="units");
tb.button("Boosts",()=>{playSound("pop", 0.5, 1.0);currentCategory="boosts";refreshShop()}).checked(b=>currentCategory=="boosts");
tb.row();
tb.button("Pets",()=>{playSound("pop", 0.5, 1.0);currentCategory="pets";refreshShop()}).checked(b=>currentCategory=="pets");
tb.button("Auction",()=>{playSound("pop", 0.5, 1.0);currentCategory="auction";refreshShop()}).checked(b=>currentCategory=="auction");
tb.row();
tb.button("Favorites",()=>{playSound("pop", 0.5, 1.0);currentCategory="favorites";refreshShop()}).checked(b=>currentCategory=="favorites");
d.cont.add(tb).growX().pad(5).row();

d.cont.image().color(Color.gray).height(2).growX().pad(5).row();

let ct=new Table();
currentContentTable=ct;
refreshShop();
let sc=new ScrollPane(ct);
sc.setScrollingDisabled(true,false);
d.cont.add(sc).grow().pad(10).row();

d.buttons.defaults().size(110,60).pad(4);
d.buttons.button("Stats",()=>{playSound("pop", 0.6, 1.0);openStats()});
d.buttons.button("Rewards",()=>{playSound("pop", 0.6, 1.0);openRewards()});
d.buttons.button("Code",()=>{playSound("pop", 0.6, 1.0);showRedeemDialog()});
d.buttons.button("Close",()=>{playSound("switch", 0.6, 0.9);d.hide()});

d.hidden(()=>{currentShopDialog=null;currentContentTable=null});
d.show();
}

function openStats(){
if(currentShopDialog)currentShopDialog.hide();

let d=new BaseDialog("STATISTICS");
settingsDialog=d;
d.cont.clear();

let topBar=new Table();
topBar.background(Styles.black8);
topBar.add("[gold]YOUR STATS").pad(10);
d.cont.add(topBar).growX().pad(5).row();

d.cont.image().color(Color.gold).height(3).growX().pad(5).row();

let ct=new Table();
ct.defaults().width(500).pad(5).left();

let itemCounts={};
purchaseHistory.forEach(p=>{
itemCounts[p.name]=(itemCounts[p.name]||0)+1;
});
let maxCount=0;
let mostBought="None";
Object.keys(itemCounts).forEach(name=>{
if(itemCounts[name]>maxCount){
maxCount=itemCounts[name];
mostBought=name;
}
});

let petEarningsPerMin=0;
ownedPets.forEach(petName=>{
let pet=PETS.find(p=>p.name==petName);
if(pet)petEarningsPerMin+=pet.earnRate;
});

ct.add("[yellow]═══ ECONOMY ═══").row();
ct.add("[white]Current Coins: [green]"+coins).row();
ct.add("[white]Total Earned: [lime]"+totalEarned).row();
ct.add("[white]Total Spent: [orange]"+totalSpent).row();
ct.add("[white]Net Profit: [accent]"+(totalEarned-totalSpent)).row();
ct.add("").pad(5).row();

ct.add("[yellow]═══ PROGRESSION ═══").row();
ct.add("[white]VIP Level: [gold]"+vipLevel+" ("+vipExp+"/"+((vipLevel<VIP_LEVELS.length)?VIP_LEVELS[vipLevel].expNeeded:"MAX")+")").row();
ct.add("[white]Shop Level: [lime]"+shopLevel).row();
ct.add("[white]Shop Rep: [cyan]"+shopReputation).row();
ct.add("[white]Login Streak: [accent]"+loginStreak+" days").row();
ct.add("").pad(5).row();

ct.add("[yellow]═══ GAMEPLAY ═══").row();
ct.add("[white]Waves Completed: [cyan]"+totalWavesCompleted).row();
ct.add("[white]Enemies Killed: [red]"+totalKills).row();
ct.add("[white]Buildings Placed: [sky]"+totalBuildings).row();
ct.add("").pad(5).row();

ct.add("[yellow]═══ SHOP ACTIVITY ═══").row();
ct.add("[white]Total Purchases: [accent]"+purchaseHistory.length).row();
ct.add("[white]Most Bought: [lime]"+mostBought+" ("+maxCount+"x)").row();
ct.add("[white]Favorite Items: [yellow]"+favoriteItems.length).row();
ct.add("[white]Codes Redeemed: [gold]"+redeemedCodes.length).row();
ct.add("").pad(5).row();

ct.add("[yellow]═══ PETS ═══").row();
ct.add("[white]Owned Pets: [lime]"+ownedPets.length+"/"+PETS.length).row();
ct.add("[white]Passive Income: [green]"+petEarningsPerMin+" coins/min").row();
ct.add("").pad(5).row();

let completedQuests=0;
Object.keys(questProgress).forEach(qid=>{
if(questProgress[qid].claimed)completedQuests++;
});
let completedAchievements=0;
Object.keys(achievementProgress).forEach(aid=>{
if(achievementProgress[aid].claimed)completedAchievements++;
});

ct.add("[yellow]═══ REWARDS ═══").row();
ct.add("[white]Quests Done: [accent]"+completedQuests).row();
ct.add("[white]Achievements: [gold]"+completedAchievements+"/"+ACHIEVEMENTS.length).row();
ct.add("[white]Work Completed: [cyan]"+(dailyWorkDone?"Yes":"No")).row();

let sc=new ScrollPane(ct);
sc.setScrollingDisabled(true,false);
d.cont.add(sc).grow().pad(10).row();

d.buttons.button("Close",()=>{playSound("switch", 0.6, 0.9);d.hide()}).size(150,60);

d.hidden(()=>{settingsDialog=null;currentContentTable=null});
d.show();
}

function refreshShop(){
if(!currentContentTable)return;
currentContentTable.clear();
currentContentTable.defaults().width(500).minHeight(85).pad(5);

switch(currentCategory){
case"all":showAllItems();break;
case"resources":showCategoryItems(shopCategories.resources,"RESOURCES");break;
case"units":showCategoryItems(shopCategories.units,"UNITS");break;
case"boosts":showCategoryItems(shopCategories.boosts,"BOOSTS");break;
case"pets":showPets();break;
case"auction":showAuction();break;
case"favorites":showFavorites();break;
}
}

function showAuction(){
let t=currentContentTable;
t.add("[gold]AUCTION HOUSE").pad(10).row();
t.add("[lightgray]Bid on exclusive items!").pad(5).row();
t.add("").pad(5).row();

if(auctionItems.length==0){
t.add("[gray]No auctions available").pad(10).row();
t.button("[cyan]Generate Auctions",()=>{
playSound("switch", 0.7, 1.0);
generateAuction();
refreshShop();
}).size(300,60);
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
auctionTable.add("[yellow]Current Bid: "+auction.currentBid).pad(3).row();
auctionTable.add("[white]Buy Now: [lime]"+auction.buyNowPrice).pad(3).row();
auctionTable.add("[cyan]Time: "+minutes+"m "+seconds+"s").pad(3).row();
auctionTable.add("[gray]Highest: "+auction.highestBidder).pad(3).row();

let btnTable=new Table();
btnTable.defaults().size(140,50).pad(3);

btnTable.button("[yellow]Place Bid",()=>{
playSound("pop", 0.6, 1.0);
showBidDialog(auction);
});

btnTable.button("[lime]Buy Now",()=>{
buyNowAuction(auction.id);
});

auctionTable.add(btnTable).pad(5).row();

t.add(auctionTable).growX().pad(5).row();
});
}

function showBidDialog(auction){
let d=new BaseDialog("PLACE BID");
d.cont.add("[yellow]"+auction.item.name).pad(10).row();
d.cont.add("[white]Current Bid: "+auction.currentBid).pad(5).row();
let minBid=auction.currentBid+Math.floor(auction.startPrice*0.1);
d.cont.add("[gray]Minimum: "+minBid).pad(5).row();

let bidField=d.cont.field(minBid+"",txt=>{}).width(300).get();
d.cont.row();

d.buttons.button("Cancel",()=>{playSound("pop", 0.5, 0.8);d.hide()}).size(140,60);
d.buttons.button("[green]Bid",()=>{
let bidAmount=parseInt(bidField.getText());
if(!isNaN(bidAmount)){
placeBid(auction.id,bidAmount);
d.hide();
refreshShop();
}
}).size(140,60);

d.show();
}

function showAllItems(){
let t=currentContentTable;
t.add("[accent]ALL ITEMS").pad(10).row();

if(saleItems.length>0){
t.add("[yellow]FLASH SALE").pad(10).row();
saleItems.forEach(si=>{
if(si.item.type=="resource"){
addResourceShopItem(t,si.item,si.discount);
}else{
addShopItem(t,si.item,si.discount);
}
});
t.add("").pad(5).row();
}

Object.keys(shopCategories).forEach(cat=>{
let allItems=shopCategories[cat];
let unlocked=allItems.filter(item=>item&&isItemUnlocked(item));
let locked=allItems.filter(item=>item&&!isItemUnlocked(item));

if(unlocked.length>0||locked.length>0){
t.add("[accent]"+cat.toUpperCase()).pad(5).row();
unlocked.slice(0,3).forEach(item=>{
if(item.type=="resource"){
addResourceShopItem(t,item,0);
}else{
addShopItem(t,item,0);
}
});
locked.slice(0,2).forEach(item=>{addLockedItem(t,item)});
t.add("").pad(5).row();
}
});
}

function showCategoryItems(items,title){
let t=currentContentTable;
t.add("[accent]"+title).pad(10).row();
if(!items||items.length==0){t.add("[gray]No items").pad(10).row();return}

let unlocked=items.filter(item=>item&&isItemUnlocked(item));
let locked=items.filter(item=>item&&!isItemUnlocked(item));

if(unlocked.length>0){
unlocked.forEach(item=>{
if(item.type=="resource"){
addResourceShopItem(t,item,0);
}else{
addShopItem(t,item,0);
}
});
}

if(locked.length>0){
t.add("[red]LOCKED ITEMS").pad(10).row();
locked.forEach(item=>{addLockedItem(t,item)});
}

if(unlocked.length==0&&locked.length==0){
t.add("[gray]No items available").pad(10).row();
}
}

function showFavorites(){
let t=currentContentTable;
t.add("[yellow]FAVORITES").pad(10).row();

if(favoriteItems.length==0){
t.add("[gray]No favorites yet").pad(5).row();
t.add("[lightgray]Click star on items to add").pad(5).row();
return;
}

let allItems=[];
Object.keys(shopCategories).forEach(cat=>{
shopCategories[cat].forEach(item=>{
if(item&&isFavorite(item.name)&&isItemUnlocked(item)){
allItems.push(item);
}
});
});

PETS.forEach(pet=>{
if(isFavorite(pet.name)&&isItemUnlocked(pet)){
allItems.push(pet);
}
});

if(allItems.length==0){
t.add("[gray]All favorites are locked").pad(10).row();
return;
}

allItems.forEach(item=>{
if(item.type=="resource"){
addResourceShopItem(t,item,0);
}else if(item.earnRate){
let owned=ownedPets.indexOf(item.name)!==-1;
let itemTable=new Table();
itemTable.background(Styles.black6);
itemTable.button(isFavorite(item.name)?"[yellow]★":"[gray]☆",()=>{
toggleFavorite(item.name);
refreshShop();
}).size(40,40).pad(5);
let statusText=owned?"[lime]OWNED":"[yellow]"+item.cost+" Coins";
let txt="[white]"+item.name+"\n[lightgray]"+item.description+"\n"+statusText;
let btn=itemTable.button(txt,()=>{
if(!owned){
buyPet(item.name);
}else{
Vars.ui.showInfoToast("[yellow]Already owned!",2);
playSound("pop", 0.5, 0.8);
}
}).left().growX().minHeight(85).get();
if(owned){
btn.setColor(Color.valueOf("228B22"));
}
t.add(itemTable).growX().pad(5).row();
}else{
addShopItem(t,item,0);
}
});
}function showPets(){
let t=currentContentTable;
t.add("[lime]PETS").pad(10).row();
t.add("[lightgray]Earn coins passively!").pad(5).row();
t.add("").pad(5).row();

let unlocked=PETS.filter(pet=>isItemUnlocked(pet));
let locked=PETS.filter(pet=>!isItemUnlocked(pet));

if(unlocked.length>0){
unlocked.forEach(pet=>{
let owned=ownedPets.indexOf(pet.name)!==-1;
let itemTable=new Table();
itemTable.background(Styles.black6);

itemTable.button(isFavorite(pet.name)?"[yellow]★":"[gray]☆",()=>{
toggleFavorite(pet.name);
refreshShop();
}).size(40,40).pad(5);

let statusText=owned?"[lime]OWNED":"[yellow]"+pet.cost+" Coins";
let txt="[white]"+pet.name+"\n[lightgray]"+pet.description+"\n"+statusText;
let btn=itemTable.button(txt,()=>{
if(!owned){
buyPet(pet.name);
}else{
Vars.ui.showInfoToast("[yellow]Already owned!",2);
playSound("pop", 0.5, 0.8);
}
}).left().growX().minHeight(85).get();

if(owned){
btn.setColor(Color.valueOf("228B22"));
}

t.add(itemTable).growX().pad(5).row();
});
}

if(locked.length>0){
t.add("[red]LOCKED PETS").pad(10).row();
locked.forEach(pet=>{
let req="[red]🔒 Unlock: Wave "+pet.unlockWave+" & Shop Lvl "+pet.unlockShopLvl;
let txt="[gray]"+pet.name+"\n[lightgray]"+pet.description+"\n"+req;
let btn=t.button(txt,()=>{
Vars.ui.showInfoToast("[red]Locked! Need Wave "+pet.unlockWave,2);
playSound("pop", 0.5, 0.8);
}).left().minHeight(85).get();
btn.disabled=true;
btn.setColor(Color.valueOf("333333"));
t.row();
});
}

if(unlocked.length==0&&locked.length==0){
t.add("[gray]No pets available").pad(10).row();
}
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

function addResourceShopItem(t,item,discount){
if(!item||!isItemUnlocked(item))return;

let itemTable=new Table();
itemTable.background(Styles.black6);

let topRow=new Table();
let starBtn=topRow.button(isFavorite(item.name)?"[yellow]★":"[gray]☆",()=>{toggleFavorite(item.name);refreshShop()}).size(40,40).pad(5).get();
topRow.add("[white]"+item.name).left().padLeft(10).growX();
topRow.add("[lightgray]"+item.baseRate+" = "+item.cost+" coins").right().padRight(10);
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

selectorTable.button("[-100]",()=>{
playSound("pop", 0.4, 0.9);
qty-=100;
if(qty<10)qty=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[-10]",()=>{
playSound("pop", 0.4, 0.9);
qty-=10;
if(qty<10)qty=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[RESET]",()=>{
playSound("pop", 0.5, 1.0);
qty=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

quantityLabel=selectorTable.add("[accent]"+qty).pad(3).minWidth(60).get();

selectorTable.button("[+10]",()=>{
playSound("pop", 0.4, 1.1);
qty+=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[+100]",()=>{
playSound("pop", 0.4, 1.1);
qty+=100;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[MAX]",()=>{
playSound("pop", 0.5, 1.2);
let maxQty=Math.floor((coins/item.cost)*(item.baseRate||10));
if(maxQty<10)maxQty=10;
qty=maxQty;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

itemTable.add(selectorTable).pad(3).row();

costLabel=itemTable.add("").pad(3).get();
itemTable.row();

bonusLabel=itemTable.add("").pad(3).get();
itemTable.row();

if(onCD){
itemTable.add("[red]Cooldown: "+cdTime+"s").pad(3).row();
}

let buyBtn=itemTable.button(onCD?"[gray]ON COOLDOWN":"[green]BUY",()=>{
if(!onCD){
purchaseResource(item,qty,discount);
updateLabels();
}
}).size(200,50).pad(5).get();
buyBtn.disabled=onCD;

updateLabels();

t.add(itemTable).growX().pad(5).row();
}

function addShopItem(t,item,discount){
if(!item||!isItemUnlocked(item))return;

let itemTable=new Table();
itemTable.background(Styles.black6);

let starBtn=itemTable.button(isFavorite(item.name)?"[yellow]★":"[gray]☆",()=>{toggleFavorite(item.name);refreshShop()}).size(40,40).pad(5).get();

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
if(!onCD){
purchaseItem(item,finalPrice,discount);
}
}).left().growX().minHeight(85).get();

btn.disabled=onCD;
if(onCD)btn.setColor(Color.valueOf("666666"));
else if(discount>0)btn.setColor(Color.valueOf("FF6B6B"));

t.add(itemTable).growX().pad(5).row();
}

function purchaseResource(item,quantity,discount){
let calc=calculateResourcePurchase(item,quantity);
let finalCost=calc.cost;

if(discount>0){
finalCost=Math.floor(calc.cost*(1-discount/100));
}

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
addVIPExp(Math.floor(finalCost/10));
addShopRep(Math.floor(finalCost/20));

let core=Vars.player.team().core();
if(core&&item.item){
core.items.add(item.item,calc.totalAmount);
let bonusText=calc.bonusAmount>0?" (+"+ calc.bonusAmount+" bonus!)":"";
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
}else if(i.effect=="spawnArmy"){
let c=Vars.player.team().core();
if(c){
let types=[UnitTypes.flare,UnitTypes.dagger];
for(let j=0;j<15;j++){
let a=Mathf.random(360);
let d=Mathf.random(100,180);
types[Math.floor(Math.random()*types.length)].spawn(Vars.player.team(),c.x+Angles.trnsx(a,d),c.y+Angles.trnsy(a,d));
}
Vars.ui.showInfoToast("[gold]Army spawned!",2);
}
}
}

function openRewards(){
if(currentShopDialog)currentShopDialog.hide();

let d=new BaseDialog("REWARDS");
settingsDialog=d;
d.cont.clear();

let topBar=new Table();
topBar.background(Styles.black8);
topBar.add("[gold]VIP "+vipLevel).pad(5);
topBar.add().growX();
topBar.add("[cyan]Wave: "+totalWavesCompleted).pad(5);
topBar.add().growX();
topBar.add("[green]Coins: "+coins).pad(5);
d.cont.add(topBar).growX().pad(5).row();

let tb=new Table();
tb.defaults().size(130,55).pad(3);
tb.button("Quests",()=>{playSound("pop", 0.5, 1.0);currentSettingsTab="quests";refreshRewardsTab()}).checked(b=>currentSettingsTab=="quests");
tb.button("Achievements",()=>{playSound("pop", 0.5, 1.0);currentSettingsTab="achievements";refreshRewardsTab()}).checked(b=>currentSettingsTab=="achievements");
tb.row();
tb.button("Work",()=>{playSound("pop", 0.5, 1.0);currentSettingsTab="work";refreshRewardsTab()}).checked(b=>currentSettingsTab=="work");
tb.button("Login",()=>{playSound("pop", 0.5, 1.0);currentSettingsTab="login";refreshRewardsTab()}).checked(b=>currentSettingsTab=="login");
d.cont.add(tb).growX().pad(5).row();

d.cont.image().color(Color.gold).height(3).growX().pad(5).row();

let ct=new Table();
currentContentTable=ct;
refreshRewardsTab();
let sc=new ScrollPane(ct);
sc.setScrollingDisabled(true,false);
d.cont.add(sc).grow().pad(10).row();

d.buttons.button("Close",()=>{playSound("switch", 0.6, 0.9);d.hide()}).size(150,60);

d.hidden(()=>{settingsDialog=null;currentContentTable=null;currentSettingsTab="quests"});
d.show();
}

function refreshRewardsTab(){
if(!currentContentTable)return;
currentContentTable.clear();
currentContentTable.defaults().width(500).minHeight(85).pad(5);

switch(currentSettingsTab){
case"quests":showQuestsTab();break;
case"achievements":showAchievementsTab();break;
case"work":showWorkTab();break;
case"login":showLoginTab();break;
}
}

function showQuestsTab(){
let t=currentContentTable;
t.add("[yellow]DAILY QUESTS").pad(10).row();
if(dailyQuests.length==0){t.add("[red]No quests").pad(10).row();return}

dailyQuests.forEach(q=>{
let p=questProgress[q.id];
let done=p.completed;
let claim=p.claimed;
let txt="[white]"+q.name+" +"+q.reward+" Coins\n[lightgray]"+q.desc+"\n"+(claim?"[gray]CLAIMED":(done?"[lime]TAP TO CLAIM":"[accent]"+p.current+"/"+q.target));
let btn=t.button(txt,()=>{if(done&&!claim){playSound("pop", 0.6, 1.0);claimQuestReward(q.id);refreshRewardsTab()}}).left().minHeight(85).get();
btn.disabled=claim||!done;
if(claim)btn.setColor(Color.valueOf("444444"));
else if(done)btn.setColor(Color.valueOf("4CAF50"));
t.row();
});
}

function showAchievementsTab(){
let t=currentContentTable;
t.add("[gold]ACHIEVEMENTS").pad(10).row();

ACHIEVEMENTS.forEach(a=>{
let p=achievementProgress[a.id];
let done=p.current>=a.target;
let claim=p.claimed;
let txt="[white]"+a.name+" +"+a.reward+" Coins\n[lightgray]"+a.desc+"\n"+(claim?"[gray]CLAIMED":(done?"[lime]TAP TO CLAIM":"[accent]"+p.current+"/"+a.target));
let btn=t.button(txt,()=>{if(done&&!claim){playSound("pop", 0.6, 1.0);claimAchievement(a.id);refreshRewardsTab()}}).left().minHeight(85).get();
btn.disabled=claim||!done;
if(claim)btn.setColor(Color.valueOf("444444"));
else if(done)btn.setColor(Color.valueOf("FFD700"));
t.row();
});
}

function showWorkTab(){
let t=currentContentTable;
t.add("[cyan]DAILY WORK").pad(10).row();

if(dailyWorkDone){
t.add("[yellow]Work completed!").pad(10).row();
t.add("[lightgray]Come back tomorrow").pad(5).row();
return;
}

if(currentWorkActivity){
t.add("[yellow]Current: "+currentWorkActivity.name).pad(10).row();
t.add("[accent]Progress: "+workProgress+"/"+currentWorkActivity.progress).pad(5).row();
t.add("").pad(10).row();
t.button("[red]Cancel Work",()=>{
if(currentWorkActivity){
currentWorkActivity=null;
workProgress=0;
if(activeWorkListener){
Events.remove(activeWorkListener);
activeWorkListener=null;
}
playSound("pop", 0.6, 0.8);
Vars.ui.showInfoToast("[yellow]Work cancelled",2);
refreshRewardsTab();
}
}).size(300,60);
t.row();
return;
}

t.add("[accent]CHOOSE A TASK").pad(5).row();
WORK_ACTIVITIES.forEach((activity,i)=>{
let txt="[white]"+activity.name+"\n[lightgray]"+activity.desc+"\n[yellow]Reward: "+activity.reward+" Coins";
t.button(txt,()=>{playSound("pop", 0.6, 1.0);startWorkActivity(i);refreshRewardsTab()}).left().minHeight(85);
t.row();
});
}

function showLoginTab(){
let t=currentContentTable;
t.add("[lime]DAILY LOGIN").pad(10).row();
t.add("[accent]Streak: "+loginStreak+" days").pad(5).row();
t.add("").pad(5).row();

if(loginStreak>0&&!loginRewardClaimed){
let reward=LOGIN_REWARDS[Math.min(loginStreak-1,9)]||10;
reward=Math.floor(reward*getVIPMultiplier());
t.button("[green]CLAIM DAY "+loginStreak+"\n[yellow]+"+reward+" Coins",()=>{playSound("pop", 0.7, 1.0);claimDailyLoginReward();refreshRewardsTab()}).size(400,80).get();
t.row();
t.add("").pad(10).row();
}else if(loginRewardClaimed){
t.add("[yellow]Today's reward claimed!").pad(10).row();
}

t.add("[yellow]REWARDS:").pad(5).row();
LOGIN_REWARDS.forEach((r,i)=>{
let day=i+1;
let actual=Math.floor(r*getVIPMultiplier());
let status=loginStreak>=day?"[lime]Day "+day+": "+actual+" Coins":"[gray]Day "+day+": "+actual+" Coins";
t.add(status).left().pad(3).row();
});
}

function showRedeemDialog(){
let d=new BaseDialog("REDEEM CODE");
d.cont.add("[yellow]Enter Code").pad(10).row();
let codeField=d.cont.field("",txt=>{}).width(350).get();
d.cont.row();

d.buttons.button("Cancel",()=>{playSound("pop", 0.5, 0.8);d.hide()}).size(140,60);
d.buttons.button("[green]Redeem",()=>{
let code=codeField.getText().trim();
if(code.length>0){playSound("pop", 0.6, 1.0);redeemCode(code);d.hide();if(currentShopDialog)refreshShop()}
}).size(140,60);

d.show();
}

function saveCoins(){
try{
let cleanAuctionItems=[];
if(auctionItems&&auctionItems.length>0){
auctionItems.forEach(a=>{
if(a&&a.item){
cleanAuctionItems.push({
id:a.id,
itemName:a.item.name,
startPrice:a.startPrice,
buyNowPrice:a.buyNowPrice,
currentBid:a.currentBid,
highestBidder:a.highestBidder
});
}
});
}

Vars.dataDirectory.child("shop-coins.json").writeString(JSON.stringify({
coins:coins,
totalSpent:totalSpent,
totalEarned:totalEarned,
history:purchaseHistory.slice(0,20),
quests:dailyQuests,
questProgress:questProgress,
lastQuestReset:lastQuestReset,
loginStreak:loginStreak,
lastLogin:lastLogin,
loginRewardClaimed:loginRewardClaimed,
achievements:achievementProgress,
cooldowns:itemCooldowns,
favorites:favoriteItems,
vipLevel:vipLevel,
vipExp:vipExp,
itemLevels:itemLevels,
shopReputation:shopReputation,
shopLevel:shopLevel,
ownedPets:ownedPets,
petCoins:petCoins,
redeemedCodes:redeemedCodes,
workProgress:workProgress,
dailyWorkDone:dailyWorkDone,
lastWorkReset:lastWorkReset,
totalWavesCompleted:totalWavesCompleted,
selectedQuantities:selectedQuantities,
totalKills:totalKills,
totalBuildings:totalBuildings,
cleanAuctionItems:cleanAuctionItems,
auctionEndTimes:auctionEndTimes,
auctionBids:auctionBids
}));
}catch(e){}
}

function loadCoins(){
try{
let f=Vars.dataDirectory.child("shop-coins.json");
if(f.exists()){
let d=JSON.parse(f.readString());
coins=d.coins||0;
totalSpent=d.totalSpent||0;
totalEarned=d.totalEarned||0;
purchaseHistory=d.history||[];
dailyQuests=d.quests||[];
questProgress=d.questProgress||{};
lastQuestReset=d.lastQuestReset||0;
loginStreak=d.loginStreak||0;
lastLogin=d.lastLogin||0;
loginRewardClaimed=d.loginRewardClaimed||false;
achievementProgress=d.achievements||{};
itemCooldowns=d.cooldowns||{};
favoriteItems=d.favorites||[];
vipLevel=d.vipLevel||0;
vipExp=d.vipExp||0;
itemLevels=d.itemLevels||{};
shopReputation=d.shopReputation||0;
shopLevel=d.shopLevel||1;
ownedPets=d.ownedPets||[];
petCoins=d.petCoins||0;
redeemedCodes=d.redeemedCodes||[];
workProgress=d.workProgress||0;
dailyWorkDone=d.dailyWorkDone||false;
lastWorkReset=d.lastWorkReset||0;
totalWavesCompleted=d.totalWavesCompleted||0;
selectedQuantities=d.selectedQuantities||{};
totalKills=d.totalKills||0;
totalBuildings=d.totalBuildings||0;
auctionEndTimes=d.auctionEndTimes||{};
auctionBids=d.auctionBids||{};

auctionItems=[];
if(d.cleanAuctionItems&&d.cleanAuctionItems.length>0){
d.cleanAuctionItems.forEach(clean=>{
let foundItem=AUCTION_EXCLUSIVE.find(i=>i.name==clean.itemName);
if(foundItem){
auctionItems.push({
id:clean.id,
item:foundItem,
startPrice:clean.startPrice,
buyNowPrice:clean.buyNowPrice,
currentBid:clean.currentBid,
highestBidder:clean.highestBidder
});
}
});
}
}
}catch(e){}
}
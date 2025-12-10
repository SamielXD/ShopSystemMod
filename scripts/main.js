// ShopSystemMod v1.1

let coins=0,coinLabel=null,shopLevelLabel=null,currentCategory="all",purchaseHistory=[],totalSpent=0,totalEarned=0,saleItems=[],MAX_SALE_ITEMS=4,saleEndTime=0,SALE_DURATION=600,currentShopDialog=null,currentContentTable=null,saleTimerLabel=null,dailyQuests=[],questProgress={},lastQuestReset=0,refundableItems=[],MAX_REFUND_HISTORY=3,loginStreak=0,lastLogin=0,achievementProgress={},REFUND_TIME_LIMIT=120,itemCooldowns={},favoriteItems=[],vipLevel=0,vipExp=0,itemLevels={},comboStreak=0,lastPurchaseTime=0,priceHistory={},notifications=[],coupons=[],shopReputation=0,shopLevel=1,dynamicPrices={},insuranceActive=false,ownedPets=[],petCoins=0,petLastCollect=0,redeemedCodes=[],workProgress=0,dailyWorkDone=false,lastWorkReset=0,settingsDialog=null,currentSettingsTab="quests",totalWavesCompleted=0,unlockedItems=[],activeCoupon=null,isRefreshing=false,saleUpdatePending=false,loginRewardClaimed=false,activeWorkListener=null,currentWorkActivity=null;

let selectedQuantities = {};

const VIP_LEVELS=[{level:1,expNeeded:100,perks:"2x Coin",discount:5},{level:2,expNeeded:300,perks:"3x Coin",discount:10},{level:3,expNeeded:600,perks:"4x Coin",discount:15},{level:4,expNeeded:1000,perks:"5x Coin",discount:20},{level:5,expNeeded:1500,perks:"6x Coin",discount:25}];

const PETS=[{name:"Coin Cat",cost:800,earnRate:2,description:"2 coins/min",unlockWave:5,unlockShopLvl:1},{name:"Gold Dog",cost:1500,earnRate:4,description:"4 coins/min",unlockWave:10,unlockShopLvl:2},{name:"Diamond Bird",cost:3000,earnRate:8,description:"8 coins/min",unlockWave:15,unlockShopLvl:3},{name:"Mega Dragon",cost:7000,earnRate:15,description:"15 coins/min",unlockWave:25,unlockShopLvl:5}];

const WORK_ACTIVITIES=[{name:"Wave Defense",desc:"Complete 5 waves",reward:50,progress:5,type:"waves"},{name:"Enemy Hunter",desc:"Kill 30 enemies",reward:30,progress:30,type:"kills"},{name:"Builder",desc:"Place 20 buildings",reward:40,progress:20,type:"builds"}];

const REDEEM_CODES={"WELCOME2024":50,"FREEGOLD":100,"EPICWIN":200,"VIPACCESS":300,"MEGABONUS":500,"LEGENDARY":1000,"BLESSED2024":150,"GIFT888":250,"LUCKY999":350,"SamielXD15":15,"NEWBIE10":10,"START25":25,"COINS50":50};

const ACHIEVEMENTS=[{id:"kill100",name:"Warrior",desc:"Kill 100 enemies",target:100,reward:50,type:"kills"},{id:"wave20",name:"Survivor",desc:"Complete 20 waves",target:20,reward:100,type:"waves"},{id:"earn500",name:"Earner",desc:"Earn 500 coins",target:500,reward:75,type:"earn"}];

const QUEST_TEMPLATES=[{id:"kill30",name:"Destroyer",desc:"Kill 30 enemies",target:30,reward:20,type:"kills"},{id:"wave5",name:"Survivor",desc:"Complete 5 waves",target:5,reward:25,type:"waves"},{id:"spend50",name:"Shopper",desc:"Spend 50 coins",target:50,reward:15,type:"spend"}];

const LOGIN_REWARDS=[10,15,20,25,30,40,50,75,100,150];
const COIN_RATES={enemyKill:1,waveComplete:5,sectorCapture:50};

const COOLDOWN_TIMES={
"Copper":60,
"Lead":60,
"Coal":60,
"Titanium":60,
"Thorium":60,
"Skip Wave":300,
"Repair":180
};

const BULK_DISCOUNTS = [
  {min: 100, max: 499, bonus: 0.10, label: "+10%"},
  {min: 500, max: 999, bonus: 0.20, label: "+20%"},
  {min: 1000, max: 999999, bonus: 0.30, label: "+30%"}
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
checkDailyLogin();
initAchievements();
createShopUI();
setupCoinEarning();
generateSale();
startSaleTimer();
initializeQuests();
startPetSystem();
checkDailyWork();
});

Events.on(WorldLoadEvent,()=>{Timer.schedule(()=>saveCoins(),0,60)});function initAchievements(){ACHIEVEMENTS.forEach(a=>{if(!achievementProgress[a.id])achievementProgress[a.id]={current:0,claimed:false}})}

function checkDailyLogin(){let now=Date.now(),day=86400000;if(now-lastLogin>day*2){loginStreak=0;loginRewardClaimed=false}else if(now-lastLogin>day){loginStreak++;loginRewardClaimed=false}lastLogin=now;saveCoins()}

function claimDailyLoginReward(){if(loginRewardClaimed){Vars.ui.showInfoToast("[yellow]Already claimed!",2);return}let reward=LOGIN_REWARDS[Math.min(loginStreak-1,9)]||10;let vipMult=getVIPMultiplier();reward=Math.floor(reward*vipMult);coins+=reward;totalEarned+=reward;loginRewardClaimed=true;addVIPExp(10);Sounds.press.at(Vars.player);Vars.ui.showInfoToast("[lime]Day "+loginStreak+" +"+reward+" Coins!",3);saveCoins()}

function checkDailyWork(){let now=Date.now(),day=86400000;if(now-lastWorkReset>day){dailyWorkDone=false;workProgress=0;currentWorkActivity=null;lastWorkReset=now;saveCoins()}}

function isItemUnlocked(item){if(!item)return false;return totalWavesCompleted>=(item.unlockWave||0)&&shopLevel>=(item.unlockShopLvl||1)}

function getVIPMultiplier(){if(vipLevel>=5)return 6;if(vipLevel>=4)return 5;if(vipLevel>=3)return 4;if(vipLevel>=2)return 3;if(vipLevel>=1)return 2;return 1}

function getVIPDiscount(){let vip=VIP_LEVELS.find(v=>v.level==vipLevel);return vip?vip.discount:0}

function addVIPExp(amount){vipExp+=amount;if(vipLevel<VIP_LEVELS.length){let nextLevel=VIP_LEVELS[vipLevel];if(vipExp>=nextLevel.expNeeded){vipLevel++;vipExp=0;Sounds.unlock.at(Vars.player);Vars.ui.showInfoToast("[gold]VIP LEVEL "+vipLevel+"!",3);saveCoins()}}}

function getItemLevel(itemName){return itemLevels[itemName]||1}

function getItemPrice(item){let lvl=getItemLevel(item.name);if(lvl<=1)return item.cost;return Math.floor(item.cost*Math.pow(item.costMultiplier||2.0,lvl-1))}

function getItemAmount(item){let lvl=getItemLevel(item.name);if(!item.amount&&!item.value)return lvl;let base=item.amount||item.value||1;return Math.floor(base*Math.pow(item.amountMultiplier||1.5,lvl-1))}

function addShopRep(amount){shopReputation+=amount;let oldLevel=shopLevel;shopLevel=Math.floor(shopReputation/100)+1;if(shopLevel>oldLevel){Sounds.unlock.at(Vars.player);Vars.ui.showInfoToast("[gold]Shop Level "+shopLevel+"!",3)}saveCoins()}

function buyPet(petName){let pet=PETS.find(p=>p.name==petName);if(!pet||!isItemUnlocked(pet))return;if(ownedPets.indexOf(petName)!==-1){Sounds.back.at(Vars.player);Vars.ui.showInfoToast("[yellow]Already owned!",2);return}if(coins<pet.cost){Sounds.back.at(Vars.player);Vars.ui.showInfoToast("[red]Need "+pet.cost+" coins!",2);return}coins-=pet.cost;totalSpent+=pet.cost;ownedPets.push(petName);Sounds.press.at(Vars.player);Vars.ui.showInfoToast("[lime]"+petName+" adopted!",3);saveCoins()}

function redeemCode(code){if(redeemedCodes.indexOf(code)!==-1){Sounds.back.at(Vars.player);Vars.ui.showInfoToast("[red]Code already used!",2);return}let reward=REDEEM_CODES[code];if(!reward){Sounds.back.at(Vars.player);Vars.ui.showInfoToast("[red]Invalid code!",2);return}coins+=reward;totalEarned+=reward;redeemedCodes.push(code);Sounds.press.at(Vars.player);Vars.ui.showInfoToast("[gold]Code: +"+reward+" Coins!",3);saveCoins()}

function updateAchievement(type,amt){ACHIEVEMENTS.forEach(a=>{if(a.type==type&&!achievementProgress[a.id].claimed){achievementProgress[a.id].current+=amt;saveCoins()}})}

function claimAchievement(aid){let a=ACHIEVEMENTS.find(x=>x.id==aid);if(!a)return;let p=achievementProgress[aid];if(p.current>=a.target&&!p.claimed){coins+=a.reward;totalEarned+=a.reward;p.claimed=true;addVIPExp(15);addShopRep(5);Sounds.press.at(Vars.player);Vars.ui.showInfoToast("[gold]+"+a.reward+" Coins!",3);saveCoins()}}

function initializeQuests(){let t=Date.now(),d=86400000;if(t-lastQuestReset>d||dailyQuests.length==0){generateDailyQuests();lastQuestReset=t}}

function generateDailyQuests(){dailyQuests=[];questProgress={};let s=QUEST_TEMPLATES.slice();for(let i=s.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[s[i],s[j]]=[s[j],s[i]]}for(let i=0;i<3&&i<s.length;i++){dailyQuests.push(s[i]);questProgress[s[i].id]={current:0,completed:false,claimed:false}}saveCoins()}

function updateQuestProgress(type,amt){dailyQuests.forEach(q=>{if(q.type==type&&!questProgress[q.id].completed){questProgress[q.id].current+=amt;if(questProgress[q.id].current>=q.target){questProgress[q.id].current=q.target;questProgress[q.id].completed=true;Vars.ui.showInfoToast("[yellow]Quest: "+q.name,2)}saveCoins()}})}

function claimQuestReward(qid){let q=dailyQuests.find(x=>x.id==qid);if(!q)return;let p=questProgress[qid];if(p.completed&&!p.claimed){coins+=q.reward;totalEarned+=q.reward;p.claimed=true;addVIPExp(5);addShopRep(3);Sounds.press.at(Vars.player);Vars.ui.showInfoToast("[green]+"+q.reward+" Coins!",2);saveCoins()}}

function startWorkActivity(activityIndex){let activity=WORK_ACTIVITIES[activityIndex];if(!activity||dailyWorkDone){Sounds.back.at(Vars.player);Vars.ui.showInfoToast("[yellow]Come back tomorrow!",2);return}workProgress=0;currentWorkActivity=activity;Sounds.press.at(Vars.player);Vars.ui.showInfoToast("[cyan]Working on: "+activity.name,3);if(activeWorkListener){Events.remove(activeWorkListener)}if(activity.type=="kills"){activeWorkListener=Events.on(UnitDestroyEvent,e=>{if(e.unit.team!=Vars.player.team()&&currentWorkActivity&&currentWorkActivity.name==activity.name){workProgress++;if(workProgress>=activity.progress)completeWork(activity)}})}else if(activity.type=="waves"){activeWorkListener=Events.on(WaveEvent,()=>{if(currentWorkActivity&&currentWorkActivity.name==activity.name){workProgress++;if(workProgress>=activity.progress)completeWork(activity)}})}else if(activity.type=="builds"){activeWorkListener=Events.on(BlockBuildEndEvent,e=>{if(e.team==Vars.player.team()&&currentWorkActivity&&currentWorkActivity.name==activity.name){workProgress++;if(workProgress>=activity.progress)completeWork(activity)}})}}

function completeWork(activity){coins+=activity.reward;totalEarned+=activity.reward;dailyWorkDone=true;workProgress=0;currentWorkActivity=null;if(activeWorkListener){Events.remove(activeWorkListener);activeWorkListener=null}Sounds.press.at(Vars.player);Vars.ui.showInfoToast("[green]"+activity.name+" complete! +"+activity.reward+" Coins",3);saveCoins()}

function isFavorite(itemName){return favoriteItems.indexOf(itemName)!==-1}

function toggleFavorite(itemName){let idx=favoriteItems.indexOf(itemName);if(idx===-1){favoriteItems.push(itemName);Sounds.press.at(Vars.player)}else{favoriteItems.splice(idx,1);Sounds.press.at(Vars.player)}saveCoins()}

function getBulkDiscount(quantity){for(let i=0;i<BULK_DISCOUNTS.length;i++){let tier=BULK_DISCOUNTS[i];if(quantity>=tier.min&&quantity<=tier.max){return tier}}return null}

function calculateResourcePurchase(item,quantity){let baseRate=item.baseRate||10;let baseAmount=quantity;let baseCost=Math.ceil(quantity/baseRate)*item.cost;let discount=getBulkDiscount(quantity);let bonusAmount=0;let bonusLabel="";if(discount){bonusAmount=Math.floor(baseAmount*discount.bonus);bonusLabel=discount.label}let totalAmount=baseAmount+bonusAmount;return{cost:baseCost,baseAmount:baseAmount,bonusAmount:bonusAmount,totalAmount:totalAmount,bonusLabel:bonusLabel}}

function getSelectedQuantity(itemName){if(!selectedQuantities[itemName]){selectedQuantities[itemName]=10}return selectedQuantities[itemName]}

function setSelectedQuantity(itemName,quantity){if(quantity<10)quantity=10;selectedQuantities[itemName]=quantity}

function isOnCooldown(itemName){if(!COOLDOWN_TIMES[itemName]||!itemCooldowns[itemName])return false;return(Date.now()-itemCooldowns[itemName])/1000<COOLDOWN_TIMES[itemName]}

function getCooldownRemaining(itemName){if(!isOnCooldown(itemName))return 0;return Math.ceil(COOLDOWN_TIMES[itemName]-(Date.now()-itemCooldowns[itemName])/1000)}

function generateSale(){saleItems=[];saleEndTime=SALE_DURATION;let all=[];Object.keys(shopCategories).forEach(c=>{shopCategories[c].forEach(i=>{if(i&&isItemUnlocked(i))all.push(i)})});if(all.length==0)return;for(let i=0;i<MAX_SALE_ITEMS&&i<all.length;i++){let item=all[Math.floor(Math.random()*all.length)];saleItems.push({item:item,discount:Mathf.random(20,50)})}}

function startSaleTimer(){Timer.schedule(()=>{if(saleEndTime>0){saleEndTime--;if(saleEndTime<=0){generateSale();Vars.ui.showInfoToast("[yellow]NEW SALE!",2)}}},0,1)}

function startPetSystem(){Timer.schedule(()=>{if(ownedPets.length>0){petCoins++;if(petCoins>=60){let totalEarn=0;ownedPets.forEach(petName=>{let pet=PETS.find(p=>p.name==petName);if(pet)totalEarn+=pet.earnRate});coins+=totalEarn;totalEarned+=totalEarn;petCoins=0;Vars.ui.showInfoToast("[lime]Pets: +"+totalEarn+" Coins",2);saveCoins()}}},0,1)}

function setupCoinEarning(){Events.on(UnitDestroyEvent,e=>{if(e.unit.team!=Vars.player.team()){let earn=COIN_RATES.enemyKill*getVIPMultiplier();coins+=earn;totalEarned+=earn;updateQuestProgress("kills",1);updateQuestProgress("earn",earn);updateAchievement("kills",1);updateAchievement("earn",earn);addVIPExp(1);addShopRep(1);saveCoins()}});Events.on(WaveEvent,()=>{totalWavesCompleted++;let earn=COIN_RATES.waveComplete*getVIPMultiplier();coins+=earn;totalEarned+=earn;updateQuestProgress("waves",1);updateQuestProgress("earn",earn);updateAchievement("waves",1);updateAchievement("earn",earn);addVIPExp(5);addShopRep(2);saveCoins();Vars.ui.showInfoToast("Coins +"+earn+" | Wave "+totalWavesCompleted,2)})}function createShopUI(){
let c=new Table();
c.background(Styles.black6);
c.touchable=Touchable.disabled;
coinLabel=c.add("Coins: [green]"+coins).pad(8).get();
c.update(()=>{
c.setPosition(100,Core.graphics.getHeight()-60);
coinLabel.setText("Coins: [green]"+coins);
c.visible=Vars.ui.hudfrag.shown;
});
Vars.ui.hudGroup.addChild(c);

let vipTable=new Table();
vipTable.background(Styles.black6);
vipTable.touchable=Touchable.disabled;
let vipLabel=vipTable.add("[gold]VIP "+vipLevel).pad(8).get();
vipTable.update(()=>{
vipTable.setPosition(100,Core.graphics.getHeight()-100);
vipLabel.setText("[gold]VIP "+vipLevel);
vipTable.visible=Vars.ui.hudfrag.shown;
});
Vars.ui.hudGroup.addChild(vipTable);

Vars.ui.settings.addCategory("Shop System",Icon.box,table=>{
table.button("Open Shop",()=>{Sounds.press.at(Vars.player);openShop()}).size(200,60);
table.row();
table.add("[lightgray]ShopSystemMod v1.1").pad(5);
});
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
tb.button("All",()=>{Sounds.press.at(Vars.player);currentCategory="all";refreshShop()}).checked(b=>currentCategory=="all");
tb.button("Resources",()=>{Sounds.press.at(Vars.player);currentCategory="resources";refreshShop()}).checked(b=>currentCategory=="resources");
tb.row();
tb.button("Units",()=>{Sounds.press.at(Vars.player);currentCategory="units";refreshShop()}).checked(b=>currentCategory=="units");
tb.button("Boosts",()=>{Sounds.press.at(Vars.player);currentCategory="boosts";refreshShop()}).checked(b=>currentCategory=="boosts");
tb.row();
tb.button("Special",()=>{Sounds.press.at(Vars.player);currentCategory="special";refreshShop()}).checked(b=>currentCategory=="special");
tb.button("Pets",()=>{Sounds.press.at(Vars.player);currentCategory="pets";refreshShop()}).checked(b=>currentCategory=="pets");
tb.row();
tb.button("Favorites",()=>{Sounds.press.at(Vars.player);currentCategory="favorites";refreshShop()}).checked(b=>currentCategory=="favorites");
d.cont.add(tb).growX().pad(5).row();

d.cont.image().color(Color.gray).height(2).growX().pad(5).row();

let ct=new Table();
currentContentTable=ct;
refreshShop();
let sc=new ScrollPane(ct);
sc.setScrollingDisabled(true,false);
d.cont.add(sc).grow().pad(10).row();

d.buttons.defaults().size(110,60).pad(4);
d.buttons.button("Rewards",()=>{Sounds.press.at(Vars.player);openRewards()});
d.buttons.button("Code",()=>{Sounds.press.at(Vars.player);showRedeemDialog()});
d.buttons.button("Close",()=>{Sounds.press.at(Vars.player);d.hide()});

d.hidden(()=>{currentShopDialog=null;currentContentTable=null});
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
case"special":showCategoryItems(shopCategories.special,"SPECIAL");break;
case"pets":showPets();break;
case"favorites":showFavorites();break;
}
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
let txt="[white]"+item.name+"\n[lightgray]"+item.description+"\n"+(owned?"[lime]OWNED":"[yellow]"+item.cost+" Coins");
let btn=t.button(txt,()=>{if(!owned){Sounds.press.at(Vars.player);buyPet(item.name)}}).left().minHeight(85).get();
btn.disabled=owned;
if(owned)btn.setColor(Color.valueOf("4CAF50"));
t.row();
}else{
addShopItem(t,item,0);
}
});
}

function showPets(){
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

let starBtn=itemTable.button(isFavorite(pet.name)?"[yellow]★":"[gray]☆",()=>{toggleFavorite(pet.name);refreshShop()}).size(40,40).pad(5).get();
let txt="[white]"+pet.name+"\n[lightgray]"+pet.description+"\n"+(owned?"[lime]OWNED":"[yellow]"+pet.cost+" Coins");
let btn=itemTable.button(txt,()=>{if(!owned){Sounds.press.at(Vars.player);buyPet(pet.name)}}).left().growX().minHeight(85).get();
btn.disabled=owned;
if(owned)btn.setColor(Color.valueOf("4CAF50"));

t.add(itemTable).growX().pad(5).row();
});
}

if(locked.length>0){
t.add("[red]LOCKED PETS").pad(10).row();
locked.forEach(pet=>{
let req="[red]🔒 Unlock: Wave "+pet.unlockWave+" & Shop Lvl "+pet.unlockShopLvl;
let txt="[gray]"+pet.name+"\n[lightgray]"+pet.description+"\n"+req;
let btn=t.button(txt,()=>{
Sounds.back.at(Vars.player);
Vars.ui.showInfoToast("[red]Locked! Need Wave "+pet.unlockWave,2);
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
Sounds.back.at(Vars.player);
Vars.ui.showInfoToast("[red]Locked! Need Wave "+item.unlockWave,2);
}).left().minHeight(85).get();
btn.disabled=true;
btn.setColor(Color.valueOf("333333"));
t.row();
}function addResourceShopItem(t,item,discount){
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
Sounds.press.at(Vars.player);
qty-=100;
if(qty<10)qty=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[-10]",()=>{
Sounds.press.at(Vars.player);
qty-=10;
if(qty<10)qty=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[RESET]",()=>{
Sounds.press.at(Vars.player);
qty=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

quantityLabel=selectorTable.add("[accent]"+qty).pad(3).minWidth(60).get();

selectorTable.button("[+10]",()=>{
Sounds.press.at(Vars.player);
qty+=10;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[+100]",()=>{
Sounds.press.at(Vars.player);
qty+=100;
setSelectedQuantity(item.name,qty);
updateLabels();
}).size(70,45).pad(2);

selectorTable.button("[MAX]",()=>{
Sounds.press.at(Vars.player);
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
Sounds.press.at(Vars.player);
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
Sounds.press.at(Vars.player);
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
Sounds.back.at(Vars.player);
Vars.ui.showInfoToast("[red]Need "+finalCost+" coins!",2);
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
Sounds.press.at(Vars.player);
Vars.ui.showInfoToast("[green]+"+calc.totalAmount+" "+item.item.name+bonusText,2);
}

saveCoins();
refreshShop();
}

function purchaseItem(item,price,discount){
if(coins<price){Sounds.back.at(Vars.player);Vars.ui.showInfoToast("[red]Need "+price+" coins!",2);return}
if(isOnCooldown(item.name)){Sounds.back.at(Vars.player);Vars.ui.showInfoToast("[red]On cooldown!",2);return}

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
saveCoins();
Sounds.press.at(Vars.player);
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
tb.button("Quests",()=>{Sounds.press.at(Vars.player);currentSettingsTab="quests";refreshRewardsTab()}).checked(b=>currentSettingsTab=="quests");
tb.button("Achievements",()=>{Sounds.press.at(Vars.player);currentSettingsTab="achievements";refreshRewardsTab()}).checked(b=>currentSettingsTab=="achievements");
tb.row();
tb.button("Work",()=>{Sounds.press.at(Vars.player);currentSettingsTab="work";refreshRewardsTab()}).checked(b=>currentSettingsTab=="work");
tb.button("Login",()=>{Sounds.press.at(Vars.player);currentSettingsTab="login";refreshRewardsTab()}).checked(b=>currentSettingsTab=="login");
d.cont.add(tb).growX().pad(5).row();

d.cont.image().color(Color.gold).height(3).growX().pad(5).row();

let ct=new Table();
currentContentTable=ct;
refreshRewardsTab();
let sc=new ScrollPane(ct);
sc.setScrollingDisabled(true,false);
d.cont.add(sc).grow().pad(10).row();

d.buttons.button("Close",()=>{Sounds.press.at(Vars.player);d.hide()}).size(150,60);

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
let btn=t.button(txt,()=>{if(done&&!claim){Sounds.press.at(Vars.player);claimQuestReward(q.id)}}).left().minHeight(85).get();
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
let btn=t.button(txt,()=>{if(done&&!claim){Sounds.press.at(Vars.player);claimAchievement(a.id)}}).left().minHeight(85).get();
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
Sounds.press.at(Vars.player);
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
t.button(txt,()=>{Sounds.press.at(Vars.player);startWorkActivity(i);refreshRewardsTab()}).left().minHeight(85);
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
t.button("[green]CLAIM DAY "+loginStreak+"\n[yellow]+"+reward+" Coins",()=>{Sounds.press.at(Vars.player);claimDailyLoginReward();refreshRewardsTab()}).size(400,80).get();
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

d.buttons.button("Cancel",()=>{Sounds.press.at(Vars.player);d.hide()}).size(140,60);
d.buttons.button("[green]Redeem",()=>{
let code=codeField.getText().trim();
if(code.length>0){Sounds.press.at(Vars.player);redeemCode(code);d.hide();if(currentShopDialog)refreshShop()}
}).size(140,60);

d.show();
}

function saveCoins(){
try{
Vars.dataDirectory.child("shop-coins.json").writeString(JSON.stringify({
coins:coins,
totalSpent:totalSpent,
totalEarned:totalEarned,
history:purchaseHistory,
quests:dailyQuests,
questProgress:questProgress,
lastQuestReset:lastQuestReset,
refundable:refundableItems,
loginStreak:loginStreak,
lastLogin:lastLogin,
loginRewardClaimed:loginRewardClaimed,
achievements:achievementProgress,
cooldowns:itemCooldowns,
favorites:favoriteItems,
vipLevel:vipLevel,
vipExp:vipExp,
itemLevels:itemLevels,
comboStreak:comboStreak,
lastPurchaseTime:lastPurchaseTime,
priceHistory:priceHistory,
notifications:notifications,
coupons:coupons,
shopReputation:shopReputation,
shopLevel:shopLevel,
dynamicPrices:dynamicPrices,
insuranceActive:insuranceActive,
ownedPets:ownedPets,
petCoins:petCoins,
petLastCollect:petLastCollect,
redeemedCodes:redeemedCodes,
workProgress:workProgress,
dailyWorkDone:dailyWorkDone,
lastWorkReset:lastWorkReset,
currentWorkActivity:currentWorkActivity,
totalWavesCompleted:totalWavesCompleted,
unlockedItems:unlockedItems,
activeCoupon:activeCoupon,
selectedQuantities:selectedQuantities
}));
}catch(e){
print("Save error: "+e);
}
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
refundableItems=d.refundable||[];
loginStreak=d.loginStreak||0;
lastLogin=d.lastLogin||0;
loginRewardClaimed=d.loginRewardClaimed||false;
achievementProgress=d.achievements||{};
itemCooldowns=d.cooldowns||{};
favoriteItems=d.favorites||[];
vipLevel=d.vipLevel||0;
vipExp=d.vipExp||0;
itemLevels=d.itemLevels||{};
comboStreak=d.comboStreak||0;
lastPurchaseTime=d.lastPurchaseTime||0;
priceHistory=d.priceHistory||{};
notifications=d.notifications||[];
coupons=d.coupons||[];
shopReputation=d.shopReputation||0;
shopLevel=d.shopLevel||1;
dynamicPrices=d.dynamicPrices||{};
insuranceActive=d.insuranceActive||false;
ownedPets=d.ownedPets||[];
petCoins=d.petCoins||0;
petLastCollect=d.petLastCollect||0;
redeemedCodes=d.redeemedCodes||[];
workProgress=d.workProgress||0;
dailyWorkDone=d.dailyWorkDone||false;
lastWorkReset=d.lastWorkReset||0;
currentWorkActivity=d.currentWorkActivity||null;
totalWavesCompleted=d.totalWavesCompleted||0;
unlockedItems=d.unlockedItems||[];
activeCoupon=d.activeCoupon||null;
selectedQuantities=d.selectedQuantities||{};
}
}catch(e){
print("Load error: "+e);
}
}

print("========================================");
print("ShopSystemMod v1.1 - Loaded");
print("========================================");
print("Features:");
print("- Soft pop sound effects");
print("- Favorite system with star toggle");
print("- Improved quantity controls");
print("- Resource cooldowns (60s)");
print("- 5x higher prices");
print("- Bulk discounts: 100+ (10%), 500+ (20%), 1000+ (30%)");
print("========================================");
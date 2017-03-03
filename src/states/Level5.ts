module Namespace.State {
    export class Level5 extends Phaser.State {
        level:number;
        levelKills:number;
        levelKillsRequired:number;

        player:any;

        background:Phaser.Group;
        upgradePanel:Phaser.Image;
        monsters:Phaser.Group;
        coins:Phaser.Group;
        levelUI:Phaser.Group;
        dmgTextPool:Phaser.Group;
        monsterInfoUI:Phaser.Group;

        currentMonster:Phaser.Sprite;

        playerGoldText:Phaser.Text;

        dpsTimer:Phaser.TimerEvent;

        monsterNameText:Phaser.Text;
        levelKillsText:Phaser.Text;
        monsterHealthText:Phaser.Text;
        levelText:Phaser.Text;

        init(){
            // the main player
            this.player = {
                clickDmg: 1,
                gold: 50,
                dps: 0
            };

            // world progression
            this.level = 1;
            // how many monsters have we killed during this level
            this.levelKills = 0;
            // how many monsters are required to advance a level
            this.levelKillsRequired = 10;
        }

        preload() {
            this.game.load.image('forest-back', 'assets/images/level5/parallax_forest_pack/layers/parallax-forest-back-trees.png');
            this.game.load.image('forest-lights', 'assets/images/level5/parallax_forest_pack/layers/parallax-forest-lights.png');
            this.game.load.image('forest-middle', 'assets/images/level5/parallax_forest_pack/layers/parallax-forest-middle-trees.png');
            this.game.load.image('forest-front', 'assets/images/level5/parallax_forest_pack/layers/parallax-forest-front-trees.png');

            this.game.load.image('aerocephal', 'assets/images/level5/allacrost_enemy_sprites/aerocephal.png');
            this.game.load.image('arcana_drake', 'assets/images/level5/allacrost_enemy_sprites/arcana_drake.png');
            this.game.load.image('aurum-drakueli', 'assets/images/level5/allacrost_enemy_sprites/aurum-drakueli.png');
            this.game.load.image('bat', 'assets/images/level5/allacrost_enemy_sprites/bat.png');
            this.game.load.image('daemarbora', 'assets/images/level5/allacrost_enemy_sprites/daemarbora.png');
            this.game.load.image('deceleon', 'assets/images/level5/allacrost_enemy_sprites/deceleon.png');
            this.game.load.image('demonic_essence', 'assets/images/level5/allacrost_enemy_sprites/demonic_essence.png');
            this.game.load.image('dune_crawler', 'assets/images/level5/allacrost_enemy_sprites/dune_crawler.png');
            this.game.load.image('green_slime', 'assets/images/level5/allacrost_enemy_sprites/green_slime.png');
            this.game.load.image('nagaruda', 'assets/images/level5/allacrost_enemy_sprites/nagaruda.png');
            this.game.load.image('rat', 'assets/images/level5/allacrost_enemy_sprites/rat.png');
            this.game.load.image('scorpion', 'assets/images/level5/allacrost_enemy_sprites/scorpion.png');
            this.game.load.image('skeleton', 'assets/images/level5/allacrost_enemy_sprites/skeleton.png');
            this.game.load.image('snake', 'assets/images/level5/allacrost_enemy_sprites/snake.png');
            this.game.load.image('spider', 'assets/images/level5/allacrost_enemy_sprites/spider.png');
            this.game.load.image('stygian_lizard', 'assets/images/level5/allacrost_enemy_sprites/stygian_lizard.png');

            this.game.load.image('gold_coin', 'assets/images/level5/496_RPG_icons/I_GoldCoin.png');

            this.game.load.image('dagger', 'assets/images/level5/496_RPG_icons/W_Dagger002.png');
            this.game.load.image('swordIcon1', 'assets/images/level5/496_RPG_icons/S_Sword15.png');

            // build panel for upgrades
            var bmd = this.game.add.bitmapData(250, 500);
            bmd.ctx.fillStyle = '#9a783d';
            bmd.ctx.strokeStyle = '#35371c';
            bmd.ctx.lineWidth = 12;
            bmd.ctx.fillRect(0, 0, 250, 500);
            bmd.ctx.strokeRect(0, 0, 250, 500);
            this.game.cache.addBitmapData('upgradePanel', bmd);

            let buttonImage = this.game.add.bitmapData(476, 48);
            buttonImage.ctx.fillStyle = '#e6dec7';
            buttonImage.ctx.strokeStyle = '#35371c';
            buttonImage.ctx.lineWidth = 4;
            buttonImage.ctx.fillRect(0, 0, 225, 48);
            buttonImage.ctx.strokeRect(0, 0, 225, 48);
            this.game.cache.addBitmapData('button', buttonImage);
        }

        create() {
            var state = this;
            this.background = this.game.add.group();

            // setup each of our background layers to take the full screen
            ['forest-back', 'forest-lights', 'forest-middle', 'forest-front']
                .forEach(function(image) {
                    var bg = state.game.add.tileSprite(0, 0, state.game.world.width,
                        state.game.world.height, image, '', state.background);
                    bg.tileScale.set(4,4);
                });

            state.upgradePanel = state.game.add.image(10, 70, state.game.cache.getBitmapData('upgradePanel'));
            var upgradeButtons = <Phaser.Group>state.upgradePanel.addChild(state.game.add.group());
            upgradeButtons.position.set(8, 8);

            var upgradeButtonsData = [
                {icon: 'dagger', name: 'Attack', level: 0, cost: 5, purchaseHandler: function(button, player) {
                    player.clickDmg += 1;
                }},
                {icon: 'swordIcon1', name: 'Auto-Attack', level: 0, cost: 25, purchaseHandler: function(button, player) {
                    player.dps += 5;
                }}
            ];

            let button;
            //alert("setting button");
            upgradeButtonsData.forEach(function(buttonData, index) {
                button = state.game.add.image(0, (50 * index), state.game.cache.getBitmapData('button'));
                button.inputEnabled=true;
                button.icon = button.addChild(state.game.add.image(6, 6, buttonData.icon));
                button.text = button.addChild(state.game.add.text(42, 6, buttonData.name + ': ' + buttonData.level, {font: '16px Arial Black'}));
                button.details = buttonData;
                button.costText = button.addChild(state.game.add.text(42, 24, 'Cost: ' + buttonData.cost, {font: '16px Arial Black'}));
                button.events.onInputDown.add(state.onUpgradeButtonClick, state, 1, button);

                upgradeButtons.addChild(button);
            });

            var monsterData = [
                {name: 'Aerocephal',        image: 'aerocephal',        maxHealth: 10},
                {name: 'Arcana Drake',      image: 'arcana_drake',      maxHealth: 20},
                {name: 'Aurum Drakueli',    image: 'aurum-drakueli',    maxHealth: 30}, 
                {name: 'Bat',               image: 'bat',               maxHealth: 5},
                {name: 'Daemarbora',        image: 'daemarbora',        maxHealth: 10},
                {name: 'Deceleon',          image: 'deceleon',          maxHealth: 10},
                {name: 'Demonic Essence',   image: 'demonic_essence',   maxHealth: 15},
                {name: 'Dune Crawler',      image: 'dune_crawler',      maxHealth: 8},
                {name: 'Green Slime',       image: 'green_slime',       maxHealth: 3},
                {name: 'Nagaruda',          image: 'nagaruda',          maxHealth: 13},
                {name: 'Rat',               image: 'rat',               maxHealth: 2},
                {name: 'Scorpion',          image: 'scorpion',          maxHealth: 2},
                {name: 'Skeleton',          image: 'skeleton',          maxHealth: 6},
                {name: 'Snake',             image: 'snake',             maxHealth: 4},
                {name: 'Spider',            image: 'spider',            maxHealth: 4},
                {name: 'Stygian Lizard',    image: 'stygian_lizard',    maxHealth: 20}
            ];
            state.monsters = state.game.add.group();

            let monster;    // Phaser.Sprite
            monsterData.forEach(function(data) {
                // create a sprite for them off screen
                monster = state.monsters.create(1000, state.game.world.centerY, data.image);
                // use the built in health component
                monster.health = monster.maxHealth = data.maxHealth;
                // center anchor
                monster.anchor.setTo(0.5, 1);
                // reference to the database
                monster.details = data;

                //enable input so we can click it!
                monster.inputEnabled = true;
                monster.events.onInputDown.add(state.onClickMonster, state);

                // hook into health and lifecycle events
                monster.events.onKilled.add(state.onKilledMonster, state);
                monster.events.onRevived.add(state.onRevivedMonster, state);

                monster.exists = false;
            });

            // display the monster front and center
            this.currentMonster = this.monsters.getRandom();
            this.currentMonster.visible=true;
            this.currentMonster.position.set(this.game.world.centerX + 100, this.game.world.centerY + 50);

            this.monsterInfoUI = this.game.add.group();
            this.monsterInfoUI.position.setTo(this.currentMonster.x - 220, this.currentMonster.y + 120);
            this.monsterNameText = <Phaser.Text>this.monsterInfoUI.addChild(this.game.add.text(0, 0, this.currentMonster.name, {
                font: '48px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            }));
            this.monsterHealthText = <Phaser.Text>this.monsterInfoUI.addChild(this.game.add.text(0, 80, this.currentMonster.health + ' HP', {
                font: '32px Arial Black',
                fill: '#ff0000',
                strokeThickness: 4
            }));

            this.dmgTextPool = this.add.group();
            var dmgText;
            for (var d=0; d<50; d++) {
                dmgText = this.add.text(0, 0, '1', {
                    font: '64px Arial Black',
                    fill: '#fff',
                    strokeThickness: 4
                });
                // start out not existing, so we don't draw it yet
                dmgText.exists = false;
                dmgText.tween = this.game.add.tween(dmgText)
                    .to({
                        alpha: 0,
                        y: 100,
                        x: this.game.rnd.integerInRange(100, 700)
                    }, 1000, Phaser.Easing.Cubic.Out);

                dmgText.tween.onComplete.add(function(text, tween) {
                    text.kill();
                });
                this.dmgTextPool.add(dmgText);
            }

            // create a pool of gold coins
            this.coins = this.add.group();
            this.coins.createMultiple(50, 'gold_coin', '', false);
            this.coins.setAll('inputEnabled', true);
            this.coins.setAll('goldValue', 1);
            this.coins.callAll('events.onInputDown.add', 'events.onInputDown', this.onClickCoin, this);

            this.playerGoldText = this.add.text(30, 30, 'Gold: ' + this.player.gold, {
                font: '24px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            });

            // 100ms 10x a second
            this.dpsTimer = this.game.time.events.loop(100, this.onDPS, this);

            // setup the world progression display
            this.levelUI = this.game.add.group();
            this.levelUI.position.setTo(this.game.world.centerX, 30);
            this.levelText = <Phaser.Text>this.levelUI.addChild(this.game.add.text(0, 0, 'Level: ' + this.level, {
                font: '24px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            }));
            this.levelKillsText = <Phaser.Text>this.levelUI.addChild(this.game.add.text(0, 30, 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired, {
                font: '24px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            }));
        }

        onDPS() {
            if (this.player.dps > 0) {
                if (this.currentMonster && this.currentMonster.alive) {
                    var dmg = this.player.dps / 10;
                    this.currentMonster.damage(dmg);
                    // update the health text
                    this.monsterHealthText.text = this.currentMonster.alive ? Math.round(this.currentMonster.health) + ' HP' : 'DEAD';
                }
            }
        }

        onUpgradeButtonClick(button) {
            //alert("here...");
            // make this a function so that it updates after we buy
            function getAdjustedCost() {
                return Math.ceil(button.details.cost + (button.details.level * 1.46));
            }

            if (this.player.gold - getAdjustedCost() >= 0) {
                this.player.gold -= getAdjustedCost();
                this.playerGoldText.text = 'Gold: ' + this.player.gold;
                button.details.level++;
                button.text.text = button.details.name + ': ' + button.details.level;
                button.costText.text = 'Cost: ' + getAdjustedCost();
                button.details.purchaseHandler.call(this, button, this.player);
            }
        }

        onClickCoin(coin) {
            if (!coin.alive) {
                return;
            }
            // give the player gold
            this.player.gold += coin.goldValue;
            // update UI
            this.playerGoldText.text = 'Gold: ' + this.player.gold;
            // remove the coin
            coin.kill();
        }

        onKilledMonster(monster) {
            // move the monster off screen again
            monster.position.set(1000, this.game.world.centerY);

            var coin;
            // spawn a coin on the ground
            coin = this.coins.getFirstExists(false);
            coin.reset(this.game.world.centerX + this.game.rnd.integerInRange(-100, 100), this.game.world.centerY);
            coin.goldValue = Math.round(this.level * 1.33);
            this.game.time.events.add(Phaser.Timer.SECOND * 3, this.onClickCoin, this, coin);

            this.levelKills++;

            if (this.levelKills >= this.levelKillsRequired) {
                this.level++;
                this.levelKills = 0;
            }

            this.levelText.text = 'Level: ' + this.level;
            this.levelKillsText.text = 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired;

            // pick a new monster
            this.currentMonster = this.monsters.getRandom();
            // upgrade the monster based on level
            this.currentMonster.maxHealth = Math.ceil(this.currentMonster.maxHealth + ((this.level - 1) * 10.6));
            // make sure they are fully healed
            this.currentMonster.revive(this.currentMonster.maxHealth);
            this.currentMonster.exists=true;
        }

        onRevivedMonster(monster) {
            monster.position.set(this.game.world.centerX + 100, this.game.world.centerY + 50);
            // update the text display
            this.monsterNameText.text = monster.details.name;
            this.monsterHealthText.text = monster.health + 'HP';
        }

        onClickMonster(monster, pointer) {
            // apply click damage to monster
            this.currentMonster.damage(this.player.clickDmg);

            // grab a damage text from the pool to display what happened
            var dmgText = this.dmgTextPool.getFirstExists(false);
            if (dmgText) {
                dmgText.text = this.player.clickDmg;
                dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
                dmgText.alpha = 1;
                dmgText.tween.start();
            }

            // update the health text
            this.monsterHealthText.text = this.currentMonster.alive ? this.currentMonster.health + ' HP' : 'DEAD';
        }

    }
}

import * as constants from './constants.js'

export class SceneMenu extends Phaser.Scene {
    constructor() {
        super({
            key: 'SceneMenu',
        })
    }

    preload() {
        this.load.image('star', 'assets/star_gold.png')
        this.load.image('background', 'assets/blue_background.png')

        this.load.image('ship_1_blue', 'assets/playerShip1_blue.png')
        this.load.image('ship_2_blue', 'assets/playerShip2_blue.png')
        this.load.image('ship_3_blue', 'assets/playerShip3_blue.png')
        this.load.image('ship_1_red', 'assets/playerShip1_red.png')
        this.load.image('ship_2_red', 'assets/playerShip2_red.png')
        this.load.image('ship_3_red', 'assets/playerShip3_red.png')
        this.load.image('button', 'assets/buttonBlue.png')

        this.load.plugin(
            'rexinputtextplugin',
            'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js',
            true
        )
    }

    create() {
        var self = this

        this.shipModel = 1
        this.team = 1

        this.add.tileSprite(constants.WORLD_WIDTH/2, constants.WORLD_HEIGHT/2, constants.WORLD_WIDTH, constants.WORLD_HEIGHT, 'background')

        let playButton = this.add.image(constants.WORLD_WIDTH/2, 600, 'button')
        playButton.setInteractive()
        playButton.on('pointerdown', function () {
            self.scene.stop()
            self.scene.run('SceneSpace', {
                username: inputText.text,
                team: self.team,
                shipModel: self.shipModel,
            })
        })
        this.add
            .text(constants.WORLD_WIDTH/2, 600, 'Play', {
                fontSize: '14px',
                fill: '#000',
            })
            .setOrigin(0.5, 0.5)

        var inputText = this.add
            .rexInputText(constants.WORLD_WIDTH/2, 200, 100, 30, {
                type: 'textarea',
                text: '',
                placeholder: 'Your name?',
                fontSize: '12px',
                align: 'center',
            })
            .setOrigin(0.5)

        inputText.setFocus()

        this.add
            .text(constants.WORLD_WIDTH/2, 100, 'Fill your name and choose team (Red / Blue) and battleship')
            .setOrigin(0.5, 0.5)

        let ship_1_blue = this.add.image(-75, -30, 'ship_1_blue').setScale(0.5)
        let ship_2_blue = this.add.image(0, -30, 'ship_2_blue').setScale(0.5)
        let ship_3_blue = this.add.image(75, -30, 'ship_3_blue').setScale(0.5)
        let ship_1_red = this.add.image(-75, 30, 'ship_1_red').setScale(0.5)
        let ship_2_red = this.add.image(0, 30, 'ship_2_red').setScale(0.5)
        let ship_3_red = this.add.image(75, 30, 'ship_3_red').setScale(0.5)

        let container = this.add.container(constants.WORLD_WIDTH/2, 400, [
            ship_1_blue,
            ship_2_blue,
            ship_3_blue,
            ship_1_red,
            ship_2_red,
            ship_3_red,
        ])

        this.input
            .setHitArea(container.getAll())
            .on('gameobjectdown', function (pointer, gameObject) {
                const key_split = gameObject.texture.key.split('_')
                const this_model = key_split[1]
                const this_team = key_split[2]
                
                self.shipModel = this_model 
                self.team = this_team

                for(let ship of container.getAll()) {
                    ship.clearTint()
                }
                
                gameObject.setTint(0xfcfa65)

            })

        this.tweens.add({
            targets: playButton,
            scaleX: 1.1,
            scaleY: 1.1,
            repeat: -1,
            duration: 1000,
            yoyo: true,
            // ease: 'Power3',
            
        })
    }

    update() {}
}

import * as constants from './constants.js'

export class SceneSpace extends Phaser.Scene {
    constructor() {
        super({
            key: 'SceneSpace',
        })
    }

    init(data) {
        this.player = {}
        this.player.ship = null
        this.player.username = data.username
        this.player.team = data.team
        this.player.shipModel = data.shipModel
    }

    preload() {}

    create() {
        var self = this

        this.socket = io('', {
            query:
                'name=' +
                this.player.username +
                '&team=' +
                this.player.team +
                '&shipModel=' +
                this.player.shipModel,
        })
        this.otherPlayers = []

        this.add.tileSprite(constants.WORLD_WIDTH/2, constants.WORLD_HEIGHT/2, constants.WORLD_WIDTH, constants.WORLD_HEIGHT, 'background')

        this.blueScoreText = this.add.text(constants.WORLD_WIDTH/4, 16, '', {
            fontSize: '32px',
            fill: '#0000FF',
        })
        this.redScoreText = this.add.text(constants.WORLD_WIDTH*(3/4), 16, '', {
            fontSize: '32px',
            fill: '#FF0000',
        })

        this.cursors = this.input.keyboard.createCursorKeys()

        this.socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                if (id === self.socket.id) {
                    self.addPlayer(self, players[id])
                } else {
                    self.addOtherPlayers(self, players[id])
                }
            })
        })

        this.socket.on('newPlayer', function (playerInfo) {
            self.addOtherPlayers(self, playerInfo)
        })

        this.socket.on('disconnect', function (playerId) {
            for (let i = 0; i < self.otherPlayers.length; i++ )
            {
                if (playerId === self.otherPlayers[i].playerId) {
                    self.otherPlayers[i].ship.destroy()
                    self.otherPlayers[i].nameText.destroy()
                    self.otherPlayers.slice(i,1)
                }
            }
        })

        this.socket.on('playerMoved', function (playerInfo) {
            
            for(let otherPlayer of self.otherPlayers) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.ship.setRotation(playerInfo.rotation)
                    otherPlayer.ship.setPosition(playerInfo.x, playerInfo.y)
                    otherPlayer.nameText.setPosition(
                        otherPlayer.ship.x,
                        otherPlayer.ship.y - 40
                    )
                }
            }
        })

        this.socket.on('scoreUpdate', function (scores) {
            self.blueScoreText.setText('Blue: ' + scores.blue)
            self.redScoreText.setText('Red: ' + scores.red)
        })

        this.socket.on('starLocation', function (starLocation) {
            if (self.star) self.star.destroy()

            self.star = self.physics.add.image(
                starLocation.x,
                starLocation.y,
                'star'
            )

            self.physics.add.overlap(
                self.player.ship,
                self.star,
                function () {
                    if (self.star) self.star.destroy()
                    this.socket.emit('starCollected')
                },
                null,
                self
            )
        })
    }

    update() {
        var self = this
        if (self.player.ship) {
            if (this.cursors.left.isDown) {
                self.player.ship.setAngularVelocity(-150)
            } else if (this.cursors.right.isDown) {
                self.player.ship.setAngularVelocity(150)
            } else {
                self.player.ship.setAngularVelocity(0)
            }

            if (this.cursors.up.isDown) {
                this.physics.velocityFromRotation(
                    this.player.ship.rotation + 1.5,
                    100,
                    this.player.ship.body.acceleration
                )
            } else {
                this.player.ship.setAcceleration(0)
            }
            self.player.nameText.setPosition(self.player.ship.x, self.player.ship.y - 40)

            this.physics.world.wrap(this.player.ship, 10)

            // emit player movement
            var x = this.player.ship.x
            var y = this.player.ship.y
            var r = this.player.ship.rotation
            if (
                this.player.oldPosition &&
                (x !== this.player.oldPosition.x ||
                    y !== this.player.oldPosition.y ||
                    r !== this.player.oldPosition.rotation)
            ) {
                this.socket.emit('playerMovement', {
                    x: this.player.ship.x,
                    y: this.player.ship.y,
                    rotation: this.player.ship.rotation,
                })
            }

            // save old position data
            this.player.oldPosition = {
                x: this.player.ship.x,
                y: this.player.ship.y,
                rotation: this.player.ship.rotation,
            }
        }
    }

    addPlayer(self, playerInfo) {
        self.player.ship = self.physics.add
            .image(
                playerInfo.x,
                playerInfo.y,
                'ship_' + playerInfo.shipModel + '_' + playerInfo.team
            )
            .setOrigin(0.5, 0.5)
            .setDisplaySize(53, 40)
            .setFlipY(true)
            .setRotation(playerInfo.rotation)
            .setDrag(100)
            .setAngularDrag(100)
            .setMaxVelocity(200)
        self.player.nameText = self.add
            .text(playerInfo.x, playerInfo.y - 30, playerInfo.name)
            .setOrigin(0.5, 0.5)
    }

    addOtherPlayers(self, playerInfo) {
        let otherPlayer = {}
        otherPlayer.ship = self.add
            .sprite(
                playerInfo.x,
                playerInfo.y,
                'ship_' + playerInfo.shipModel + '_' + playerInfo.team
            )
            .setOrigin(0.5, 0.5)
            .setDisplaySize(53, 40)
            .setFlipY(true)
            .setRotation(playerInfo.rotation)
        otherPlayer.playerId = playerInfo.playerId
        otherPlayer.nameText = self.add
            .text(playerInfo.x, playerInfo.y - 30, playerInfo.name)
            .setOrigin(0.5, 0.5)
        self.otherPlayers.push(otherPlayer)
    }
}

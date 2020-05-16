import { SceneSpace } from './SceneSpace.js'
import { SceneMenu } from './SceneMenu.js'
import * as constants from './constants.js'


var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: constants.WORLD_WIDTH,
    height: constants.WORLD_HEIGHT,
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 },
        },
    },
    scene: [SceneMenu, SceneSpace],
}

var game = new Phaser.Game(config)


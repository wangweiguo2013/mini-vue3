import { createRenderer } from '../../lib/mini-vue.esm.js'
import { App } from './App.js'

const game = new PIXI.Application({
    width: 500,
    height: 500
})

document.body.append(game.view)

const renderer = createRenderer({
    createElement(type) {
        if (type === 'rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff0000)
            rect.drawRect(100, 100, 100, 100)
            rect.endFill()
            return rect
        }
    },
    insert(el, parent) {
        parent.addChild(el)
    },
    patchProp(el, key, value) {
        el[key] = value
    }
})
renderer.createApp(App).mount(game.stage)

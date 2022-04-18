import { h } from '../../lib/mini-vue.esm.js'

export const App = {
    setup() {
        return {
            msg: 'hello mini-vue'
        }
    },
    render() {
        return h('div', 'hi' + this.msg)
    }
}

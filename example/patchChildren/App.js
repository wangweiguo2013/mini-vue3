import { createTextVNode, h, provide, inject } from '../../lib/mini-vue.esm.js'
import { ArrayToText } from './ArrayToText.js'
import { TextToArray } from './TextToArray.js'

export const App = {
    name: 'app',
    setup() {
        provide('foo', 'foo1')
        provide('bar', 'bar')
        return {}
    },
    render() {
        return h('div', {}, [
            // array to text
            // h(ArrayToText),
            // text to array
            h(TextToArray)
        ])
    }
}

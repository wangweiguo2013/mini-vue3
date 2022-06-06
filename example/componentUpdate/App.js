import { h, ref } from '../../lib/mini-vue.esm.js'
import { Child } from './Child.js'

export const App = {
    setup() {
        const msg = ref('msg')
        const count = ref(0)
        window.msg = msg
        const changeMsg = () => {
            console.log('changeMsg')
            msg.value = 'msg changed'
        }
        const changeCount = () => {
            console.log('changeCount')
            count.value += 1
        }
        return {
            msg,
            count,
            changeMsg,
            changeCount
        }
    },
    render() {
        window.vm = this
        return h('div', { class: ['root', 'con'], id: 'root' }, [
            h(
                'button',
                {
                    style: 'color: red',
                    onClick: this.changeMsg
                },
                'change msg'
            ),
            h(Child, {
                msg: this.msg
            }),
            h(
                'button',
                {
                    onClick: this.changeCount
                },
                ' change count'
            ),
            h('p', {}, ' count is' + this.count)
        ])
    }
}

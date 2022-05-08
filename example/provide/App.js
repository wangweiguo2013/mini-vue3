import { createTextVNode, h, provide, inject } from '../../lib/mini-vue.esm.js'

const Provider = {
    name: 'Provider',
    setup() {
        const foo = inject('foo')
        const bar = inject('bar')

        return {
            foo,
            bar
        }
    },
    render() {
        return h('div', {}, [h(`div`, {}, 'Provider'), h(ProviderTwo)])
    }
}

const ProviderTwo = {
    name: 'Provider',
    setup() {
        provide('foo', 'fooTwo')
        const foo = inject('foo')
        const bar = inject('bar')

        return {
            foo,
            bar
        }
    },
    render() {
        return h('div', {}, [h(`div`, {}, `ProviderTwo foo is ${this.foo}`), h(Consumer)])
    }
}

const Consumer = {
    name: 'Consumer',
    setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        const baz = inject('baz', 'baz')
        const baz2 = inject('baz', () => 'baz from fn')

        return {
            foo,
            bar,
            baz,
            baz2
        }
    },
    render() {
        return h(
            'div',
            {},
            `consumer: foo: ${this.foo}, bar: ${this.bar}, baz: ${this.baz}, baz2: ${this.baz2}`
        )
    }
}
export const App = {
    name: 'app',
    setup() {
        provide('foo', 'foo1')
        provide('bar', 'bar')
        return {}
    },
    render() {
        return h('div', {}, [h(Provider)])
    }
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
}

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance

        const hasOwn = (target, key) => {
            return Object.prototype.hasOwnProperty.call(target, key)
        }
        if (hasOwn(setupState, key)) return setupState[key]
        if (hasOwn(props, key)) return props[key]

        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    }
}

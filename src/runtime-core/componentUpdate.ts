export const shouldUpdateComponent = (preVNode, nextVNode) => {
    const { props: preProps } = preVNode
    const { props: nextProps } = nextVNode

    // 不能使用for of
    for (const key in nextProps) {
        if (nextProps[key] !== preProps[key]) {
            return true
        }
    }
    return false
}

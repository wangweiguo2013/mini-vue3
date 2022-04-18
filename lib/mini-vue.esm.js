const createVnode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
};

const createApp = (rootComponent) => {
    return {
        mount(rootContainer) {
        }
    };
};

const h = (type, props, children) => {
    return createVnode(type, props, children);
};

export { createApp, h };

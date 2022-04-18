'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object';
};

const createComponentInstance = (vnode) => {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
};
const setupComponent = (instance) => {
    //
    //initProps()
    //initSlots()
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
// setup可以返回一个state对象，也可以是一个render函数
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

const render = (vnode, container) => {
    patch(vnode, container);
};
const patch = (vnode, container) => {
    console.log(vnode.type);
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
};
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}
function processElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { props, children } = vnode;
    for (const key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        children.forEach((v) => {
            patch(v, el);
        });
    }
    container.append(el);
}

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
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
};

const h = (type, props, children) => {
    return createVnode(type, props, children);
};

exports.createApp = createApp;
exports.h = h;

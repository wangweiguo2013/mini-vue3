'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const createComponentInstance = (vnode) => {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        setupState: {}
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

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

const render = (vnode, container) => {
    patch(vnode, container);
};
const patch = (vnode, container) => {
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
};
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    //  ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    // 组件render返回的vnode
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}
function processElement(initialVNode, container) {
    mountElement(initialVNode, container);
}
function mountElement(initialVNode, container) {
    // 这里的vnode其实是element的vnode， 而不是组件的vnode
    // 因此不能在这里给el赋值
    const el = (initialVNode.el = document.createElement(initialVNode.type));
    const { props, children, shapeFlag } = initialVNode;
    const isEvent = (key) => /^on[A-Z]/.test(key);
    for (const key in props) {
        const value = props[key];
        if (isEvent(key)) {
            const eventName = key.slice(2).toLocaleLowerCase();
            el.addEventListener(eventName, value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    if (shapeFlag & 8 /* TEXT_CHILD */) {
        el.textContent = children;
    }
    else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(initialVNode, el);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}

const createVnode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 8 /* TEXT_CHILD */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    }
    return vnode;
};
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}

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

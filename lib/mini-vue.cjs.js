'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object';
};
const capitalize = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};
const camelize = (str) => {
    return str.replace(/-\w?/g, (_, c) => {
        return _.slice(1).toUpperCase();
    });
};

const emit = (instance, eventName, ...args) => {
    const { props } = instance;
    const eventKey = 'on' + capitalize(eventName);
    const handler = props[camelize(eventKey)];
    handler && handler(...args);
};

const createComponentInstance = (vnode) => {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        emit: () => { },
        slots: {},
        setupState: {}
    };
    component.emit = emit.bind(null, component);
    return component;
};
const setupComponent = (instance) => {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup(instance.props, { emit: instance.emit });
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
function initProps(instance, props) {
    instance.props = props;
}
function initSlots(instance, children) {
    instance.slots = Array.isArray(children) ? children : [children];
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        const hasOwn = (target, key) => {
            return Object.prototype.hasOwnProperty.call(target, key);
        };
        if (hasOwn(setupState, key))
            return setupState[key];
        if (hasOwn(props, key))
            return props[key];
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

let activeEffect;
const targetMap = new Map();
const trigger = function (target, key) {
    // 取出该key的依赖
    const depMap = targetMap.get(target);
    const dep = depMap.get(key);
    // 执行依赖
    triggerEffect(dep);
};
const triggerEffect = function (dep) {
    // 优化
    if (!dep.has(activeEffect))
        return;
    dep.forEach((_effect) => {
        if (_effect.scheduler) {
            _effect.scheduler();
        }
        else {
            _effect.run();
        }
    });
};

const createGetter = function (isReadOnly = false, isShallow = false) {
    return function (target, key) {
        const res = Reflect.get(target, key);
        if (isObject(res) && !isShallow) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        if (key === "__v_is_reactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_is_readonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        return res;
    };
};
const createSetter = function () {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn(`read only object cannot be set, accessing key is ${String(key)}, value is ${value}`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const reactive = function (raw) {
    return new Proxy(raw, mutableHandlers);
};
const readonly = function (raw) {
    return createActiveObject(raw, readonlyHandlers);
};
const shallowReadonly = function (raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
};
const createActiveObject = function (raw, handler) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not object`);
        return;
    }
    return new Proxy(raw, handler);
};

const createVnode = (type, props, children) => {
    const vnode = {
        type,
        props: shallowReadonly(props),
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

const renderSlots = (slots) => {
    return createVnode('div', {}, slots);
};

exports.createApp = createApp;
exports.h = h;
exports.renderSlots = renderSlots;

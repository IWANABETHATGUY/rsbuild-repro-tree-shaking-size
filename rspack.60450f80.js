(function() {
var __webpack_modules__ = {
"./node_modules/.pnpm/@vue+reactivity@3.4.12/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  EffectScope: function() { return EffectScope; },
  ReactiveEffect: function() { return ReactiveEffect; },
  computed: function() { return computed; },
  customRef: function() { return customRef; },
  getCurrentScope: function() { return getCurrentScope; },
  isProxy: function() { return isProxy; },
  isReactive: function() { return isReactive; },
  isRef: function() { return isRef; },
  isShallow: function() { return isShallow; },
  markRaw: function() { return markRaw; },
  pauseTracking: function() { return pauseTracking; },
  proxyRefs: function() { return proxyRefs; },
  reactive: function() { return reactive; },
  ref: function() { return ref; },
  resetTracking: function() { return resetTracking; },
  shallowReactive: function() { return shallowReactive; },
  toRaw: function() { return toRaw; },
  track: function() { return track; },
  trigger: function() { return trigger; },
  unref: function() { return unref; }
});
/* harmony import */var _vue_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vue/shared */"./node_modules/.pnpm/@vue+shared@3.4.12/node_modules/@vue/shared/dist/shared.esm-bundler.js");
/**
* @vue/reactivity v3.4.12
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/ 
function warn(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
}
let activeEffectScope;
class EffectScope {
    constructor(detached = false){
        this.detached = detached;
        /**
     * @internal
     */ this._active = true;
        /**
     * @internal
     */ this.effects = [];
        /**
     * @internal
     */ this.cleanups = [];
        this.parent = activeEffectScope;
        if (!detached && activeEffectScope) this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
    }
    get active() {
        return this._active;
    }
    run(fn) {
        if (this._active) {
            const currentEffectScope = activeEffectScope;
            try {
                activeEffectScope = this;
                return fn();
            } finally{
                activeEffectScope = currentEffectScope;
            }
        }
    }
    /**
   * This should only be called on non-detached scopes
   * @internal
   */ on() {
        activeEffectScope = this;
    }
    /**
   * This should only be called on non-detached scopes
   * @internal
   */ off() {
        activeEffectScope = this.parent;
    }
    stop(fromParent) {
        if (this._active) {
            let i, l;
            for(i = 0, l = this.effects.length; i < l; i++)this.effects[i].stop();
            for(i = 0, l = this.cleanups.length; i < l; i++)this.cleanups[i]();
            if (this.scopes) for(i = 0, l = this.scopes.length; i < l; i++)this.scopes[i].stop(true);
            if (!this.detached && this.parent && !fromParent) {
                const last = this.parent.scopes.pop();
                if (last && last !== this) {
                    this.parent.scopes[this.index] = last;
                    last.index = this.index;
                }
            }
            this.parent = void 0;
            this._active = false;
        }
    }
}
function effectScope(detached) {
    return new EffectScope(detached);
}
function recordEffectScope(effect, scope = activeEffectScope) {
    if (scope && scope.active) scope.effects.push(effect);
}
function getCurrentScope() {
    return activeEffectScope;
}
function onScopeDispose(fn) {
    if (activeEffectScope) activeEffectScope.cleanups.push(fn);
}
let activeEffect;
class ReactiveEffect {
    constructor(fn, trigger, scheduler, scope){
        this.fn = fn;
        this.trigger = trigger;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        /**
     * @internal
     */ this._dirtyLevel = 3;
        /**
     * @internal
     */ this._trackId = 0;
        /**
     * @internal
     */ this._runnings = 0;
        /**
     * @internal
     */ this._queryings = 0;
        /**
     * @internal
     */ this._depsLength = 0;
        recordEffectScope(this, scope);
    }
    get dirty() {
        if (this._dirtyLevel === 1) {
            this._dirtyLevel = 0;
            this._queryings++;
            pauseTracking();
            for (const dep of this.deps)if (dep.computed) {
                triggerComputed(dep.computed);
                if (this._dirtyLevel >= 2) break;
            }
            resetTracking();
            this._queryings--;
        }
        return this._dirtyLevel >= 2;
    }
    set dirty(v) {
        this._dirtyLevel = v ? 3 : 0;
    }
    run() {
        this._dirtyLevel = 0;
        if (!this.active) return this.fn();
        let lastShouldTrack = shouldTrack;
        let lastEffect = activeEffect;
        try {
            shouldTrack = true;
            activeEffect = this;
            this._runnings++;
            preCleanupEffect(this);
            return this.fn();
        } finally{
            postCleanupEffect(this);
            this._runnings--;
            activeEffect = lastEffect;
            shouldTrack = lastShouldTrack;
        }
    }
    stop() {
        var _a;
        if (this.active) {
            preCleanupEffect(this);
            postCleanupEffect(this);
            (_a = this.onStop) == null || _a.call(this);
            this.active = false;
        }
    }
}
function triggerComputed(computed) {
    return computed.value;
}
function preCleanupEffect(effect2) {
    effect2._trackId++;
    effect2._depsLength = 0;
}
function postCleanupEffect(effect2) {
    if (effect2.deps && effect2.deps.length > effect2._depsLength) {
        for(let i = effect2._depsLength; i < effect2.deps.length; i++)cleanupDepEffect(effect2.deps[i], effect2);
        effect2.deps.length = effect2._depsLength;
    }
}
function cleanupDepEffect(dep, effect2) {
    const trackId = dep.get(effect2);
    if (trackId !== void 0 && effect2._trackId !== trackId) {
        dep.delete(effect2);
        if (dep.size === 0) dep.cleanup();
    }
}
function effect(fn, options) {
    if (fn.effect instanceof ReactiveEffect) fn = fn.effect.fn;
    const _effect = new ReactiveEffect(fn, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.NOOP, ()=>{
        if (_effect.dirty) _effect.run();
    });
    if (options) {
        (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.extend)(_effect, options);
        if (options.scope) recordEffectScope(_effect, options.scope);
    }
    if (!options || !options.lazy) _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}
let shouldTrack = true;
let pauseScheduleStack = 0;
const trackStack = [];
function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
}
function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
}
function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
}
function pauseScheduling() {
    pauseScheduleStack++;
}
function resetScheduling() {
    pauseScheduleStack--;
    while(!pauseScheduleStack && queueEffectSchedulers.length)queueEffectSchedulers.shift()();
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
    var _a;
    if (dep.get(effect2) !== effect2._trackId) {
        dep.set(effect2, effect2._trackId);
        const oldDep = effect2.deps[effect2._depsLength];
        if (oldDep !== dep) {
            if (oldDep) cleanupDepEffect(oldDep, effect2);
            effect2.deps[effect2._depsLength++] = dep;
        } else effect2._depsLength++;
    }
}
const queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
    var _a;
    pauseScheduling();
    for (const effect2 of dep.keys()){
        if (!effect2.allowRecurse && effect2._runnings) continue;
        if (effect2._dirtyLevel < dirtyLevel && (!effect2._runnings || dirtyLevel !== 2)) {
            const lastDirtyLevel = effect2._dirtyLevel;
            effect2._dirtyLevel = dirtyLevel;
            if (lastDirtyLevel === 0 && (!effect2._queryings || dirtyLevel !== 2)) {
                effect2.trigger();
                if (effect2.scheduler) queueEffectSchedulers.push(effect2.scheduler);
            }
        }
    }
    resetScheduling();
}
const createDep = (cleanup, computed)=>{
    const dep = /* @__PURE__ */ new Map();
    dep.cleanup = cleanup;
    dep.computed = computed;
    return dep;
};
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
function track(target, type, key) {
    if (shouldTrack && activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
        let dep = depsMap.get(key);
        if (!dep) depsMap.set(key, dep = createDep(()=>depsMap.delete(key)));
        trackEffect(activeEffect, dep, void 0);
    }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    let deps = [];
    if (type === "clear") deps = [
        ...depsMap.values()
    ];
    else if (key === "length" && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target)) {
        const newLength = Number(newValue);
        depsMap.forEach((dep, key2)=>{
            if (key2 === "length" || !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isSymbol)(key2) && key2 >= newLength) deps.push(dep);
        });
    } else {
        if (key !== void 0) deps.push(depsMap.get(key));
        switch(type){
            case "add":
                if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(target)) deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isIntegerKey)(key)) deps.push(depsMap.get("length"));
                break;
            case "delete":
                if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(target)) deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                }
                break;
            case "set":
                if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(target)) deps.push(depsMap.get(ITERATE_KEY));
                break;
        }
    }
    pauseScheduling();
    for (const dep of deps)if (dep) triggerEffects(dep, 3, void 0);
    resetScheduling();
}
function getDepFromReactive(object, key) {
    var _a;
    return (_a = targetMap.get(object)) == null ? void 0 : _a.get(key);
}
const isNonTrackableKeys = /* @__PURE__ */ (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.makeMap)(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key)=>key !== "arguments" && key !== "caller").map((key)=>Symbol[key]).filter(_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isSymbol));
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
    const instrumentations = {};
    [
        "includes",
        "indexOf",
        "lastIndexOf"
    ].forEach((key)=>{
        instrumentations[key] = function(...args) {
            const arr = toRaw(this);
            for(let i = 0, l = this.length; i < l; i++)track(arr, "get", i + "");
            const res = arr[key](...args);
            if (res === -1 || res === false) return arr[key](...args.map(toRaw));
            else return res;
        };
    });
    [
        "push",
        "pop",
        "shift",
        "unshift",
        "splice"
    ].forEach((key)=>{
        instrumentations[key] = function(...args) {
            pauseTracking();
            pauseScheduling();
            const res = toRaw(this)[key].apply(this, args);
            resetScheduling();
            resetTracking();
            return res;
        };
    });
    return instrumentations;
}
function hasOwnProperty(key) {
    const obj = toRaw(this);
    track(obj, "has", key);
    return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
    constructor(_isReadonly = false, _shallow = false){
        this._isReadonly = _isReadonly;
        this._shallow = _shallow;
    }
    get(target, key, receiver) {
        const isReadonly2 = this._isReadonly, shallow = this._shallow;
        if (key === "__v_isReactive") return !isReadonly2;
        else if (key === "__v_isReadonly") return isReadonly2;
        else if (key === "__v_isShallow") return shallow;
        else if (key === "__v_raw") {
            if (receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
            // this means the reciever is a user proxy of the reactive proxy
            Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
            return;
        }
        const targetIsArray = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target);
        if (!isReadonly2) {
            if (targetIsArray && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(arrayInstrumentations, key)) return Reflect.get(arrayInstrumentations, key, receiver);
            if (key === "hasOwnProperty") return hasOwnProperty;
        }
        const res = Reflect.get(target, key, receiver);
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isSymbol)(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
        if (!isReadonly2) track(target, "get", key);
        if (shallow) return res;
        if (isRef(res)) return targetIsArray && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isIntegerKey)(key) ? res : res.value;
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(res)) return isReadonly2 ? readonly(res) : reactive(res);
        return res;
    }
}
class MutableReactiveHandler extends BaseReactiveHandler {
    constructor(shallow = false){
        super(false, shallow);
    }
    set(target, key, value, receiver) {
        let oldValue = target[key];
        if (!this._shallow) {
            const isOldValueReadonly = isReadonly(oldValue);
            if (!isShallow(value) && !isReadonly(value)) {
                oldValue = toRaw(oldValue);
                value = toRaw(value);
            }
            if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target) && isRef(oldValue) && !isRef(value)) {
                if (isOldValueReadonly) return false;
                else {
                    oldValue.value = value;
                    return true;
                }
            }
        }
        const hadKey = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isIntegerKey)(key) ? Number(key) < target.length : (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(target, key);
        const result = Reflect.set(target, key, value, receiver);
        if (target === toRaw(receiver)) {
            if (!hadKey) trigger(target, "add", key, value);
            else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(value, oldValue)) trigger(target, "set", key, value, oldValue);
        }
        return result;
    }
    deleteProperty(target, key) {
        const hadKey = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(target, key);
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);
        if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
        return result;
    }
    has(target, key) {
        const result = Reflect.has(target, key);
        if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isSymbol)(key) || !builtInSymbols.has(key)) track(target, "has", key);
        return result;
    }
    ownKeys(target) {
        track(target, "iterate", (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target) ? "length" : ITERATE_KEY);
        return Reflect.ownKeys(target);
    }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
    constructor(shallow = false){
        super(true, shallow);
    }
    set(target, key) {
        return true;
    }
    deleteProperty(target, key) {
        return true;
    }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value)=>value;
const getProto = (v)=>Reflect.getPrototypeOf(v);
function get(target, key, isReadonly = false, isShallow = false) {
    target = target["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(key, rawKey)) track(rawTarget, "get", key);
        track(rawTarget, "get", rawKey);
    }
    const { has: has2 } = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) return wrap(target.get(key));
    else if (has2.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
    else if (target !== rawTarget) target.get(key);
}
function has(key, isReadonly = false) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(key, rawKey)) track(rawTarget, "has", key);
        track(rawTarget, "has", rawKey);
    }
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
    target = target["__v_raw"];
    !isReadonly && track(toRaw(target), "iterate", ITERATE_KEY);
    return Reflect.get(target, "size", target);
}
function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
        target.add(value);
        trigger(target, "add", value, value);
    }
    return this;
}
function set(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has: has2, get: get2 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has2.call(target, key);
    }
    const oldValue = get2.call(target, key);
    target.set(key, value);
    if (!hadKey) trigger(target, "add", key, value);
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(value, oldValue)) trigger(target, "set", key, value, oldValue);
    return this;
}
function deleteEntry(key) {
    const target = toRaw(this);
    const { has: has2, get: get2 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has2.call(target, key);
    }
    const oldValue = get2 ? get2.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) trigger(target, "delete", key, void 0, oldValue);
    return result;
}
function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = void 0;
    const result = target.clear();
    if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
    return result;
}
function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
        const observed = this;
        const target = observed["__v_raw"];
        const rawTarget = toRaw(target);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
        return target.forEach((value, key)=>{
            return callback.call(thisArg, wrap(value), wrap(key), observed);
        });
    };
}
function createIterableMethod(method, isReadonly, isShallow) {
    return function(...args) {
        const target = this["__v_raw"];
        const rawTarget = toRaw(target);
        const targetIsMap = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(rawTarget);
        const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
        const isKeyOnly = method === "keys" && targetIsMap;
        const innerIterator = target[method](...args);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
        return {
            // iterator protocol
            next () {
                const { value, done } = innerIterator.next();
                return done ? {
                    value,
                    done
                } : {
                    value: isPair ? [
                        wrap(value[0]),
                        wrap(value[1])
                    ] : wrap(value),
                    done
                };
            },
            // iterable protocol
            [Symbol.iterator] () {
                return this;
            }
        };
    };
}
function createReadonlyMethod(type) {
    return function(...args) {
        return type === "delete" ? false : type === "clear" ? void 0 : this;
    };
}
function createInstrumentations() {
    const mutableInstrumentations2 = {
        get (key) {
            return get(this, key);
        },
        get size () {
            return size(this);
        },
        has,
        add,
        set,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, false)
    };
    const shallowInstrumentations2 = {
        get (key) {
            return get(this, key, false, true);
        },
        get size () {
            return size(this);
        },
        has,
        add,
        set,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, true)
    };
    const readonlyInstrumentations2 = {
        get (key) {
            return get(this, key, true);
        },
        get size () {
            return size(this, true);
        },
        has (key) {
            return has.call(this, key, true);
        },
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear"),
        forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations2 = {
        get (key) {
            return get(this, key, true, true);
        },
        get size () {
            return size(this, true);
        },
        has (key) {
            return has.call(this, key, true);
        },
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear"),
        forEach: createForEach(true, true)
    };
    const iteratorMethods = [
        "keys",
        "values",
        "entries",
        Symbol.iterator
    ];
    iteratorMethods.forEach((method)=>{
        mutableInstrumentations2[method] = createIterableMethod(method, false, false);
        readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
        shallowInstrumentations2[method] = createIterableMethod(method, false, true);
        shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
    });
    return [
        mutableInstrumentations2,
        readonlyInstrumentations2,
        shallowInstrumentations2,
        shallowReadonlyInstrumentations2
    ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
    return (target, key, receiver)=>{
        if (key === "__v_isReactive") return !isReadonly;
        else if (key === "__v_isReadonly") return isReadonly;
        else if (key === "__v_raw") return target;
        return Reflect.get((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
    };
}
const mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
        const type = toRawType(target);
        console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
    }
}
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
    switch(rawType){
        case "Object":
        case "Array":
            return 1 /* COMMON */ ;
        case "Map":
        case "Set":
        case "WeakMap":
        case "WeakSet":
            return 2 /* COLLECTION */ ;
        default:
            return 0 /* INVALID */ ;
    }
}
function getTargetType(value) {
    return value["__v_skip"] || !Object.isExtensible(value) ? 0 /* INVALID */  : targetTypeMap((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.toRawType)(value));
}
function reactive(target) {
    if (isReadonly(target)) return target;
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
    if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(target)) return target;
    if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
    const existingProxy = proxyMap.get(target);
    if (existingProxy) return existingProxy;
    const targetType = getTargetType(target);
    if (targetType === 0 /* INVALID */ ) return target;
    const proxy = new Proxy(target, targetType === 2 /* COLLECTION */  ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
function isReactive(value) {
    if (isReadonly(value)) return isReactive(value["__v_raw"]);
    return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
    return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
    return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
    const raw = observed && observed["__v_raw"];
    return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
    (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.def)(value, "__v_skip", true);
    return value;
}
const toReactive = (value)=>(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(value) ? reactive(value) : value;
const toReadonly = (value)=>(0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(value) ? readonly(value) : value;
class ComputedRefImpl {
    constructor(getter, _setter, isReadonly, isSSR){
        this._setter = _setter;
        this.dep = void 0;
        this.__v_isRef = true;
        this["__v_isReadonly"] = false;
        this.effect = new ReactiveEffect(()=>getter(this._value), ()=>triggerRefValue(this, 1));
        this.effect.computed = this;
        this.effect.active = this._cacheable = !isSSR;
        this["__v_isReadonly"] = isReadonly;
    }
    get value() {
        const self = toRaw(this);
        trackRefValue(self);
        if (!self._cacheable || self.effect.dirty) {
            if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(self._value, self._value = self.effect.run())) triggerRefValue(self, 2);
        }
        return self._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
    // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
    get _dirty() {
        return this.effect.dirty;
    }
    set _dirty(v) {
        this.effect.dirty = v;
    }
}
function computed(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    const onlyGetter = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(getterOrOptions);
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = _vue_shared__WEBPACK_IMPORTED_MODULE_0__.NOOP;
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
    return cRef;
}
function trackRefValue(ref2) {
    if (shouldTrack && activeEffect) {
        ref2 = toRaw(ref2);
        trackEffect(activeEffect, ref2.dep || (ref2.dep = createDep(()=>ref2.dep = void 0, ref2 instanceof ComputedRefImpl ? ref2 : void 0)), void 0);
    }
}
function triggerRefValue(ref2, dirtyLevel = 3, newVal) {
    ref2 = toRaw(ref2);
    const dep = ref2.dep;
    if (dep) triggerEffects(dep, dirtyLevel, void 0);
}
function isRef(r) {
    return !!(r && r.__v_isRef === true);
}
function ref(value) {
    return createRef(value, false);
}
function shallowRef(value) {
    return createRef(value, true);
}
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) return rawValue;
    return new RefImpl(rawValue, shallow);
}
class RefImpl {
    constructor(value, __v_isShallow){
        this.__v_isShallow = __v_isShallow;
        this.dep = void 0;
        this.__v_isRef = true;
        this._rawValue = __v_isShallow ? value : toRaw(value);
        this._value = __v_isShallow ? value : toReactive(value);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
        newVal = useDirectValue ? newVal : toRaw(newVal);
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = useDirectValue ? newVal : toReactive(newVal);
            triggerRefValue(this, 3, newVal);
        }
    }
}
function triggerRef(ref2) {
    triggerRefValue(ref2, 3, void 0);
}
function unref(ref2) {
    return isRef(ref2) ? ref2.value : ref2;
}
function toValue(source) {
    return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(source) ? source() : unref(source);
}
const shallowUnwrapHandlers = {
    get: (target, key, receiver)=>unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver)=>{
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        } else return Reflect.set(target, key, value, receiver);
    }
};
function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class CustomRefImpl {
    constructor(factory){
        this.dep = void 0;
        this.__v_isRef = true;
        const { get, set } = factory(()=>trackRefValue(this), ()=>triggerRefValue(this));
        this._get = get;
        this._set = set;
    }
    get value() {
        return this._get();
    }
    set value(newVal) {
        this._set(newVal);
    }
}
function customRef(factory) {
    return new CustomRefImpl(factory);
}
function toRefs(object) {
    const ret = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(object) ? new Array(object.length) : {};
    for(const key in object)ret[key] = propertyToRef(object, key);
    return ret;
}
class ObjectRefImpl {
    constructor(_object, _key, _defaultValue){
        this._object = _object;
        this._key = _key;
        this._defaultValue = _defaultValue;
        this.__v_isRef = true;
    }
    get value() {
        const val = this._object[this._key];
        return val === void 0 ? this._defaultValue : val;
    }
    set value(newVal) {
        this._object[this._key] = newVal;
    }
    get dep() {
        return getDepFromReactive(toRaw(this._object), this._key);
    }
}
class GetterRefImpl {
    constructor(_getter){
        this._getter = _getter;
        this.__v_isRef = true;
        this.__v_isReadonly = true;
    }
    get value() {
        return this._getter();
    }
}
function toRef(source, key, defaultValue) {
    if (isRef(source)) return source;
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(source)) return new GetterRefImpl(source);
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(source) && arguments.length > 1) return propertyToRef(source, key, defaultValue);
    else return ref(source);
}
function propertyToRef(source, key, defaultValue) {
    const val = source[key];
    return isRef(val) ? val : new ObjectRefImpl(source, key, defaultValue);
}
const deferredComputed = computed;
const TrackOpTypes = {
    "GET": "get",
    "HAS": "has",
    "ITERATE": "iterate"
};
const TriggerOpTypes = {
    "SET": "set",
    "ADD": "add",
    "DELETE": "delete",
    "CLEAR": "clear"
};
const ReactiveFlags = {
    "SKIP": "__v_skip",
    "IS_REACTIVE": "__v_isReactive",
    "IS_READONLY": "__v_isReadonly",
    "IS_SHALLOW": "__v_isShallow",
    "RAW": "__v_raw"
};

}),
"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  computed: function() { return computed; },
  createVNode: function() { return createVNode; },
  defineComponent: function() { return defineComponent; },
  getCurrentInstance: function() { return getCurrentInstance; },
  inject: function() { return inject; },
  isVNode: function() { return isVNode; },
  mergeProps: function() { return mergeProps; },
  nextTick: function() { return nextTick; },
  onActivated: function() { return onActivated; },
  onBeforeUnmount: function() { return onBeforeUnmount; },
  onDeactivated: function() { return onDeactivated; },
  onMounted: function() { return onMounted; },
  onUnmounted: function() { return onUnmounted; },
  provide: function() { return provide; },
  watch: function() { return watch; },
  watchEffect: function() { return watchEffect; }
});
/* harmony import */var _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vue/reactivity */"./node_modules/.pnpm/@vue+reactivity@3.4.12/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");
/* harmony import */var _vue_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @vue/shared */"./node_modules/.pnpm/@vue+shared@3.4.12/node_modules/@vue/shared/dist/shared.esm-bundler.js");
/**
* @vue/runtime-core v3.4.12
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/ 



const stack = [];
function pushWarningContext(vnode) {
    stack.push(vnode);
}
function popWarningContext() {
    stack.pop();
}
function warn$1(msg, ...args) {
    (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
    const instance = stack.length ? stack[stack.length - 1].component : null;
    const appWarnHandler = instance && instance.appContext.config.warnHandler;
    const trace = getComponentTrace();
    if (appWarnHandler) callWithErrorHandling(appWarnHandler, instance, 11, [
        msg + args.join(""),
        instance && instance.proxy,
        trace.map(({ vnode })=>`at <${formatComponentName(instance, vnode.type)}>`).join("\n"),
        trace
    ]);
    else {
        const warnArgs = [
            `[Vue warn]: ${msg}`,
            ...args
        ];
        if (trace.length && // avoid spamming console during tests
        true) warnArgs.push(`
`, ...formatTrace(trace));
        console.warn(...warnArgs);
    }
    (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
}
function getComponentTrace() {
    let currentVNode = stack[stack.length - 1];
    if (!currentVNode) return [];
    const normalizedStack = [];
    while(currentVNode){
        const last = normalizedStack[0];
        if (last && last.vnode === currentVNode) last.recurseCount++;
        else normalizedStack.push({
            vnode: currentVNode,
            recurseCount: 0
        });
        const parentInstance = currentVNode.component && currentVNode.component.parent;
        currentVNode = parentInstance && parentInstance.vnode;
    }
    return normalizedStack;
}
function formatTrace(trace) {
    const logs = [];
    trace.forEach((entry, i)=>{
        logs.push(...i === 0 ? [] : [
            `
`
        ], ...formatTraceEntry(entry));
    });
    return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
    const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
    const isRoot = vnode.component ? vnode.component.parent == null : false;
    const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
    const close = `>` + postfix;
    return vnode.props ? [
        open,
        ...formatProps(vnode.props),
        close
    ] : [
        open + close
    ];
}
function formatProps(props) {
    const res = [];
    const keys = Object.keys(props);
    keys.slice(0, 3).forEach((key)=>{
        res.push(...formatProp(key, props[key]));
    });
    if (keys.length > 3) res.push(` ...`);
    return res;
}
function formatProp(key, value, raw) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(value)) {
        value = JSON.stringify(value);
        return raw ? value : [
            `${key}=${value}`
        ];
    } else if (typeof value === "number" || typeof value === "boolean" || value == null) return raw ? value : [
        `${key}=${value}`
    ];
    else if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(value)) {
        value = formatProp(key, (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(value.value), true);
        return raw ? value : [
            `${key}=Ref<`,
            value,
            `>`
        ];
    } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value)) return [
        `${key}=fn${value.name ? `<${value.name}>` : ``}`
    ];
    else {
        value = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(value);
        return raw ? value : [
            `${key}=`,
            value
        ];
    }
}
function assertNumber(val, type) {
    return;
}
const ErrorCodes = {
    "SETUP_FUNCTION": 0,
    "0": "SETUP_FUNCTION",
    "RENDER_FUNCTION": 1,
    "1": "RENDER_FUNCTION",
    "WATCH_GETTER": 2,
    "2": "WATCH_GETTER",
    "WATCH_CALLBACK": 3,
    "3": "WATCH_CALLBACK",
    "WATCH_CLEANUP": 4,
    "4": "WATCH_CLEANUP",
    "NATIVE_EVENT_HANDLER": 5,
    "5": "NATIVE_EVENT_HANDLER",
    "COMPONENT_EVENT_HANDLER": 6,
    "6": "COMPONENT_EVENT_HANDLER",
    "VNODE_HOOK": 7,
    "7": "VNODE_HOOK",
    "DIRECTIVE_HOOK": 8,
    "8": "DIRECTIVE_HOOK",
    "TRANSITION_HOOK": 9,
    "9": "TRANSITION_HOOK",
    "APP_ERROR_HANDLER": 10,
    "10": "APP_ERROR_HANDLER",
    "APP_WARN_HANDLER": 11,
    "11": "APP_WARN_HANDLER",
    "FUNCTION_REF": 12,
    "12": "FUNCTION_REF",
    "ASYNC_COMPONENT_LOADER": 13,
    "13": "ASYNC_COMPONENT_LOADER",
    "SCHEDULER": 14,
    "14": "SCHEDULER"
};
const ErrorTypeStrings$1 = {
    ["sp"]: "serverPrefetch hook",
    ["bc"]: "beforeCreate hook",
    ["c"]: "created hook",
    ["bm"]: "beforeMount hook",
    ["m"]: "mounted hook",
    ["bu"]: "beforeUpdate hook",
    ["u"]: "updated",
    ["bum"]: "beforeUnmount hook",
    ["um"]: "unmounted hook",
    ["a"]: "activated hook",
    ["da"]: "deactivated hook",
    ["ec"]: "errorCaptured hook",
    ["rtc"]: "renderTracked hook",
    ["rtg"]: "renderTriggered hook",
    [0]: "setup function",
    [1]: "render function",
    [2]: "watcher getter",
    [3]: "watcher callback",
    [4]: "watcher cleanup function",
    [5]: "native event handler",
    [6]: "component event handler",
    [7]: "vnode hook",
    [8]: "directive hook",
    [9]: "transition hook",
    [10]: "app errorHandler",
    [11]: "app warnHandler",
    [12]: "ref function",
    [13]: "async component loader",
    [14]: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://github.com/vuejs/core ."
};
function callWithErrorHandling(fn, instance, type, args) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    } catch (err) {
        handleError(err, instance, type);
    }
    return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(fn)) {
        const res = callWithErrorHandling(fn, instance, type, args);
        if (res && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPromise)(res)) res.catch((err)=>{
            handleError(err, instance, type);
        });
        return res;
    }
    const values = [];
    for(let i = 0; i < fn.length; i++)values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    return values;
}
function handleError(err, instance, type, throwInDev = true) {
    const contextVNode = instance ? instance.vnode : null;
    if (instance) {
        let cur = instance.parent;
        const exposedInstance = instance.proxy;
        const errorInfo = `https://vuejs.org/errors/#runtime-${type}`;
        while(cur){
            const errorCapturedHooks = cur.ec;
            if (errorCapturedHooks) for(let i = 0; i < errorCapturedHooks.length; i++){
                if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
            }
            cur = cur.parent;
        }
        const appErrorHandler = instance.appContext.config.errorHandler;
        if (appErrorHandler) {
            callWithErrorHandling(appErrorHandler, null, 10, [
                err,
                exposedInstance,
                errorInfo
            ]);
            return;
        }
    }
    logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
    console.error(err);
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
    const p = currentFlushPromise || resolvedPromise;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
function findInsertionIndex(id) {
    let start = flushIndex + 1;
    let end = queue.length;
    while(start < end){
        const middle = start + end >>> 1;
        const middleJob = queue[middle];
        const middleJobId = getId(middleJob);
        if (middleJobId < id || middleJobId === id && middleJob.pre) start = middle + 1;
        else end = middle;
    }
    return start;
}
function queueJob(job) {
    if (!queue.length || !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) {
        if (job.id == null) queue.push(job);
        else queue.splice(findInsertionIndex(job.id), 0, job);
        queueFlush();
    }
}
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true;
        currentFlushPromise = resolvedPromise.then(flushJobs);
    }
}
function invalidateJob(job) {
    const i = queue.indexOf(job);
    if (i > flushIndex) queue.splice(i, 1);
}
function queuePostFlushCb(cb) {
    if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(cb)) {
        if (!activePostFlushCbs || !activePostFlushCbs.includes(cb, cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex)) pendingPostFlushCbs.push(cb);
    } else pendingPostFlushCbs.push(...cb);
    queueFlush();
}
function flushPreFlushCbs(instance, seen, i = isFlushing ? flushIndex + 1 : 0) {
    for(; i < queue.length; i++){
        const cb = queue[i];
        if (cb && cb.pre) {
            if (instance && cb.id !== instance.uid) continue;
            queue.splice(i, 1);
            i--;
            cb();
        }
    }
}
function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
        const deduped = [
            ...new Set(pendingPostFlushCbs)
        ].sort((a, b)=>getId(a) - getId(b));
        pendingPostFlushCbs.length = 0;
        if (activePostFlushCbs) {
            activePostFlushCbs.push(...deduped);
            return;
        }
        activePostFlushCbs = deduped;
        for(postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++)activePostFlushCbs[postFlushIndex]();
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}
const getId = (job)=>job.id == null ? Infinity : job.id;
const comparator = (a, b)=>{
    const diff = getId(a) - getId(b);
    if (diff === 0) {
        if (a.pre && !b.pre) return -1;
        if (b.pre && !a.pre) return 1;
    }
    return diff;
};
function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    queue.sort(comparator);
    const check = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
    try {
        for(flushIndex = 0; flushIndex < queue.length; flushIndex++){
            const job = queue[flushIndex];
            if (job && job.active !== false) callWithErrorHandling(job, null, 14);
        }
    } finally{
        flushIndex = 0;
        queue.length = 0;
        flushPostFlushCbs(seen);
        isFlushing = false;
        currentFlushPromise = null;
        if (queue.length || pendingPostFlushCbs.length) flushJobs(seen);
    }
}
function checkRecursiveUpdates(seen, fn) {
    if (!seen.has(fn)) seen.set(fn, 1);
    else {
        const count = seen.get(fn);
        if (count > RECURSION_LIMIT) {
            const instance = fn.ownerInstance;
            const componentName = instance && getComponentName(instance.type);
            handleError(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`, null, 10);
            return true;
        } else seen.set(fn, count + 1);
    }
}
let isHmrUpdating = false;
const hmrDirtyComponents = /* @__PURE__ */ new Set();
const map = /* @__PURE__ */ new Map();
function registerHMR(instance) {
    const id = instance.type.__hmrId;
    let record = map.get(id);
    if (!record) {
        createRecord(id, instance.type);
        record = map.get(id);
    }
    record.instances.add(instance);
}
function unregisterHMR(instance) {
    map.get(instance.type.__hmrId).instances.delete(instance);
}
function createRecord(id, initialDef) {
    if (map.has(id)) return false;
    map.set(id, {
        initialDef: normalizeClassComponent(initialDef),
        instances: /* @__PURE__ */ new Set()
    });
    return true;
}
function normalizeClassComponent(component) {
    return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
    const record = map.get(id);
    if (!record) return;
    record.initialDef.render = newRender;
    [
        ...record.instances
    ].forEach((instance)=>{
        if (newRender) {
            instance.render = newRender;
            normalizeClassComponent(instance.type).render = newRender;
        }
        instance.renderCache = [];
        isHmrUpdating = true;
        instance.effect.dirty = true;
        instance.update();
        isHmrUpdating = false;
    });
}
function reload(id, newComp) {
    const record = map.get(id);
    if (!record) return;
    newComp = normalizeClassComponent(newComp);
    updateComponentDef(record.initialDef, newComp);
    const instances = [
        ...record.instances
    ];
    for (const instance of instances){
        const oldComp = normalizeClassComponent(instance.type);
        if (!hmrDirtyComponents.has(oldComp)) {
            if (oldComp !== record.initialDef) updateComponentDef(oldComp, newComp);
            hmrDirtyComponents.add(oldComp);
        }
        instance.appContext.propsCache.delete(instance.type);
        instance.appContext.emitsCache.delete(instance.type);
        instance.appContext.optionsCache.delete(instance.type);
        if (instance.ceReload) {
            hmrDirtyComponents.add(oldComp);
            instance.ceReload(newComp.styles);
            hmrDirtyComponents.delete(oldComp);
        } else if (instance.parent) {
            instance.parent.effect.dirty = true;
            queueJob(instance.parent.update);
        } else if (instance.appContext.reload) instance.appContext.reload();
        else if (typeof window !== "undefined") window.location.reload();
        else console.warn("[HMR] Root or manually mounted instance modified. Full reload required.");
    }
    queuePostFlushCb(()=>{
        for (const instance of instances)hmrDirtyComponents.delete(normalizeClassComponent(instance.type));
    });
}
function updateComponentDef(oldComp, newComp) {
    extend(oldComp, newComp);
    for(const key in oldComp)if (key !== "__file" && !(key in newComp)) delete oldComp[key];
}
function tryWrap(fn) {
    return (id, arg)=>{
        try {
            return fn(id, arg);
        } catch (e) {
            console.error(e);
            console.warn(`[HMR] Something went wrong during Vue component hot-reload. Full reload required.`);
        }
    };
}
let devtools$1;
let buffer = [];
let devtoolsNotInstalled = false;
function emit$1(event, ...args) {
    if (devtools$1) devtools$1.emit(event, ...args);
    else if (!devtoolsNotInstalled) buffer.push({
        event,
        args
    });
}
function setDevtoolsHook$1(hook, target) {
    var _a, _b;
    devtools$1 = hook;
    if (devtools$1) {
        devtools$1.enabled = true;
        buffer.forEach(({ event, args })=>devtools$1.emit(event, ...args));
        buffer = [];
    } else if (// handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== "undefined" && // some envs mock window but not fully
    window.HTMLElement && // also exclude jsdom
    !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))) {
        const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
        replay.push((newHook)=>{
            setDevtoolsHook$1(newHook, target);
        });
        setTimeout(()=>{
            if (!devtools$1) {
                target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
                devtoolsNotInstalled = true;
                buffer = [];
            }
        }, 3e3);
    } else {
        devtoolsNotInstalled = true;
        buffer = [];
    }
}
function devtoolsInitApp(app, version) {
    emit$1("app:init" /* APP_INIT */ , app, version, {
        Fragment,
        Text,
        Comment,
        Static
    });
}
function devtoolsUnmountApp(app) {
    emit$1("app:unmount" /* APP_UNMOUNT */ , app);
}
const devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook("component:added" /* COMPONENT_ADDED */ );
const devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook("component:updated" /* COMPONENT_UPDATED */ );
const _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook("component:removed" /* COMPONENT_REMOVED */ );
const devtoolsComponentRemoved = (component)=>{
    if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && // remove the component if it wasn't buffered
    !devtools$1.cleanupBuffer(component)) _devtoolsComponentRemoved(component);
};
function createDevtoolsComponentHook(hook) {
    return (component)=>{
        emit$1(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : void 0, component);
    };
}
const devtoolsPerfStart = /* @__PURE__ */ (/* unused pure expression or super */ null && (createDevtoolsPerformanceHook("perf:start" /* PERFORMANCE_START */ )));
const devtoolsPerfEnd = /* @__PURE__ */ (/* unused pure expression or super */ null && (createDevtoolsPerformanceHook("perf:end" /* PERFORMANCE_END */ )));
function createDevtoolsPerformanceHook(hook) {
    return (component, type, time)=>{
        emit$1(hook, component.appContext.app, component.uid, component, type, time);
    };
}
function devtoolsComponentEmit(component, event, params) {
    emit$1("component:emit" /* COMPONENT_EMIT */ , component.appContext.app, component, event, params);
}
function emit(instance, event, ...rawArgs) {
    if (instance.isUnmounted) return;
    const props = instance.vnode.props || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
    let args = rawArgs;
    const isModelListener = event.startsWith("update:");
    const modelArg = isModelListener && event.slice(7);
    if (modelArg && modelArg in props) {
        const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
        const { number, trim } = props[modifiersKey] || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        if (trim) args = rawArgs.map((a)=>(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(a) ? a.trim() : a);
        if (number) args = rawArgs.map(_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseToNumber);
    }
    if (__VUE_PROD_DEVTOOLS__) devtoolsComponentEmit(instance, event, args);
    let handlerName;
    let handler = props[handlerName = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(event)] || // also try camelCase event handler (#2249)
    props[handlerName = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(event))];
    if (!handler && isModelListener) handler = props[handlerName = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(event))];
    if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
    const onceHandler = props[handlerName + `Once`];
    if (onceHandler) {
        if (!instance.emitted) instance.emitted = {};
        else if (instance.emitted[handlerName]) return;
        instance.emitted[handlerName] = true;
        callWithAsyncErrorHandling(onceHandler, instance, 6, args);
    }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.emitsCache;
    const cached = cache.get(comp);
    if (cached !== void 0) return cached;
    const raw = comp.emits;
    let normalized = {};
    let hasExtends = false;
    if (__VUE_OPTIONS_API__ && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(comp)) {
        const extendEmits = (raw2)=>{
            const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
            if (normalizedFromExtend) {
                hasExtends = true;
                (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(normalized, normalizedFromExtend);
            }
        };
        if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
        if (comp.extends) extendEmits(comp.extends);
        if (comp.mixins) comp.mixins.forEach(extendEmits);
    }
    if (!raw && !hasExtends) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) cache.set(comp, null);
        return null;
    }
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) raw.forEach((key)=>normalized[key] = null);
    else (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(normalized, raw);
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) cache.set(comp, normalized);
    return normalized;
}
function isEmitListener(options, key) {
    if (!options || !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) return false;
    key = key.slice(2).replace(/Once$/, "");
    return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, key[0].toLowerCase() + key.slice(1)) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key)) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance;
    currentRenderingInstance = instance;
    currentScopeId = instance && instance.type.__scopeId || null;
    return prev;
}
function pushScopeId(id) {
    currentScopeId = id;
}
function popScopeId() {
    currentScopeId = null;
}
const withScopeId = (_id)=>withCtx;
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
    if (!ctx) return fn;
    if (fn._n) return fn;
    const renderFnWithContext = (...args)=>{
        if (renderFnWithContext._d) setBlockTracking(-1);
        const prevInstance = setCurrentRenderingInstance(ctx);
        let res;
        try {
            res = fn(...args);
        } finally{
            setCurrentRenderingInstance(prevInstance);
            if (renderFnWithContext._d) setBlockTracking(1);
        }
        if (__VUE_PROD_DEVTOOLS__) devtoolsComponentUpdated(ctx);
        return res;
    };
    renderFnWithContext._n = true;
    renderFnWithContext._c = true;
    renderFnWithContext._d = true;
    return renderFnWithContext;
}
let accessedAttrs = false;
function markAttrsAccessed() {
    accessedAttrs = true;
}
function renderComponentRoot(instance) {
    const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, data, setupState, ctx, inheritAttrs } = instance;
    let result;
    let fallthroughAttrs;
    const prev = setCurrentRenderingInstance(instance);
    try {
        if (vnode.shapeFlag & 4) {
            const proxyToUse = withProxy || proxy;
            const thisProxy = proxyToUse;
            result = normalizeVNode(render.call(thisProxy, proxyToUse, renderCache, props, setupState, data, ctx));
            fallthroughAttrs = attrs;
        } else {
            const render2 = Component;
            result = normalizeVNode(render2.length > 1 ? render2(props, {
                attrs,
                slots,
                emit
            }) : render2(props, null));
            fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
        }
    } catch (err) {
        blockStack.length = 0;
        handleError(err, instance, 1);
        result = createVNode(Comment);
    }
    let root = result;
    let setRoot = void 0;
    if (fallthroughAttrs && inheritAttrs !== false) {
        const keys = Object.keys(fallthroughAttrs);
        const { shapeFlag } = root;
        if (keys.length) {
            if (shapeFlag & 7) {
                if (propsOptions && keys.some(_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
                root = cloneVNode(root, fallthroughAttrs);
            }
        }
    }
    if (vnode.dirs) {
        root = cloneVNode(root);
        root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
    }
    if (vnode.transition) root.transition = vnode.transition;
    result = root;
    setCurrentRenderingInstance(prev);
    return result;
}
const getChildRoot = (vnode)=>{
    const rawChildren = vnode.children;
    const dynamicChildren = vnode.dynamicChildren;
    const childRoot = filterSingleRoot(rawChildren, false);
    if (!childRoot) return [
        vnode,
        void 0
    ];
    const index = rawChildren.indexOf(childRoot);
    const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
    const setRoot = (updatedRoot)=>{
        rawChildren[index] = updatedRoot;
        if (dynamicChildren) {
            if (dynamicIndex > -1) dynamicChildren[dynamicIndex] = updatedRoot;
            else if (updatedRoot.patchFlag > 0) vnode.dynamicChildren = [
                ...dynamicChildren,
                updatedRoot
            ];
        }
    };
    return [
        normalizeVNode(childRoot),
        setRoot
    ];
};
function filterSingleRoot(children, recurse = true) {
    let singleRoot;
    for(let i = 0; i < children.length; i++){
        const child = children[i];
        if (isVNode(child)) {
            if (child.type !== Comment || child.children === "v-if") {
                if (singleRoot) return;
                else singleRoot = child;
            }
        } else return;
    }
    return singleRoot;
}
const getFunctionalFallthrough = (attrs)=>{
    let res;
    for(const key in attrs)if (key === "class" || key === "style" || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) (res || (res = {}))[key] = attrs[key];
    return res;
};
const filterModelListeners = (attrs, props)=>{
    const res = {};
    for(const key in attrs)if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isModelListener)(key) || !(key.slice(9) in props)) res[key] = attrs[key];
    return res;
};
const isElementRoot = (vnode)=>{
    return vnode.shapeFlag & 7 || vnode.type === Comment;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
    const { props: prevProps, children: prevChildren, component } = prevVNode;
    const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
    const emits = component.emitsOptions;
    if (nextVNode.dirs || nextVNode.transition) return true;
    if (optimized && patchFlag >= 0) {
        if (patchFlag & 1024) return true;
        if (patchFlag & 16) {
            if (!prevProps) return !!nextProps;
            return hasPropsChanged(prevProps, nextProps, emits);
        } else if (patchFlag & 8) {
            const dynamicProps = nextVNode.dynamicProps;
            for(let i = 0; i < dynamicProps.length; i++){
                const key = dynamicProps[i];
                if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) return true;
            }
        }
    } else {
        if (prevChildren || nextChildren) {
            if (!nextChildren || !nextChildren.$stable) return true;
        }
        if (prevProps === nextProps) return false;
        if (!prevProps) return !!nextProps;
        if (!nextProps) return true;
        return hasPropsChanged(prevProps, nextProps, emits);
    }
    return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) return true;
    for(let i = 0; i < nextKeys.length; i++){
        const key = nextKeys[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) return true;
    }
    return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
    while(parent){
        const root = parent.subTree;
        if (root.suspense && root.suspense.activeBranch === vnode) root.el = vnode.el;
        if (root === vnode) {
            (vnode = parent.vnode).el = el;
            parent = parent.parent;
        } else break;
    }
}
const COMPONENTS = "components";
const DIRECTIVES = "directives";
function resolveComponent(name, maybeSelfReference) {
    return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
function resolveDynamicComponent(component) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(component)) return resolveAsset(COMPONENTS, component, false) || component;
    else return component || NULL_DYNAMIC_COMPONENT;
}
function resolveDirective(name) {
    return resolveAsset(DIRECTIVES, name);
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
    const instance = currentRenderingInstance || currentInstance;
    if (instance) {
        const Component = instance.type;
        if (type === COMPONENTS) {
            const selfName = getComponentName(Component, false);
            if (selfName && (selfName === name || selfName === (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name) || selfName === (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize)((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name)))) return Component;
        }
        const res = // local registration
        // check instance[type] first which is resolved for options API
        resolve(instance[type] || Component[type], name) || // global registration
        resolve(instance.appContext[type], name);
        if (!res && maybeSelfReference) return Component;
        return res;
    }
}
function resolve(registry, name) {
    return registry && (registry[name] || registry[(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name)] || registry[(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize)((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name))]);
}
const isSuspense = (type)=>type.__isSuspense;
let suspenseId = 0;
const SuspenseImpl = {
    name: "Suspense",
    // In order to make Suspense tree-shakable, we need to avoid importing it
    // directly in the renderer. The renderer checks for the __isSuspense flag
    // on a vnode's type and calls the `process` method, passing in renderer
    // internals.
    __isSuspense: true,
    process (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals) {
        if (n1 == null) mountSuspense(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals);
        else {
            if (parentSuspense && parentSuspense.deps > 0) {
                n2.suspense = n1.suspense;
                return;
            }
            patchSuspense(n1, n2, container, anchor, parentComponent, namespace, slotScopeIds, optimized, rendererInternals);
        }
    },
    hydrate: hydrateSuspense,
    create: createSuspenseBoundary,
    normalize: normalizeSuspenseChildren
};
const Suspense = SuspenseImpl;
function triggerEvent(vnode, name) {
    const eventListener = vnode.props && vnode.props[name];
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(eventListener)) eventListener();
}
function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals) {
    const { p: patch, o: { createElement } } = rendererInternals;
    const hiddenContainer = createElement("div");
    const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, namespace, slotScopeIds, optimized, rendererInternals);
    patch(null, suspense.pendingBranch = vnode.ssContent, hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds);
    if (suspense.deps > 0) {
        triggerEvent(vnode, "onPending");
        triggerEvent(vnode, "onFallback");
        patch(null, vnode.ssFallback, container, anchor, parentComponent, null, // fallback tree will not have suspense context
        namespace, slotScopeIds);
        setActiveBranch(suspense, vnode.ssFallback);
    } else suspense.resolve(false, true);
}
function patchSuspense(n1, n2, container, anchor, parentComponent, namespace, slotScopeIds, optimized, { p: patch, um: unmount, o: { createElement } }) {
    const suspense = n2.suspense = n1.suspense;
    suspense.vnode = n2;
    n2.el = n1.el;
    const newBranch = n2.ssContent;
    const newFallback = n2.ssFallback;
    const { activeBranch, pendingBranch, isInFallback, isHydrating } = suspense;
    if (pendingBranch) {
        suspense.pendingBranch = newBranch;
        if (isSameVNodeType(newBranch, pendingBranch)) {
            patch(pendingBranch, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
            if (suspense.deps <= 0) suspense.resolve();
            else if (isInFallback) {
                if (!isHydrating) {
                    patch(activeBranch, newFallback, container, anchor, parentComponent, null, // fallback tree will not have suspense context
                    namespace, slotScopeIds, optimized);
                    setActiveBranch(suspense, newFallback);
                }
            }
        } else {
            suspense.pendingId = suspenseId++;
            if (isHydrating) {
                suspense.isHydrating = false;
                suspense.activeBranch = pendingBranch;
            } else unmount(pendingBranch, parentComponent, suspense);
            suspense.deps = 0;
            suspense.effects.length = 0;
            suspense.hiddenContainer = createElement("div");
            if (isInFallback) {
                patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
                if (suspense.deps <= 0) suspense.resolve();
                else {
                    patch(activeBranch, newFallback, container, anchor, parentComponent, null, // fallback tree will not have suspense context
                    namespace, slotScopeIds, optimized);
                    setActiveBranch(suspense, newFallback);
                }
            } else if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
                patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, namespace, slotScopeIds, optimized);
                suspense.resolve(true);
            } else {
                patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
                if (suspense.deps <= 0) suspense.resolve();
            }
        }
    } else if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
        patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, namespace, slotScopeIds, optimized);
        setActiveBranch(suspense, newBranch);
    } else {
        triggerEvent(n2, "onPending");
        suspense.pendingBranch = newBranch;
        if (newBranch.shapeFlag & 512) suspense.pendingId = newBranch.component.suspenseId;
        else suspense.pendingId = suspenseId++;
        patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
        if (suspense.deps <= 0) suspense.resolve();
        else {
            const { timeout, pendingId } = suspense;
            if (timeout > 0) setTimeout(()=>{
                if (suspense.pendingId === pendingId) suspense.fallback(newFallback);
            }, timeout);
            else if (timeout === 0) suspense.fallback(newFallback);
        }
    }
}
let hasWarned = false;
function createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, namespace, slotScopeIds, optimized, rendererInternals, isHydrating = false) {
    const { p: patch, m: move, um: unmount, n: next, o: { parentNode, remove } } = rendererInternals;
    let parentSuspenseId;
    const isSuspensible = isVNodeSuspensible(vnode);
    if (isSuspensible) {
        if (parentSuspense == null ? void 0 : parentSuspense.pendingBranch) {
            parentSuspenseId = parentSuspense.pendingId;
            parentSuspense.deps++;
        }
    }
    const timeout = vnode.props ? (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.toNumber)(vnode.props.timeout) : void 0;
    const initialAnchor = anchor;
    const suspense = {
        vnode,
        parent: parentSuspense,
        parentComponent,
        namespace,
        container,
        hiddenContainer,
        deps: 0,
        pendingId: suspenseId++,
        timeout: typeof timeout === "number" ? timeout : -1,
        activeBranch: null,
        pendingBranch: null,
        isInFallback: !isHydrating,
        isHydrating,
        isUnmounted: false,
        effects: [],
        resolve (resume = false, sync = false) {
            const { vnode: vnode2, activeBranch, pendingBranch, pendingId, effects, parentComponent: parentComponent2, container: container2 } = suspense;
            let delayEnter = false;
            if (suspense.isHydrating) suspense.isHydrating = false;
            else if (!resume) {
                delayEnter = activeBranch && pendingBranch.transition && pendingBranch.transition.mode === "out-in";
                if (delayEnter) activeBranch.transition.afterLeave = ()=>{
                    if (pendingId === suspense.pendingId) {
                        move(pendingBranch, container2, anchor === initialAnchor ? next(activeBranch) : anchor, 0);
                        queuePostFlushCb(effects);
                    }
                };
                if (activeBranch) {
                    if (parentNode(activeBranch.el) !== suspense.hiddenContainer) anchor = next(activeBranch);
                    unmount(activeBranch, parentComponent2, suspense, true);
                }
                if (!delayEnter) move(pendingBranch, container2, anchor, 0);
            }
            setActiveBranch(suspense, pendingBranch);
            suspense.pendingBranch = null;
            suspense.isInFallback = false;
            let parent = suspense.parent;
            let hasUnresolvedAncestor = false;
            while(parent){
                if (parent.pendingBranch) {
                    parent.effects.push(...effects);
                    hasUnresolvedAncestor = true;
                    break;
                }
                parent = parent.parent;
            }
            if (!hasUnresolvedAncestor && !delayEnter) queuePostFlushCb(effects);
            suspense.effects = [];
            if (isSuspensible) {
                if (parentSuspense && parentSuspense.pendingBranch && parentSuspenseId === parentSuspense.pendingId) {
                    parentSuspense.deps--;
                    if (parentSuspense.deps === 0 && !sync) parentSuspense.resolve();
                }
            }
            triggerEvent(vnode2, "onResolve");
        },
        fallback (fallbackVNode) {
            if (!suspense.pendingBranch) return;
            const { vnode: vnode2, activeBranch, parentComponent: parentComponent2, container: container2, namespace: namespace2 } = suspense;
            triggerEvent(vnode2, "onFallback");
            const anchor2 = next(activeBranch);
            const mountFallback = ()=>{
                if (!suspense.isInFallback) return;
                patch(null, fallbackVNode, container2, anchor2, parentComponent2, null, // fallback tree will not have suspense context
                namespace2, slotScopeIds, optimized);
                setActiveBranch(suspense, fallbackVNode);
            };
            const delayEnter = fallbackVNode.transition && fallbackVNode.transition.mode === "out-in";
            if (delayEnter) activeBranch.transition.afterLeave = mountFallback;
            suspense.isInFallback = true;
            unmount(activeBranch, parentComponent2, null, // no suspense so unmount hooks fire now
            true);
            if (!delayEnter) mountFallback();
        },
        move (container2, anchor2, type) {
            suspense.activeBranch && move(suspense.activeBranch, container2, anchor2, type);
            suspense.container = container2;
        },
        next () {
            return suspense.activeBranch && next(suspense.activeBranch);
        },
        registerDep (instance, setupRenderEffect) {
            const isInPendingSuspense = !!suspense.pendingBranch;
            if (isInPendingSuspense) suspense.deps++;
            const hydratedEl = instance.vnode.el;
            instance.asyncDep.catch((err)=>{
                handleError(err, instance, 0);
            }).then((asyncSetupResult)=>{
                if (instance.isUnmounted || suspense.isUnmounted || suspense.pendingId !== instance.suspenseId) return;
                instance.asyncResolved = true;
                const { vnode: vnode2 } = instance;
                handleSetupResult(instance, asyncSetupResult, false);
                if (hydratedEl) vnode2.el = hydratedEl;
                const placeholder = !hydratedEl && instance.subTree.el;
                setupRenderEffect(instance, vnode2, // component may have been moved before resolve.
                // if this is not a hydration, instance.subTree will be the comment
                // placeholder.
                parentNode(hydratedEl || instance.subTree.el), // anchor will not be used if this is hydration, so only need to
                // consider the comment placeholder case.
                hydratedEl ? null : next(instance.subTree), suspense, namespace, optimized);
                if (placeholder) remove(placeholder);
                updateHOCHostEl(instance, vnode2.el);
                if (isInPendingSuspense && --suspense.deps === 0) suspense.resolve();
            });
        },
        unmount (parentSuspense2, doRemove) {
            suspense.isUnmounted = true;
            if (suspense.activeBranch) unmount(suspense.activeBranch, parentComponent, parentSuspense2, doRemove);
            if (suspense.pendingBranch) unmount(suspense.pendingBranch, parentComponent, parentSuspense2, doRemove);
        }
    };
    return suspense;
}
function hydrateSuspense(node, vnode, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals, hydrateNode) {
    const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, node.parentNode, // eslint-disable-next-line no-restricted-globals
    document.createElement("div"), null, namespace, slotScopeIds, optimized, rendererInternals, true);
    const result = hydrateNode(node, suspense.pendingBranch = vnode.ssContent, parentComponent, suspense, slotScopeIds, optimized);
    if (suspense.deps === 0) suspense.resolve(false, true);
    return result;
}
function normalizeSuspenseChildren(vnode) {
    const { shapeFlag, children } = vnode;
    const isSlotChildren = shapeFlag & 32;
    vnode.ssContent = normalizeSuspenseSlot(isSlotChildren ? children.default : children);
    vnode.ssFallback = isSlotChildren ? normalizeSuspenseSlot(children.fallback) : createVNode(Comment);
}
function normalizeSuspenseSlot(s) {
    let block;
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(s)) {
        const trackBlock = isBlockTreeEnabled && s._c;
        if (trackBlock) {
            s._d = false;
            openBlock();
        }
        s = s();
        if (trackBlock) {
            s._d = true;
            block = currentBlock;
            closeBlock();
        }
    }
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(s)) {
        const singleChild = filterSingleRoot(s);
        s = singleChild;
    }
    s = normalizeVNode(s);
    if (block && !s.dynamicChildren) s.dynamicChildren = block.filter((c)=>c !== s);
    return s;
}
function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(fn)) suspense.effects.push(...fn);
        else suspense.effects.push(fn);
    } else queuePostFlushCb(fn);
}
function setActiveBranch(suspense, branch) {
    suspense.activeBranch = branch;
    const { vnode, parentComponent } = suspense;
    let el = branch.el;
    while(!el && branch.component){
        branch = branch.component.subTree;
        el = branch.el;
    }
    vnode.el = el;
    if (parentComponent && parentComponent.subTree === vnode) {
        parentComponent.vnode.el = el;
        updateHOCHostEl(parentComponent, el);
    }
}
function isVNodeSuspensible(vnode) {
    var _a;
    return ((_a = vnode.props) == null ? void 0 : _a.suspensible) != null && vnode.props.suspensible !== false;
}
const ssrContextKey = Symbol.for("v-scx");
const useSSRContext = ()=>{
    {
        const ctx = inject(ssrContextKey);
        ctx;
        return ctx;
    }
};
function watchEffect(effect, options) {
    return doWatch(effect, null, options);
}
function watchPostEffect(effect, options) {
    return doWatch(effect, null, {
        flush: "post"
    });
}
function watchSyncEffect(effect, options) {
    return doWatch(effect, null, {
        flush: "sync"
    });
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
    return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
    if (cb && once) {
        const _cb = cb;
        cb = (...args)=>{
            _cb(...args);
            unwatch();
        };
    }
    const warnInvalidSource = (s)=>{
        warn$1(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`);
    };
    const instance = currentInstance;
    const reactiveGetter = (source2)=>deep === true ? source2 : // for deep: false, only traverse root-level properties
        traverse(source2, deep === false ? 1 : void 0);
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(source)) {
        getter = ()=>source.value;
        forceTrigger = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isShallow)(source);
    } else if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive)(source)) {
        getter = ()=>reactiveGetter(source);
        forceTrigger = true;
    } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(source)) {
        isMultiSource = true;
        forceTrigger = source.some((s)=>(0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive)(s) || (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isShallow)(s));
        getter = ()=>source.map((s)=>{
                if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(s)) return s.value;
                else if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive)(s)) return reactiveGetter(s);
                else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(s)) return callWithErrorHandling(s, instance, 2);
            });
    } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(source)) {
        if (cb) getter = ()=>callWithErrorHandling(source, instance, 2);
        else getter = ()=>{
            if (cleanup) cleanup();
            return callWithAsyncErrorHandling(source, instance, 3, [
                onCleanup
            ]);
        };
    } else getter = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
    if (cb && deep) {
        const baseGetter = getter;
        getter = ()=>traverse(baseGetter());
    }
    let cleanup;
    let onCleanup = (fn)=>{
        cleanup = effect.onStop = ()=>{
            callWithErrorHandling(fn, instance, 4);
            cleanup = effect.onStop = void 0;
        };
    };
    let ssrCleanup;
    if (isInSSRComponentSetup) {
        onCleanup = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
        if (!cb) getter();
        else if (immediate) callWithAsyncErrorHandling(cb, instance, 3, [
            getter(),
            isMultiSource ? [] : void 0,
            onCleanup
        ]);
        if (flush === "sync") {
            const ctx = useSSRContext();
            ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
        } else return _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
    }
    let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
    const job = ()=>{
        if (!effect.active || !effect.dirty) return;
        if (cb) {
            const newValue = effect.run();
            if (deep || forceTrigger || (isMultiSource ? newValue.some((v1, i)=>(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(v1, oldValue[i])) : (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(newValue, oldValue)) || false) {
                if (cleanup) cleanup();
                callWithAsyncErrorHandling(cb, instance, 3, [
                    newValue,
                    // pass undefined as the old value when it's changed for the first time
                    oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
                    onCleanup
                ]);
                oldValue = newValue;
            }
        } else effect.run();
    };
    job.allowRecurse = !!cb;
    let scheduler;
    if (flush === "sync") scheduler = job;
    else if (flush === "post") scheduler = ()=>queuePostRenderEffect(job, instance && instance.suspense);
    else {
        job.pre = true;
        if (instance) job.id = instance.uid;
        scheduler = ()=>queueJob(job);
    }
    const effect = new _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ReactiveEffect(getter, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP, scheduler);
    const scope = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)();
    const unwatch = ()=>{
        effect.stop();
        if (scope) (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.remove)(scope.effects, effect);
    };
    if (cb) {
        if (immediate) job();
        else oldValue = effect.run();
    } else if (flush === "post") queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
    else effect.run();
    if (ssrCleanup) ssrCleanup.push(unwatch);
    return unwatch;
}
function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(source) ? source.includes(".") ? createPathGetter(publicThis, source) : ()=>publicThis[source] : source.bind(publicThis, publicThis);
    let cb;
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value)) cb = value;
    else {
        cb = value.handler;
        options = value;
    }
    const reset = setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    reset();
    return res;
}
function createPathGetter(ctx, path) {
    const segments = path.split(".");
    return ()=>{
        let cur = ctx;
        for(let i = 0; i < segments.length && cur; i++)cur = cur[segments[i]];
        return cur;
    };
}
function traverse(value, depth, currentDepth = 0, seen) {
    if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(value) || value["__v_skip"]) return value;
    if (depth && depth > 0) {
        if (currentDepth >= depth) return value;
        currentDepth++;
    }
    seen = seen || /* @__PURE__ */ new Set();
    if (seen.has(value)) return value;
    seen.add(value);
    if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(value)) traverse(value.value, depth, currentDepth, seen);
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value)) for(let i = 0; i < value.length; i++)traverse(value[i], depth, currentDepth, seen);
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSet)(value) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isMap)(value)) value.forEach((v1)=>{
        traverse(v1, depth, currentDepth, seen);
    });
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPlainObject)(value)) for(const key in value)traverse(value[key], depth, currentDepth, seen);
    return value;
}
function validateDirectiveName(name) {
    if (isBuiltInDirective(name)) warn$1("Do not use built-in directive ids as custom directive id: " + name);
}
function withDirectives(vnode, directives) {
    if (currentRenderingInstance === null) return vnode;
    const instance = getExposeProxy(currentRenderingInstance) || currentRenderingInstance.proxy;
    const bindings = vnode.dirs || (vnode.dirs = []);
    for(let i = 0; i < directives.length; i++){
        let [dir, value, arg, modifiers = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ] = directives[i];
        if (dir) {
            if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(dir)) dir = {
                mounted: dir,
                updated: dir
            };
            if (dir.deep) traverse(value);
            bindings.push({
                dir,
                instance,
                value,
                oldValue: void 0,
                arg,
                modifiers
            });
        }
    }
    return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
    const bindings = vnode.dirs;
    const oldBindings = prevVNode && prevVNode.dirs;
    for(let i = 0; i < bindings.length; i++){
        const binding = bindings[i];
        if (oldBindings) binding.oldValue = oldBindings[i].value;
        let hook = binding.dir[name];
        if (hook) {
            (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
            callWithAsyncErrorHandling(hook, instance, 8, [
                vnode.el,
                binding,
                vnode,
                prevVNode
            ]);
            (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
        }
    }
}
const leaveCbKey = Symbol("_leaveCb");
const enterCbKey = Symbol("_enterCb");
function useTransitionState() {
    const state = {
        isMounted: false,
        isLeaving: false,
        isUnmounting: false,
        leavingVNodes: /* @__PURE__ */ new Map()
    };
    onMounted(()=>{
        state.isMounted = true;
    });
    onBeforeUnmount(()=>{
        state.isUnmounting = true;
    });
    return state;
}
const TransitionHookValidator = [
    Function,
    Array
];
const BaseTransitionPropsValidators = {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    // enter
    onBeforeEnter: TransitionHookValidator,
    onEnter: TransitionHookValidator,
    onAfterEnter: TransitionHookValidator,
    onEnterCancelled: TransitionHookValidator,
    // leave
    onBeforeLeave: TransitionHookValidator,
    onLeave: TransitionHookValidator,
    onAfterLeave: TransitionHookValidator,
    onLeaveCancelled: TransitionHookValidator,
    // appear
    onBeforeAppear: TransitionHookValidator,
    onAppear: TransitionHookValidator,
    onAfterAppear: TransitionHookValidator,
    onAppearCancelled: TransitionHookValidator
};
const BaseTransitionImpl = {
    name: `BaseTransition`,
    props: BaseTransitionPropsValidators,
    setup (props, { slots }) {
        const instance = getCurrentInstance();
        const state = useTransitionState();
        let prevTransitionKey;
        return ()=>{
            const children = slots.default && getTransitionRawChildren(slots.default(), true);
            if (!children || !children.length) return;
            let child = children[0];
            if (children.length > 1) {
                let hasFound = false;
                for (const c of children)if (c.type !== Comment) {
                    child = c;
                    hasFound = true;
                    break;
                }
            }
            const rawProps = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props);
            const { mode } = rawProps;
            if (state.isLeaving) return emptyPlaceholder(child);
            const innerChild = getKeepAliveChild(child);
            if (!innerChild) return emptyPlaceholder(child);
            const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
            setTransitionHooks(innerChild, enterHooks);
            const oldChild = instance.subTree;
            const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
            let transitionKeyChanged = false;
            const { getTransitionKey } = innerChild.type;
            if (getTransitionKey) {
                const key = getTransitionKey();
                if (prevTransitionKey === void 0) prevTransitionKey = key;
                else if (key !== prevTransitionKey) {
                    prevTransitionKey = key;
                    transitionKeyChanged = true;
                }
            }
            if (oldInnerChild && oldInnerChild.type !== Comment && (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
                const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
                setTransitionHooks(oldInnerChild, leavingHooks);
                if (mode === "out-in") {
                    state.isLeaving = true;
                    leavingHooks.afterLeave = ()=>{
                        state.isLeaving = false;
                        if (instance.update.active !== false) {
                            instance.effect.dirty = true;
                            instance.update();
                        }
                    };
                    return emptyPlaceholder(child);
                } else if (mode === "in-out" && innerChild.type !== Comment) leavingHooks.delayLeave = (el, earlyRemove, delayedLeave)=>{
                    const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
                    leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
                    el[leaveCbKey] = ()=>{
                        earlyRemove();
                        el[leaveCbKey] = void 0;
                        delete enterHooks.delayedLeave;
                    };
                    enterHooks.delayedLeave = delayedLeave;
                };
            }
            return child;
        };
    }
};
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
    const { leavingVNodes } = state;
    let leavingVNodesCache = leavingVNodes.get(vnode.type);
    if (!leavingVNodesCache) {
        leavingVNodesCache = /* @__PURE__ */ Object.create(null);
        leavingVNodes.set(vnode.type, leavingVNodesCache);
    }
    return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance) {
    const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
    const key = String(vnode.key);
    const leavingVNodesCache = getLeavingNodesForType(state, vnode);
    const callHook = (hook, args)=>{
        hook && callWithAsyncErrorHandling(hook, instance, 9, args);
    };
    const callAsyncHook = (hook, args)=>{
        const done = args[1];
        callHook(hook, args);
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook)) {
            if (hook.every((hook2)=>hook2.length <= 1)) done();
        } else if (hook.length <= 1) done();
    };
    const hooks = {
        mode,
        persisted,
        beforeEnter (el) {
            let hook = onBeforeEnter;
            if (!state.isMounted) {
                if (appear) hook = onBeforeAppear || onBeforeEnter;
                else return;
            }
            if (el[leaveCbKey]) el[leaveCbKey](true);
            const leavingVNode = leavingVNodesCache[key];
            if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) leavingVNode.el[leaveCbKey]();
            callHook(hook, [
                el
            ]);
        },
        enter (el) {
            let hook = onEnter;
            let afterHook = onAfterEnter;
            let cancelHook = onEnterCancelled;
            if (!state.isMounted) {
                if (appear) {
                    hook = onAppear || onEnter;
                    afterHook = onAfterAppear || onAfterEnter;
                    cancelHook = onAppearCancelled || onEnterCancelled;
                } else return;
            }
            let called = false;
            const done = el[enterCbKey] = (cancelled)=>{
                if (called) return;
                called = true;
                if (cancelled) callHook(cancelHook, [
                    el
                ]);
                else callHook(afterHook, [
                    el
                ]);
                if (hooks.delayedLeave) hooks.delayedLeave();
                el[enterCbKey] = void 0;
            };
            if (hook) callAsyncHook(hook, [
                el,
                done
            ]);
            else done();
        },
        leave (el, remove) {
            const key2 = String(vnode.key);
            if (el[enterCbKey]) el[enterCbKey](true);
            if (state.isUnmounting) return remove();
            callHook(onBeforeLeave, [
                el
            ]);
            let called = false;
            const done = el[leaveCbKey] = (cancelled)=>{
                if (called) return;
                called = true;
                remove();
                if (cancelled) callHook(onLeaveCancelled, [
                    el
                ]);
                else callHook(onAfterLeave, [
                    el
                ]);
                el[leaveCbKey] = void 0;
                if (leavingVNodesCache[key2] === vnode) delete leavingVNodesCache[key2];
            };
            leavingVNodesCache[key2] = vnode;
            if (onLeave) callAsyncHook(onLeave, [
                el,
                done
            ]);
            else done();
        },
        clone (vnode2) {
            return resolveTransitionHooks(vnode2, props, state, instance);
        }
    };
    return hooks;
}
function emptyPlaceholder(vnode) {
    if (isKeepAlive(vnode)) {
        vnode = cloneVNode(vnode);
        vnode.children = null;
        return vnode;
    }
}
function getKeepAliveChild(vnode) {
    return isKeepAlive(vnode) ? vnode.children ? vnode.children[0] : void 0 : vnode;
}
function setTransitionHooks(vnode, hooks) {
    if (vnode.shapeFlag & 6 && vnode.component) setTransitionHooks(vnode.component.subTree, hooks);
    else if (vnode.shapeFlag & 128) {
        vnode.ssContent.transition = hooks.clone(vnode.ssContent);
        vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
    } else vnode.transition = hooks;
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
    let ret = [];
    let keyedFragmentCount = 0;
    for(let i = 0; i < children.length; i++){
        let child = children[i];
        const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
        if (child.type === Fragment) {
            if (child.patchFlag & 128) keyedFragmentCount++;
            ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
        } else if (keepComment || child.type !== Comment) ret.push(key != null ? cloneVNode(child, {
            key
        }) : child);
    }
    if (keyedFragmentCount > 1) for(let i = 0; i < ret.length; i++)ret[i].patchFlag = -2;
    return ret;
}
/*! #__NO_SIDE_EFFECTS__ */ // @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
    return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(options) ? // #8326: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (()=>(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({
            name: options.name
        }, extraOptions, {
            setup: options
        }))() : options;
}
const isAsyncWrapper = (i)=>!!i.type.__asyncLoader;
/*! #__NO_SIDE_EFFECTS__ */ // @__NO_SIDE_EFFECTS__
function defineAsyncComponent(source) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(source)) source = {
        loader: source
    };
    const { loader, loadingComponent, errorComponent, delay = 200, timeout, // undefined = never times out
    suspensible = true, onError: userOnError } = source;
    let pendingRequest = null;
    let resolvedComp;
    let retries = 0;
    const retry = ()=>{
        retries++;
        pendingRequest = null;
        return load();
    };
    const load = ()=>{
        let thisRequest;
        return pendingRequest || (thisRequest = pendingRequest = loader().catch((err)=>{
            err = err instanceof Error ? err : new Error(String(err));
            if (userOnError) return new Promise((resolve, reject)=>{
                const userRetry = ()=>resolve(retry());
                const userFail = ()=>reject(err);
                userOnError(err, userRetry, userFail, retries + 1);
            });
            else throw err;
        }).then((comp)=>{
            if (thisRequest !== pendingRequest && pendingRequest) return pendingRequest;
            if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) comp = comp.default;
            resolvedComp = comp;
            return comp;
        }));
    };
    return defineComponent({
        name: "AsyncComponentWrapper",
        __asyncLoader: load,
        get __asyncResolved () {
            return resolvedComp;
        },
        setup () {
            const instance = currentInstance;
            if (resolvedComp) return ()=>createInnerComp(resolvedComp, instance);
            const onError = (err)=>{
                pendingRequest = null;
                handleError(err, instance, 13, !errorComponent);
            };
            if (suspensible && instance.suspense || isInSSRComponentSetup) return load().then((comp)=>{
                return ()=>createInnerComp(comp, instance);
            }).catch((err)=>{
                onError(err);
                return ()=>errorComponent ? createVNode(errorComponent, {
                        error: err
                    }) : null;
            });
            const loaded = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ref)(false);
            const error = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ref)();
            const delayed = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ref)(!!delay);
            if (delay) setTimeout(()=>{
                delayed.value = false;
            }, delay);
            if (timeout != null) setTimeout(()=>{
                if (!loaded.value && !error.value) {
                    const err = new Error(`Async component timed out after ${timeout}ms.`);
                    onError(err);
                    error.value = err;
                }
            }, timeout);
            load().then(()=>{
                loaded.value = true;
                if (instance.parent && isKeepAlive(instance.parent.vnode)) {
                    instance.parent.effect.dirty = true;
                    queueJob(instance.parent.update);
                }
            }).catch((err)=>{
                onError(err);
                error.value = err;
            });
            return ()=>{
                if (loaded.value && resolvedComp) return createInnerComp(resolvedComp, instance);
                else if (error.value && errorComponent) return createVNode(errorComponent, {
                    error: error.value
                });
                else if (loadingComponent && !delayed.value) return createVNode(loadingComponent);
            };
        }
    });
}
function createInnerComp(comp, parent) {
    const { ref: ref2, props, children, ce } = parent.vnode;
    const vnode = createVNode(comp, props, children);
    vnode.ref = ref2;
    vnode.ce = ce;
    delete parent.vnode.ce;
    return vnode;
}
const isKeepAlive = (vnode)=>vnode.type.__isKeepAlive;
const KeepAliveImpl = {
    name: `KeepAlive`,
    // Marker for special handling inside the renderer. We are not using a ===
    // check directly on KeepAlive in the renderer, because importing it directly
    // would prevent it from being tree-shaken.
    __isKeepAlive: true,
    props: {
        include: [
            String,
            RegExp,
            Array
        ],
        exclude: [
            String,
            RegExp,
            Array
        ],
        max: [
            String,
            Number
        ]
    },
    setup (props, { slots }) {
        const instance = getCurrentInstance();
        const sharedContext = instance.ctx;
        if (!sharedContext.renderer) return ()=>{
            const children = slots.default && slots.default();
            return children && children.length === 1 ? children[0] : children;
        };
        const cache = /* @__PURE__ */ new Map();
        const keys = /* @__PURE__ */ new Set();
        let current = null;
        if (__VUE_PROD_DEVTOOLS__) instance.__v_cache = cache;
        const parentSuspense = instance.suspense;
        const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext;
        const storageContainer = createElement("div");
        sharedContext.activate = (vnode, container, anchor, namespace, optimized)=>{
            const instance2 = vnode.component;
            move(vnode, container, anchor, 0, parentSuspense);
            patch(instance2.vnode, vnode, container, anchor, instance2, parentSuspense, namespace, vnode.slotScopeIds, optimized);
            queuePostRenderEffect(()=>{
                instance2.isDeactivated = false;
                if (instance2.a) (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(instance2.a);
                const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
                if (vnodeHook) invokeVNodeHook(vnodeHook, instance2.parent, vnode);
            }, parentSuspense);
            if (__VUE_PROD_DEVTOOLS__) devtoolsComponentAdded(instance2);
        };
        sharedContext.deactivate = (vnode)=>{
            const instance2 = vnode.component;
            move(vnode, storageContainer, null, 1, parentSuspense);
            queuePostRenderEffect(()=>{
                if (instance2.da) (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(instance2.da);
                const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
                if (vnodeHook) invokeVNodeHook(vnodeHook, instance2.parent, vnode);
                instance2.isDeactivated = true;
            }, parentSuspense);
            if (__VUE_PROD_DEVTOOLS__) devtoolsComponentAdded(instance2);
        };
        function unmount(vnode) {
            resetShapeFlag(vnode);
            _unmount(vnode, instance, parentSuspense, true);
        }
        function pruneCache(filter) {
            cache.forEach((vnode, key)=>{
                const name = getComponentName(vnode.type);
                if (name && (!filter || !filter(name))) pruneCacheEntry(key);
            });
        }
        function pruneCacheEntry(key) {
            const cached = cache.get(key);
            if (!current || !isSameVNodeType(cached, current)) unmount(cached);
            else if (current) resetShapeFlag(current);
            cache.delete(key);
            keys.delete(key);
        }
        watch(()=>[
                props.include,
                props.exclude
            ], ([include, exclude])=>{
            include && pruneCache((name)=>matches(include, name));
            exclude && pruneCache((name)=>!matches(exclude, name));
        }, // prune post-render after `current` has been updated
        {
            flush: "post",
            deep: true
        });
        let pendingCacheKey = null;
        const cacheSubtree = ()=>{
            if (pendingCacheKey != null) cache.set(pendingCacheKey, getInnerChild(instance.subTree));
        };
        onMounted(cacheSubtree);
        onUpdated(cacheSubtree);
        onBeforeUnmount(()=>{
            cache.forEach((cached)=>{
                const { subTree, suspense } = instance;
                const vnode = getInnerChild(subTree);
                if (cached.type === vnode.type && cached.key === vnode.key) {
                    resetShapeFlag(vnode);
                    const da = vnode.component.da;
                    da && queuePostRenderEffect(da, suspense);
                    return;
                }
                unmount(cached);
            });
        });
        return ()=>{
            pendingCacheKey = null;
            if (!slots.default) return null;
            const children = slots.default();
            const rawVNode = children[0];
            if (children.length > 1) {
                current = null;
                return children;
            } else if (!isVNode(rawVNode) || !(rawVNode.shapeFlag & 4) && !(rawVNode.shapeFlag & 128)) {
                current = null;
                return rawVNode;
            }
            let vnode = getInnerChild(rawVNode);
            const comp = vnode.type;
            const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp);
            const { include, exclude, max } = props;
            if (include && (!name || !matches(include, name)) || exclude && name && matches(exclude, name)) {
                current = vnode;
                return rawVNode;
            }
            const key = vnode.key == null ? comp : vnode.key;
            const cachedVNode = cache.get(key);
            if (vnode.el) {
                vnode = cloneVNode(vnode);
                if (rawVNode.shapeFlag & 128) rawVNode.ssContent = vnode;
            }
            pendingCacheKey = key;
            if (cachedVNode) {
                vnode.el = cachedVNode.el;
                vnode.component = cachedVNode.component;
                if (vnode.transition) setTransitionHooks(vnode, vnode.transition);
                vnode.shapeFlag |= 512;
                keys.delete(key);
                keys.add(key);
            } else {
                keys.add(key);
                if (max && keys.size > parseInt(max, 10)) pruneCacheEntry(keys.values().next().value);
            }
            vnode.shapeFlag |= 256;
            current = vnode;
            return isSuspense(rawVNode.type) ? rawVNode : vnode;
        };
    }
};
const KeepAlive = KeepAliveImpl;
function matches(pattern, name) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(pattern)) return pattern.some((p)=>matches(p, name));
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(pattern)) return pattern.split(",").includes(name);
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isRegExp)(pattern)) return pattern.test(name);
    return false;
}
function onActivated(hook, target) {
    registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
    registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
    const wrappedHook = hook.__wdc || (hook.__wdc = ()=>{
        let current = target;
        while(current){
            if (current.isDeactivated) return;
            current = current.parent;
        }
        return hook();
    });
    injectHook(type, wrappedHook, target);
    if (target) {
        let current = target.parent;
        while(current && current.parent){
            if (isKeepAlive(current.parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
            current = current.parent;
        }
    }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
    const injected = injectHook(type, hook, keepAliveRoot, true);
    onUnmounted(()=>{
        (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.remove)(keepAliveRoot[type], injected);
    }, target);
}
function resetShapeFlag(vnode) {
    vnode.shapeFlag &= -257;
    vnode.shapeFlag &= -513;
}
function getInnerChild(vnode) {
    return vnode.shapeFlag & 128 ? vnode.ssContent : vnode;
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
    if (target) {
        const hooks = target[type] || (target[type] = []);
        const wrappedHook = hook.__weh || (hook.__weh = (...args)=>{
            if (target.isUnmounted) return;
            (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
            const reset = setCurrentInstance(target);
            const res = callWithAsyncErrorHandling(hook, target, type, args);
            reset();
            (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
            return res;
        });
        if (prepend) hooks.unshift(wrappedHook);
        else hooks.push(wrappedHook);
        return wrappedHook;
    }
}
const createHook = (lifecycle)=>(hook, target = currentInstance)=>// post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
        (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args)=>hook(...args), target);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
    injectHook("ec", hook, target);
}
function renderList(source, renderItem, cache, index) {
    let ret;
    const cached = cache && cache[index];
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(source) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(source)) {
        ret = new Array(source.length);
        for(let i = 0, l = source.length; i < l; i++)ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
    } else if (typeof source === "number") {
        ret = new Array(source);
        for(let i = 0; i < source; i++)ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
    } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(source)) {
        if (source[Symbol.iterator]) ret = Array.from(source, (item, i)=>renderItem(item, i, void 0, cached && cached[i]));
        else {
            const keys = Object.keys(source);
            ret = new Array(keys.length);
            for(let i = 0, l = keys.length; i < l; i++){
                const key = keys[i];
                ret[i] = renderItem(source[key], key, i, cached && cached[i]);
            }
        }
    } else ret = [];
    if (cache) cache[index] = ret;
    return ret;
}
function createSlots(slots, dynamicSlots) {
    for(let i = 0; i < dynamicSlots.length; i++){
        const slot = dynamicSlots[i];
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(slot)) for(let j = 0; j < slot.length; j++)slots[slot[j].name] = slot[j].fn;
        else if (slot) slots[slot.name] = slot.key ? (...args)=>{
            const res = slot.fn(...args);
            if (res) res.key = slot.key;
            return res;
        } : slot.fn;
    }
    return slots;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
    if (currentRenderingInstance.isCE || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.isCE) {
        if (name !== "default") props.name = name;
        return createVNode("slot", props, fallback && fallback());
    }
    let slot = slots[name];
    if (slot && slot._c) slot._d = false;
    openBlock();
    const validSlotContent = slot && ensureValidVNode(slot(props));
    const rendered = createBlock(Fragment, {
        key: props.key || // slot content array of a dynamic conditional slot may have a branch
        // key attached in the `createSlots` helper, respect that
        validSlotContent && validSlotContent.key || `_${name}`
    }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
    if (!noSlotted && rendered.scopeId) rendered.slotScopeIds = [
        rendered.scopeId + "-s"
    ];
    if (slot && slot._c) slot._d = true;
    return rendered;
}
function ensureValidVNode(vnodes) {
    return vnodes.some((child)=>{
        if (!isVNode(child)) return true;
        if (child.type === Comment) return false;
        if (child.type === Fragment && !ensureValidVNode(child.children)) return false;
        return true;
    }) ? vnodes : null;
}
function toHandlers(obj, preserveCaseIfNecessary) {
    const ret = {};
    for(const key in obj)ret[preserveCaseIfNecessary && /[A-Z]/.test(key) ? `on:${key}` : (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(key)] = obj[key];
    return ret;
}
const getPublicInstance = (i)=>{
    if (!i) return null;
    if (isStatefulComponent(i)) return getExposeProxy(i) || i.proxy;
    return getPublicInstance(i.parent);
};
const publicPropertiesMap = // Move PURE marker to new line to workaround compiler discarding it
// due to type annotation
/* @__PURE__ */ (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(/* @__PURE__ */ Object.create(null), {
    $: (i)=>i,
    $el: (i)=>i.vnode.el,
    $data: (i)=>i.data,
    $props: (i)=>(0, i.props),
    $attrs: (i)=>(0, i.attrs),
    $slots: (i)=>(0, i.slots),
    $refs: (i)=>(0, i.refs),
    $parent: (i)=>getPublicInstance(i.parent),
    $root: (i)=>getPublicInstance(i.root),
    $emit: (i)=>i.emit,
    $options: (i)=>__VUE_OPTIONS_API__ ? resolveMergedOptions(i) : i.type,
    $forceUpdate: (i)=>i.f || (i.f = ()=>{
            i.effect.dirty = true;
            queueJob(i.update);
        }),
    $nextTick: (i)=>i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i)=>__VUE_OPTIONS_API__ ? instanceWatch.bind(i) : _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP
});
const isReservedPrefix = (key)=>key === "_" || key === "$";
const hasSetupBinding = (state, key)=>state !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && !state.__isScriptSetup && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(state, key);
const PublicInstanceProxyHandlers = {
    get ({ _: instance }, key) {
        const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
        let normalizedProps;
        if (key[0] !== "$") {
            const n = accessCache[key];
            if (n !== void 0) switch(n){
                case 1 /* SETUP */ :
                    return setupState[key];
                case 2 /* DATA */ :
                    return data[key];
                case 4 /* CONTEXT */ :
                    return ctx[key];
                case 3 /* PROPS */ :
                    return props[key];
            }
            else if (hasSetupBinding(setupState, key)) {
                accessCache[key] = 1 /* SETUP */ ;
                return setupState[key];
            } else if (data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(data, key)) {
                accessCache[key] = 2 /* DATA */ ;
                return data[key];
            } else if (// only cache other properties when instance has declared (thus stable)
            // props
            (normalizedProps = instance.propsOptions[0]) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(normalizedProps, key)) {
                accessCache[key] = 3 /* PROPS */ ;
                return props[key];
            } else if (ctx !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(ctx, key)) {
                accessCache[key] = 4 /* CONTEXT */ ;
                return ctx[key];
            } else if (!__VUE_OPTIONS_API__ || shouldCacheAccess) accessCache[key] = 0 /* OTHER */ ;
        }
        const publicGetter = publicPropertiesMap[key];
        let cssModule, globalProperties;
        if (publicGetter) {
            if (key === "$attrs") (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.track)(instance, "get", key);
            return publicGetter(instance);
        } else if (// css module (injected by vue-loader)
        (cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
        else if (ctx !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(ctx, key)) {
            accessCache[key] = 4 /* CONTEXT */ ;
            return ctx[key];
        } else if (// global properties
        globalProperties = appContext.config.globalProperties, (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(globalProperties, key)) return globalProperties[key];
    },
    set ({ _: instance }, key, value) {
        const { data, setupState, ctx } = instance;
        if (hasSetupBinding(setupState, key)) {
            setupState[key] = value;
            return true;
        } else {
            if (data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(data, key)) {
                data[key] = value;
                return true;
            } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(instance.props, key)) return false;
        }
        if (key[0] === "$" && key.slice(1) in instance) return false;
        else ctx[key] = value;
        return true;
    },
    has ({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
        let normalizedProps;
        return !!accessCache[key] || data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(normalizedProps, key) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(ctx, key) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(publicPropertiesMap, key) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(appContext.config.globalProperties, key);
    },
    defineProperty (target, key, descriptor) {
        if (descriptor.get != null) target._.accessCache[key] = 0;
        else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(descriptor, "value")) this.set(target, key, descriptor.value, null);
        return Reflect.defineProperty(target, key, descriptor);
    }
};
var target;
const RuntimeCompiledPublicInstanceProxyHandlers = /* @__PURE__ */ (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, PublicInstanceProxyHandlers, {
    get (target, key) {
        if (key === Symbol.unscopables) return;
        return PublicInstanceProxyHandlers.get(target, key, target);
    },
    has (_, key) {
        const has = key[0] !== "_" && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isGloballyAllowed)(key);
        return has;
    }
});
function createDevRenderContext(instance) {
    const target = {};
    Object.defineProperty(target, `_`, {
        configurable: true,
        enumerable: false,
        get: ()=>instance
    });
    Object.keys(publicPropertiesMap).forEach((key)=>{
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: false,
            get: ()=>publicPropertiesMap[key](instance),
            // intercepted by the proxy so no need for implementation,
            // but needed to prevent set errors
            set: NOOP
        });
    });
    return target;
}
function exposePropsOnRenderContext(instance) {
    const { ctx, propsOptions: [propsOptions] } = instance;
    if (propsOptions) Object.keys(propsOptions).forEach((key)=>{
        Object.defineProperty(ctx, key, {
            enumerable: true,
            configurable: true,
            get: ()=>instance.props[key],
            set: NOOP
        });
    });
}
function exposeSetupStateOnRenderContext(instance) {
    const { ctx, setupState } = instance;
    Object.keys(toRaw(setupState)).forEach((key)=>{
        if (!setupState.__isScriptSetup) {
            if (isReservedPrefix(key[0])) {
                warn$1(`setup() return property ${JSON.stringify(key)} should not start with "$" or "_" which are reserved prefixes for Vue internals.`);
                return;
            }
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: ()=>setupState[key],
                set: NOOP
            });
        }
    });
}
const warnRuntimeUsage = (method)=>warn$1(`${method}() is a compiler-hint helper that is only usable inside <script setup> of a single file component. Its arguments should be compiled away and passing it at runtime has no effect.`);
function defineProps() {
    return null;
}
function defineEmits() {
    return null;
}
function defineExpose(exposed) {}
function defineOptions(options) {}
function defineSlots() {
    return null;
}
function defineModel() {}
function withDefaults(props, defaults) {
    return null;
}
function useSlots() {
    return getContext().slots;
}
function useAttrs() {
    return getContext().attrs;
}
function getContext() {
    const i = getCurrentInstance();
    return i.setupContext || (i.setupContext = createSetupContext(i));
}
function normalizePropsOrEmits(props) {
    return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(props) ? props.reduce((normalized, p)=>(normalized[p] = null, normalized), {}) : props;
}
function mergeDefaults(raw, defaults) {
    const props = normalizePropsOrEmits(raw);
    for(const key in defaults){
        if (key.startsWith("__skip")) continue;
        let opt = props[key];
        if (opt) {
            if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(opt) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt)) opt = props[key] = {
                type: opt,
                default: defaults[key]
            };
            else opt.default = defaults[key];
        } else if (opt === null) opt = props[key] = {
            default: defaults[key]
        };
        if (opt && defaults[`__skip_${key}`]) opt.skipFactory = true;
    }
    return props;
}
function mergeModels(a, b) {
    if (!a || !b) return a || b;
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(a) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(b)) return a.concat(b);
    return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, normalizePropsOrEmits(a), normalizePropsOrEmits(b));
}
function createPropsRestProxy(props, excludedKeys) {
    const ret = {};
    for(const key in props)if (!excludedKeys.includes(key)) Object.defineProperty(ret, key, {
        enumerable: true,
        get: ()=>props[key]
    });
    return ret;
}
function withAsyncContext(getAwaitable) {
    const ctx = getCurrentInstance();
    let awaitable = getAwaitable();
    unsetCurrentInstance();
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPromise)(awaitable)) awaitable = awaitable.catch((e)=>{
        setCurrentInstance(ctx);
        throw e;
    });
    return [
        awaitable,
        ()=>setCurrentInstance(ctx)
    ];
}
function createDuplicateChecker() {
    const cache = /* @__PURE__ */ Object.create(null);
    return (type, key)=>{
        if (cache[key]) warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
        else cache[key] = type;
    };
}
let shouldCacheAccess = true;
function applyOptions(instance) {
    const options = resolveMergedOptions(instance);
    const publicThis = instance.proxy;
    const ctx = instance.ctx;
    shouldCacheAccess = false;
    if (options.beforeCreate) callHook(options.beforeCreate, instance, "bc");
    const { // state
    data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, // lifecycle
    created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, // public API
    expose, inheritAttrs, // assets
    components, directives, filters } = options;
    const checkDuplicateProperties = null;
    if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
    if (methods) for(const key in methods){
        const methodHandler = methods[key];
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(methodHandler)) ctx[key] = methodHandler.bind(publicThis);
    }
    if (dataOptions) {
        const data = dataOptions.call(publicThis, publicThis);
        if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(data)) ;
        else instance.data = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.reactive)(data);
    }
    shouldCacheAccess = true;
    if (computedOptions) for(const key in computedOptions){
        const opt = computedOptions[key];
        const get = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt) ? opt.bind(publicThis, publicThis) : (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt.get) ? opt.get.bind(publicThis, publicThis) : _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
        const set = !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt.set) ? opt.set.bind(publicThis) : _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
        const c = computed({
            get,
            set
        });
        Object.defineProperty(ctx, key, {
            enumerable: true,
            configurable: true,
            get: ()=>c.value,
            set: (v1)=>c.value = v1
        });
    }
    if (watchOptions) for(const key in watchOptions)createWatcher(watchOptions[key], ctx, publicThis, key);
    if (provideOptions) {
        const provides = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
        Reflect.ownKeys(provides).forEach((key)=>{
            provide(key, provides[key]);
        });
    }
    if (created) callHook(created, instance, "c");
    function registerLifecycleHook(register, hook) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook)) hook.forEach((_hook)=>register(_hook.bind(publicThis)));
        else if (hook) register(hook.bind(publicThis));
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
    registerLifecycleHook(onBeforeUpdate, beforeUpdate);
    registerLifecycleHook(onUpdated, updated);
    registerLifecycleHook(onActivated, activated);
    registerLifecycleHook(onDeactivated, deactivated);
    registerLifecycleHook(onErrorCaptured, errorCaptured);
    registerLifecycleHook(onRenderTracked, renderTracked);
    registerLifecycleHook(onRenderTriggered, renderTriggered);
    registerLifecycleHook(onBeforeUnmount, beforeUnmount);
    registerLifecycleHook(onUnmounted, unmounted);
    registerLifecycleHook(onServerPrefetch, serverPrefetch);
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(expose)) {
        if (expose.length) {
            const exposed = instance.exposed || (instance.exposed = {});
            expose.forEach((key)=>{
                Object.defineProperty(exposed, key, {
                    get: ()=>publicThis[key],
                    set: (val)=>publicThis[key] = val
                });
            });
        } else if (!instance.exposed) instance.exposed = {};
    }
    if (render && instance.render === _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP) instance.render = render;
    if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
    if (components) instance.components = components;
    if (directives) instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(injectOptions)) injectOptions = normalizeInject(injectOptions);
    for(const key in injectOptions){
        const opt = injectOptions[key];
        let injected;
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(opt)) {
            if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
            else injected = inject(opt.from || key);
        } else injected = inject(opt);
        if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(injected)) Object.defineProperty(ctx, key, {
            enumerable: true,
            configurable: true,
            get: ()=>injected.value,
            set: (v1)=>injected.value = v1
        });
        else ctx[key] = injected;
    }
}
function callHook(hook, instance, type) {
    callWithAsyncErrorHandling((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook) ? hook.map((h)=>h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
    const getter = key.includes(".") ? createPathGetter(publicThis, key) : ()=>publicThis[key];
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(raw)) {
        const handler = ctx[raw];
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(handler)) watch(getter, handler);
    } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(raw)) watch(getter, raw.bind(publicThis));
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(raw)) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) raw.forEach((r)=>createWatcher(r, ctx, publicThis, key));
        else {
            const handler = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
            if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(handler)) watch(getter, handler, raw);
        }
    } else ;
}
function resolveMergedOptions(instance) {
    const base = instance.type;
    const { mixins, extends: extendsOptions } = base;
    const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
    const cached = cache.get(base);
    let resolved;
    if (cached) resolved = cached;
    else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
    else {
        resolved = {};
        if (globalMixins.length) globalMixins.forEach((m)=>mergeOptions(resolved, m, optionMergeStrategies, true));
        mergeOptions(resolved, base, optionMergeStrategies);
    }
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(base)) cache.set(base, resolved);
    return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
    const { mixins, extends: extendsOptions } = from;
    if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
    if (mixins) mixins.forEach((m)=>mergeOptions(to, m, strats, true));
    for(const key in from){
        if (asMixin && key === "expose") ;
        else {
            const strat = internalOptionMergeStrats[key] || strats && strats[key];
            to[key] = strat ? strat(to[key], from[key]) : from[key];
        }
    }
    return to;
}
const internalOptionMergeStrats = {
    data: mergeDataFn,
    props: mergeEmitsOrPropsOptions,
    emits: mergeEmitsOrPropsOptions,
    // objects
    methods: mergeObjectOptions,
    computed: mergeObjectOptions,
    // lifecycle
    beforeCreate: mergeAsArray,
    created: mergeAsArray,
    beforeMount: mergeAsArray,
    mounted: mergeAsArray,
    beforeUpdate: mergeAsArray,
    updated: mergeAsArray,
    beforeDestroy: mergeAsArray,
    beforeUnmount: mergeAsArray,
    destroyed: mergeAsArray,
    unmounted: mergeAsArray,
    activated: mergeAsArray,
    deactivated: mergeAsArray,
    errorCaptured: mergeAsArray,
    serverPrefetch: mergeAsArray,
    // assets
    components: mergeObjectOptions,
    directives: mergeObjectOptions,
    // watch
    watch: mergeWatchOptions,
    // provide / inject
    provide: mergeDataFn,
    inject: mergeInject
};
function mergeDataFn(to, from) {
    if (!from) return to;
    if (!to) return from;
    return function mergedDataFn() {
        return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(to) ? to.call(this, this) : to, (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(from) ? from.call(this, this) : from);
    };
}
function mergeInject(to, from) {
    return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) {
        const res = {};
        for(let i = 0; i < raw.length; i++)res[raw[i]] = raw[i];
        return res;
    }
    return raw;
}
function mergeAsArray(to, from) {
    return to ? [
        ...new Set([].concat(to, from))
    ] : from;
}
function mergeObjectOptions(to, from) {
    return to ? (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
    if (to) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(to) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(from)) return [
            .../* @__PURE__ */ new Set([
                ...to,
                ...from
            ])
        ];
        return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(/* @__PURE__ */ Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from != null ? from : {}));
    } else return from;
}
function mergeWatchOptions(to, from) {
    if (!to) return from;
    if (!from) return to;
    const merged = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(/* @__PURE__ */ Object.create(null), to);
    for(const key in from)merged[key] = mergeAsArray(to[key], from[key]);
    return merged;
}
function createAppContext() {
    return {
        app: null,
        config: {
            isNativeTag: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NO,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: void 0,
            warnHandler: void 0,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: /* @__PURE__ */ Object.create(null),
        optionsCache: /* @__PURE__ */ new WeakMap(),
        propsCache: /* @__PURE__ */ new WeakMap(),
        emitsCache: /* @__PURE__ */ new WeakMap()
    };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
    return function createApp(rootComponent, rootProps = null) {
        if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(rootComponent)) rootComponent = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, rootComponent);
        if (rootProps != null && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(rootProps)) rootProps = null;
        const context = createAppContext();
        const installedPlugins = /* @__PURE__ */ new WeakSet();
        let isMounted = false;
        const app = context.app = {
            _uid: uid$1++,
            _component: rootComponent,
            _props: rootProps,
            _container: null,
            _context: context,
            _instance: null,
            version,
            get config () {
                return context.config;
            },
            set config (v){},
            use (plugin, ...options) {
                if (installedPlugins.has(plugin)) ;
                else if (plugin && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(plugin.install)) {
                    installedPlugins.add(plugin);
                    plugin.install(app, ...options);
                } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(plugin)) {
                    installedPlugins.add(plugin);
                    plugin(app, ...options);
                }
                return app;
            },
            mixin (mixin) {
                if (__VUE_OPTIONS_API__) {
                    if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
                }
                return app;
            },
            component (name, component) {
                if (!component) return context.components[name];
                context.components[name] = component;
                return app;
            },
            directive (name, directive) {
                if (!directive) return context.directives[name];
                context.directives[name] = directive;
                return app;
            },
            mount (rootContainer, isHydrate, namespace) {
                if (!isMounted) {
                    const vnode = createVNode(rootComponent, rootProps);
                    vnode.appContext = context;
                    if (namespace === true) namespace = "svg";
                    else if (namespace === false) namespace = void 0;
                    if (isHydrate && hydrate) hydrate(vnode, rootContainer);
                    else render(vnode, rootContainer, namespace);
                    isMounted = true;
                    app._container = rootContainer;
                    rootContainer.__vue_app__ = app;
                    if (__VUE_PROD_DEVTOOLS__) {
                        app._instance = vnode.component;
                        devtoolsInitApp(app, version);
                    }
                    return getExposeProxy(vnode.component) || vnode.component.proxy;
                }
            },
            unmount () {
                if (isMounted) {
                    render(null, app._container);
                    if (__VUE_PROD_DEVTOOLS__) {
                        app._instance = null;
                        devtoolsUnmountApp(app);
                    }
                    delete app._container.__vue_app__;
                }
            },
            provide (key, value) {
                context.provides[key] = value;
                return app;
            },
            runWithContext (fn) {
                currentApp = app;
                try {
                    return fn();
                } finally{
                    currentApp = null;
                }
            }
        };
        return app;
    };
}
let currentApp = null;
function provide(key, value) {
    if (!currentInstance) ;
    else {
        let provides = currentInstance.provides;
        const parentProvides = currentInstance.parent && currentInstance.parent.provides;
        if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
        provides[key] = value;
    }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
    const instance = currentInstance || currentRenderingInstance;
    if (instance || currentApp) {
        const provides = instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : currentApp._context.provides;
        if (provides && key in provides) return provides[key];
        else if (arguments.length > 1) return treatDefaultAsFactory && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    }
}
function hasInjectionContext() {
    return !!(currentInstance || currentRenderingInstance || currentApp);
}
function initProps(instance, rawProps, isStateful, isSSR = false) {
    const props = {};
    const attrs = {};
    (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.def)(attrs, InternalObjectKey, 1);
    instance.propsDefaults = /* @__PURE__ */ Object.create(null);
    setFullProps(instance, rawProps, props, attrs);
    for(const key in instance.propsOptions[0])if (!(key in props)) props[key] = void 0;
    if (isStateful) instance.props = isSSR ? props : (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReactive)(props);
    else if (!instance.type.props) instance.props = attrs;
    else instance.props = props;
    instance.attrs = attrs;
}
function isInHmrContext(instance) {
    while(instance){
        if (instance.type.__hmrId) return true;
        instance = instance.parent;
    }
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
    const { props, attrs, vnode: { patchFlag } } = instance;
    const rawCurrentProps = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props);
    const [options] = instance.propsOptions;
    let hasAttrsChanged = false;
    if (// always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)) {
        if (patchFlag & 8) {
            const propsToUpdate = instance.vnode.dynamicProps;
            for(let i = 0; i < propsToUpdate.length; i++){
                let key = propsToUpdate[i];
                if (isEmitListener(instance.emitsOptions, key)) continue;
                const value = rawProps[key];
                if (options) {
                    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(attrs, key)) {
                        if (value !== attrs[key]) {
                            attrs[key] = value;
                            hasAttrsChanged = true;
                        }
                    } else {
                        const camelizedKey = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key);
                        props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
                    }
                } else if (value !== attrs[key]) {
                    attrs[key] = value;
                    hasAttrsChanged = true;
                }
            }
        }
    } else {
        if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
        let kebabKey;
        for(const key in rawCurrentProps)if (!rawProps || // for camelCase
        !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, key) && ((kebabKey = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key)) === key || !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, kebabKey))) {
            if (options) {
                if (rawPrevProps && (rawPrevProps[key] !== void 0 || // for kebab-case
                rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
            } else delete props[key];
        }
        if (attrs !== rawCurrentProps) {
            for(const key in attrs)if (!rawProps || !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, key) && true) {
                delete attrs[key];
                hasAttrsChanged = true;
            }
        }
    }
    if (hasAttrsChanged) (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.trigger)(instance, "set", "$attrs");
}
function setFullProps(instance, rawProps, props, attrs) {
    const [options, needCastKeys] = instance.propsOptions;
    let hasAttrsChanged = false;
    let rawCastValues;
    if (rawProps) for(let key in rawProps){
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key)) continue;
        const value = rawProps[key];
        let camelKey;
        if (options && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, camelKey = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key))) {
            if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
            else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        } else if (!isEmitListener(instance.emitsOptions, key)) {
            if (!(key in attrs) || value !== attrs[key]) {
                attrs[key] = value;
                hasAttrsChanged = true;
            }
        }
    }
    if (needCastKeys) {
        const rawCurrentProps = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props);
        const castValues = rawCastValues || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        for(let i = 0; i < needCastKeys.length; i++){
            const key = needCastKeys[i];
            props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(castValues, key));
        }
    }
    return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
    const opt = options[key];
    if (opt != null) {
        const hasDefault = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(opt, "default");
        if (hasDefault && value === void 0) {
            const defaultValue = opt.default;
            if (opt.type !== Function && !opt.skipFactory && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(defaultValue)) {
                const { propsDefaults } = instance;
                if (key in propsDefaults) value = propsDefaults[key];
                else {
                    const reset = setCurrentInstance(instance);
                    value = propsDefaults[key] = defaultValue.call(null, props);
                    reset();
                }
            } else value = defaultValue;
        }
        if (opt[0 /* shouldCast */ ]) {
            if (isAbsent && !hasDefault) value = false;
            else if (opt[1 /* shouldCastTrue */ ] && (value === "" || value === (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key))) value = true;
        }
    }
    return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.propsCache;
    const cached = cache.get(comp);
    if (cached) return cached;
    const raw = comp.props;
    const normalized = {};
    const needCastKeys = [];
    let hasExtends = false;
    if (__VUE_OPTIONS_API__ && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(comp)) {
        const extendProps = (raw2)=>{
            hasExtends = true;
            const [props, keys] = normalizePropsOptions(raw2, appContext, true);
            (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(normalized, props);
            if (keys) needCastKeys.push(...keys);
        };
        if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
        if (comp.extends) extendProps(comp.extends);
        if (comp.mixins) comp.mixins.forEach(extendProps);
    }
    if (!raw && !hasExtends) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) cache.set(comp, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR);
        return _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
    }
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) for(let i = 0; i < raw.length; i++){
        const normalizedKey = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(raw[i]);
        if (validatePropName(normalizedKey)) normalized[normalizedKey] = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
    }
    else if (raw) for(const key in raw){
        const normalizedKey = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key);
        if (validatePropName(normalizedKey)) {
            const opt = raw[key];
            const prop = normalized[normalizedKey] = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(opt) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt) ? {
                type: opt
            } : (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, opt);
            if (prop) {
                const booleanIndex = getTypeIndex(Boolean, prop.type);
                const stringIndex = getTypeIndex(String, prop.type);
                prop[0 /* shouldCast */ ] = booleanIndex > -1;
                prop[1 /* shouldCastTrue */ ] = stringIndex < 0 || booleanIndex < stringIndex;
                if (booleanIndex > -1 || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(prop, "default")) needCastKeys.push(normalizedKey);
            }
        }
    }
    const res = [
        normalized,
        needCastKeys
    ];
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) cache.set(comp, res);
    return res;
}
function validatePropName(key) {
    if (key[0] !== "$") return true;
    return false;
}
function getType(ctor) {
    const match = ctor && ctor.toString().match(/^\s*(function|class) (\w+)/);
    return match ? match[2] : ctor === null ? "null" : "";
}
function isSameType(a, b) {
    return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(expectedTypes)) return expectedTypes.findIndex((t)=>isSameType(t, type));
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(expectedTypes)) return isSameType(expectedTypes, type) ? 0 : -1;
    return -1;
}
function validateProps(rawProps, props, instance) {
    const resolvedValues = toRaw(props);
    const options = instance.propsOptions[0];
    for(const key in options){
        let opt = options[key];
        if (opt == null) continue;
        validateProp(key, resolvedValues[key], opt, resolvedValues, !hasOwn(rawProps, key) && !hasOwn(rawProps, hyphenate(key)));
    }
}
function validateProp(name, value, prop, props, isAbsent) {
    const { type, required, validator, skipCheck } = prop;
    if (required && isAbsent) {
        warn$1('Missing required prop: "' + name + '"');
        return;
    }
    if (value == null && !required) return;
    if (type != null && type !== true && !skipCheck) {
        let isValid = false;
        const types = isArray(type) ? type : [
            type
        ];
        const expectedTypes = [];
        for(let i = 0; i < types.length && !isValid; i++){
            const { valid, expectedType } = assertType(value, types[i]);
            expectedTypes.push(expectedType || "");
            isValid = valid;
        }
        if (!isValid) {
            warn$1(getInvalidTypeMessage(name, value, expectedTypes));
            return;
        }
    }
    if (validator && !validator(value, props)) warn$1('Invalid prop: custom validator check failed for prop "' + name + '".');
}
const isSimpleType = /* @__PURE__ */ (/* unused pure expression or super */ null && ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.makeMap)("String,Number,Boolean,Function,Symbol,BigInt")));
function assertType(value, type) {
    let valid;
    const expectedType = getType(type);
    if (isSimpleType(expectedType)) {
        const t = typeof value;
        valid = t === expectedType.toLowerCase();
        if (!valid && t === "object") valid = value instanceof type;
    } else if (expectedType === "Object") valid = isObject(value);
    else if (expectedType === "Array") valid = isArray(value);
    else if (expectedType === "null") valid = value === null;
    else valid = value instanceof type;
    return {
        valid,
        expectedType
    };
}
function getInvalidTypeMessage(name, value, expectedTypes) {
    if (expectedTypes.length === 0) return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
    let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
    const expectedType = expectedTypes[0];
    const receivedType = toRawType(value);
    const expectedValue = styleValue(value, expectedType);
    const receivedValue = styleValue(value, receivedType);
    if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) message += ` with value ${expectedValue}`;
    message += `, got ${receivedType} `;
    if (isExplicable(receivedType)) message += `with value ${receivedValue}.`;
    return message;
}
function styleValue(value, type) {
    if (type === "String") return `"${value}"`;
    else if (type === "Number") return `${Number(value)}`;
    else return `${value}`;
}
function isExplicable(type) {
    const explicitTypes = [
        "string",
        "number",
        "boolean"
    ];
    return explicitTypes.some((elem)=>type.toLowerCase() === elem);
}
function isBoolean(...args) {
    return args.some((elem)=>elem.toLowerCase() === "boolean");
}
const isInternalKey = (key)=>key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value)=>(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value) ? value.map(normalizeVNode) : [
        normalizeVNode(value)
    ];
const normalizeSlot = (key, rawSlot, ctx)=>{
    if (rawSlot._n) return rawSlot;
    const normalized = withCtx((...args)=>{
        return normalizeSlotValue(rawSlot(...args));
    }, ctx);
    normalized._c = false;
    return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance)=>{
    const ctx = rawSlots._ctx;
    for(const key in rawSlots){
        if (isInternalKey(key)) continue;
        const value = rawSlots[key];
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value)) slots[key] = normalizeSlot(key, value, ctx);
        else if (value != null) {
            const normalized = normalizeSlotValue(value);
            slots[key] = ()=>normalized;
        }
    }
};
const normalizeVNodeSlots = (instance, children)=>{
    const normalized = normalizeSlotValue(children);
    instance.slots.default = ()=>normalized;
};
const initSlots = (instance, children)=>{
    if (instance.vnode.shapeFlag & 32) {
        const type = children._;
        if (type) {
            instance.slots = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(children);
            (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.def)(children, "_", type);
        } else normalizeObjectSlots(children, instance.slots = {});
    } else {
        instance.slots = {};
        if (children) normalizeVNodeSlots(instance, children);
    }
    (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.def)(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized)=>{
    const { vnode, slots } = instance;
    let needDeletionCheck = true;
    let deletionComparisonTarget = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
    if (vnode.shapeFlag & 32) {
        const type = children._;
        if (type) {
            if (optimized && type === 1) needDeletionCheck = false;
            else {
                (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(slots, children);
                if (!optimized && type === 1) delete slots._;
            }
        } else {
            needDeletionCheck = !children.$stable;
            normalizeObjectSlots(children, slots);
        }
        deletionComparisonTarget = children;
    } else if (children) {
        normalizeVNodeSlots(instance, children);
        deletionComparisonTarget = {
            default: 1
        };
    }
    if (needDeletionCheck) {
        for(const key in slots)if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
    }
};
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(rawRef)) {
        rawRef.forEach((r, i)=>setRef(r, oldRawRef && ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
        return;
    }
    if (isAsyncWrapper(vnode) && !isUnmount) return;
    const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
    const value = isUnmount ? null : refValue;
    const { i: owner, r: ref } = rawRef;
    const oldRef = oldRawRef && oldRawRef.r;
    const refs = owner.refs === _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ ? owner.refs = {} : owner.refs;
    const setupState = owner.setupState;
    if (oldRef != null && oldRef !== ref) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(oldRef)) {
            refs[oldRef] = null;
            if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, oldRef)) setupState[oldRef] = null;
        } else if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(oldRef)) oldRef.value = null;
    }
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(ref)) callWithErrorHandling(ref, owner, 12, [
        value,
        refs
    ]);
    else {
        const _isString = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(ref);
        const _isRef = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(ref);
        if (_isString || _isRef) {
            const doSet = ()=>{
                if (rawRef.f) {
                    const existing = _isString ? (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, ref) ? setupState[ref] : refs[ref] : ref.value;
                    if (isUnmount) (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(existing) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.remove)(existing, refValue);
                    else {
                        if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(existing)) {
                            if (_isString) {
                                refs[ref] = [
                                    refValue
                                ];
                                if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, ref)) setupState[ref] = refs[ref];
                            } else {
                                ref.value = [
                                    refValue
                                ];
                                if (rawRef.k) refs[rawRef.k] = ref.value;
                            }
                        } else if (!existing.includes(refValue)) existing.push(refValue);
                    }
                } else if (_isString) {
                    refs[ref] = value;
                    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, ref)) setupState[ref] = value;
                } else if (_isRef) {
                    ref.value = value;
                    if (rawRef.k) refs[rawRef.k] = value;
                }
            };
            if (value) {
                doSet.id = -1;
                queuePostRenderEffect(doSet, parentSuspense);
            } else doSet();
        }
    }
}
let hasMismatch = false;
const isSVGContainer = (container)=>container.namespaceURI.includes("svg") && container.tagName !== "foreignObject";
const isMathMLContainer = (container)=>container.namespaceURI.includes("MathML");
const getContainerType = (container)=>{
    if (isSVGContainer(container)) return "svg";
    if (isMathMLContainer(container)) return "mathml";
    return void 0;
};
const isComment = (node)=>node.nodeType === 8 /* COMMENT */ ;
function createHydrationFunctions(rendererInternals) {
    const { mt: mountComponent, p: patch, o: { patchProp, createText, nextSibling, parentNode, remove, insert, createComment } } = rendererInternals;
    const hydrate = (vnode, container)=>{
        if (!container.hasChildNodes()) {
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ && warn$1(`Attempting to hydrate existing markup but container is empty. Performing full mount instead.`);
            patch(null, vnode, container);
            flushPostFlushCbs();
            container._vnode = vnode;
            return;
        }
        hasMismatch = false;
        hydrateNode(container.firstChild, vnode, null, null, null);
        flushPostFlushCbs();
        container._vnode = vnode;
        if (hasMismatch && true) console.error(`Hydration completed but contains mismatches.`);
    };
    const hydrateNode = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized = false)=>{
        const isFragmentStart = isComment(node) && node.data === "[";
        const onMismatch = ()=>handleMismatch(node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragmentStart);
        const { type, ref, shapeFlag, patchFlag } = vnode;
        let domType = node.nodeType;
        vnode.el = node;
        if (__VUE_PROD_DEVTOOLS__) {
            if (!("__vnode" in node)) Object.defineProperty(node, "__vnode", {
                value: vnode,
                enumerable: false
            });
            if (!("__vueParentComponent" in node)) Object.defineProperty(node, "__vueParentComponent", {
                value: parentComponent,
                enumerable: false
            });
        }
        if (patchFlag === -2) {
            optimized = false;
            vnode.dynamicChildren = null;
        }
        let nextNode = null;
        switch(type){
            case Text:
                if (domType !== 3 /* TEXT */ ) {
                    if (vnode.children === "") {
                        insert(vnode.el = createText(""), parentNode(node), node);
                        nextNode = node;
                    } else nextNode = onMismatch();
                } else {
                    if (node.data !== vnode.children) {
                        hasMismatch = true;
                        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ && warn$1(`Hydration text mismatch in`, node.parentNode, `
  - rendered on server: ${JSON.stringify(node.data)}
  - expected on client: ${JSON.stringify(vnode.children)}`);
                        node.data = vnode.children;
                    }
                    nextNode = nextSibling(node);
                }
                break;
            case Comment:
                if (isTemplateNode(node)) {
                    nextNode = nextSibling(node);
                    replaceNode(vnode.el = node.content.firstChild, node, parentComponent);
                } else if (domType !== 8 /* COMMENT */  || isFragmentStart) nextNode = onMismatch();
                else nextNode = nextSibling(node);
                break;
            case Static:
                if (isFragmentStart) {
                    node = nextSibling(node);
                    domType = node.nodeType;
                }
                if (domType === 1 /* ELEMENT */  || domType === 3 /* TEXT */ ) {
                    nextNode = node;
                    const needToAdoptContent = !vnode.children.length;
                    for(let i = 0; i < vnode.staticCount; i++){
                        if (needToAdoptContent) vnode.children += nextNode.nodeType === 1 /* ELEMENT */  ? nextNode.outerHTML : nextNode.data;
                        if (i === vnode.staticCount - 1) vnode.anchor = nextNode;
                        nextNode = nextSibling(nextNode);
                    }
                    return isFragmentStart ? nextSibling(nextNode) : nextNode;
                } else onMismatch();
                break;
            case Fragment:
                if (!isFragmentStart) nextNode = onMismatch();
                else nextNode = hydrateFragment(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
                break;
            default:
                if (shapeFlag & 1) {
                    if ((domType !== 1 /* ELEMENT */  || vnode.type.toLowerCase() !== node.tagName.toLowerCase()) && !isTemplateNode(node)) nextNode = onMismatch();
                    else nextNode = hydrateElement(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
                } else if (shapeFlag & 6) {
                    vnode.slotScopeIds = slotScopeIds;
                    const container = parentNode(node);
                    if (isFragmentStart) nextNode = locateClosingAnchor(node);
                    else if (isComment(node) && node.data === "teleport start") nextNode = locateClosingAnchor(node, node.data, "teleport end");
                    else nextNode = nextSibling(node);
                    mountComponent(vnode, container, null, parentComponent, parentSuspense, getContainerType(container), optimized);
                    if (isAsyncWrapper(vnode)) {
                        let subTree;
                        if (isFragmentStart) {
                            subTree = createVNode(Fragment);
                            subTree.anchor = nextNode ? nextNode.previousSibling : container.lastChild;
                        } else subTree = node.nodeType === 3 ? createTextVNode("") : createVNode("div");
                        subTree.el = node;
                        vnode.component.subTree = subTree;
                    }
                } else if (shapeFlag & 64) {
                    if (domType !== 8 /* COMMENT */ ) nextNode = onMismatch();
                    else nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, rendererInternals, hydrateChildren);
                } else if (shapeFlag & 128) nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, getContainerType(parentNode(node)), slotScopeIds, optimized, rendererInternals, hydrateNode);
                else if (__VUE_PROD_HYDRATION_MISMATCH_DETAILS__) warn$1("Invalid HostVNode type:", type, `(${typeof type})`);
        }
        if (ref != null) setRef(ref, null, parentSuspense, vnode);
        return nextNode;
    };
    const hydrateElement = (el, vnode, parentComponent, parentSuspense, slotScopeIds, optimized)=>{
        optimized = optimized || !!vnode.dynamicChildren;
        const { type, props, patchFlag, shapeFlag, dirs, transition } = vnode;
        const forcePatch = type === "input" || type === "option";
        if (forcePatch || patchFlag !== -1) {
            if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
            let needCallTransitionHooks = false;
            if (isTemplateNode(el)) {
                needCallTransitionHooks = needTransition(parentSuspense, transition) && parentComponent && parentComponent.vnode.props && parentComponent.vnode.props.appear;
                const content = el.content.firstChild;
                if (needCallTransitionHooks) transition.beforeEnter(content);
                replaceNode(content, el, parentComponent);
                vnode.el = el = content;
            }
            if (shapeFlag & 16 && // skip if element has innerHTML / textContent
            !(props && (props.innerHTML || props.textContent))) {
                let next = hydrateChildren(el.firstChild, vnode, el, parentComponent, parentSuspense, slotScopeIds, optimized);
                let hasWarned = false;
                while(next){
                    hasMismatch = true;
                    if (__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ && !hasWarned) {
                        warn$1(`Hydration children mismatch on`, el, `
Server rendered element contains more child nodes than client vdom.`);
                        hasWarned = true;
                    }
                    const cur = next;
                    next = next.nextSibling;
                    remove(cur);
                }
            } else if (shapeFlag & 8) {
                if (el.textContent !== vnode.children) {
                    hasMismatch = true;
                    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ && warn$1(`Hydration text content mismatch on`, el, `
  - rendered on server: ${el.textContent}
  - expected on client: ${vnode.children}`);
                    el.textContent = vnode.children;
                }
            }
            if (props) {
                if (forcePatch || !optimized || patchFlag & 48) {
                    for(const key in props)if (forcePatch && (key.endsWith("value") || key === "indeterminate") || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key) && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key) || // force hydrate v-bind with .prop modifiers
                    key[0] === ".") patchProp(el, key, null, props[key], void 0, void 0, parentComponent);
                } else if (props.onClick) patchProp(el, "onClick", null, props.onClick, void 0, void 0, parentComponent);
            }
            let vnodeHooks;
            if (vnodeHooks = props && props.onVnodeBeforeMount) invokeVNodeHook(vnodeHooks, parentComponent, vnode);
            if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
            if ((vnodeHooks = props && props.onVnodeMounted) || dirs || needCallTransitionHooks) queueEffectWithSuspense(()=>{
                vnodeHooks && invokeVNodeHook(vnodeHooks, parentComponent, vnode);
                needCallTransitionHooks && transition.enter(el);
                dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
            }, parentSuspense);
        }
        return el.nextSibling;
    };
    const hydrateChildren = (node, parentVNode, container, parentComponent, parentSuspense, slotScopeIds, optimized)=>{
        optimized = optimized || !!parentVNode.dynamicChildren;
        const children = parentVNode.children;
        const l = children.length;
        let hasWarned = false;
        for(let i = 0; i < l; i++){
            const vnode = optimized ? children[i] : children[i] = normalizeVNode(children[i]);
            if (node) node = hydrateNode(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
            else if (vnode.type === Text && !vnode.children) continue;
            else {
                hasMismatch = true;
                if (__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ && !hasWarned) {
                    warn$1(`Hydration children mismatch on`, container, `
Server rendered element contains fewer child nodes than client vdom.`);
                    hasWarned = true;
                }
                patch(null, vnode, container, null, parentComponent, parentSuspense, getContainerType(container), slotScopeIds);
            }
        }
        return node;
    };
    const hydrateFragment = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized)=>{
        const { slotScopeIds: fragmentSlotScopeIds } = vnode;
        if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
        const container = parentNode(node);
        const next = hydrateChildren(nextSibling(node), vnode, container, parentComponent, parentSuspense, slotScopeIds, optimized);
        if (next && isComment(next) && next.data === "]") return nextSibling(vnode.anchor = next);
        else {
            hasMismatch = true;
            insert(vnode.anchor = createComment(`]`), container, next);
            return next;
        }
    };
    const handleMismatch = (node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragment)=>{
        hasMismatch = true;
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ && warn$1(`Hydration node mismatch:
- rendered on server:`, node, node.nodeType === 3 /* TEXT */  ? `(text)` : isComment(node) && node.data === "[" ? `(start of fragment)` : ``, `
- expected on client:`, vnode.type);
        vnode.el = null;
        if (isFragment) {
            const end = locateClosingAnchor(node);
            while(true){
                const next2 = nextSibling(node);
                if (next2 && next2 !== end) remove(next2);
                else break;
            }
        }
        const next = nextSibling(node);
        const container = parentNode(node);
        remove(node);
        patch(null, vnode, container, next, parentComponent, parentSuspense, getContainerType(container), slotScopeIds);
        return next;
    };
    const locateClosingAnchor = (node, open = "[", close = "]")=>{
        let match = 0;
        while(node){
            node = nextSibling(node);
            if (node && isComment(node)) {
                if (node.data === open) match++;
                if (node.data === close) {
                    if (match === 0) return nextSibling(node);
                    else match--;
                }
            }
        }
        return node;
    };
    const replaceNode = (newNode, oldNode, parentComponent)=>{
        const parentNode2 = oldNode.parentNode;
        if (parentNode2) parentNode2.replaceChild(newNode, oldNode);
        let parent = parentComponent;
        while(parent){
            if (parent.vnode.el === oldNode) parent.vnode.el = parent.subTree.el = newNode;
            parent = parent.parent;
        }
    };
    const isTemplateNode = (node)=>{
        return node.nodeType === 1 /* ELEMENT */  && node.tagName.toLowerCase() === "template";
    };
    return [
        hydrate,
        hydrateNode
    ];
}
function propHasMismatch(el, key, clientValue, vnode) {
    let mismatchType;
    let mismatchKey;
    let actual;
    let expected;
    if (key === "class") {
        actual = el.getAttribute("class");
        expected = normalizeClass(clientValue);
        if (!isSetEqual(toClassSet(actual || ""), toClassSet(expected))) mismatchType = mismatchKey = `class`;
    } else if (key === "style") {
        actual = el.getAttribute("style");
        expected = isString(clientValue) ? clientValue : stringifyStyle(normalizeStyle(clientValue));
        const actualMap = toStyleMap(actual);
        const expectedMap = toStyleMap(expected);
        if (vnode.dirs) {
            for (const { dir, value } of vnode.dirs)if (dir.name === "show" && !value) expectedMap.set("display", "none");
        }
        if (!isMapEqual(actualMap, expectedMap)) mismatchType = mismatchKey = "style";
    } else if (el instanceof SVGElement && isKnownSvgAttr(key) || el instanceof HTMLElement && (isBooleanAttr(key) || isKnownHtmlAttr(key))) {
        if (isBooleanAttr(key)) {
            actual = el.hasAttribute(key);
            expected = includeBooleanAttr(clientValue);
        } else if (clientValue == null) {
            actual = el.hasAttribute(key);
            expected = false;
        } else {
            if (el.hasAttribute(key)) actual = el.getAttribute(key);
            else {
                const serverValue = el[key];
                actual = isObject(serverValue) || serverValue == null ? "" : String(serverValue);
            }
            expected = isObject(clientValue) || clientValue == null ? "" : String(clientValue);
        }
        if (actual !== expected) {
            mismatchType = `attribute`;
            mismatchKey = key;
        }
    }
    if (mismatchType) {
        const format = (v1)=>v1 === false ? `(not rendered)` : `${mismatchKey}="${v1}"`;
        const preSegment = `Hydration ${mismatchType} mismatch on`;
        const postSegment = `
  - rendered on server: ${format(actual)}
  - expected on client: ${format(expected)}
  Note: this mismatch is check-only. The DOM will not be rectified in production due to performance overhead.
  You should fix the source of the mismatch.`;
        warn$1(preSegment, el, postSegment);
        return true;
    }
    return false;
}
function toClassSet(str) {
    return new Set(str.trim().split(/\s+/));
}
function isSetEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const s of a){
        if (!b.has(s)) return false;
    }
    return true;
}
function toStyleMap(str) {
    const styleMap = /* @__PURE__ */ new Map();
    for (const item of str.split(";")){
        let [key, value] = item.split(":");
        key = key == null ? void 0 : key.trim();
        value = value == null ? void 0 : value.trim();
        if (key && value) styleMap.set(key, value);
    }
    return styleMap;
}
function isMapEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a){
        if (value !== b.get(key)) return false;
    }
    return true;
}
let supported;
let perf;
function startMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) perf.mark(`vue-${type}-${instance.uid}`);
    if (__VUE_PROD_DEVTOOLS__) devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
}
function endMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
        const startTag = `vue-${type}-${instance.uid}`;
        const endTag = startTag + `:end`;
        perf.mark(endTag);
        perf.measure(`<${formatComponentName(instance, instance.type)}> ${type}`, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
    }
    if (__VUE_PROD_DEVTOOLS__) devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
}
function isSupported() {
    if (supported !== void 0) return supported;
    if (typeof window !== "undefined" && window.performance) {
        supported = true;
        perf = window.performance;
    } else supported = false;
    return supported;
}
function initFeatureFlags() {
    const needWarn = [];
    if (typeof __VUE_OPTIONS_API__ !== "boolean") (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.getGlobalThis)().__VUE_OPTIONS_API__ = true;
    if (typeof __VUE_PROD_DEVTOOLS__ !== "boolean") (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.getGlobalThis)().__VUE_PROD_DEVTOOLS__ = false;
    if (typeof __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ !== "boolean") (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.getGlobalThis)().__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
    return baseCreateRenderer(options);
}
function createHydrationRenderer(options) {
    return baseCreateRenderer(options, createHydrationFunctions);
}
function baseCreateRenderer(options, createHydrationFns) {
    initFeatureFlags();
    const target = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.getGlobalThis)();
    target.__VUE__ = true;
    if (__VUE_PROD_DEVTOOLS__) setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
    const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP, insertStaticContent: hostInsertStaticContent } = options;
    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace, slotScopeIds = null, optimized = !!n2.dynamicChildren)=>{
        if (n1 === n2) return;
        if (n1 && !isSameVNodeType(n1, n2)) {
            anchor = getNextHostNode(n1);
            unmount(n1, parentComponent, parentSuspense, true);
            n1 = null;
        }
        if (n2.patchFlag === -2) {
            optimized = false;
            n2.dynamicChildren = null;
        }
        const { type, ref, shapeFlag } = n2;
        switch(type){
            case Text:
                processText(n1, n2, container, anchor);
                break;
            case Comment:
                processCommentNode(n1, n2, container, anchor);
                break;
            case Static:
                if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
                break;
            case Fragment:
                processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                break;
            default:
                if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
                else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
        }
        if (ref != null && parentComponent) setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    };
    const processText = (n1, n2, container, anchor)=>{
        if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
        else {
            const el = n2.el = n1.el;
            if (n2.children !== n1.children) hostSetText(el, n2.children);
        }
    };
    const processCommentNode = (n1, n2, container, anchor)=>{
        if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
        else n2.el = n1.el;
    };
    const mountStaticNode = (n2, container, anchor, namespace)=>{
        [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
    };
    const patchStaticNode = (n1, n2, container, namespace)=>{
        if (n2.children !== n1.children) {
            const anchor = hostNextSibling(n1.anchor);
            removeStaticNode(n1);
            [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace);
        } else {
            n2.el = n1.el;
            n2.anchor = n1.anchor;
        }
    };
    const moveStaticNode = ({ el, anchor }, container, nextSibling)=>{
        let next;
        while(el && el !== anchor){
            next = hostNextSibling(el);
            hostInsert(el, container, nextSibling);
            el = next;
        }
        hostInsert(anchor, container, nextSibling);
    };
    const removeStaticNode = ({ el, anchor })=>{
        let next;
        while(el && el !== anchor){
            next = hostNextSibling(el);
            hostRemove(el);
            el = next;
        }
        hostRemove(anchor);
    };
    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)=>{
        if (n2.type === "svg") namespace = "svg";
        else if (n2.type === "math") namespace = "mathml";
        if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
        else patchElement(n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
    };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)=>{
        let el;
        let vnodeHook;
        const { props, shapeFlag, transition, dirs } = vnode;
        el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
        if (shapeFlag & 8) hostSetElementText(el, vnode.children);
        else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
        if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
        setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
        if (props) {
            for(const key in props)if (key !== "value" && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key)) hostPatchProp(el, key, null, props[key], namespace, vnode.children, parentComponent, parentSuspense, unmountChildren);
            if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
            if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
        if (__VUE_PROD_DEVTOOLS__) {
            Object.defineProperty(el, "__vnode", {
                value: vnode,
                enumerable: false
            });
            Object.defineProperty(el, "__vueParentComponent", {
                value: parentComponent,
                enumerable: false
            });
        }
        if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
        const needCallTransitionHooks = needTransition(parentSuspense, transition);
        if (needCallTransitionHooks) transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) queuePostRenderEffect(()=>{
            vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
            needCallTransitionHooks && transition.enter(el);
            dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        }, parentSuspense);
    };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent)=>{
        if (scopeId) hostSetScopeId(el, scopeId);
        if (slotScopeIds) for(let i = 0; i < slotScopeIds.length; i++)hostSetScopeId(el, slotScopeIds[i]);
        if (parentComponent) {
            let subTree = parentComponent.subTree;
            if (vnode === subTree) {
                const parentVNode = parentComponent.vnode;
                setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
            }
        }
    };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0)=>{
        for(let i = start; i < children.length; i++){
            const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
            patch(null, child, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
        }
    };
    const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)=>{
        const el = n2.el = n1.el;
        let { patchFlag, dynamicChildren, dirs } = n2;
        patchFlag |= n1.patchFlag & 16;
        const oldProps = n1.props || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        const newProps = n2.props || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        let vnodeHook;
        parentComponent && toggleRecurse(parentComponent, false);
        if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
        parentComponent && toggleRecurse(parentComponent, true);
        if (dynamicChildren) patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds);
        else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
        if (patchFlag > 0) {
            if (patchFlag & 16) patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, namespace);
            else {
                if (patchFlag & 2) {
                    if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
                }
                if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
                if (patchFlag & 8) {
                    const propsToUpdate = n2.dynamicProps;
                    for(let i = 0; i < propsToUpdate.length; i++){
                        const key = propsToUpdate[i];
                        const prev = oldProps[key];
                        const next = newProps[key];
                        if (next !== prev || key === "value") hostPatchProp(el, key, prev, next, namespace, n1.children, parentComponent, parentSuspense, unmountChildren);
                    }
                }
            }
            if (patchFlag & 1) {
                if (n1.children !== n2.children) hostSetElementText(el, n2.children);
            }
        } else if (!optimized && dynamicChildren == null) patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, namespace);
        if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(()=>{
            vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
            dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
        }, parentSuspense);
    };
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds)=>{
        for(let i = 0; i < newChildren.length; i++){
            const oldVNode = oldChildren[i];
            const newVNode = newChildren[i];
            const container = // oldVNode may be an errored async setup() component inside Suspense
            // which will not have a mounted element
            oldVNode.el && (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
            // which also requires the correct parent container
            !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
            oldVNode.shapeFlag & 70) ? hostParentNode(oldVNode.el) : // In other cases, the parent container is not actually used so we
            // just pass the block element here to avoid a DOM parentNode call.
            fallbackContainer;
            patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, true);
        }
    };
    const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, namespace)=>{
        if (oldProps !== newProps) {
            if (oldProps !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
                for(const key in oldProps)if (!(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, vnode.children, parentComponent, parentSuspense, unmountChildren);
            }
            for(const key in newProps){
                if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key)) continue;
                const next = newProps[key];
                const prev = oldProps[key];
                if (next !== prev && key !== "value") hostPatchProp(el, key, prev, next, namespace, vnode.children, parentComponent, parentSuspense, unmountChildren);
            }
            if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
        }
    };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)=>{
        const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
        const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
        let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
        if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
        if (n1 == null) {
            hostInsert(fragmentStartAnchor, container, anchor);
            hostInsert(fragmentEndAnchor, container, anchor);
            mountChildren(// #10007
            // such fragment like `<></>` will be compiled into
            // a fragment which doesn't have a children.
            // In this case fallback to an empty array
            n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
        } else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
        // of renderSlot() with no valid children
        n1.dynamicChildren) {
            patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, namespace, slotScopeIds);
            if (// #2080 if the stable fragment has a key, it's a <template v-for> that may
            //  get moved around. Make sure all root level vnodes inherit el.
            // #2134 or if it's a component root, it may also get moved around
            // as the component is being moved.
            n2.key != null || parentComponent && n2 === parentComponent.subTree) traverseStaticChildren(n1, n2, true);
        } else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)=>{
        n2.slotScopeIds = slotScopeIds;
        if (n1 == null) {
            if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
            else mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
        } else updateComponent(n1, n2, optimized);
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized)=>{
        const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
        if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
        setupComponent(instance);
        if (instance.asyncDep) {
            parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
            if (!initialVNode.el) {
                const placeholder = instance.subTree = createVNode(Comment);
                processCommentNode(null, placeholder, container, anchor);
            }
        } else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, namespace, optimized);
    };
    const updateComponent = (n1, n2, optimized)=>{
        const instance = n2.component = n1.component;
        if (shouldUpdateComponent(n1, n2, optimized)) {
            if (instance.asyncDep && !instance.asyncResolved) {
                updateComponentPreRender(instance, n2, optimized);
                return;
            } else {
                instance.next = n2;
                invalidateJob(instance.update);
                instance.effect.dirty = true;
                instance.update();
            }
        } else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized)=>{
        const componentUpdateFn = ()=>{
            if (!instance.isMounted) {
                let vnodeHook;
                const { el, props } = initialVNode;
                const { bm, m, parent } = instance;
                const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
                toggleRecurse(instance, false);
                if (bm) (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(bm);
                if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
                toggleRecurse(instance, true);
                if (el && hydrateNode) {
                    const hydrateSubTree = ()=>{
                        instance.subTree = renderComponentRoot(instance);
                        hydrateNode(el, instance.subTree, instance, parentSuspense, null);
                    };
                    if (isAsyncWrapperVNode) initialVNode.type.__asyncLoader().then(// note: we are moving the render call into an async callback,
                    // which means it won't track dependencies - but it's ok because
                    // a server-rendered async wrapper is already in resolved state
                    // and it will never need to change.
                    ()=>!instance.isUnmounted && hydrateSubTree());
                    else hydrateSubTree();
                } else {
                    const subTree = instance.subTree = renderComponentRoot(instance);
                    patch(null, subTree, container, anchor, instance, parentSuspense, namespace);
                    initialVNode.el = subTree.el;
                }
                if (m) queuePostRenderEffect(m, parentSuspense);
                if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
                    const scopedInitialVNode = initialVNode;
                    queuePostRenderEffect(()=>invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
                }
                if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, parentSuspense);
                instance.isMounted = true;
                if (__VUE_PROD_DEVTOOLS__) devtoolsComponentAdded(instance);
                initialVNode = container = anchor = null;
            } else {
                let { next, bu, u, parent, vnode } = instance;
                {
                    const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
                    if (nonHydratedAsyncRoot) {
                        if (next) {
                            next.el = vnode.el;
                            updateComponentPreRender(instance, next, optimized);
                        }
                        nonHydratedAsyncRoot.asyncDep.then(()=>{
                            if (!instance.isUnmounted) componentUpdateFn();
                        });
                        return;
                    }
                }
                let originNext = next;
                let vnodeHook;
                toggleRecurse(instance, false);
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next, optimized);
                } else next = vnode;
                if (bu) (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(bu);
                if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next, vnode);
                toggleRecurse(instance, true);
                const nextTree = renderComponentRoot(instance);
                const prevTree = instance.subTree;
                instance.subTree = nextTree;
                patch(prevTree, nextTree, // parent may have changed if it's in a teleport
                hostParentNode(prevTree.el), // anchor may have changed if it's in a fragment
                getNextHostNode(prevTree), instance, parentSuspense, namespace);
                next.el = nextTree.el;
                if (originNext === null) updateHOCHostEl(instance, nextTree.el);
                if (u) queuePostRenderEffect(u, parentSuspense);
                if (vnodeHook = next.props && next.props.onVnodeUpdated) queuePostRenderEffect(()=>invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
                if (__VUE_PROD_DEVTOOLS__) devtoolsComponentUpdated(instance);
            }
        };
        const effect = instance.effect = new _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ReactiveEffect(componentUpdateFn, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP, ()=>queueJob(update), instance.scope);
        const update = instance.update = ()=>{
            if (effect.dirty) effect.run();
        };
        update.id = instance.uid;
        toggleRecurse(instance, true);
        var e, e1;
        update();
    };
    const updateComponentPreRender = (instance, nextVNode, optimized)=>{
        nextVNode.component = instance;
        const prevProps = instance.vnode.props;
        instance.vnode = nextVNode;
        instance.next = null;
        updateProps(instance, nextVNode.props, prevProps, optimized);
        updateSlots(instance, nextVNode.children, optimized);
        (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
        flushPreFlushCbs(instance);
        (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
    };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false)=>{
        const c1 = n1 && n1.children;
        const prevShapeFlag = n1 ? n1.shapeFlag : 0;
        const c2 = n2.children;
        const { patchFlag, shapeFlag } = n2;
        if (patchFlag > 0) {
            if (patchFlag & 128) {
                patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                return;
            } else if (patchFlag & 256) {
                patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                return;
            }
        }
        if (shapeFlag & 8) {
            if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense);
            if (c2 !== c1) hostSetElementText(container, c2);
        } else if (prevShapeFlag & 16) {
            if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
            else unmountChildren(c1, parentComponent, parentSuspense, true);
        } else {
            if (prevShapeFlag & 8) hostSetElementText(container, "");
            if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
        }
    };
    const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)=>{
        c1 = c1 || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
        c2 = c2 || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
        const oldLength = c1.length;
        const newLength = c2.length;
        const commonLength = Math.min(oldLength, newLength);
        let i;
        for(i = 0; i < commonLength; i++){
            const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
            patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
        }
        if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
        else mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, commonLength);
    };
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)=>{
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        while(i <= e1 && i <= e2){
            const n1 = c1[i];
            const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
            if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
            else break;
            i++;
        }
        while(i <= e1 && i <= e2){
            const n1 = c1[e1];
            const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
            if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
            else break;
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while(i <= e2){
                    patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                    i++;
                }
            }
        } else if (i > e2) while(i <= e1){
            unmount(c1[i], parentComponent, parentSuspense, true);
            i++;
        }
        else {
            const s1 = i;
            const s2 = i;
            const keyToNewIndexMap = /* @__PURE__ */ new Map();
            for(i = s2; i <= e2; i++){
                const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
                if (nextChild.key != null) keyToNewIndexMap.set(nextChild.key, i);
            }
            let j;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            let moved = false;
            let maxNewIndexSoFar = 0;
            const newIndexToOldIndexMap = new Array(toBePatched);
            for(i = 0; i < toBePatched; i++)newIndexToOldIndexMap[i] = 0;
            for(i = s1; i <= e1; i++){
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    unmount(prevChild, parentComponent, parentSuspense, true);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
                else {
                    for(j = s2; j <= e2; j++)if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
                        newIndex = j;
                        break;
                    }
                }
                if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense, true);
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
                    else moved = true;
                    patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
            j = increasingNewIndexSequence.length - 1;
            for(i = toBePatched - 1; i >= 0; i--){
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) move(nextChild, container, anchor, 2);
                    else j--;
                }
            }
        }
    };
    const move = (vnode, container, anchor, moveType, parentSuspense = null)=>{
        const { el, type, transition, children, shapeFlag } = vnode;
        if (shapeFlag & 6) {
            move(vnode.component.subTree, container, anchor, moveType);
            return;
        }
        if (shapeFlag & 128) {
            vnode.suspense.move(container, anchor, moveType);
            return;
        }
        if (shapeFlag & 64) {
            type.move(vnode, container, anchor, internals);
            return;
        }
        if (type === Fragment) {
            hostInsert(el, container, anchor);
            for(let i = 0; i < children.length; i++)move(children[i], container, anchor, moveType);
            hostInsert(vnode.anchor, container, anchor);
            return;
        }
        if (type === Static) {
            moveStaticNode(vnode, container, anchor);
            return;
        }
        const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
        if (needTransition2) {
            if (moveType === 0) {
                transition.beforeEnter(el);
                hostInsert(el, container, anchor);
                queuePostRenderEffect(()=>transition.enter(el), parentSuspense);
            } else {
                const { leave, delayLeave, afterLeave } = transition;
                const remove2 = ()=>hostInsert(el, container, anchor);
                const performLeave = ()=>{
                    leave(el, ()=>{
                        remove2();
                        afterLeave && afterLeave();
                    });
                };
                if (delayLeave) delayLeave(el, remove2, performLeave);
                else performLeave();
            }
        } else hostInsert(el, container, anchor);
    };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false)=>{
        const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
        if (ref != null) setRef(ref, null, parentSuspense, vnode, true);
        if (shapeFlag & 256) {
            parentComponent.ctx.deactivate(vnode);
            return;
        }
        const shouldInvokeDirs = shapeFlag & 1 && dirs;
        const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
        let vnodeHook;
        if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
        if (shapeFlag & 6) unmountComponent(vnode.component, parentSuspense, doRemove);
        else {
            if (shapeFlag & 128) {
                vnode.suspense.unmount(parentSuspense, doRemove);
                return;
            }
            if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
            if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
            else if (dynamicChildren && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
            else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense);
            if (doRemove) remove(vnode);
        }
        if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) queuePostRenderEffect(()=>{
            vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
            shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        }, parentSuspense);
    };
    const remove = (vnode)=>{
        const { type, el, anchor, transition } = vnode;
        if (type === Fragment) {
            var child;
            removeFragment(el, anchor);
            return;
        }
        if (type === Static) {
            removeStaticNode(vnode);
            return;
        }
        const performRemove = ()=>{
            hostRemove(el);
            if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
        };
        if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
            const { leave, delayLeave } = transition;
            const performLeave = ()=>leave(el, performRemove);
            if (delayLeave) delayLeave(vnode.el, performRemove, performLeave);
            else performLeave();
        } else performRemove();
    };
    const removeFragment = (cur, end)=>{
        let next;
        while(cur !== end){
            next = hostNextSibling(cur);
            hostRemove(cur);
            cur = next;
        }
        hostRemove(end);
    };
    const unmountComponent = (instance, parentSuspense, doRemove)=>{
        const { bum, scope, update, subTree, um } = instance;
        if (bum) (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(bum);
        scope.stop();
        if (update) {
            update.active = false;
            unmount(subTree, instance, parentSuspense, doRemove);
        }
        if (um) queuePostRenderEffect(um, parentSuspense);
        queuePostRenderEffect(()=>{
            instance.isUnmounted = true;
        }, parentSuspense);
        if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
            parentSuspense.deps--;
            if (parentSuspense.deps === 0) parentSuspense.resolve();
        }
        if (__VUE_PROD_DEVTOOLS__) devtoolsComponentRemoved(instance);
    };
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0)=>{
        for(let i = start; i < children.length; i++)unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    };
    const getNextHostNode = (vnode)=>{
        if (vnode.shapeFlag & 6) return getNextHostNode(vnode.component.subTree);
        if (vnode.shapeFlag & 128) return vnode.suspense.next();
        return hostNextSibling(vnode.anchor || vnode.el);
    };
    let isFlushing = false;
    const render = (vnode, container, namespace)=>{
        if (vnode == null) {
            if (container._vnode) unmount(container._vnode, null, null, true);
        } else patch(container._vnode || null, vnode, container, null, null, null, namespace);
        if (!isFlushing) {
            isFlushing = true;
            flushPreFlushCbs();
            flushPostFlushCbs();
            isFlushing = false;
        }
        container._vnode = vnode;
    };
    const internals = {
        p: patch,
        um: unmount,
        m: move,
        r: remove,
        mt: mountComponent,
        mc: mountChildren,
        pc: patchChildren,
        pbc: patchBlockChildren,
        n: getNextHostNode,
        o: options
    };
    let hydrate;
    let hydrateNode;
    if (createHydrationFns) [hydrate, hydrateNode] = createHydrationFns(internals);
    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
    return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect, update }, allowed) {
    effect.allowRecurse = update.allowRecurse = allowed;
}
function needTransition(parentSuspense, transition) {
    return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
    const ch1 = n1.children;
    const ch2 = n2.children;
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(ch1) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(ch2)) for(let i = 0; i < ch1.length; i++){
        const c1 = ch1[i];
        let c2 = ch2[i];
        if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
            if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
                c2 = ch2[i] = cloneIfMounted(ch2[i]);
                c2.el = c1.el;
            }
            if (!shallow) traverseStaticChildren(c1, c2);
        }
        if (c2.type === Text) c2.el = c1.el;
    }
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [
        0
    ];
    let i, j, u, v1, c;
    const len = arr.length;
    for(i = 0; i < len; i++){
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v1 = result.length - 1;
            while(u < v1){
                c = u + v1 >> 1;
                if (arr[result[c]] < arrI) u = c + 1;
                else v1 = c;
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) p[i] = result[u - 1];
                result[u] = i;
            }
        }
    }
    u = result.length;
    v1 = result[u - 1];
    while(u-- > 0){
        result[u] = v1;
        v1 = p[v1];
    }
    return result;
}
function locateNonHydratedAsyncRoot(instance) {
    const subComponent = instance.subTree.component;
    if (subComponent) {
        if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
        else return locateNonHydratedAsyncRoot(subComponent);
    }
}
const isTeleport = (type)=>type.__isTeleport;
const isTeleportDisabled = (props)=>props && (props.disabled || props.disabled === "");
const isTargetSVG = (target)=>typeof SVGElement !== "undefined" && target instanceof SVGElement;
const isTargetMathML = (target)=>typeof MathMLElement === "function" && target instanceof MathMLElement;
const resolveTarget = (props, select)=>{
    const targetSelector = props && props.to;
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(targetSelector)) {
        if (!select) return null;
        else {
            const target = select(targetSelector);
            target;
            return target;
        }
    } else return targetSelector;
};
const TeleportImpl = {
    name: "Teleport",
    __isTeleport: true,
    process (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
        const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals;
        const disabled = isTeleportDisabled(n2.props);
        let { shapeFlag, children, dynamicChildren } = n2;
        if (n1 == null) {
            const placeholder = n2.el = createText("");
            const mainAnchor = n2.anchor = createText("");
            insert(placeholder, container, anchor);
            insert(mainAnchor, container, anchor);
            const target = n2.target = resolveTarget(n2.props, querySelector);
            const targetAnchor = n2.targetAnchor = createText("");
            if (target) {
                insert(targetAnchor, target);
                if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
                else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
            }
            const mount = (container2, anchor2)=>{
                if (shapeFlag & 16) mountChildren(children, container2, anchor2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
            };
            if (disabled) mount(container, mainAnchor);
            else if (target) mount(target, targetAnchor);
        } else {
            n2.el = n1.el;
            const mainAnchor = n2.anchor = n1.anchor;
            const target = n2.target = n1.target;
            const targetAnchor = n2.targetAnchor = n1.targetAnchor;
            const wasDisabled = isTeleportDisabled(n1.props);
            const currentContainer = wasDisabled ? container : target;
            const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
            if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
            else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
            if (dynamicChildren) {
                patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, namespace, slotScopeIds);
                traverseStaticChildren(n1, n2, true);
            } else if (!optimized) patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, false);
            if (disabled) {
                if (!wasDisabled) moveTeleport(n2, container, mainAnchor, internals, 1);
                else if (n2.props && n1.props && n2.props.to !== n1.props.to) n2.props.to = n1.props.to;
            } else {
                if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
                    const nextTarget = n2.target = resolveTarget(n2.props, querySelector);
                    if (nextTarget) moveTeleport(n2, nextTarget, null, internals, 0);
                } else if (wasDisabled) moveTeleport(n2, target, targetAnchor, internals, 1);
            }
        }
        updateCssVars(n2);
    },
    remove (vnode, parentComponent, parentSuspense, optimized, { um: unmount, o: { remove: hostRemove } }, doRemove) {
        const { shapeFlag, children, anchor, targetAnchor, target, props } = vnode;
        if (target) hostRemove(targetAnchor);
        doRemove && hostRemove(anchor);
        if (shapeFlag & 16) {
            const shouldRemove = doRemove || !isTeleportDisabled(props);
            for(let i = 0; i < children.length; i++){
                const child = children[i];
                unmount(child, parentComponent, parentSuspense, shouldRemove, !!child.dynamicChildren);
            }
        }
    },
    move: moveTeleport,
    hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
    if (moveType === 0) insert(vnode.targetAnchor, container, parentAnchor);
    const { el, anchor, shapeFlag, children, props } = vnode;
    const isReorder = moveType === 2;
    if (isReorder) insert(el, container, parentAnchor);
    if (!isReorder || isTeleportDisabled(props)) {
        if (shapeFlag & 16) for(let i = 0; i < children.length; i++)move(children[i], container, parentAnchor, 2);
    }
    if (isReorder) insert(anchor, container, parentAnchor);
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector } }, hydrateChildren) {
    const target = vnode.target = resolveTarget(vnode.props, querySelector);
    if (target) {
        const targetNode = target._lpa || target.firstChild;
        if (vnode.shapeFlag & 16) {
            if (isTeleportDisabled(vnode.props)) {
                vnode.anchor = hydrateChildren(nextSibling(node), vnode, parentNode(node), parentComponent, parentSuspense, slotScopeIds, optimized);
                vnode.targetAnchor = targetNode;
            } else {
                vnode.anchor = nextSibling(node);
                let targetAnchor = targetNode;
                while(targetAnchor){
                    targetAnchor = nextSibling(targetAnchor);
                    if (targetAnchor && targetAnchor.nodeType === 8 && targetAnchor.data === "teleport anchor") {
                        vnode.targetAnchor = targetAnchor;
                        target._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
                        break;
                    }
                }
                hydrateChildren(targetNode, vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
            }
        }
        updateCssVars(vnode);
    }
    return vnode.anchor && nextSibling(vnode.anchor);
}
const Teleport = TeleportImpl;
function updateCssVars(vnode) {
    const ctx = vnode.ctx;
    if (ctx && ctx.ut) {
        let node = vnode.children[0].el;
        while(node && node !== vnode.targetAnchor){
            if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
            node = node.nextSibling;
        }
        ctx.ut();
    }
}
const Fragment = Symbol.for("v-fgt");
const Text = Symbol.for("v-txt");
const Comment = Symbol.for("v-cmt");
const Static = Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
    blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
    isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
    vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR : null;
    closeBlock();
    if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
    return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
    return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
    return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
}
function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
}
let vnodeArgsTransformer;
function transformVNodeArgs(transformer) {
    vnodeArgsTransformer = transformer;
}
const createVNodeWithArgsTransform = (...args)=>{
    return _createVNode(...vnodeArgsTransformer ? vnodeArgsTransformer(args, currentRenderingInstance) : args);
};
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key })=>key != null ? key : null;
const normalizeRef = ({ ref, ref_key, ref_for })=>{
    if (typeof ref === "number") ref = "" + ref;
    return ref != null ? (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(ref) || (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(ref) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(ref) ? {
        i: currentRenderingInstance,
        r: ref,
        k: ref_key,
        f: !!ref_for
    } : ref : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
    const vnode = {
        __v_isVNode: true,
        __v_skip: true,
        type,
        props,
        key: props && normalizeKey(props),
        ref: props && normalizeRef(props),
        scopeId: currentScopeId,
        slotScopeIds: null,
        children,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag,
        patchFlag,
        dynamicProps,
        dynamicChildren: null,
        appContext: null,
        ctx: currentRenderingInstance
    };
    if (needFullChildrenNormalization) {
        normalizeChildren(vnode, children);
        if (shapeFlag & 128) type.normalize(vnode);
    } else if (children) vnode.shapeFlag |= (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(children) ? 8 : 16;
    if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
    !isBlockNode && // has current parent block
    currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    vnode.patchFlag !== 32) currentBlock.push(vnode);
    return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) type = Comment;
    if (isVNode(type)) {
        const cloned = cloneVNode(type, props, true);
        if (children) normalizeChildren(cloned, children);
        if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
            if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
            else currentBlock.push(cloned);
        }
        cloned.patchFlag |= -2;
        return cloned;
    }
    if (isClassComponent(type)) type = type.__vccOpts;
    if (props) {
        props = guardReactiveProps(props);
        let { class: klass, style } = props;
        if (klass && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(klass)) props.class = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeClass)(klass);
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(style)) {
            if ((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isProxy)(style) && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(style)) style = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, style);
            props.style = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeStyle)(style);
        }
    }
    const shapeFlag = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(type) ? 4 : (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(type) ? 2 : 0;
    return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
    if (!props) return null;
    return (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isProxy)(props) || InternalObjectKey in props ? (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
    const { props, ref, patchFlag, children } = vnode;
    const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    const cloned = {
        __v_isVNode: true,
        __v_skip: true,
        type: vnode.type,
        props: mergedProps,
        key: mergedProps && normalizeKey(mergedProps),
        ref: extraProps && extraProps.ref ? // #2078 in the case of <component :is="vnode" ref="extra"/>
        // if the vnode itself already has a ref, cloneVNode will need to merge
        // the refs so the single vnode can be set on multiple refs
        mergeRef && ref ? (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(ref) ? ref.concat(normalizeRef(extraProps)) : [
            ref,
            normalizeRef(extraProps)
        ] : normalizeRef(extraProps) : ref,
        scopeId: vnode.scopeId,
        slotScopeIds: vnode.slotScopeIds,
        children: children,
        target: vnode.target,
        targetAnchor: vnode.targetAnchor,
        staticCount: vnode.staticCount,
        shapeFlag: vnode.shapeFlag,
        // if the vnode is cloned with extra props, we can no longer assume its
        // existing patch flag to be reliable and need to add the FULL_PROPS flag.
        // note: preserve flag for fragments since they use the flag for children
        // fast paths only.
        patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
        dynamicProps: vnode.dynamicProps,
        dynamicChildren: vnode.dynamicChildren,
        appContext: vnode.appContext,
        dirs: vnode.dirs,
        transition: vnode.transition,
        // These should technically only be non-null on mounted VNodes. However,
        // they *should* be copied for kept-alive vnodes. So we just always copy
        // them since them being non-null during a mount doesn't affect the logic as
        // they will simply be overwritten.
        component: vnode.component,
        suspense: vnode.suspense,
        ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
        ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
        el: vnode.el,
        anchor: vnode.anchor,
        ctx: vnode.ctx,
        ce: vnode.ce
    };
    return cloned;
}
function deepCloneVNode(vnode) {
    const cloned = cloneVNode(vnode);
    if (isArray(vnode.children)) cloned.children = vnode.children.map(deepCloneVNode);
    return cloned;
}
function createTextVNode(text = " ", flag = 0) {
    return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
    const vnode = createVNode(Static, null, content);
    vnode.staticCount = numberOfNodes;
    return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
    return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
    if (child == null || typeof child === "boolean") return createVNode(Comment);
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(child)) return createVNode(Fragment, null, // #3666, avoid reference pollution when reusing vnode
    child.slice());
    else if (typeof child === "object") return cloneIfMounted(child);
    else return createVNode(Text, null, String(child));
}
function cloneIfMounted(child) {
    return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
    let type = 0;
    const { shapeFlag } = vnode;
    if (children == null) children = null;
    else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(children)) type = 16;
    else if (typeof children === "object") {
        if (shapeFlag & 65) {
            const slot = children.default;
            if (slot) {
                slot._c && (slot._d = false);
                normalizeChildren(vnode, slot());
                slot._c && (slot._d = true);
            }
            return;
        } else {
            type = 32;
            const slotFlag = children._;
            if (!slotFlag && !(InternalObjectKey in children)) children._ctx = currentRenderingInstance;
            else if (slotFlag === 3 && currentRenderingInstance) {
                if (currentRenderingInstance.slots._ === 1) children._ = 1;
                else {
                    children._ = 2;
                    vnode.patchFlag |= 1024;
                }
            }
        }
    } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(children)) {
        children = {
            default: children,
            _ctx: currentRenderingInstance
        };
        type = 32;
    } else {
        children = String(children);
        if (shapeFlag & 64) {
            type = 16;
            children = [
                createTextVNode(children)
            ];
        } else type = 8;
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
}
function mergeProps(...args) {
    const ret = {};
    for(let i = 0; i < args.length; i++){
        const toMerge = args[i];
        for(const key in toMerge){
            if (key === "class") {
                if (ret.class !== toMerge.class) ret.class = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeClass)([
                    ret.class,
                    toMerge.class
                ]);
            } else if (key === "style") ret.style = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeStyle)([
                ret.style,
                toMerge.style
            ]);
            else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) {
                const existing = ret[key];
                const incoming = toMerge[key];
                if (incoming && existing !== incoming && !((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
            } else if (key !== "") ret[key] = toMerge[key];
        }
    }
    return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
    callWithAsyncErrorHandling(hook, instance, 7, [
        vnode,
        prevVNode
    ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
        uid: uid++,
        vnode,
        type,
        parent,
        appContext,
        root: null,
        // to be immediately set
        next: null,
        subTree: null,
        // will be set synchronously right after creation
        effect: null,
        update: null,
        // will be set synchronously right after creation
        scope: new _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.EffectScope(true),
        render: null,
        proxy: null,
        exposed: null,
        exposeProxy: null,
        withProxy: null,
        provides: parent ? parent.provides : Object.create(appContext.provides),
        accessCache: null,
        renderCache: [],
        // local resolved assets
        components: null,
        directives: null,
        // resolved props and emits options
        propsOptions: normalizePropsOptions(type, appContext),
        emitsOptions: normalizeEmitsOptions(type, appContext),
        // emit
        emit: null,
        // to be set immediately
        emitted: null,
        // props default value
        propsDefaults: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        // inheritAttrs
        inheritAttrs: type.inheritAttrs,
        // state
        ctx: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        data: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        props: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        attrs: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        slots: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        refs: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        setupState: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        setupContext: null,
        attrsProxy: null,
        slotsProxy: null,
        // suspense related
        suspense,
        suspenseId: suspense ? suspense.pendingId : 0,
        asyncDep: null,
        asyncResolved: false,
        // lifecycle hooks
        // not using enums here because it results in computed properties
        isMounted: false,
        isUnmounted: false,
        isDeactivated: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null
    };
    instance.ctx = {
        _: instance
    };
    instance.root = parent ? parent.root : instance;
    instance.emit = emit.bind(null, instance);
    if (vnode.ce) vnode.ce(instance);
    return instance;
}
let currentInstance = null;
const getCurrentInstance = ()=>currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
    const g = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.getGlobalThis)();
    const registerGlobalSetter = (key, setter)=>{
        let setters;
        if (!(setters = g[key])) setters = g[key] = [];
        setters.push(setter);
        return (v1)=>{
            if (setters.length > 1) setters.forEach((set)=>set(v1));
            else setters[0](v1);
        };
    };
    internalSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v1)=>currentInstance = v1);
    setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v1)=>isInSSRComponentSetup = v1);
}const setCurrentInstance = (instance)=>{
    const prev = currentInstance;
    internalSetCurrentInstance(instance);
    instance.scope.on();
    return ()=>{
        instance.scope.off();
        internalSetCurrentInstance(prev);
    };
};
const unsetCurrentInstance = ()=>{
    currentInstance && currentInstance.scope.off();
    internalSetCurrentInstance(null);
};
const isBuiltInTag = /* @__PURE__ */ (/* unused pure expression or super */ null && ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.makeMap)("slot,component")));
function validateComponentName(name, config) {
    const appIsNativeTag = config.isNativeTag || NO;
    if (isBuiltInTag(name) || appIsNativeTag(name)) warn$1("Do not use built-in or reserved HTML elements as component id: " + name);
}
function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
    isSSR && setInSSRSetupState(isSSR);
    const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children);
    const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
    isSSR && setInSSRSetupState(false);
    return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
    var _a;
    const Component = instance.type;
    instance.accessCache = /* @__PURE__ */ Object.create(null);
    instance.proxy = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.markRaw)(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
    const { setup } = Component;
    if (setup) {
        const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
        const reset = setCurrentInstance(instance);
        (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
        const setupResult = callWithErrorHandling(setup, instance, 0, [
            (0, instance.props),
            setupContext
        ]);
        (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
        reset();
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPromise)(setupResult)) {
            setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
            if (isSSR) return setupResult.then((resolvedResult)=>{
                handleSetupResult(instance, resolvedResult, isSSR);
            }).catch((e)=>{
                handleError(e, instance, 0);
            });
            else instance.asyncDep = setupResult;
        } else handleSetupResult(instance, setupResult, isSSR);
    } else finishComponentSetup(instance, isSSR);
}
function handleSetupResult(instance, setupResult, isSSR) {
    if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(setupResult)) {
        if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
        else instance.render = setupResult;
    } else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(setupResult)) {
        if (__VUE_PROD_DEVTOOLS__) instance.devtoolsRawSetupState = setupResult;
        instance.setupState = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.proxyRefs)(setupResult);
    }
    finishComponentSetup(instance, isSSR);
}
let compile;
let installWithProxy;
function registerRuntimeCompiler(_compile) {
    compile = _compile;
    installWithProxy = (i)=>{
        if (i.render._rc) i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers);
    };
}
const isRuntimeOnly = ()=>!compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    if (!instance.render) {
        if (!isSSR && compile && !Component.render) {
            const template = Component.template || resolveMergedOptions(instance).template;
            if (template) {
                const { isCustomElement, compilerOptions } = instance.appContext.config;
                const { delimiters, compilerOptions: componentCompilerOptions } = Component;
                const finalCompilerOptions = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({
                    isCustomElement,
                    delimiters
                }, compilerOptions), componentCompilerOptions);
                Component.render = compile(template, finalCompilerOptions);
            }
        }
        instance.render = Component.render || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
        if (installWithProxy) installWithProxy(instance);
    }
    if (__VUE_OPTIONS_API__ && true) {
        const reset = setCurrentInstance(instance);
        (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
        try {
            applyOptions(instance);
        } finally{
            (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
            reset();
        }
    }
}
function getAttrsProxy(instance) {
    return instance.attrsProxy || (instance.attrsProxy = new Proxy(instance.attrs, {
        get (target, key) {
            (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.track)(instance, "get", "$attrs");
            return target[key];
        }
    }));
}
function getSlotsProxy(instance) {
    return instance.slotsProxy || (instance.slotsProxy = new Proxy(instance.slots, {
        get (target, key) {
            track(instance, "get", "$slots");
            return target[key];
        }
    }));
}
function createSetupContext(instance) {
    const expose = (exposed)=>{
        instance.exposed = exposed || {};
    };
    var event, args;
    return {
        get attrs () {
            return getAttrsProxy(instance);
        },
        slots: instance.slots,
        emit: instance.emit,
        expose
    };
}
function getExposeProxy(instance) {
    if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.proxyRefs)((0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.markRaw)(instance.exposed)), {
        get (target, key) {
            if (key in target) return target[key];
            else if (key in publicPropertiesMap) return publicPropertiesMap[key](instance);
        },
        has (target, key) {
            return key in target || key in publicPropertiesMap;
        }
    }));
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str)=>str.replace(classifyRE, (c)=>c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
    return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
    let name = getComponentName(Component);
    if (!name && Component.__file) {
        const match = Component.__file.match(/([^/\\]+)\.\w+$/);
        if (match) name = match[1];
    }
    if (!name && instance && instance.parent) {
        const inferFromRegistry = (registry)=>{
            for(const key in registry){
                if (registry[key] === Component) return key;
            }
        };
        name = inferFromRegistry(instance.components || instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
    }
    return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
    return (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions)=>{
    return (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.computed)(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
function useModel(props, name, options = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
    const i = getCurrentInstance();
    const camelizedName = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name);
    const hyphenatedName = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(name);
    const res = (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.customRef)((track, trigger)=>{
        let localValue;
        watchSyncEffect(()=>{
            const propValue = props[name];
            if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(localValue, propValue)) {
                localValue = propValue;
                trigger();
            }
        });
        return {
            get () {
                track();
                return options.get ? options.get(localValue) : localValue;
            },
            set (value) {
                const rawProps = i.vnode.props;
                if (!(rawProps && (name in rawProps || camelizedName in rawProps || hyphenatedName in rawProps) && (`onUpdate:${name}` in rawProps || `onUpdate:${camelizedName}` in rawProps || `onUpdate:${hyphenatedName}` in rawProps)) && (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(value, localValue)) {
                    localValue = value;
                    trigger();
                }
                i.emit(`update:${name}`, options.set ? options.set(value) : value);
            }
        };
    });
    const modifierKey = name === "modelValue" ? "modelModifiers" : `${name}Modifiers`;
    res[Symbol.iterator] = ()=>{
        let i2 = 0;
        return {
            next () {
                if (i2 < 2) return {
                    value: i2++ ? props[modifierKey] || {} : res,
                    done: false
                };
                else return {
                    done: true
                };
            }
        };
    };
    return res;
}
function h(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(propsOrChildren) && !(0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(propsOrChildren)) {
            if (isVNode(propsOrChildren)) return createVNode(type, null, [
                propsOrChildren
            ]);
            return createVNode(type, propsOrChildren);
        } else return createVNode(type, null, propsOrChildren);
    } else {
        if (l > 3) children = Array.prototype.slice.call(arguments, 2);
        else if (l === 3 && isVNode(children)) children = [
            children
        ];
        return createVNode(type, propsOrChildren, children);
    }
}
function isShallow(value) {
    return !!(value && value["__v_isShallow"]);
}
function initCustomFormatter() {
    return;
    function formatInstance(instance) {
        const blocks = [];
        if (instance.type.props && instance.props) blocks.push(createInstanceBlock("props", (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(instance.props)));
        if (instance.setupState !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) blocks.push(createInstanceBlock("setup", instance.setupState));
        if (instance.data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) blocks.push(createInstanceBlock("data", (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(instance.data)));
        const computed = extractKeys(instance, "computed");
        if (computed) blocks.push(createInstanceBlock("computed", computed));
        const injected = extractKeys(instance, "inject");
        if (injected) blocks.push(createInstanceBlock("injected", injected));
        blocks.push([
            "div",
            {},
            [
                "span",
                {
                    style: keywordStyle.style + ";opacity:0.66"
                },
                "$ (internal): "
            ],
            [
                "object",
                {
                    object: instance
                }
            ]
        ]);
        return blocks;
    }
    function createInstanceBlock(type, target) {
        target = (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, target);
        if (!Object.keys(target).length) return [
            "span",
            {}
        ];
        return [
            "div",
            {
                style: "line-height:1.25em;margin-bottom:0.6em"
            },
            [
                "div",
                {
                    style: "color:#476582"
                },
                type
            ],
            [
                "div",
                {
                    style: "padding-left:1.25em"
                },
                ...Object.keys(target).map((key)=>{
                    return [
                        "div",
                        {},
                        [
                            "span",
                            keywordStyle,
                            key + ": "
                        ],
                        formatValue(target[key], false)
                    ];
                })
            ]
        ];
    }
    function formatValue(v1, asRaw = true) {
        if (typeof v1 === "number") return [
            "span",
            numberStyle,
            v1
        ];
        else if (typeof v1 === "string") return [
            "span",
            stringStyle,
            JSON.stringify(v1)
        ];
        else if (typeof v1 === "boolean") return [
            "span",
            keywordStyle,
            v1
        ];
        else if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(v1)) return [
            "object",
            {
                object: asRaw ? (0, _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(v1) : v1
            }
        ];
        else return [
            "span",
            stringStyle,
            String(v1)
        ];
    }
    function extractKeys(instance, type) {
        const Comp = instance.type;
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(Comp)) return;
        const extracted = {};
        for(const key in instance.ctx)if (isKeyOfType(Comp, key, type)) extracted[key] = instance.ctx[key];
        return extracted;
    }
    function isKeyOfType(Comp, key, type) {
        const opts = Comp[type];
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(opts) && opts.includes(key) || (0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(opts) && key in opts) return true;
        if (Comp.extends && isKeyOfType(Comp.extends, key, type)) return true;
        if (Comp.mixins && Comp.mixins.some((m)=>isKeyOfType(m, key, type))) return true;
    }
    function genRefFlag(v1) {
        if (isShallow(v1)) return `ShallowRef`;
        if (v1.effect) return `ComputedRef`;
        return `Ref`;
    }
}
function withMemo(memo, render, cache, index) {
    const cached = cache[index];
    if (cached && isMemoSame(cached, memo)) return cached;
    const ret = render();
    ret.memo = memo.slice();
    return cache[index] = ret;
}
function isMemoSame(cached, memo) {
    const prev = cached.memo;
    if (prev.length != memo.length) return false;
    for(let i = 0; i < prev.length; i++){
        if ((0, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(prev[i], memo[i])) return false;
    }
    if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(cached);
    return true;
}
const version = "3.4.12";
const warn = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
const ErrorTypeStrings = ErrorTypeStrings$1;
const devtools = devtools$1;
const setDevtoolsHook = setDevtoolsHook$1;
const _ssrUtils = {
    createComponentInstance,
    setupComponent,
    renderComponentRoot,
    setCurrentRenderingInstance,
    isVNode: isVNode,
    normalizeVNode
};
const ssrUtils = _ssrUtils;
const resolveFilter = null;
const compatUtils = null;
const DeprecationTypes = null;

}),
"./node_modules/.pnpm/@vue+shared@3.4.12/node_modules/@vue/shared/dist/shared.esm-bundler.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  EMPTY_ARR: function() { return EMPTY_ARR; },
  EMPTY_OBJ: function() { return EMPTY_OBJ; },
  NO: function() { return NO; },
  NOOP: function() { return NOOP; },
  camelize: function() { return camelize; },
  capitalize: function() { return capitalize; },
  def: function() { return def; },
  extend: function() { return extend; },
  getGlobalThis: function() { return getGlobalThis; },
  hasChanged: function() { return hasChanged; },
  hasOwn: function() { return hasOwn; },
  hyphenate: function() { return hyphenate; },
  invokeArrayFns: function() { return invokeArrayFns; },
  isArray: function() { return isArray; },
  isFunction: function() { return isFunction; },
  isGloballyAllowed: function() { return isGloballyAllowed; },
  isIntegerKey: function() { return isIntegerKey; },
  isMap: function() { return isMap; },
  isModelListener: function() { return isModelListener; },
  isObject: function() { return isObject; },
  isOn: function() { return isOn; },
  isPlainObject: function() { return isPlainObject; },
  isPromise: function() { return isPromise; },
  isRegExp: function() { return isRegExp; },
  isReservedProp: function() { return isReservedProp; },
  isSet: function() { return isSet; },
  isString: function() { return isString; },
  isSymbol: function() { return isSymbol; },
  looseToNumber: function() { return looseToNumber; },
  makeMap: function() { return makeMap; },
  normalizeClass: function() { return normalizeClass; },
  normalizeStyle: function() { return normalizeStyle; },
  remove: function() { return remove; },
  toHandlerKey: function() { return toHandlerKey; },
  toNumber: function() { return toNumber; },
  toRawType: function() { return toRawType; }
});
/**
* @vue/shared v3.4.12
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/ function makeMap(str, expectsLowerCase) {
    const set = new Set(str.split(","));
    return expectsLowerCase ? (val)=>set.has(val.toLowerCase()) : (val)=>set.has(val);
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = ()=>{};
const NO = ()=>false;
const isOn = (key)=>key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key)=>key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el)=>{
    const i = arr.indexOf(el);
    if (i > -1) arr.splice(i, 1);
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key)=>hasOwnProperty.call(val, key);
const isArray = Array.isArray;
const isMap = (val)=>toTypeString(val) === "[object Map]";
const isSet = (val)=>toTypeString(val) === "[object Set]";
const isDate = (val)=>toTypeString(val) === "[object Date]";
const isRegExp = (val)=>toTypeString(val) === "[object RegExp]";
const isFunction = (val)=>typeof val === "function";
const isString = (val)=>typeof val === "string";
const isSymbol = (val)=>typeof val === "symbol";
const isObject = (val)=>val !== null && typeof val === "object";
const isPromise = (val)=>{
    return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value)=>objectToString.call(value);
const toRawType = (value)=>{
    return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val)=>toTypeString(val) === "[object Object]";
const isIntegerKey = (key)=>isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(// the leading comma is intentional so empty string "" is also included
",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
const isBuiltInDirective = /* @__PURE__ */ makeMap("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo");
const cacheStringFunction = (fn)=>{
    const cache = /* @__PURE__ */ Object.create(null);
    return (str)=>{
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str)=>{
    return str.replace(camelizeRE, (_, c)=>c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction((str)=>str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str)=>{
    return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction((str)=>{
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
});
const hasChanged = (value, oldValue)=>!Object.is(value, oldValue);
const invokeArrayFns = (fns, arg)=>{
    for(let i = 0; i < fns.length; i++)fns[i](arg);
};
const def = (obj, key, value)=>{
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: false,
        value
    });
};
const looseToNumber = (val)=>{
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
};
const toNumber = (val)=>{
    const n = isString(val) ? Number(val) : NaN;
    return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = ()=>{
    return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : {});
};
const identRE = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;
function genPropsAccessExp(name) {
    return identRE.test(name) ? `__props.${name}` : `__props[${JSON.stringify(name)}]`;
}
const PatchFlags = {
    "TEXT": 1,
    "1": "TEXT",
    "CLASS": 2,
    "2": "CLASS",
    "STYLE": 4,
    "4": "STYLE",
    "PROPS": 8,
    "8": "PROPS",
    "FULL_PROPS": 16,
    "16": "FULL_PROPS",
    "NEED_HYDRATION": 32,
    "32": "NEED_HYDRATION",
    "STABLE_FRAGMENT": 64,
    "64": "STABLE_FRAGMENT",
    "KEYED_FRAGMENT": 128,
    "128": "KEYED_FRAGMENT",
    "UNKEYED_FRAGMENT": 256,
    "256": "UNKEYED_FRAGMENT",
    "NEED_PATCH": 512,
    "512": "NEED_PATCH",
    "DYNAMIC_SLOTS": 1024,
    "1024": "DYNAMIC_SLOTS",
    "DEV_ROOT_FRAGMENT": 2048,
    "2048": "DEV_ROOT_FRAGMENT",
    "HOISTED": -1,
    "-1": "HOISTED",
    "BAIL": -2,
    "-2": "BAIL"
};
const PatchFlagNames = {
    [1]: `TEXT`,
    [2]: `CLASS`,
    [4]: `STYLE`,
    [8]: `PROPS`,
    [16]: `FULL_PROPS`,
    [32]: `NEED_HYDRATION`,
    [64]: `STABLE_FRAGMENT`,
    [128]: `KEYED_FRAGMENT`,
    [256]: `UNKEYED_FRAGMENT`,
    [512]: `NEED_PATCH`,
    [1024]: `DYNAMIC_SLOTS`,
    [2048]: `DEV_ROOT_FRAGMENT`,
    [-1]: `HOISTED`,
    [-2]: `BAIL`
};
const ShapeFlags = {
    "ELEMENT": 1,
    "1": "ELEMENT",
    "FUNCTIONAL_COMPONENT": 2,
    "2": "FUNCTIONAL_COMPONENT",
    "STATEFUL_COMPONENT": 4,
    "4": "STATEFUL_COMPONENT",
    "TEXT_CHILDREN": 8,
    "8": "TEXT_CHILDREN",
    "ARRAY_CHILDREN": 16,
    "16": "ARRAY_CHILDREN",
    "SLOTS_CHILDREN": 32,
    "32": "SLOTS_CHILDREN",
    "TELEPORT": 64,
    "64": "TELEPORT",
    "SUSPENSE": 128,
    "128": "SUSPENSE",
    "COMPONENT_SHOULD_KEEP_ALIVE": 256,
    "256": "COMPONENT_SHOULD_KEEP_ALIVE",
    "COMPONENT_KEPT_ALIVE": 512,
    "512": "COMPONENT_KEPT_ALIVE",
    "COMPONENT": 6,
    "6": "COMPONENT"
};
const SlotFlags = {
    "STABLE": 1,
    "1": "STABLE",
    "DYNAMIC": 2,
    "2": "DYNAMIC",
    "FORWARDED": 3,
    "3": "FORWARDED"
};
const slotFlagsText = {
    [1]: "STABLE",
    [2]: "DYNAMIC",
    [3]: "FORWARDED"
};
const GLOBALS_ALLOWED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error";
const isGloballyAllowed = /* @__PURE__ */ makeMap(GLOBALS_ALLOWED);
const isGloballyWhitelisted = isGloballyAllowed;
const range = 2;
function generateCodeFrame(source, start = 0, end = source.length) {
    let lines = source.split(/(\r?\n)/);
    const newlineSequences = lines.filter((_, idx)=>idx % 2 === 1);
    lines = lines.filter((_, idx)=>idx % 2 === 0);
    let count = 0;
    const res = [];
    for(let i = 0; i < lines.length; i++){
        count += lines[i].length + (newlineSequences[i] && newlineSequences[i].length || 0);
        if (count >= start) {
            for(let j = i - range; j <= i + range || end > count; j++){
                if (j < 0 || j >= lines.length) continue;
                const line = j + 1;
                res.push(`${line}${" ".repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
                const lineLength = lines[j].length;
                const newLineSeqLength = newlineSequences[j] && newlineSequences[j].length || 0;
                if (j === i) {
                    const pad = start - (count - (lineLength + newLineSeqLength));
                    const length = Math.max(1, end > count ? lineLength - pad : end - start);
                    res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
                } else if (j > i) {
                    if (end > count) {
                        const length = Math.max(Math.min(end - count, lineLength), 1);
                        res.push(`   |  ` + "^".repeat(length));
                    }
                    count += lineLength + newLineSeqLength;
                }
            }
            break;
        }
    }
    return res.join("\n");
}
function normalizeStyle(value) {
    if (isArray(value)) {
        const res = {};
        for(let i = 0; i < value.length; i++){
            const item = value[i];
            const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
            if (normalized) for(const key in normalized)res[key] = normalized[key];
        }
        return res;
    } else if (isString(value) || isObject(value)) return value;
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
    const ret = {};
    cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item)=>{
        if (item) {
            const tmp = item.split(propertyDelimiterRE);
            tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
        }
    });
    return ret;
}
function stringifyStyle(styles) {
    let ret = "";
    if (!styles || isString(styles)) return ret;
    for(const key in styles){
        const value = styles[key];
        const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
        if (isString(value) || typeof value === "number") ret += `${normalizedKey}:${value};`;
    }
    return ret;
}
function normalizeClass(value) {
    let res = "";
    if (isString(value)) res = value;
    else if (isArray(value)) for(let i = 0; i < value.length; i++){
        const normalized = normalizeClass(value[i]);
        if (normalized) res += normalized + " ";
    }
    else if (isObject(value)) {
        for(const name in value)if (value[name]) res += name + " ";
    }
    return res.trim();
}
function normalizeProps(props) {
    if (!props) return null;
    let { class: klass, style } = props;
    if (klass && !isString(klass)) props.class = normalizeClass(klass);
    if (style) props.style = normalizeStyle(style);
    return props;
}
const HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
const SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
const MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
const VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
const isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
const isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
const isMathMLTag = /* @__PURE__ */ makeMap(MATH_TAGS);
const isVoidTag = /* @__PURE__ */ makeMap(VOID_TAGS);
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
const isBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
function includeBooleanAttr(value) {
    return !!value || value === "";
}
const unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u0020]/;
const attrValidationCache = {};
function isSSRSafeAttrName(name) {
    if (attrValidationCache.hasOwnProperty(name)) return attrValidationCache[name];
    const isUnsafe = unsafeAttrCharRE.test(name);
    if (isUnsafe) console.error(`unsafe attribute name: ${name}`);
    return attrValidationCache[name] = !isUnsafe;
}
const propsToAttrMap = {
    acceptCharset: "accept-charset",
    className: "class",
    htmlFor: "for",
    httpEquiv: "http-equiv"
};
const isKnownHtmlAttr = /* @__PURE__ */ makeMap(`accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,inert,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap`);
const isKnownSvgAttr = /* @__PURE__ */ makeMap(`xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,overflow,overline-position,overline-thickness,panose-1,paint-order,path,pathLength,patternContentUnits,patternTransform,patternUnits,ping,pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,specularConstant,specularExponent,speed,spreadMethod,startOffset,stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,string,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,text-decoration,text-rendering,textLength,to,transform,transform-origin,type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xmlns:xlink,xml:base,xml:lang,xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan`);
const escapeRE = /["'&<>]/;
function escapeHtml(string) {
    const str = "" + string;
    const match = escapeRE.exec(str);
    if (!match) return str;
    let html = "";
    let escaped;
    let index;
    let lastIndex = 0;
    for(index = match.index; index < str.length; index++){
        switch(str.charCodeAt(index)){
            case 34:
                escaped = "&quot;";
                break;
            case 38:
                escaped = "&amp;";
                break;
            case 39:
                escaped = "&#39;";
                break;
            case 60:
                escaped = "&lt;";
                break;
            case 62:
                escaped = "&gt;";
                break;
            default:
                continue;
        }
        if (lastIndex !== index) html += str.slice(lastIndex, index);
        lastIndex = index + 1;
        html += escaped;
    }
    return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
const commentStripRE = /^-?>|<!--|-->|--!>|<!-$/g;
function escapeHtmlComment(src) {
    return src.replace(commentStripRE, "");
}
function looseCompareArrays(a, b) {
    if (a.length !== b.length) return false;
    let equal = true;
    for(let i = 0; equal && i < a.length; i++)equal = looseEqual(a[i], b[i]);
    return equal;
}
function looseEqual(a, b) {
    if (a === b) return true;
    let aValidType = isDate(a);
    let bValidType = isDate(b);
    if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
    aValidType = isSymbol(a);
    bValidType = isSymbol(b);
    if (aValidType || bValidType) return a === b;
    aValidType = isArray(a);
    bValidType = isArray(b);
    if (aValidType || bValidType) return aValidType && bValidType ? looseCompareArrays(a, b) : false;
    aValidType = isObject(a);
    bValidType = isObject(b);
    if (aValidType || bValidType) {
        if (!aValidType || !bValidType) return false;
        const aKeysCount = Object.keys(a).length;
        const bKeysCount = Object.keys(b).length;
        if (aKeysCount !== bKeysCount) return false;
        for(const key in a){
            const aHasKey = a.hasOwnProperty(key);
            const bHasKey = b.hasOwnProperty(key);
            if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) return false;
        }
    }
    return String(a) === String(b);
}
function looseIndexOf(arr, val) {
    return arr.findIndex((item)=>looseEqual(item, val));
}
const toDisplayString = (val)=>{
    return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val)=>{
    if (val && val.__v_isRef) return replacer(_key, val.value);
    else if (isMap(val)) return {
        [`Map(${val.size})`]: [
            ...val.entries()
        ].reduce((entries, [key, val2], i)=>{
            entries[stringifySymbol(key, i) + " =>"] = val2;
            return entries;
        }, {})
    };
    else if (isSet(val)) return {
        [`Set(${val.size})`]: [
            ...val.values()
        ].map((v)=>stringifySymbol(v))
    };
    else if (isSymbol(val)) return stringifySymbol(val);
    else if (isObject(val) && !isArray(val) && !isPlainObject(val)) return String(val);
    return val;
};
const stringifySymbol = (v, i = "")=>{
    var _a;
    return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
};

}),
"./src/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */var vant__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vant */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/button/index.mjs");
/* harmony import */var vant__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vant */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/swipe/index.mjs");
// import { createApp } from "vue";

console.log(createApp, vant__WEBPACK_IMPORTED_MODULE_0__.Button, vant__WEBPACK_IMPORTED_MODULE_1__.Swipe);
}),
"./node_modules/.pnpm/@vant+use@1.6.0_vue@3.4.12/node_modules/@vant/use/dist/index.esm.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  doubleRaf: function() { return doubleRaf; },
  useChildren: function() { return useChildren; },
  useEventListener: function() { return useEventListener; },
  usePageVisibility: function() { return usePageVisibility; },
  useRect: function() { return useRect; },
  useWindowSize: function() { return useWindowSize; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+reactivity@3.4.12/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
// src/utils.ts
var inBrowser = typeof window !== "undefined";
var supportsPassive = true;
function raf(fn) {
    return inBrowser ? requestAnimationFrame(fn) : -1;
}
function cancelRaf(id) {
    if (inBrowser) cancelAnimationFrame(id);
}
function doubleRaf(fn) {
    raf(()=>raf(fn));
}
// src/useRect/index.ts

var isWindow = (val)=>val === window;
var makeDOMRect = (width2, height2)=>({
        top: 0,
        left: 0,
        right: width2,
        bottom: height2,
        width: width2,
        height: height2
    });
var useRect = (elementOrRef)=>{
    const element = (0, vue__WEBPACK_IMPORTED_MODULE_0__.unref)(elementOrRef);
    if (isWindow(element)) {
        const width2 = element.innerWidth;
        const height2 = element.innerHeight;
        return makeDOMRect(width2, height2);
    }
    if (element == null ? void 0 : element.getBoundingClientRect) return element.getBoundingClientRect();
    return makeDOMRect(0, 0);
};
// src/useToggle/index.ts

function useToggle(defaultValue = false) {
    const state = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(defaultValue);
    const toggle = (value = !state.value)=>{
        state.value = value;
    };
    return [
        state,
        toggle
    ];
}
// src/useRelation/useParent.ts

function useParent(key) {
    const parent = (0, vue__WEBPACK_IMPORTED_MODULE_1__.inject)(key, null);
    if (parent) {
        const instance = (0, vue__WEBPACK_IMPORTED_MODULE_1__.getCurrentInstance)();
        const { link, unlink, internalChildren } = parent;
        link(instance);
        (0, vue__WEBPACK_IMPORTED_MODULE_1__.onUnmounted)(()=>unlink(instance));
        const index = (0, vue__WEBPACK_IMPORTED_MODULE_1__.computed)(()=>internalChildren.indexOf(instance));
        return {
            parent,
            index
        };
    }
    return {
        parent: null,
        index: (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(-1)
    };
}
// src/useRelation/useChildren.ts

function flattenVNodes(children) {
    const result = [];
    const traverse = (children2)=>{
        if (Array.isArray(children2)) children2.forEach((child)=>{
            var _a;
            if ((0, vue__WEBPACK_IMPORTED_MODULE_1__.isVNode)(child)) {
                result.push(child);
                if ((_a = child.component) == null ? void 0 : _a.subTree) {
                    result.push(child.component.subTree);
                    traverse(child.component.subTree.children);
                }
                if (child.children) traverse(child.children);
            }
        });
    };
    traverse(children);
    return result;
}
var findVNodeIndex = (vnodes, vnode)=>{
    const index = vnodes.indexOf(vnode);
    if (index === -1) return vnodes.findIndex((item)=>vnode.key !== void 0 && vnode.key !== null && item.type === vnode.type && item.key === vnode.key);
    return index;
};
function sortChildren(parent, publicChildren, internalChildren) {
    const vnodes = flattenVNodes(parent.subTree.children);
    internalChildren.sort((a, b)=>findVNodeIndex(vnodes, a.vnode) - findVNodeIndex(vnodes, b.vnode));
    const orderedPublicChildren = internalChildren.map((item)=>item.proxy);
    publicChildren.sort((a, b)=>{
        const indexA = orderedPublicChildren.indexOf(a);
        const indexB = orderedPublicChildren.indexOf(b);
        return indexA - indexB;
    });
}
function useChildren(key) {
    const publicChildren = (0, vue__WEBPACK_IMPORTED_MODULE_0__.reactive)([]);
    const internalChildren = (0, vue__WEBPACK_IMPORTED_MODULE_0__.reactive)([]);
    const parent = (0, vue__WEBPACK_IMPORTED_MODULE_1__.getCurrentInstance)();
    const linkChildren = (value)=>{
        const link = (child)=>{
            if (child.proxy) {
                internalChildren.push(child);
                publicChildren.push(child.proxy);
                sortChildren(parent, publicChildren, internalChildren);
            }
        };
        const unlink = (child)=>{
            const index = internalChildren.indexOf(child);
            publicChildren.splice(index, 1);
            internalChildren.splice(index, 1);
        };
        (0, vue__WEBPACK_IMPORTED_MODULE_1__.provide)(key, Object.assign({
            link,
            unlink,
            children: publicChildren,
            internalChildren
        }, value));
    };
    return {
        children: publicChildren,
        linkChildren
    };
}
// src/useCountDown/index.ts

var SECOND = 1e3;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
function parseTime(time) {
    const days = Math.floor(time / DAY);
    const hours = Math.floor(time % DAY / HOUR);
    const minutes = Math.floor(time % HOUR / MINUTE);
    const seconds = Math.floor(time % MINUTE / SECOND);
    const milliseconds = Math.floor(time % SECOND);
    return {
        total: time,
        days,
        hours,
        minutes,
        seconds,
        milliseconds
    };
}
function isSameSecond(time1, time2) {
    return Math.floor(time1 / 1e3) === Math.floor(time2 / 1e3);
}
function useCountDown(options) {
    let rafId;
    let endTime;
    let counting;
    let deactivated;
    const remain = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(options.time);
    const current = (0, vue__WEBPACK_IMPORTED_MODULE_1__.computed)(()=>parseTime(remain.value));
    const pause = ()=>{
        counting = false;
        cancelRaf(rafId);
    };
    const getCurrentRemain = ()=>Math.max(endTime - Date.now(), 0);
    const setRemain = (value)=>{
        var _a, _b;
        remain.value = value;
        (_a = options.onChange) == null || _a.call(options, current.value);
        if (value === 0) {
            pause();
            (_b = options.onFinish) == null || _b.call(options);
        }
    };
    const microTick = ()=>{
        rafId = raf(()=>{
            if (counting) {
                setRemain(getCurrentRemain());
                if (remain.value > 0) microTick();
            }
        });
    };
    const macroTick = ()=>{
        rafId = raf(()=>{
            if (counting) {
                const remainRemain = getCurrentRemain();
                if (!isSameSecond(remainRemain, remain.value) || remainRemain === 0) setRemain(remainRemain);
                if (remain.value > 0) macroTick();
            }
        });
    };
    const tick = ()=>{
        if (!inBrowser) return;
        if (options.millisecond) microTick();
        else macroTick();
    };
    const start = ()=>{
        if (!counting) {
            endTime = Date.now() + remain.value;
            counting = true;
            tick();
        }
    };
    const reset = (totalTime = options.time)=>{
        pause();
        remain.value = totalTime;
    };
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onBeforeUnmount)(pause);
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onActivated)(()=>{
        if (deactivated) {
            counting = true;
            deactivated = false;
            tick();
        }
    });
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onDeactivated)(()=>{
        if (counting) {
            pause();
            deactivated = true;
        }
    });
    return {
        start,
        pause,
        reset,
        current
    };
}
// src/useClickAway/index.ts

// src/useEventListener/index.ts

// src/onMountedOrActivated/index.ts

function onMountedOrActivated(hook) {
    let mounted;
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onMounted)(()=>{
        hook();
        (0, vue__WEBPACK_IMPORTED_MODULE_1__.nextTick)(()=>{
            mounted = true;
        });
    });
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onActivated)(()=>{
        if (mounted) hook();
    });
}
// src/useEventListener/index.ts
function useEventListener(type, listener, options = {}) {
    if (!inBrowser) return;
    const { target = window, passive = false, capture = false } = options;
    let cleaned = false;
    let attached;
    const add = (target2)=>{
        if (cleaned) return;
        const element = (0, vue__WEBPACK_IMPORTED_MODULE_0__.unref)(target2);
        if (element && !attached) {
            element.addEventListener(type, listener, {
                capture,
                passive
            });
            attached = true;
        }
    };
    const remove = (target2)=>{
        if (cleaned) return;
        const element = (0, vue__WEBPACK_IMPORTED_MODULE_0__.unref)(target2);
        if (element && attached) {
            element.removeEventListener(type, listener, capture);
            attached = false;
        }
    };
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onUnmounted)(()=>remove(target));
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onDeactivated)(()=>remove(target));
    onMountedOrActivated(()=>add(target));
    let stopWatch;
    if ((0, vue__WEBPACK_IMPORTED_MODULE_0__.isRef)(target)) stopWatch = (0, vue__WEBPACK_IMPORTED_MODULE_1__.watch)(target, (val, oldVal)=>{
        remove(oldVal);
        add(val);
    });
    return ()=>{
        stopWatch == null || stopWatch();
        remove(target);
        cleaned = true;
    };
}
// src/useClickAway/index.ts
function useClickAway(target, listener, options = {}) {
    if (!inBrowser) return;
    const { eventName = "click" } = options;
    const onClick = (event)=>{
        const targets = Array.isArray(target) ? target : [
            target
        ];
        const isClickAway = targets.every((item)=>{
            const element = (0, vue__WEBPACK_IMPORTED_MODULE_0__.unref)(item);
            return element && !element.contains(event.target);
        });
        if (isClickAway) listener(event);
    };
    useEventListener(eventName, onClick, {
        target: document
    });
}
// src/useWindowSize/index.ts

var width;
var height;
function useWindowSize() {
    if (!width) {
        width = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
        height = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
        if (inBrowser) {
            const update = ()=>{
                width.value = window.innerWidth;
                height.value = window.innerHeight;
            };
            update();
            window.addEventListener("resize", update, {
                passive: true
            });
            window.addEventListener("orientationchange", update, {
                passive: true
            });
        }
    }
    return {
        width,
        height
    };
}
// src/useScrollParent/index.ts

var overflowScrollReg = /scroll|auto|overlay/i;
var defaultRoot = inBrowser ? window : void 0;
function isElement(node) {
    const ELEMENT_NODE_TYPE = 1;
    return node.tagName !== "HTML" && node.tagName !== "BODY" && node.nodeType === ELEMENT_NODE_TYPE;
}
function getScrollParent(el, root = defaultRoot) {
    let node = el;
    while(node && node !== root && isElement(node)){
        const { overflowY } = window.getComputedStyle(node);
        if (overflowScrollReg.test(overflowY)) return node;
        node = node.parentNode;
    }
    return root;
}
function useScrollParent(el, root = defaultRoot) {
    const scrollParent = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.onMounted)(()=>{
        if (el.value) scrollParent.value = getScrollParent(el.value, root);
    });
    return scrollParent;
}
// src/usePageVisibility/index.ts

var visibility;
function usePageVisibility() {
    if (!visibility) {
        visibility = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)("visible");
        if (inBrowser) {
            const update = ()=>{
                visibility.value = document.hidden ? "hidden" : "visible";
            };
            update();
            window.addEventListener("visibilitychange", update);
        }
    }
    return visibility;
}
// src/useCustomFieldValue/index.ts

var CUSTOM_FIELD_INJECTION_KEY = Symbol("van-field");
function useCustomFieldValue(customValue) {
    const field = (0, vue__WEBPACK_IMPORTED_MODULE_1__.inject)(CUSTOM_FIELD_INJECTION_KEY, null);
    if (field && !field.customValue.value) {
        field.customValue.value = customValue;
        (0, vue__WEBPACK_IMPORTED_MODULE_1__.watch)(customValue, ()=>{
            field.resetValidation();
            field.validateWithTrigger("onChange");
        });
    }
}
// src/useRaf/index.ts
function useRaf(fn, options) {
    if (inBrowser) {
        const { interval = 0, isLoop = false } = options || {};
        let start;
        let isStopped = false;
        let rafId;
        const stop = ()=>{
            isStopped = true;
            cancelAnimationFrame(rafId);
        };
        const frameWrapper = (timestamp)=>{
            if (isStopped) return;
            if (start === void 0) start = timestamp;
            else if (timestamp - start > interval) {
                fn(timestamp);
                start = timestamp;
                if (!isLoop) {
                    stop();
                    return;
                }
            }
            rafId = requestAnimationFrame(frameWrapper);
        };
        rafId = requestAnimationFrame(frameWrapper);
        return stop;
    }
    return ()=>{};
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/badge/Badge.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return stdin_default; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/create.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/props.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs");



const [name, bem] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createNamespace)("badge");
const badgeProps = {
    dot: Boolean,
    max: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.numericProp,
    tag: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeStringProp)("div"),
    color: String,
    offset: Array,
    content: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.numericProp,
    showZero: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.truthProp,
    position: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeStringProp)("top-right")
};
var stdin_default = (0, vue__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
    name,
    props: badgeProps,
    setup (props, { slots }) {
        const hasContent = ()=>{
            if (slots.content) return true;
            const { content, showZero } = props;
            return (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.isDef)(content) && content !== "" && (showZero || content !== 0 && content !== "0");
        };
        const renderContent = ()=>{
            const { dot, max, content } = props;
            if (!dot && hasContent()) {
                if (slots.content) return slots.content();
                if ((0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.isDef)(max) && (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.isNumeric)(content) && +content > +max) return `${max}+`;
                return content;
            }
        };
        const getOffsetWithMinusString = (val)=>val.startsWith("-") ? val.replace("-", "") : `-${val}`;
        const style = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>{
            const style2 = {
                background: props.color
            };
            if (props.offset) {
                const [x, y] = props.offset;
                const { position } = props;
                const [offsetY, offsetX] = position.split("-");
                if (slots.default) {
                    if (typeof y === "number") style2[offsetY] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.addUnit)(offsetY === "top" ? y : -y);
                    else style2[offsetY] = offsetY === "top" ? (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.addUnit)(y) : getOffsetWithMinusString(y);
                    if (typeof x === "number") style2[offsetX] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.addUnit)(offsetX === "left" ? x : -x);
                    else style2[offsetX] = offsetX === "left" ? (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.addUnit)(x) : getOffsetWithMinusString(x);
                } else {
                    style2.marginTop = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.addUnit)(y);
                    style2.marginLeft = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.addUnit)(x);
                }
            }
            return style2;
        });
        const renderBadge = ()=>{
            if (hasContent() || props.dot) return (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)("div", {
                "class": bem([
                    props.position,
                    {
                        dot: props.dot,
                        fixed: !!slots.default
                    }
                ]),
                "style": style.value
            }, [
                renderContent()
            ]);
        };
        return ()=>{
            if (slots.default) {
                const { tag } = props;
                return (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)(tag, {
                    "class": bem("wrapper")
                }, {
                    default: ()=>[
                            slots.default(),
                            renderBadge()
                        ]
                });
            }
            return renderBadge();
        };
    }
});

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/badge/index.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Badge: function() { return Badge; }
});
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/with-install.mjs");
/* harmony import */var _Badge_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Badge.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/badge/Badge.mjs");


const Badge = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.withInstall)(_Badge_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]);
var stdin_default = Badge;


}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/button/Button.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return stdin_default; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/create.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/props.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/dom.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/constant.mjs");
/* harmony import */var _composables_use_route_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../composables/use-route.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-route.mjs");
/* harmony import */var _icon_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../icon/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/icon/index.mjs");
/* harmony import */var _loading_index_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../loading/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/loading/index.mjs");






const [name, bem] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createNamespace)("button");
const buttonProps = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.extend)({}, _composables_use_route_mjs__WEBPACK_IMPORTED_MODULE_2__.routeProps, {
    tag: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.makeStringProp)("button"),
    text: String,
    icon: String,
    type: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.makeStringProp)("default"),
    size: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.makeStringProp)("normal"),
    color: String,
    block: Boolean,
    plain: Boolean,
    round: Boolean,
    square: Boolean,
    loading: Boolean,
    hairline: Boolean,
    disabled: Boolean,
    iconPrefix: String,
    nativeType: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.makeStringProp)("button"),
    loadingSize: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.numericProp,
    loadingText: String,
    loadingType: String,
    iconPosition: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.makeStringProp)("left")
});
var stdin_default = (0, vue__WEBPACK_IMPORTED_MODULE_4__.defineComponent)({
    name,
    props: buttonProps,
    emits: [
        "click"
    ],
    setup (props, { emit, slots }) {
        const route = (0, _composables_use_route_mjs__WEBPACK_IMPORTED_MODULE_2__.useRoute)();
        const renderLoadingIcon = ()=>{
            if (slots.loading) return slots.loading();
            return (0, vue__WEBPACK_IMPORTED_MODULE_4__.createVNode)(_loading_index_mjs__WEBPACK_IMPORTED_MODULE_5__.Loading, {
                "size": props.loadingSize,
                "type": props.loadingType,
                "class": bem("loading")
            }, null);
        };
        const renderIcon = ()=>{
            if (props.loading) return renderLoadingIcon();
            if (slots.icon) return (0, vue__WEBPACK_IMPORTED_MODULE_4__.createVNode)("div", {
                "class": bem("icon")
            }, [
                slots.icon()
            ]);
            if (props.icon) return (0, vue__WEBPACK_IMPORTED_MODULE_4__.createVNode)(_icon_index_mjs__WEBPACK_IMPORTED_MODULE_6__.Icon, {
                "name": props.icon,
                "class": bem("icon"),
                "classPrefix": props.iconPrefix
            }, null);
        };
        const renderText = ()=>{
            let text;
            if (props.loading) text = props.loadingText;
            else text = slots.default ? slots.default() : props.text;
            if (text) return (0, vue__WEBPACK_IMPORTED_MODULE_4__.createVNode)("span", {
                "class": bem("text")
            }, [
                text
            ]);
        };
        const getStyle = ()=>{
            const { color, plain } = props;
            if (color) {
                const style = {
                    color: plain ? color : "white"
                };
                if (!plain) style.background = color;
                if (color.includes("gradient")) style.border = 0;
                else style.borderColor = color;
                return style;
            }
        };
        const onClick = (event)=>{
            if (props.loading) (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__.preventDefault)(event);
            else if (!props.disabled) {
                emit("click", event);
                route();
            }
        };
        return ()=>{
            const { tag, type, size, block, round, plain, square, loading, disabled, hairline, nativeType, iconPosition } = props;
            const classes = [
                bem([
                    type,
                    size,
                    {
                        plain,
                        block,
                        round,
                        square,
                        loading,
                        disabled,
                        hairline
                    }
                ]),
                {
                    [_utils_index_mjs__WEBPACK_IMPORTED_MODULE_8__.BORDER_SURROUND]: hairline
                }
            ];
            return (0, vue__WEBPACK_IMPORTED_MODULE_4__.createVNode)(tag, {
                "type": nativeType,
                "class": classes,
                "style": getStyle(),
                "disabled": disabled,
                "onClick": onClick
            }, {
                default: ()=>[
                        (0, vue__WEBPACK_IMPORTED_MODULE_4__.createVNode)("div", {
                            "class": bem("content")
                        }, [
                            iconPosition === "left" && renderIcon(),
                            renderText(),
                            iconPosition === "right" && renderIcon()
                        ])
                    ]
            });
        };
    }
});

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/button/index.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Button: function() { return Button; }
});
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/with-install.mjs");
/* harmony import */var _Button_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Button.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/button/Button.mjs");


const Button = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.withInstall)(_Button_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]);
var stdin_default = Button;


}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/on-popup-reopen.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  onPopupReopen: function() { return onPopupReopen; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");

const POPUP_TOGGLE_KEY = Symbol();
function onPopupReopen(callback) {
    const popupToggleStatus = (0, vue__WEBPACK_IMPORTED_MODULE_0__.inject)(POPUP_TOGGLE_KEY, null);
    if (popupToggleStatus) (0, vue__WEBPACK_IMPORTED_MODULE_0__.watch)(popupToggleStatus, (show)=>{
        if (show) callback();
    });
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-expose.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  useExpose: function() { return useExpose; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");


function useExpose(apis) {
    const instance = (0, vue__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance)();
    if (instance) (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.extend)(instance.proxy, apis);
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-global-z-index.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  setGlobalZIndex: function() { return setGlobalZIndex; }
});
let globalZIndex = 2e3;
const useGlobalZIndex = ()=>++globalZIndex;
const setGlobalZIndex = (val)=>{
    globalZIndex = val;
};

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-route.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  routeProps: function() { return routeProps; },
  useRoute: function() { return useRoute; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");

const routeProps = {
    to: [
        String,
        Object
    ],
    url: String,
    replace: Boolean
};
function route({ to, url, replace, $router: router }) {
    if (to && router) router[replace ? "replace" : "push"](to);
    else if (url) replace ? location.replace(url) : location.href = url;
}
function useRoute() {
    const vm = (0, vue__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance)().proxy;
    return ()=>route(vm);
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-touch.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  useTouch: function() { return useTouch; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+reactivity@3.4.12/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/constant.mjs");


function getDirection(x, y) {
    if (x > y) return "horizontal";
    if (y > x) return "vertical";
    return "";
}
function useTouch() {
    const startX = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
    const startY = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
    const deltaX = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
    const deltaY = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
    const offsetX = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
    const offsetY = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
    const direction = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)("");
    const isTap = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)(true);
    const isVertical = ()=>direction.value === "vertical";
    const isHorizontal = ()=>direction.value === "horizontal";
    const reset = ()=>{
        deltaX.value = 0;
        deltaY.value = 0;
        offsetX.value = 0;
        offsetY.value = 0;
        direction.value = "";
        isTap.value = true;
    };
    const start = (event)=>{
        reset();
        startX.value = event.touches[0].clientX;
        startY.value = event.touches[0].clientY;
    };
    const move = (event)=>{
        const touch = event.touches[0];
        deltaX.value = (touch.clientX < 0 ? 0 : touch.clientX) - startX.value;
        deltaY.value = touch.clientY - startY.value;
        offsetX.value = Math.abs(deltaX.value);
        offsetY.value = Math.abs(deltaY.value);
        const LOCK_DIRECTION_DISTANCE = 10;
        if (!direction.value || offsetX.value < LOCK_DIRECTION_DISTANCE && offsetY.value < LOCK_DIRECTION_DISTANCE) direction.value = getDirection(offsetX.value, offsetY.value);
        if (isTap.value && (offsetX.value > _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.TAP_OFFSET || offsetY.value > _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.TAP_OFFSET)) isTap.value = false;
    };
    return {
        move,
        start,
        reset,
        startX,
        startY,
        deltaX,
        deltaY,
        offsetX,
        offsetY,
        direction,
        isVertical,
        isHorizontal,
        isTap
    };
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/config-provider/ConfigProvider.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  CONFIG_PROVIDER_KEY: function() { return CONFIG_PROVIDER_KEY; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/create.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/props.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");
/* harmony import */var _composables_use_global_z_index_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../composables/use-global-z-index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-global-z-index.mjs");




const [name, bem] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createNamespace)("config-provider");
const CONFIG_PROVIDER_KEY = Symbol(name);
const configProviderProps = {
    tag: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeStringProp)("div"),
    theme: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeStringProp)("light"),
    zIndex: Number,
    themeVars: Object,
    themeVarsDark: Object,
    themeVarsLight: Object,
    themeVarsScope: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeStringProp)("local"),
    iconPrefix: String
};
function insertDash(str) {
    return str.replace(/([a-zA-Z])(\d)/g, "$1-$2");
}
function mapThemeVarsToCSSVars(themeVars) {
    const cssVars = {};
    Object.keys(themeVars).forEach((key)=>{
        const formattedKey = insertDash((0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_2__.kebabCase)(key));
        cssVars[`--van-${formattedKey}`] = themeVars[key];
    });
    return cssVars;
}
function syncThemeVarsOnRoot(newStyle = {}, oldStyle = {}) {
    Object.keys(newStyle).forEach((key)=>{
        if (newStyle[key] !== oldStyle[key]) document.documentElement.style.setProperty(key, newStyle[key]);
    });
    Object.keys(oldStyle).forEach((key)=>{
        if (!newStyle[key]) document.documentElement.style.removeProperty(key);
    });
}
var stdin_default = (0, vue__WEBPACK_IMPORTED_MODULE_3__.defineComponent)({
    name,
    props: configProviderProps,
    setup (props, { slots }) {
        const style = (0, vue__WEBPACK_IMPORTED_MODULE_3__.computed)(()=>mapThemeVarsToCSSVars((0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.extend)({}, props.themeVars, props.theme === "dark" ? props.themeVarsDark : props.themeVarsLight)));
        if (_utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.inBrowser) {
            const addTheme = ()=>{
                document.documentElement.classList.add(`van-theme-${props.theme}`);
            };
            const removeTheme = (theme = props.theme)=>{
                document.documentElement.classList.remove(`van-theme-${theme}`);
            };
            (0, vue__WEBPACK_IMPORTED_MODULE_3__.watch)(()=>props.theme, (newVal, oldVal)=>{
                if (oldVal) removeTheme(oldVal);
                addTheme();
            }, {
                immediate: true
            });
            (0, vue__WEBPACK_IMPORTED_MODULE_3__.onActivated)(addTheme);
            (0, vue__WEBPACK_IMPORTED_MODULE_3__.onDeactivated)(removeTheme);
            (0, vue__WEBPACK_IMPORTED_MODULE_3__.onBeforeUnmount)(removeTheme);
            (0, vue__WEBPACK_IMPORTED_MODULE_3__.watch)(style, (newStyle, oldStyle)=>{
                if (props.themeVarsScope === "global") syncThemeVarsOnRoot(newStyle, oldStyle);
            });
            (0, vue__WEBPACK_IMPORTED_MODULE_3__.watch)(()=>props.themeVarsScope, (newScope, oldScope)=>{
                if (oldScope === "global") syncThemeVarsOnRoot({}, style.value);
                if (newScope === "global") syncThemeVarsOnRoot(style.value, {});
            });
            if (props.themeVarsScope === "global") syncThemeVarsOnRoot(style.value, {});
        }
        (0, vue__WEBPACK_IMPORTED_MODULE_3__.provide)(CONFIG_PROVIDER_KEY, props);
        (0, vue__WEBPACK_IMPORTED_MODULE_3__.watchEffect)(()=>{
            if (props.zIndex !== void 0) (0, _composables_use_global_z_index_mjs__WEBPACK_IMPORTED_MODULE_5__.setGlobalZIndex)(props.zIndex);
        });
        return ()=>(0, vue__WEBPACK_IMPORTED_MODULE_3__.createVNode)(props.tag, {
                "class": bem(),
                "style": props.themeVarsScope === "local" ? style.value : void 0
            }, {
                default: ()=>{
                    var _a;
                    return [
                        (_a = slots.default) == null ? void 0 : _a.call(slots)
                    ];
                }
            });
    }
});

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/icon/Icon.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return stdin_default; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/create.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/props.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs");
/* harmony import */var _badge_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../badge/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/badge/index.mjs");
/* harmony import */var _config_provider_ConfigProvider_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../config-provider/ConfigProvider.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/config-provider/ConfigProvider.mjs");





const [name, bem] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createNamespace)("icon");
const isImage = (name2)=>name2 == null ? void 0 : name2.includes("/");
const iconProps = {
    dot: Boolean,
    tag: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeStringProp)("i"),
    name: String,
    size: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.numericProp,
    badge: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.numericProp,
    color: String,
    badgeProps: Object,
    classPrefix: String
};
var stdin_default = (0, vue__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
    name,
    props: iconProps,
    setup (props, { slots }) {
        const config = (0, vue__WEBPACK_IMPORTED_MODULE_2__.inject)(_config_provider_ConfigProvider_mjs__WEBPACK_IMPORTED_MODULE_3__.CONFIG_PROVIDER_KEY, null);
        const classPrefix = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>props.classPrefix || (config == null ? void 0 : config.iconPrefix) || bem());
        return ()=>{
            const { tag, dot, name: name2, size, badge, color } = props;
            const isImageIcon = isImage(name2);
            return (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)(_badge_index_mjs__WEBPACK_IMPORTED_MODULE_4__.Badge, (0, vue__WEBPACK_IMPORTED_MODULE_2__.mergeProps)({
                "dot": dot,
                "tag": tag,
                "class": [
                    classPrefix.value,
                    isImageIcon ? "" : `${classPrefix.value}-${name2}`
                ],
                "style": {
                    color,
                    fontSize: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_5__.addUnit)(size)
                },
                "content": badge
            }, props.badgeProps), {
                default: ()=>{
                    var _a;
                    return [
                        (_a = slots.default) == null ? void 0 : _a.call(slots),
                        isImageIcon && (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)("img", {
                            "class": bem("image"),
                            "src": name2
                        }, null)
                    ];
                }
            });
        };
    }
});

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/icon/index.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Icon: function() { return Icon; }
});
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/with-install.mjs");
/* harmony import */var _Icon_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Icon.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/icon/Icon.mjs");


const Icon = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.withInstall)(_Icon_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]);
var stdin_default = Icon;


}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/loading/Loading.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return stdin_default; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/create.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/props.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs");



const [name, bem] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createNamespace)("loading");
const SpinIcon = Array(12).fill(null).map((_, index)=>(0, vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("i", {
        "class": bem("line", String(index + 1))
    }, null));
const CircularIcon = (0, vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("svg", {
    "class": bem("circular"),
    "viewBox": "25 25 50 50"
}, [
    (0, vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("circle", {
        "cx": "50",
        "cy": "50",
        "r": "20",
        "fill": "none"
    }, null)
]);
const loadingProps = {
    size: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_2__.numericProp,
    type: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_2__.makeStringProp)("circular"),
    color: String,
    vertical: Boolean,
    textSize: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_2__.numericProp,
    textColor: String
};
var stdin_default = (0, vue__WEBPACK_IMPORTED_MODULE_1__.defineComponent)({
    name,
    props: loadingProps,
    setup (props, { slots }) {
        const spinnerStyle = (0, vue__WEBPACK_IMPORTED_MODULE_1__.computed)(()=>(0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_3__.extend)({
                color: props.color
            }, (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.getSizeStyle)(props.size)));
        const renderIcon = ()=>{
            const DefaultIcon = props.type === "spinner" ? SpinIcon : CircularIcon;
            return (0, vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("span", {
                "class": bem("spinner", props.type),
                "style": spinnerStyle.value
            }, [
                slots.icon ? slots.icon() : DefaultIcon
            ]);
        };
        const renderText = ()=>{
            var _a;
            if (slots.default) return (0, vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("span", {
                "class": bem("text"),
                "style": {
                    fontSize: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_4__.addUnit)(props.textSize),
                    color: (_a = props.textColor) != null ? _a : props.color
                }
            }, [
                slots.default()
            ]);
        };
        return ()=>{
            const { type, vertical } = props;
            return (0, vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("div", {
                "class": bem([
                    type,
                    {
                        vertical
                    }
                ]),
                "aria-live": "polite",
                "aria-busy": true
            }, [
                renderIcon(),
                renderText()
            ]);
        };
    }
});

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/loading/index.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Loading: function() { return Loading; }
});
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/with-install.mjs");
/* harmony import */var _Loading_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Loading.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/loading/Loading.mjs");


const Loading = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.withInstall)(_Loading_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]);
var stdin_default = Loading;


}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/locale/index.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return stdin_default; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+reactivity@3.4.12/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");
/* harmony import */var _utils_deep_assign_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/deep-assign.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/deep-assign.mjs");
/* harmony import */var _lang_zh_CN_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lang/zh-CN.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/locale/lang/zh-CN.mjs");



const lang = (0, vue__WEBPACK_IMPORTED_MODULE_0__.ref)("zh-CN");
const messages = (0, vue__WEBPACK_IMPORTED_MODULE_0__.reactive)({
    "zh-CN": _lang_zh_CN_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]
});
const Locale = {
    messages () {
        return messages[lang.value];
    },
    use (newLang, newMessages) {
        lang.value = newLang;
        this.add({
            [newLang]: newMessages
        });
    },
    add (newMessages = {}) {
        (0, _utils_deep_assign_mjs__WEBPACK_IMPORTED_MODULE_2__.deepAssign)(messages, newMessages);
    }
};
const useCurrentLang = ()=>lang;
var stdin_default = Locale;

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/locale/lang/zh-CN.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return stdin_default; }
});
var stdin_default = {
    name: "\u59D3\u540D",
    tel: "\u7535\u8BDD",
    save: "\u4FDD\u5B58",
    clear: "\u6E05\u7A7A",
    cancel: "\u53D6\u6D88",
    confirm: "\u786E\u8BA4",
    delete: "\u5220\u9664",
    loading: "\u52A0\u8F7D\u4E2D...",
    noCoupon: "\u6682\u65E0\u4F18\u60E0\u5238",
    nameEmpty: "\u8BF7\u586B\u5199\u59D3\u540D",
    addContact: "\u6DFB\u52A0\u8054\u7CFB\u4EBA",
    telInvalid: "\u8BF7\u586B\u5199\u6B63\u786E\u7684\u7535\u8BDD",
    vanCalendar: {
        end: "\u7ED3\u675F",
        start: "\u5F00\u59CB",
        title: "\u65E5\u671F\u9009\u62E9",
        weekdays: [
            "\u65E5",
            "\u4E00",
            "\u4E8C",
            "\u4E09",
            "\u56DB",
            "\u4E94",
            "\u516D"
        ],
        monthTitle: (year, month)=>`${year}\u5E74${month}\u6708`,
        rangePrompt: (maxRange)=>`\u6700\u591A\u9009\u62E9 ${maxRange} \u5929`
    },
    vanCascader: {
        select: "\u8BF7\u9009\u62E9"
    },
    vanPagination: {
        prev: "\u4E0A\u4E00\u9875",
        next: "\u4E0B\u4E00\u9875"
    },
    vanPullRefresh: {
        pulling: "\u4E0B\u62C9\u5373\u53EF\u5237\u65B0...",
        loosing: "\u91CA\u653E\u5373\u53EF\u5237\u65B0..."
    },
    vanSubmitBar: {
        label: "\u5408\u8BA1:"
    },
    vanCoupon: {
        unlimited: "\u65E0\u95E8\u69DB",
        discount: (discount)=>`${discount}\u6298`,
        condition: (condition)=>`\u6EE1${condition}\u5143\u53EF\u7528`
    },
    vanCouponCell: {
        title: "\u4F18\u60E0\u5238",
        count: (count)=>`${count}\u5F20\u53EF\u7528`
    },
    vanCouponList: {
        exchange: "\u5151\u6362",
        close: "\u4E0D\u4F7F\u7528",
        enable: "\u53EF\u7528",
        disabled: "\u4E0D\u53EF\u7528",
        placeholder: "\u8F93\u5165\u4F18\u60E0\u7801"
    },
    vanAddressEdit: {
        area: "\u5730\u533A",
        areaEmpty: "\u8BF7\u9009\u62E9\u5730\u533A",
        addressEmpty: "\u8BF7\u586B\u5199\u8BE6\u7EC6\u5730\u5740",
        addressDetail: "\u8BE6\u7EC6\u5730\u5740",
        defaultAddress: "\u8BBE\u4E3A\u9ED8\u8BA4\u6536\u8D27\u5730\u5740"
    },
    vanAddressList: {
        add: "\u65B0\u589E\u5730\u5740"
    }
};

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/swipe/Swipe.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return stdin_default; }
});
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+runtime-core@3.4.12/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+reactivity@3.4.12/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/create.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/props.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs");
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/dom.mjs");
/* harmony import */var _vant_use__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @vant/use */"./node_modules/.pnpm/@vant+use@1.6.0_vue@3.4.12/node_modules/@vant/use/dist/index.esm.mjs");
/* harmony import */var _composables_use_touch_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../composables/use-touch.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-touch.mjs");
/* harmony import */var _composables_use_expose_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../composables/use-expose.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/use-expose.mjs");
/* harmony import */var _composables_on_popup_reopen_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../composables/on-popup-reopen.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/composables/on-popup-reopen.mjs");







const [name, bem] = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createNamespace)("swipe");
const swipeProps = {
    loop: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.truthProp,
    width: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.numericProp,
    height: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.numericProp,
    vertical: Boolean,
    autoplay: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeNumericProp)(0),
    duration: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeNumericProp)(500),
    touchable: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.truthProp,
    lazyRender: Boolean,
    initialSwipe: (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.makeNumericProp)(0),
    indicatorColor: String,
    showIndicators: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.truthProp,
    stopPropagation: _utils_index_mjs__WEBPACK_IMPORTED_MODULE_1__.truthProp
};
const SWIPE_KEY = Symbol(name);
var stdin_default = (0, vue__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
    name,
    props: swipeProps,
    emits: [
        "change",
        "dragStart",
        "dragEnd"
    ],
    setup (props, { emit, slots }) {
        const root = (0, vue__WEBPACK_IMPORTED_MODULE_3__.ref)();
        const track = (0, vue__WEBPACK_IMPORTED_MODULE_3__.ref)();
        const state = (0, vue__WEBPACK_IMPORTED_MODULE_3__.reactive)({
            rect: null,
            width: 0,
            height: 0,
            offset: 0,
            active: 0,
            swiping: false
        });
        let dragging = false;
        const touch = (0, _composables_use_touch_mjs__WEBPACK_IMPORTED_MODULE_4__.useTouch)();
        const { children, linkChildren } = (0, _vant_use__WEBPACK_IMPORTED_MODULE_5__.useChildren)(SWIPE_KEY);
        const count = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>children.length);
        const size = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>state[props.vertical ? "height" : "width"]);
        const delta = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>props.vertical ? touch.deltaY.value : touch.deltaX.value);
        const minOffset = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>{
            if (state.rect) {
                const base = props.vertical ? state.rect.height : state.rect.width;
                return base - size.value * count.value;
            }
            return 0;
        });
        const maxCount = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>size.value ? Math.ceil(Math.abs(minOffset.value) / size.value) : count.value);
        const trackSize = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>count.value * size.value);
        const activeIndicator = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>(state.active + count.value) % count.value);
        const isCorrectDirection = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>{
            const expect = props.vertical ? "vertical" : "horizontal";
            return touch.direction.value === expect;
        });
        const trackStyle = (0, vue__WEBPACK_IMPORTED_MODULE_2__.computed)(()=>{
            const style = {
                transitionDuration: `${state.swiping ? 0 : props.duration}ms`,
                transform: `translate${props.vertical ? "Y" : "X"}(${+state.offset.toFixed(2)}px)`
            };
            if (size.value) {
                const mainAxis = props.vertical ? "height" : "width";
                const crossAxis = props.vertical ? "width" : "height";
                style[mainAxis] = `${trackSize.value}px`;
                style[crossAxis] = props[crossAxis] ? `${props[crossAxis]}px` : "";
            }
            return style;
        });
        const getTargetActive = (pace)=>{
            const { active } = state;
            if (pace) {
                if (props.loop) return (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_6__.clamp)(active + pace, -1, count.value);
                return (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_6__.clamp)(active + pace, 0, maxCount.value);
            }
            return active;
        };
        const getTargetOffset = (targetActive, offset = 0)=>{
            let currentPosition = targetActive * size.value;
            if (!props.loop) currentPosition = Math.min(currentPosition, -minOffset.value);
            let targetOffset = offset - currentPosition;
            if (!props.loop) targetOffset = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_6__.clamp)(targetOffset, minOffset.value, 0);
            return targetOffset;
        };
        const move = ({ pace = 0, offset = 0, emitChange })=>{
            if (count.value <= 1) return;
            const { active } = state;
            const targetActive = getTargetActive(pace);
            const targetOffset = getTargetOffset(targetActive, offset);
            if (props.loop) {
                if (children[0] && targetOffset !== minOffset.value) {
                    const outRightBound = targetOffset < minOffset.value;
                    children[0].setOffset(outRightBound ? trackSize.value : 0);
                }
                if (children[count.value - 1] && targetOffset !== 0) {
                    const outLeftBound = targetOffset > 0;
                    children[count.value - 1].setOffset(outLeftBound ? -trackSize.value : 0);
                }
            }
            state.active = targetActive;
            state.offset = targetOffset;
            if (emitChange && targetActive !== active) emit("change", activeIndicator.value);
        };
        const correctPosition = ()=>{
            state.swiping = true;
            if (state.active <= -1) move({
                pace: count.value
            });
            else if (state.active >= count.value) move({
                pace: -count.value
            });
        };
        const prev = ()=>{
            correctPosition();
            touch.reset();
            (0, _vant_use__WEBPACK_IMPORTED_MODULE_5__.doubleRaf)(()=>{
                state.swiping = false;
                move({
                    pace: -1,
                    emitChange: true
                });
            });
        };
        const next = ()=>{
            correctPosition();
            touch.reset();
            (0, _vant_use__WEBPACK_IMPORTED_MODULE_5__.doubleRaf)(()=>{
                state.swiping = false;
                move({
                    pace: 1,
                    emitChange: true
                });
            });
        };
        let autoplayTimer;
        const stopAutoplay = ()=>clearTimeout(autoplayTimer);
        const autoplay = ()=>{
            stopAutoplay();
            if (+props.autoplay > 0 && count.value > 1) autoplayTimer = setTimeout(()=>{
                next();
                autoplay();
            }, +props.autoplay);
        };
        const initialize = (active = +props.initialSwipe)=>{
            if (!root.value) return;
            const cb = ()=>{
                var _a, _b;
                if (!(0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__.isHidden)(root)) {
                    const rect = {
                        width: root.value.offsetWidth,
                        height: root.value.offsetHeight
                    };
                    state.rect = rect;
                    state.width = +((_a = props.width) != null ? _a : rect.width);
                    state.height = +((_b = props.height) != null ? _b : rect.height);
                }
                if (count.value) {
                    active = Math.min(count.value - 1, active);
                    if (active === -1) active = count.value - 1;
                }
                state.active = active;
                state.swiping = true;
                state.offset = getTargetOffset(active);
                children.forEach((swipe)=>{
                    swipe.setOffset(0);
                });
                autoplay();
            };
            if ((0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__.isHidden)(root)) (0, vue__WEBPACK_IMPORTED_MODULE_2__.nextTick)().then(cb);
            else cb();
        };
        const resize = ()=>initialize(state.active);
        let touchStartTime;
        const onTouchStart = (event)=>{
            if (!props.touchable || // avoid resetting position on multi-finger touch
            event.touches.length > 1) return;
            touch.start(event);
            dragging = false;
            touchStartTime = Date.now();
            stopAutoplay();
            correctPosition();
        };
        const onTouchMove = (event)=>{
            if (props.touchable && state.swiping) {
                touch.move(event);
                if (isCorrectDirection.value) {
                    const isEdgeTouch = !props.loop && (state.active === 0 && delta.value > 0 || state.active === count.value - 1 && delta.value < 0);
                    if (!isEdgeTouch) {
                        (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__.preventDefault)(event, props.stopPropagation);
                        move({
                            offset: delta.value
                        });
                        if (!dragging) {
                            emit("dragStart", {
                                index: activeIndicator.value
                            });
                            dragging = true;
                        }
                    }
                }
            }
        };
        const onTouchEnd = ()=>{
            if (!props.touchable || !state.swiping) return;
            const duration = Date.now() - touchStartTime;
            const speed = delta.value / duration;
            const shouldSwipe = Math.abs(speed) > 0.25 || Math.abs(delta.value) > size.value / 2;
            if (shouldSwipe && isCorrectDirection.value) {
                const offset = props.vertical ? touch.offsetY.value : touch.offsetX.value;
                let pace = 0;
                if (props.loop) pace = offset > 0 ? delta.value > 0 ? -1 : 1 : 0;
                else pace = -Math[delta.value > 0 ? "ceil" : "floor"](delta.value / size.value);
                move({
                    pace,
                    emitChange: true
                });
            } else if (delta.value) move({
                pace: 0
            });
            dragging = false;
            state.swiping = false;
            emit("dragEnd", {
                index: activeIndicator.value
            });
            autoplay();
        };
        const swipeTo = (index, options = {})=>{
            correctPosition();
            touch.reset();
            (0, _vant_use__WEBPACK_IMPORTED_MODULE_5__.doubleRaf)(()=>{
                let targetIndex;
                if (props.loop && index === count.value) targetIndex = state.active === 0 ? 0 : index;
                else targetIndex = index % count.value;
                if (options.immediate) (0, _vant_use__WEBPACK_IMPORTED_MODULE_5__.doubleRaf)(()=>{
                    state.swiping = false;
                });
                else state.swiping = false;
                move({
                    pace: targetIndex - state.active,
                    emitChange: true
                });
            });
        };
        const renderDot = (_, index)=>{
            const active = index === activeIndicator.value;
            const style = active ? {
                backgroundColor: props.indicatorColor
            } : void 0;
            return (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)("i", {
                "style": style,
                "class": bem("indicator", {
                    active
                })
            }, null);
        };
        const renderIndicator = ()=>{
            if (slots.indicator) return slots.indicator({
                active: activeIndicator.value,
                total: count.value
            });
            if (props.showIndicators && count.value > 1) return (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)("div", {
                "class": bem("indicators", {
                    vertical: props.vertical
                })
            }, [
                Array(count.value).fill("").map(renderDot)
            ]);
        };
        (0, _composables_use_expose_mjs__WEBPACK_IMPORTED_MODULE_8__.useExpose)({
            prev,
            next,
            state,
            resize,
            swipeTo
        });
        linkChildren({
            size,
            props,
            count,
            activeIndicator
        });
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.watch)(()=>props.initialSwipe, (value)=>initialize(+value));
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.watch)(count, ()=>initialize(state.active));
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.watch)(()=>props.autoplay, autoplay);
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.watch)([
            _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__.windowWidth,
            _utils_index_mjs__WEBPACK_IMPORTED_MODULE_7__.windowHeight,
            ()=>props.width,
            ()=>props.height
        ], resize);
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.watch)((0, _vant_use__WEBPACK_IMPORTED_MODULE_5__.usePageVisibility)(), (visible)=>{
            if (visible === "visible") autoplay();
            else stopAutoplay();
        });
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.onMounted)(initialize);
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.onActivated)(()=>initialize(state.active));
        (0, _composables_on_popup_reopen_mjs__WEBPACK_IMPORTED_MODULE_9__.onPopupReopen)(()=>initialize(state.active));
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.onDeactivated)(stopAutoplay);
        (0, vue__WEBPACK_IMPORTED_MODULE_2__.onBeforeUnmount)(stopAutoplay);
        (0, _vant_use__WEBPACK_IMPORTED_MODULE_5__.useEventListener)("touchmove", onTouchMove, {
            target: track
        });
        return ()=>{
            var _a;
            return (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)("div", {
                "ref": root,
                "class": bem()
            }, [
                (0, vue__WEBPACK_IMPORTED_MODULE_2__.createVNode)("div", {
                    "ref": track,
                    "style": trackStyle.value,
                    "class": bem("track", {
                        vertical: props.vertical
                    }),
                    "onTouchstartPassive": onTouchStart,
                    "onTouchend": onTouchEnd,
                    "onTouchcancel": onTouchEnd
                }, [
                    (_a = slots.default) == null ? void 0 : _a.call(slots)
                ]),
                renderIndicator()
            ]);
        };
    }
});

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/swipe/index.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Swipe: function() { return Swipe; }
});
/* harmony import */var _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/with-install.mjs");
/* harmony import */var _Swipe_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Swipe.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/swipe/Swipe.mjs");


const Swipe = (0, _utils_index_mjs__WEBPACK_IMPORTED_MODULE_0__.withInstall)(_Swipe_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]);
var stdin_default = Swipe;


}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  extend: function() { return extend; },
  get: function() { return get; },
  inBrowser: function() { return inBrowser; },
  isDef: function() { return isDef; },
  isFunction: function() { return isFunction; },
  isIOS: function() { return isIOS; },
  isNumeric: function() { return isNumeric; },
  isObject: function() { return isObject; }
});
function noop() {}
const extend = Object.assign;
const inBrowser = typeof window !== "undefined";
const isObject = (val)=>val !== null && typeof val === "object";
const isDef = (val)=>val !== void 0 && val !== null;
const isFunction = (val)=>typeof val === "function";
const isPromise = (val)=>isObject(val) && isFunction(val.then) && isFunction(val.catch);
const isDate = (val)=>Object.prototype.toString.call(val) === "[object Date]" && !Number.isNaN(val.getTime());
function isMobile(value) {
    value = value.replace(/[^-|\d]/g, "");
    return /^((\+86)|(86))?(1)\d{10}$/.test(value) || /^0[0-9-]{10,13}$/.test(value);
}
const isNumeric = (val)=>typeof val === "number" || /^\d+(\.\d+)?$/.test(val);
const isIOS = ()=>inBrowser ? /ios|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) : false;
function get(object, path) {
    const keys = path.split(".");
    let result = object;
    keys.forEach((key)=>{
        var _a;
        result = isObject(result) ? (_a = result[key]) != null ? _a : "" : "";
    });
    return result;
}
function pick(obj, keys, ignoreUndefined) {
    return keys.reduce((ret, key)=>{
        if (!ignoreUndefined || obj[key] !== void 0) ret[key] = obj[key];
        return ret;
    }, {});
}
const isSameValue = (newValue, oldValue)=>JSON.stringify(newValue) === JSON.stringify(oldValue);
const toArray = (item)=>Array.isArray(item) ? item : [
        item
    ];

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/constant.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BORDER_SURROUND: function() { return BORDER_SURROUND; },
  TAP_OFFSET: function() { return TAP_OFFSET; }
});
const BORDER = "van-hairline";
const BORDER_TOP = `${BORDER}--top`;
const BORDER_LEFT = `${BORDER}--left`;
const BORDER_RIGHT = `${BORDER}--right`;
const BORDER_BOTTOM = `${BORDER}--bottom`;
const BORDER_SURROUND = `${BORDER}--surround`;
const BORDER_TOP_BOTTOM = `${BORDER}--top-bottom`;
const BORDER_UNSET_TOP_BOTTOM = `${BORDER}-unset--top-bottom`;
const HAPTICS_FEEDBACK = "van-haptics-feedback";
const FORM_KEY = Symbol("van-form");
const LONG_PRESS_START_TIME = 500;
const TAP_OFFSET = 5;

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/create.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createNamespace: function() { return createNamespace; }
});
/* harmony import */var _basic_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./basic.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");
/* harmony import */var _format_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./format.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs");
/* harmony import */var _locale_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../locale/index.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/locale/index.mjs");



function createTranslate(name) {
    const prefix = (0, _format_mjs__WEBPACK_IMPORTED_MODULE_0__.camelize)(name) + ".";
    return (path, ...args)=>{
        const messages = _locale_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"].messages();
        const message = (0, _basic_mjs__WEBPACK_IMPORTED_MODULE_2__.get)(messages, prefix + path) || (0, _basic_mjs__WEBPACK_IMPORTED_MODULE_2__.get)(messages, path);
        return (0, _basic_mjs__WEBPACK_IMPORTED_MODULE_2__.isFunction)(message) ? message(...args) : message;
    };
}
function genBem(name, mods) {
    if (!mods) return "";
    if (typeof mods === "string") return ` ${name}--${mods}`;
    if (Array.isArray(mods)) return mods.reduce((ret, item)=>ret + genBem(name, item), "");
    return Object.keys(mods).reduce((ret, key)=>ret + (mods[key] ? genBem(name, key) : ""), "");
}
function createBEM(name) {
    return (el, mods)=>{
        if (el && typeof el !== "string") {
            mods = el;
            el = "";
        }
        el = el ? `${name}__${el}` : name;
        return `${el}${genBem(el, mods)}`;
    };
}
function createNamespace(name) {
    const prefixedName = `van-${name}`;
    return [
        prefixedName,
        createBEM(prefixedName),
        createTranslate(prefixedName)
    ];
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/deep-assign.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  deepAssign: function() { return deepAssign; }
});
/* harmony import */var _basic_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./basic.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");

const { hasOwnProperty } = Object.prototype;
function assignKey(to, from, key) {
    const val = from[key];
    if (!(0, _basic_mjs__WEBPACK_IMPORTED_MODULE_0__.isDef)(val)) return;
    if (!hasOwnProperty.call(to, key) || !(0, _basic_mjs__WEBPACK_IMPORTED_MODULE_0__.isObject)(val)) to[key] = val;
    else to[key] = deepAssign(Object(to[key]), val);
}
function deepAssign(to, from) {
    Object.keys(from).forEach((key)=>{
        assignKey(to, from, key);
    });
    return to;
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/dom.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  isHidden: function() { return isHidden; },
  preventDefault: function() { return preventDefault; },
  windowHeight: function() { return windowHeight; },
  windowWidth: function() { return windowWidth; }
});
/* harmony import */var _vant_use__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vant/use */"./node_modules/.pnpm/@vant+use@1.6.0_vue@3.4.12/node_modules/@vant/use/dist/index.esm.mjs");
/* harmony import */var vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vue */"./node_modules/.pnpm/@vue+reactivity@3.4.12/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");
/* harmony import */var _basic_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./basic.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");



function getScrollTop(el) {
    const top = "scrollTop" in el ? el.scrollTop : el.pageYOffset;
    return Math.max(top, 0);
}
function setScrollTop(el, value) {
    if ("scrollTop" in el) el.scrollTop = value;
    else el.scrollTo(el.scrollX, value);
}
function getRootScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
function setRootScrollTop(value) {
    setScrollTop(window, value);
    setScrollTop(document.body, value);
}
function getElementTop(el, scroller) {
    if (el === window) return 0;
    const scrollTop = scroller ? getScrollTop(scroller) : getRootScrollTop();
    return (0, _vant_use__WEBPACK_IMPORTED_MODULE_0__.useRect)(el).top + scrollTop;
}
const isIOS = (0, _basic_mjs__WEBPACK_IMPORTED_MODULE_1__.isIOS)();
function resetScroll() {
    if (isIOS) setRootScrollTop(getRootScrollTop());
}
const stopPropagation = (event)=>event.stopPropagation();
function preventDefault(event, isStopPropagation) {
    if (typeof event.cancelable !== "boolean" || event.cancelable) event.preventDefault();
    if (isStopPropagation) stopPropagation(event);
}
function isHidden(elementRef) {
    const el = (0, vue__WEBPACK_IMPORTED_MODULE_2__.unref)(elementRef);
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const hidden = style.display === "none";
    const parentHidden = el.offsetParent === null && style.position !== "fixed";
    return hidden || parentHidden;
}
const { width: windowWidth, height: windowHeight } = (0, _vant_use__WEBPACK_IMPORTED_MODULE_0__.useWindowSize)();
function isContainingBlock(el) {
    const css = window.getComputedStyle(el);
    return css.transform !== "none" || css.perspective !== "none" || [
        "transform",
        "perspective",
        "filter"
    ].some((value)=>(css.willChange || "").includes(value));
}
function getContainingBlock(el) {
    let node = el.parentElement;
    while(node){
        if (node && node.tagName !== "HTML" && node.tagName !== "BODY" && isContainingBlock(node)) return node;
        node = node.parentElement;
    }
    return null;
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  addUnit: function() { return addUnit; },
  camelize: function() { return camelize; },
  clamp: function() { return clamp; },
  getSizeStyle: function() { return getSizeStyle; },
  kebabCase: function() { return kebabCase; }
});
/* harmony import */var _basic_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./basic.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/basic.mjs");
/* harmony import */var _dom_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dom.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/dom.mjs");



function addUnit(value) {
    if ((0, _basic_mjs__WEBPACK_IMPORTED_MODULE_0__.isDef)(value)) return (0, _basic_mjs__WEBPACK_IMPORTED_MODULE_0__.isNumeric)(value) ? `${value}px` : String(value);
    return void 0;
}
function getSizeStyle(originSize) {
    if ((0, _basic_mjs__WEBPACK_IMPORTED_MODULE_0__.isDef)(originSize)) {
        if (Array.isArray(originSize)) return {
            width: addUnit(originSize[0]),
            height: addUnit(originSize[1])
        };
        const size = addUnit(originSize);
        return {
            width: size,
            height: size
        };
    }
}
function getZIndexStyle(zIndex) {
    const style = {};
    if (zIndex !== void 0) style.zIndex = +zIndex;
    return style;
}
let rootFontSize;
function getRootFontSize() {
    if (!rootFontSize) {
        const doc = document.documentElement;
        const fontSize = doc.style.fontSize || window.getComputedStyle(doc).fontSize;
        rootFontSize = parseFloat(fontSize);
    }
    return rootFontSize;
}
function convertRem(value) {
    value = value.replace(/rem/g, "");
    return +value * getRootFontSize();
}
function convertVw(value) {
    value = value.replace(/vw/g, "");
    return +value * _dom_mjs__WEBPACK_IMPORTED_MODULE_1__.windowWidth.value / 100;
}
function convertVh(value) {
    value = value.replace(/vh/g, "");
    return +value * _dom_mjs__WEBPACK_IMPORTED_MODULE_1__.windowHeight.value / 100;
}
function unitToPx(value) {
    if (typeof value === "number") return value;
    if (_basic_mjs__WEBPACK_IMPORTED_MODULE_0__.inBrowser) {
        if (value.includes("rem")) return convertRem(value);
        if (value.includes("vw")) return convertVw(value);
        if (value.includes("vh")) return convertVh(value);
    }
    return parseFloat(value);
}
const camelizeRE = /-(\w)/g;
const camelize = (str)=>str.replace(camelizeRE, (_, c)=>c.toUpperCase());
const kebabCase = (str)=>str.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
function padZero(num, targetLength = 2) {
    let str = num + "";
    while(str.length < targetLength)str = "0" + str;
    return str;
}
const clamp = (num, min, max)=>Math.min(Math.max(num, min), max);
function trimExtraChar(value, char, regExp) {
    const index = value.indexOf(char);
    if (index === -1) return value;
    if (char === "-" && index !== 0) return value.slice(0, index);
    return value.slice(0, index + 1) + value.slice(index).replace(regExp, "");
}
function formatNumber(value, allowDot = true, allowMinus = true) {
    if (allowDot) value = trimExtraChar(value, ".", /\./g);
    else value = value.split(".")[0];
    if (allowMinus) value = trimExtraChar(value, "-", /-/g);
    else value = value.replace(/-/, "");
    const regExp = allowDot ? /[^-0-9.]/g : /[^-0-9]/g;
    return value.replace(regExp, "");
}
function addNumber(num1, num2) {
    const cardinal = 10 ** 10;
    return Math.round((num1 + num2) * cardinal) / cardinal;
}

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/props.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  makeNumericProp: function() { return makeNumericProp; },
  makeStringProp: function() { return makeStringProp; },
  numericProp: function() { return numericProp; },
  truthProp: function() { return truthProp; }
});
const unknownProp = null;
const numericProp = [
    Number,
    String
];
const truthProp = {
    type: Boolean,
    default: true
};
const makeRequiredProp = (type)=>({
        type,
        required: true
    });
const makeArrayProp = ()=>({
        type: Array,
        default: ()=>[]
    });
const makeNumberProp = (defaultVal)=>({
        type: Number,
        default: defaultVal
    });
const makeNumericProp = (defaultVal)=>({
        type: numericProp,
        default: defaultVal
    });
const makeStringProp = (defaultVal)=>({
        type: String,
        default: defaultVal
    });

}),
"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/with-install.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  withInstall: function() { return withInstall; }
});
/* harmony import */var _format_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./format.mjs */"./node_modules/.pnpm/vant@4.8.2_vue@3.4.12/node_modules/vant/es/utils/format.mjs");

function withInstall(options) {
    options.install = (app)=>{
        const { name } = options;
        if (name) {
            app.component(name, options);
            app.component((0, _format_mjs__WEBPACK_IMPORTED_MODULE_0__.camelize)(`-${name}`), options);
        }
    };
    return options;
}

}),

}
// The module cache
 var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
// Check if module is in cache
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
      return cachedModule.exports;
      }
      // Create a new module (and put it into the cache)
      var module = (__webpack_module_cache__[moduleId] = {
       exports: {}
      });
      // Execute the module function
      __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
// Return the exports of the module
 return module.exports;

}
// webpack/runtime/global
!function() {
__webpack_require__.g = (function () {
	if (typeof globalThis === 'object') return globalThis;
	try {
		return this || new Function('return this')();
	} catch (e) {
		if (typeof window === 'object') return window;
	}
})();

}();
// webpack/runtime/define_property_getters
!function() {
__webpack_require__.d = function(exports, definition) {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
}();
// webpack/runtime/make_namespace_object
!function() {
// define __esModule on exports
__webpack_require__.r = function(exports) {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};

}();
// webpack/runtime/has_own_property
!function() {
__webpack_require__.o = function (obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
};

}();
var __webpack_exports__ = __webpack_require__("./src/index.js");
})()

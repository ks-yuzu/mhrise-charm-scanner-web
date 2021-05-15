
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/VideoReader.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/VideoReader.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let video;
    	let track;
    	let video_id_value;
    	let video_src_value;
    	let video_alt_value;
    	let video_style_value;
    	let t0;
    	let div0;
    	let progress_1;
    	let t1;
    	let span;
    	let t2_value = Math.floor(/*progress*/ ctx[4] * 100) + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			div0 = element("div");
    			progress_1 = element("progress");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = text("%");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$1, 84, 4, 2189);
    			attr_dev(video, "id", video_id_value = "video" + /*index*/ ctx[0]);
    			attr_dev(video, "class", "video-preview svelte-syjktf");
    			if (video.src !== (video_src_value = /*videoData*/ ctx[1])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "width", videoWidth);
    			attr_dev(video, "height", videoHeight);
    			attr_dev(video, "alt", video_alt_value = "preview" + /*index*/ ctx[0]);
    			attr_dev(video, "style", video_style_value = /*isVideoVisible*/ ctx[2] ? "" : "display: none");
    			add_location(video, file$1, 76, 2, 1922);
    			progress_1.value = /*progress*/ ctx[4];
    			attr_dev(progress_1, "class", "svelte-syjktf");
    			add_location(progress_1, file$1, 88, 4, 2237);
    			attr_dev(span, "class", "progress-text svelte-syjktf");
    			add_location(span, file$1, 89, 4, 2280);
    			add_location(div0, file$1, 87, 2, 2227);
    			attr_dev(div1, "class", "video-reader svelte-syjktf");
    			add_location(div1, file$1, 75, 0, 1893);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video);
    			append_dev(video, track);
    			/*video_binding*/ ctx[8](video);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, progress_1);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 1 && video_id_value !== (video_id_value = "video" + /*index*/ ctx[0])) {
    				attr_dev(video, "id", video_id_value);
    			}

    			if (dirty & /*videoData*/ 2 && video.src !== (video_src_value = /*videoData*/ ctx[1])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*index*/ 1 && video_alt_value !== (video_alt_value = "preview" + /*index*/ ctx[0])) {
    				attr_dev(video, "alt", video_alt_value);
    			}

    			if (dirty & /*isVideoVisible*/ 4 && video_style_value !== (video_style_value = /*isVideoVisible*/ ctx[2] ? "" : "display: none")) {
    				attr_dev(video, "style", video_style_value);
    			}

    			if (dirty & /*progress*/ 16) {
    				prop_dev(progress_1, "value", /*progress*/ ctx[4]);
    			}

    			if (dirty & /*progress*/ 16 && t2_value !== (t2_value = Math.floor(/*progress*/ ctx[4] * 100) + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*video_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const FRAME_RATE = 29.97;
    const videoWidth = 1280;
    const videoHeight = 720;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VideoReader", slots, []);
    	let { nSplits } = $$props;
    	let { index } = $$props;
    	let { videoData } = $$props;
    	let { isVideoVisible = false } = $$props;
    	let { charmScanner } = $$props;
    	let { onFinish } = $$props;
    	let beginTime, endTime;
    	let domVideo;
    	let capture;
    	let frame = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    	let progress = 0;

    	(async () => {
    		await new Promise(r => requestAnimationFrame(r));
    		await new Promise(r => $$invalidate(3, domVideo.oncanplay = r, domVideo));
    		capture = new cv.VideoCapture(domVideo);
    		beginTime = index * domVideo.duration / nSplits;
    		endTime = (index + 1) * domVideo.duration / nSplits;
    		domVideo.addEventListener("seeked", processCurrentFrame);

    		// console.log( domVideo.currentTime, domVideo.duration, index, nSplits, beginTime, endTime )
    		if (domVideo.currentTime != beginTime) {
    			$$invalidate(3, domVideo.currentTime = beginTime, domVideo);
    		} else {
    			processCurrentFrame();
    		}
    	})();

    	const processCurrentFrame = async () => {
    		// console.log( {currentTime: domVideo.currentTime, endTime} )
    		if (endTime - domVideo.currentTime < 1 / FRAME_RATE) {
    			charmScanner.countCharms();

    			// console.log(nScanedCharms)
    			// insertScript = charmScanner.generateInsertScript()
    			$$invalidate(4, progress = 1);

    			// console.log(charmScanner.charms)
    			onFinish();

    			return;
    		}

    		capture.read(frame);
    		charmScanner.scan(frame);
    		seekFrames(1, FRAME_RATE);
    		$$invalidate(4, progress = (domVideo.currentTime - beginTime) / (endTime - beginTime));
    	};

    	const seekFrames = (nFrames, fps) => {
    		const currentFrame = domVideo.currentTime * fps;
    		const newPosition = 0.00001 + (currentFrame + nFrames) / fps;

    		// plus 0.00001 is workaround for safari
    		$$invalidate(3, domVideo.currentTime = Math.min(endTime, newPosition), domVideo);
    	};

    	const writable_props = ["nSplits", "index", "videoData", "isVideoVisible", "charmScanner", "onFinish"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VideoReader> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domVideo = $$value;
    			$$invalidate(3, domVideo);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("nSplits" in $$props) $$invalidate(5, nSplits = $$props.nSplits);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(6, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(7, onFinish = $$props.onFinish);
    	};

    	$$self.$capture_state = () => ({
    		FRAME_RATE,
    		videoWidth,
    		videoHeight,
    		nSplits,
    		index,
    		videoData,
    		isVideoVisible,
    		charmScanner,
    		onFinish,
    		beginTime,
    		endTime,
    		domVideo,
    		capture,
    		frame,
    		progress,
    		processCurrentFrame,
    		seekFrames
    	});

    	$$self.$inject_state = $$props => {
    		if ("nSplits" in $$props) $$invalidate(5, nSplits = $$props.nSplits);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(6, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(7, onFinish = $$props.onFinish);
    		if ("beginTime" in $$props) beginTime = $$props.beginTime;
    		if ("endTime" in $$props) endTime = $$props.endTime;
    		if ("domVideo" in $$props) $$invalidate(3, domVideo = $$props.domVideo);
    		if ("capture" in $$props) capture = $$props.capture;
    		if ("frame" in $$props) frame = $$props.frame;
    		if ("progress" in $$props) $$invalidate(4, progress = $$props.progress);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		videoData,
    		isVideoVisible,
    		domVideo,
    		progress,
    		nSplits,
    		charmScanner,
    		onFinish,
    		video_binding
    	];
    }

    class VideoReader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			nSplits: 5,
    			index: 0,
    			videoData: 1,
    			isVideoVisible: 2,
    			charmScanner: 6,
    			onFinish: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoReader",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nSplits*/ ctx[5] === undefined && !("nSplits" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'nSplits'");
    		}

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'index'");
    		}

    		if (/*videoData*/ ctx[1] === undefined && !("videoData" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'videoData'");
    		}

    		if (/*charmScanner*/ ctx[6] === undefined && !("charmScanner" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'charmScanner'");
    		}

    		if (/*onFinish*/ ctx[7] === undefined && !("onFinish" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'onFinish'");
    		}
    	}

    	get nSplits() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nSplits(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoData() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoData(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVideoVisible() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVideoVisible(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmScanner() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFinish() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFinish(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class MHRiseCharmManager {
      db = null


      constructor() {
        this.db = openDatabase('mhrise-charm-manager', '', 'MHRise charm manager', 5000);
        this._createTable();
      }


      sql(query, placeholderValues) {
        return new Promise((resolve, reject) => {
          this.db.transaction(
            tx => tx.executeSql(
              query,
              placeholderValues,
              (tx, result) => resolve({tx, result}),
              (...args) => reject(args)
            )
          );
        })
      }


      async reset() {
        await this.sql('drop table if exists charms');
        await this._createTable();
      }


      async registerCharms(charms) {
        const values = charms
          .map(c => `("${c.skills[0]}", ${c.skillLevels[0]}, "${c.skills[1]}", ${c.skillLevels[1]}, ${c.slots.replace(/-/g, ', ')})`)
          .join(',\n');
        console.log(`insert or ignore into charms values ${values}`);
        await this.sql(`insert or ignore into charms values ${values}`);
      }


      async searchCharm(query) {
        const {tx, result} = await this.sql(query);
        return result.rows
      }


      async _createTable() {
        await this.sql(`create table if not exists charms(
               skill1      varchar(20),
               skill1Level int,
               skill2      varchar(20),
               skill2Level int,
               slot1       int,
               slot2       int,
               slot3       int,
               unique (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3))`);
      }
    }

    function fetchImage(path) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = path;

        img.onload = () => {
          // console.log(`fetched ${path}`)
          const imgmat = cv.imread(img);
    	    resolve(imgmat);
        };
      })
    }


    function countImageDiffAtPoint(image, templateImage, point, maskBinaryThreshold, diffBinaryThreshold) {
      const size = new cv.Size(templateImage.cols, templateImage.rows);
      const rect = new cv.Rect(point, size);
      const trimmed = image.roi(rect);

      const templateMask = new cv.Mat();
      cv.threshold(templateImage, templateMask, maskBinaryThreshold, 255, cv.THRESH_BINARY);

      const masked = new cv.Mat();
      trimmed.copyTo(masked, templateMask);

      const diff = new cv.Mat();
      cv.absdiff(templateImage, masked, diff);
      cv.cvtColor(diff, diff, cv.COLOR_BGR2GRAY);

      const result = new cv.Mat();
      cv.threshold(diff, result, diffBinaryThreshold, 255, cv.THRESH_BINARY);
      // // cv::imwrite("./tmp/debug.png", diff); // for debug

      diff.delete();
      masked.delete();
      templateMask.delete();
      trimmed.delete();

      return result;
    }


    function getMostMatchedImage(image, templates, point, maskBinaryThreshold = 63, diffBinaryThreshold = 63) {
      let minDiffCount = Number.MAX_SAFE_INTEGER;
      let candidate = null;

      // console.log(templates)
      for (const [name, template] of Object.entries(templates)) {
        const diff = countImageDiffAtPoint(image, template, point, maskBinaryThreshold, diffBinaryThreshold);
        const diffCount = cv.countNonZero(diff);

        if ( minDiffCount > diffCount ) {
          minDiffCount = diffCount;
          candidate = name;
        }

        diff.delete();
      }

      return candidate;
    }



    function promiseAllRecursive(value) {
      if (value instanceof Promise) {
        return value
      }

      if (Array.isArray(value)) {
        return Promise.all(value.map(promiseAllRecursive))
      }

      if (typeof value === 'object') {
        return resolveObject(value)
      }

      return Promise.resolve(value)
    }

    function resolveObject(object) {
      const promises = Object.keys(object).map(key => {
        return promiseAllRecursive(object[key]).then(value => ({ key, value }))
      });

      return Promise.all(promises).then(results => {
        return results.reduce((obj, pair) => {
          obj[pair.key] = pair.value;
          return obj
        }, {})
      })
    }

    class MHRiseCharmScanner {
      MAX_PAGE = 34
      COLUMNS_PER_PAGE = 10
      ROWS_PER_PAGE    = 5

      POINT_RARITY       = new cv.Point(1190, 176)
      POINT_SLOTS        = new cv.Point(1160, 200)
      POINT_SKILL1       = new cv.Point(1033, 266)
      POINT_SKILL2       = new cv.Point(1033, 317)
      POINT_SKILL_LEVEL1 = new cv.Point(1190, 289)
      POINT_SKILL_LEVEL2 = new cv.Point(1190, 340)
      POINT_PAGE         = new cv.Point(787, 582)

      POINT_CHARM_AREA_LEFT_TOP = new cv.Point(634, 359)
      SIZE_CHARM_AREA           = new cv.Size(357, 199)

      nCharms = 0
      charms = {}
      templates = null

      async init() {
        this.templates = {
          frame: fetchImage('img/templates/frame.png'),
          rare: {
            7:                    fetchImage('img/templates/rare/7.jpg'),
            6:                    fetchImage('img/templates/rare/6.jpg'),
            5:                    fetchImage('img/templates/rare/5.jpg'),
            4:                    fetchImage('img/templates/rare/4.jpg'),
          },
          lvl: {
            0:                    fetchImage('img/templates/lvl/0.jpg'),
            1:                    fetchImage('img/templates/lvl/1.jpg'),
            2:                    fetchImage('img/templates/lvl/2.jpg'),
            3:                    fetchImage('img/templates/lvl/3.jpg'),
            4:                    fetchImage('img/templates/lvl/4.jpg'),
            5:                    fetchImage('img/templates/lvl/5.jpg'),
          },
          slot: {
            '0-0-0':              fetchImage('img/templates/slot/0.jpg'),
            '1-0-0':              fetchImage('img/templates/slot/1.jpg'),
            '1-1-0':              fetchImage('img/templates/slot/11.jpg'),
            '1-1-1':              fetchImage('img/templates/slot/111.jpg'),
            '2-0-0':              fetchImage('img/templates/slot/2.jpg'),
            '2-1-0':              fetchImage('img/templates/slot/21.jpg'),
            '2-1-1':              fetchImage('img/templates/slot/211.jpg'),
            '2-2-0':              fetchImage('img/templates/slot/22.jpg'),
            '2-2-1':              fetchImage('img/templates/slot/221.jpg'),
            '3-0-0':              fetchImage('img/templates/slot/3.jpg'),
            '3-1-0':              fetchImage('img/templates/slot/31.jpg'),
            '3-1-1':              fetchImage('img/templates/slot/311.jpg'),
            '3-2-0':              fetchImage('img/templates/slot/32.jpg'),
            '3-2-1':              fetchImage('img/templates/slot/321.jpg'),
          },
          skill: {
            'KO術':               fetchImage('img/templates/skill/KO術.jpg'),
            '匠':                 fetchImage('img/templates/skill/匠.jpg'),
            '不屈':               fetchImage('img/templates/skill/不屈.jpg'),
            '体術':               fetchImage('img/templates/skill/体術.jpg'),
            '幸運':               fetchImage('img/templates/skill/幸運.jpg'),
            '心眼':               fetchImage('img/templates/skill/心眼.jpg'),
            '攻撃':               fetchImage('img/templates/skill/攻撃.jpg'),
            '業物':               fetchImage('img/templates/skill/業物.jpg'),
            '渾身':               fetchImage('img/templates/skill/渾身.jpg'),
            '無し':               fetchImage('img/templates/skill/無し.jpg'),
            '砲術':               fetchImage('img/templates/skill/砲術.jpg'),
            '耐震':               fetchImage('img/templates/skill/耐震.jpg'),
            '耳栓':               fetchImage('img/templates/skill/耳栓.jpg'),
            '逆襲':               fetchImage('img/templates/skill/逆襲.jpg'),
            '防御':               fetchImage('img/templates/skill/防御.jpg'),
            '陽動':               fetchImage('img/templates/skill/陽動.jpg'),
            '集中':               fetchImage('img/templates/skill/集中.jpg'),
            'ボマー':             fetchImage('img/templates/skill/ボマー.jpg'),
            '地質学':             fetchImage('img/templates/skill/地質学.jpg'),
            '広域化':             fetchImage('img/templates/skill/広域化.jpg'),
            '挑戦者':             fetchImage('img/templates/skill/挑戦者.jpg'),
            '早食い':             fetchImage('img/templates/skill/早食い.jpg'),
            '植生学':             fetchImage('img/templates/skill/植生学.jpg'),
            '毒耐性':             fetchImage('img/templates/skill/毒耐性.jpg'),
            '水耐性':             fetchImage('img/templates/skill/水耐性.jpg'),
            '氷耐性':             fetchImage('img/templates/skill/氷耐性.jpg'),
            '満足感':             fetchImage('img/templates/skill/満足感.jpg'),
            '火耐性':             fetchImage('img/templates/skill/火耐性.jpg'),
            '破壊王':             fetchImage('img/templates/skill/破壊王.jpg'),
            '納刀術':             fetchImage('img/templates/skill/納刀術.jpg'),
            '見切り':             fetchImage('img/templates/skill/見切り.jpg'),
            '超会心':             fetchImage('img/templates/skill/超会心.jpg'),
            '逆恨み':             fetchImage('img/templates/skill/逆恨み.jpg'),
            '達人芸':             fetchImage('img/templates/skill/達人芸.jpg'),
            '雷耐性':             fetchImage('img/templates/skill/雷耐性.jpg'),
            '鬼火纏':             fetchImage('img/templates/skill/鬼火纏.jpg'),
            '龍耐性':             fetchImage('img/templates/skill/龍耐性.jpg'),
            'ブレ抑制':           fetchImage('img/templates/skill/ブレ抑制.jpg'),
            'ランナー':           fetchImage('img/templates/skill/ランナー.jpg'),
            '乗り名人':           fetchImage('img/templates/skill/乗り名人.jpg'),
            '剛刃研磨':           fetchImage('img/templates/skill/剛刃研磨.jpg'),
            '力の解放':           fetchImage('img/templates/skill/力の解放.jpg'),
            '反動軽減':           fetchImage('img/templates/skill/反動軽減.jpg'),
            '回復速度':           fetchImage('img/templates/skill/回復速度.jpg'),
            '回避性能':           fetchImage('img/templates/skill/回避性能.jpg'),
            '壁面移動':           fetchImage('img/templates/skill/壁面移動.jpg'),
            '弱点特効':           fetchImage('img/templates/skill/弱点特効.jpg'),
            '強化持続':           fetchImage('img/templates/skill/強化持続.jpg'),
            '弾丸節約':           fetchImage('img/templates/skill/弾丸節約.jpg'),
            '弾導強化':           fetchImage('img/templates/skill/弾導強化.jpg'),
            '死中に活':           fetchImage('img/templates/skill/死中に活.jpg'),
            '気絶耐性':           fetchImage('img/templates/skill/気絶耐性.jpg'),
            '泡沫の舞':           fetchImage('img/templates/skill/泡沫の舞.jpg'),
            '泥雪耐性':           fetchImage('img/templates/skill/泥雪耐性.jpg'),
            '滑走強化':           fetchImage('img/templates/skill/滑走強化.jpg'),
            '火事場力':           fetchImage('img/templates/skill/火事場力.jpg'),
            '睡眠耐性':           fetchImage('img/templates/skill/睡眠耐性.jpg'),
            '砲弾装填':           fetchImage('img/templates/skill/砲弾装填.jpg'),
            '翔蟲使い':           fetchImage('img/templates/skill/翔蟲使い.jpg'),
            '装填拡張':           fetchImage('img/templates/skill/装填拡張.jpg'),
            '装填速度':           fetchImage('img/templates/skill/装填速度.jpg'),
            '速射強化':           fetchImage('img/templates/skill/速射強化.jpg'),
            '鈍器使い':           fetchImage('img/templates/skill/鈍器使い.jpg'),
            '風圧耐性':           fetchImage('img/templates/skill/風圧耐性.jpg'),
            '飛び込み':           fetchImage('img/templates/skill/飛び込み.jpg'),
            '高速変形':           fetchImage('img/templates/skill/高速変形.jpg'),
            '麻痺耐性':           fetchImage('img/templates/skill/麻痺耐性.jpg'),
            '回避距離UP':         fetchImage('img/templates/skill/回避距離UP.jpg'),
            'ひるみ軽減':         fetchImage('img/templates/skill/ひるみ軽減.jpg'),
            'ガード強化':         fetchImage('img/templates/skill/ガード強化.jpg'),
            'ガード性能':         fetchImage('img/templates/skill/ガード性能.jpg'),
            '攻めの守勢':         fetchImage('img/templates/skill/攻めの守勢.jpg'),
            '毒属性強化':         fetchImage('img/templates/skill/毒属性強化.jpg'),
            '笛吹き名人':         fetchImage('img/templates/skill/笛吹き名人.jpg'),
            '精霊の加護':         fetchImage('img/templates/skill/精霊の加護.jpg'),
            '腹減り耐性':         fetchImage('img/templates/skill/腹減り耐性.jpg'),
            '体力回復量UP':       fetchImage('img/templates/skill/体力回復量UP.jpg'),
            'キノコ大好き':       fetchImage('img/templates/skill/キノコ大好き.jpg'),
            'ジャンプ鉄人':       fetchImage('img/templates/skill/ジャンプ鉄人.jpg'),
            'スタミナ奪取':       fetchImage('img/templates/skill/スタミナ奪取.jpg'),
            'フルチャージ':       fetchImage('img/templates/skill/フルチャージ.jpg'),
            '剥ぎ取り鉄人':       fetchImage('img/templates/skill/剥ぎ取り鉄人.jpg'),
            '抜刀術【力】':       fetchImage('img/templates/skill/抜刀術【力】.jpg'),
            '抜刀術【技】':       fetchImage('img/templates/skill/抜刀術【技】.jpg'),
            '爆破属性強化':       fetchImage('img/templates/skill/爆破属性強化.jpg'),
            '特殊射撃強化':       fetchImage('img/templates/skill/特殊射撃強化.jpg'),
            '睡眠属性強化':       fetchImage('img/templates/skill/睡眠属性強化.jpg'),
            '麻痺属性強化':       fetchImage('img/templates/skill/麻痺属性強化.jpg'),
            '会心撃【属性】':     fetchImage('img/templates/skill/会心撃【属性】.jpg'),
            '属性やられ耐性':     fetchImage('img/templates/skill/属性やられ耐性.jpg'),
            '水属性攻撃強化':     fetchImage('img/templates/skill/水属性攻撃強化.jpg'),
            '氷属性攻撃強化':     fetchImage('img/templates/skill/氷属性攻撃強化.jpg'),
            '火属性攻撃強化':     fetchImage('img/templates/skill/火属性攻撃強化.jpg'),
            '爆破やられ耐性':     fetchImage('img/templates/skill/爆破やられ耐性.jpg'),
            '砥石使用高速化':     fetchImage('img/templates/skill/砥石使用高速化.jpg'),
            '雷属性攻撃強化':     fetchImage('img/templates/skill/雷属性攻撃強化.jpg'),
            '龍属性攻撃強化':     fetchImage('img/templates/skill/龍属性攻撃強化.jpg'),
            'アイテム使用強化':   fetchImage('img/templates/skill/アイテム使用強化.jpg'),
            'スタミナ急速回復':   fetchImage('img/templates/skill/スタミナ急速回復.jpg'),
            '散弾・拡散矢強化':   fetchImage('img/templates/skill/散弾・拡散矢強化.jpg'),
            '貫通弾・貫通矢強化': fetchImage('img/templates/skill/貫通弾・貫通矢強化.jpg'),
            '通常弾・連射矢強化': fetchImage('img/templates/skill/通常弾・連射矢強化.jpg'),
          },
        };

        this.templates.page = {};
        for (let i = 1; i <= this.MAX_PAGE; i++) {
          this.templates.page[i] = fetchImage(`img/templates/page/${i}.png`);
        }

        this.templates = await promiseAllRecursive(this.templates);
        this.reset();
      }

      reset() {
        this.nCharms = 0;
        this.charms = {};
        for (let p = 1; p <= this.MAX_PAGE; p++) {
          this.charms[p] = {};
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            this.charms[p][r] = {};
          }
        }
      }

      isScaned(page, row, col) {
        return this.charms[page][row][col] != null
      }

      store(params) {
        const {page, row, col} = params;
        this.charms[page][row][col] = params;
        this.nCharms++;
      }

      scan(screenshot) {
        const page          = this._getCurrentPage(screenshot);
        const [pos, match]  = this._getCurrentCharmPos(screenshot);

        if ( match < 0.35 ) {
          // 放置すると blink するので一致度が低い時はスキップ
          // console.log(`low match degress ${match} for charm position searching. skip`)
          return null
        }

        const [col, row]    = pos;
        if (this.isScaned(page, row, col)) {
          // console.log(`this charm is already scanned. skip: p${page} (${row}, ${col})`);
          return null
        }

        const rarity        = this._getRarity(screenshot);
        const slots         = this._getSlots(screenshot);
        const skills        = this._getSkills(screenshot);
        const skillLevels   = this._getSkillLevels(screenshot);

        // console.log(`scaned ${row} ${col}`)

        // console.log({col, row, match, page, rarity, slots, skills, skillLevels})
        this.store({page, row, col, rarity, slots, skills, skillLevels});
      }

      countCharms() {
        return this.nCharms
      }

      generateInsertScript() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              // console.log(`${charm.slots} ${charm.skills[0]} ${charm.skillLevels[0]} ${charm.skills[1]} ${charm.skillLevels[1]}`)
              buf.push({
                "第一スキル":         charm.skills[0],
                "第一スキルポイント": charm.skillLevels[0],
                "第二スキル":         charm.skills[1],
                "第二スキルポイント": charm.skillLevels[1],
                "スロット":           charm.slots,
              });
            }
          }
        }

        return `const inputs = ${JSON.stringify(buf)}

eval( await (await fetch('https://code.jquery.com/jquery-3.6.0.slim.min.js')).text() )

for (const input of inputs) {
  Object.entries(input).forEach(([key, value]) => {
    \$(\`select[aria-label="\${key}"]\`).val(value)
    \$(\`select[aria-label="\${key}"]\`)[0].dispatchEvent(new Event('change', { bubbles: true }))
  })

  \$('button:contains("追加")').click()
}`
      }

      exportAsText() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              buf.push(`${charm.skills[0]},${charm.skillLevels[0]},${charm.skills[1]},${charm.skillLevels[1]},${charm.slots.replace(/-/g, ',')}`);
            }
          }
        }

        return buf.join('\n')
      }

      getCharms() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              buf.push(charm);
            }
          }
        }

        return buf
      }

      _getRarity(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.rare, this.POINT_RARITY, 63, 63)
      }

      _getSlots(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.slot, this.POINT_SLOTS, 0, 63)
      }

      _getSkills(screenshot) {
        return [
          getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL1, 0, 63),
          getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL2, 0, 63),
        ]
      }

      _getSkillLevels(screenshot) {
        return [
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL1, 0, 127),
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL2, 0, 127),
        ]
      }

      _getCurrentPage(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.page, this.POINT_PAGE, 31, 63)
      }


      _getCurrentCharmPos(screenshot) {
        const rect = new cv.Rect(this.POINT_CHARM_AREA_LEFT_TOP, this.SIZE_CHARM_AREA);
        const trimmed = screenshot.roi(rect);

        const result = new cv.Mat();
        cv.matchTemplate(trimmed, this.templates.frame, result, cv.TM_CCOEFF_NORMED);

        const {maxLoc, maxVal} = cv.minMaxLoc(result);
        // console.log({maxVal, maxLoc})

        result.delete();
        trimmed.delete();

        return [
          [
            1 + Math.floor(0.5 + maxLoc.x / 36.0),
            1 + Math.floor(0.5 + maxLoc.y / 41.0),
          ],
          maxVal,
        ]
      }
    }

    /* src/App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (119:6) {#each $videoReaderProps as props}
    function create_each_block(ctx) {
    	let videoreader;
    	let current;
    	const videoreader_spread_levels = [/*props*/ ctx[21]];
    	let videoreader_props = {};

    	for (let i = 0; i < videoreader_spread_levels.length; i += 1) {
    		videoreader_props = assign(videoreader_props, videoreader_spread_levels[i]);
    	}

    	videoreader = new VideoReader({ props: videoreader_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(videoreader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(videoreader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const videoreader_changes = (dirty & /*$videoReaderProps*/ 128)
    			? get_spread_update(videoreader_spread_levels, [get_spread_object(/*props*/ ctx[21])])
    			: {};

    			videoreader.$set(videoreader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videoreader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videoreader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(videoreader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(119:6) {#each $videoReaderProps as props}",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#if files.length > 0}
    function create_if_block_1(ctx) {
    	let t0;
    	let t1_value = 1 + Number(/*currentFileIndex*/ ctx[4]) + "";
    	let t1;
    	let t2;
    	let t3_value = /*files*/ ctx[2].length + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("/");
    			t3 = text(t3_value);
    			t4 = text("]");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFileIndex*/ 16 && t1_value !== (t1_value = 1 + Number(/*currentFileIndex*/ ctx[4]) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*files*/ 4 && t3_value !== (t3_value = /*files*/ ctx[2].length + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(122:6) {#if files.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (172:2) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading Files...";
    			add_location(div, file, 172, 2, 5020);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(172:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (160:2) {#if fInitialized}
    function create_if_block(ctx) {
    	let div1;
    	let input;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Click to Select Movie";
    			set_style(input, "display", "none");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".mp4");
    			input.multiple = true;
    			attr_dev(input, "class", "svelte-1697s2b");
    			add_location(input, file, 161, 4, 4617);
    			if (img.src !== (img_src_value = "https://static.thenounproject.com/png/625182-200.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1697s2b");
    			add_location(img, file, 168, 4, 4820);
    			attr_dev(div0, "class", "svelte-1697s2b");
    			add_location(div0, file, 169, 4, 4932);
    			attr_dev(div1, "id", "upload");
    			attr_dev(div1, "class", "svelte-1697s2b");
    			add_location(div1, file, 160, 2, 4595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[11](input);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler*/ ctx[9], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[10]),
    					listen_dev(img, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(div0, "click", /*click_handler_1*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(160:2) {#if fInitialized}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div0;
    	let p;
    	let t2;
    	let br0;
    	let t3;
    	let a0;
    	let t5;
    	let br1;
    	let t6;
    	let br2;
    	let t7;
    	let br3;
    	let t8;
    	let a1;
    	let t10;
    	let br4;
    	let t11;
    	let div2;
    	let div1;
    	let t12;
    	let t13;
    	let t14;
    	let div4;
    	let div3;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let textarea;
    	let current;
    	let each_value = /*$videoReaderProps*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block0 = /*files*/ ctx[2].length > 0 && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*fInitialized*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `${TITLE}`;
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			t2 = text("モンスターハンターライズの護石を自動読み取りするツールです。");
    			br0 = element("br");
    			t3 = text("\n   Nintendo Switch の 30 秒キャプチャ動画を用意するだけで, 護石のスキルやスロットが読み取れます。\n   (");
    			a0 = element("a");
    			a0.textContent = "動画例";
    			t5 = text(")");
    			br1 = element("br");
    			t6 = space();
    			br2 = element("br");
    			t7 = text("\n   出力形式は、<スキル1>,<スキル1Lv>,<スキル2>,<スキル2Lv>,<スロット1Lv>,<スロット2Lv>,<スロット3Lv> です。");
    			br3 = element("br");
    			t8 = space();
    			a1 = element("a");
    			a1.textContent = "泣きシミュ";
    			t10 = text(" さんでそのままインポートできます。");
    			br4 = element("br");
    			t11 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			if (if_block0) if_block0.c();
    			t13 = space();
    			if_block1.c();
    			t14 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t15 = text("Found ");
    			t16 = text(/*nScanedCharms*/ ctx[5]);
    			t17 = text(" charms.");
    			t18 = space();
    			textarea = element("textarea");
    			attr_dev(h1, "class", "svelte-1697s2b");
    			add_location(h1, file, 103, 1, 2558);
    			add_location(br0, file, 106, 33, 2725);
    			attr_dev(a0, "href", "sample/input.mp4");
    			add_location(a0, file, 108, 4, 2796);
    			add_location(br1, file, 108, 39, 2831);
    			add_location(br2, file, 109, 3, 2839);
    			add_location(br3, file, 110, 116, 2960);
    			attr_dev(a1, "href", "https://mhrise.wiki-db.com/sim/");
    			add_location(a1, file, 111, 3, 2968);
    			add_location(br4, file, 111, 72, 3037);
    			set_style(p, "margin", "auto");
    			set_style(p, "max-width", "100%");
    			set_style(p, "width", "54rem");
    			set_style(p, "height", "6rem");
    			set_style(p, "text-align", "left");
    			add_location(p, file, 105, 4, 2604);
    			attr_dev(div0, "id", "description");
    			attr_dev(div0, "class", "svelte-1697s2b");
    			add_location(div0, file, 104, 2, 2577);
    			attr_dev(div1, "id", "status");
    			attr_dev(div1, "class", "svelte-1697s2b");
    			add_location(div1, file, 117, 4, 3086);
    			attr_dev(div2, "id", "status");
    			attr_dev(div2, "class", "svelte-1697s2b");
    			add_location(div2, file, 116, 2, 3064);
    			add_location(div3, file, 177, 6, 5112);
    			attr_dev(textarea, "placeholder", "charms will be exported here");
    			textarea.value = /*exportData*/ ctx[6];
    			attr_dev(textarea, "class", "svelte-1697s2b");
    			add_location(textarea, file, 178, 6, 5159);
    			attr_dev(div4, "id", "result");
    			attr_dev(div4, "class", "svelte-1697s2b");
    			add_location(div4, file, 175, 2, 5059);
    			attr_dev(main, "class", "svelte-1697s2b");
    			add_location(main, file, 102, 0, 2550);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(p, br0);
    			append_dev(p, t3);
    			append_dev(p, a0);
    			append_dev(p, t5);
    			append_dev(p, br1);
    			append_dev(p, t6);
    			append_dev(p, br2);
    			append_dev(p, t7);
    			append_dev(p, br3);
    			append_dev(p, t8);
    			append_dev(p, a1);
    			append_dev(p, t10);
    			append_dev(p, br4);
    			append_dev(main, t11);
    			append_dev(main, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t12);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(main, t13);
    			if_block1.m(main, null);
    			append_dev(main, t14);
    			append_dev(main, div4);
    			append_dev(div4, div3);
    			append_dev(div3, t15);
    			append_dev(div3, t16);
    			append_dev(div3, t17);
    			append_dev(div4, t18);
    			append_dev(div4, textarea);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$videoReaderProps*/ 128) {
    				each_value = /*$videoReaderProps*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, t12);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*files*/ ctx[2].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(main, t14);
    				}
    			}

    			if (!current || dirty & /*nScanedCharms*/ 32) set_data_dev(t16, /*nScanedCharms*/ ctx[5]);

    			if (!current || dirty & /*exportData*/ 64) {
    				prop_dev(textarea, "value", /*exportData*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TITLE = "MHRise Charm Scanner";
    const VIDEO_WIDTH = 1280; // switch のキャプチャ解像度
    const VIDEO_HEIGHT = 720;
    const VIDEO_FRAME_RATE = 29.97;

    function instance($$self, $$props, $$invalidate) {
    	let $videoReaderProps,
    		$$unsubscribe_videoReaderProps = noop,
    		$$subscribe_videoReaderProps = () => ($$unsubscribe_videoReaderProps(), $$unsubscribe_videoReaderProps = subscribe(videoReaderProps, $$value => $$invalidate(7, $videoReaderProps = $$value)), videoReaderProps);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_videoReaderProps());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2;
    	let fInitialized = false;
    	let charmScanner;
    	let charmManager;
    	let domInput; // input 要素
    	let files = []; // 選択されたローカルファイル

    	// video reader
    	let videoReaderProps = writable([]);

    	validate_store(videoReaderProps, "videoReaderProps");
    	$$subscribe_videoReaderProps();
    	let countFinishVideoRead;
    	let isVideoReadFinished;

    	// progress
    	let currentFileIndex = -1;

    	// result
    	let nScanedCharms = 0;

    	let exportData = "";

    	window.addEventListener("load", async () => {
    		charmScanner = new MHRiseCharmScanner();
    		charmManager = new MHRiseCharmManager();
    		await charmScanner.init();
    		$$invalidate(0, fInitialized = true);
    	});

    	const initVideoReaders = () => {
    		$$subscribe_videoReaderProps($$invalidate(3, videoReaderProps = writable([])));
    		countFinishVideoRead = 0;
    		isVideoReadFinished = false;
    	};

    	const onFileSelected = async e => {
    		const files = e.target.files;

    		if (files == null) {
    			return;
    		}

    		console.log(files);

    		for (let i = 0; i < files.length; i++) {
    			console.log(Date());
    			$$invalidate(4, currentFileIndex = i);
    			const file = files[i];
    			initVideoReaders();
    			const reader = new FileReader();
    			reader.readAsDataURL(file);

    			await new Promise(resolve => {
    					reader.onload = resolve;
    				});

    			for (let i = 0; i < N_VIDEO_SPLITS; i++) {
    				const index = $videoReaderProps.length;

    				set_store_value(
    					videoReaderProps,
    					$videoReaderProps[index] = {
    						index,
    						videoData: reader.result,
    						charmScanner,
    						nSplits: N_VIDEO_SPLITS,
    						onFinish: onFinishVideoRead
    					},
    					$videoReaderProps
    				);
    			}

    			// console.log($videoReaderProps)
    			await new Promise(resolve => requestAnimationFrame(resolve));

    			await new Promise(resolve => {
    					setInterval(
    						() => {
    							$$invalidate(5, nScanedCharms = charmScanner.countCharms());
    							$$invalidate(6, exportData = charmScanner.exportAsText());

    							if (isVideoReadFinished) {
    								resolve();
    							}
    						},
    						1000
    					);
    				});
    		}

    		const charms = charmScanner.getCharms();
    		console.log(charms);
    		charmManager.registerCharms(charms);
    	};

    	const onFinishVideoRead = () => {
    		if (++countFinishVideoRead !== N_VIDEO_SPLITS) {
    			return;
    		}

    		isVideoReadFinished = true;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const change_handler = e => onFileSelected(e);

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(2, files);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domInput = $$value;
    			$$invalidate(1, domInput);
    		});
    	}

    	const click_handler = () => {
    		domInput.click();
    	};

    	const click_handler_1 = () => {
    		domInput.click();
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		VideoReader,
    		MHRiseCharmManager,
    		MHRiseCharmScanner,
    		TITLE,
    		VIDEO_WIDTH,
    		VIDEO_HEIGHT,
    		VIDEO_FRAME_RATE,
    		N_VIDEO_SPLITS,
    		fInitialized,
    		charmScanner,
    		charmManager,
    		domInput,
    		files,
    		videoReaderProps,
    		countFinishVideoRead,
    		isVideoReadFinished,
    		currentFileIndex,
    		nScanedCharms,
    		exportData,
    		initVideoReaders,
    		onFileSelected,
    		onFinishVideoRead,
    		$videoReaderProps
    	});

    	$$self.$inject_state = $$props => {
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    		if ("charmScanner" in $$props) charmScanner = $$props.charmScanner;
    		if ("charmManager" in $$props) charmManager = $$props.charmManager;
    		if ("domInput" in $$props) $$invalidate(1, domInput = $$props.domInput);
    		if ("files" in $$props) $$invalidate(2, files = $$props.files);
    		if ("videoReaderProps" in $$props) $$subscribe_videoReaderProps($$invalidate(3, videoReaderProps = $$props.videoReaderProps));
    		if ("countFinishVideoRead" in $$props) countFinishVideoRead = $$props.countFinishVideoRead;
    		if ("isVideoReadFinished" in $$props) isVideoReadFinished = $$props.isVideoReadFinished;
    		if ("currentFileIndex" in $$props) $$invalidate(4, currentFileIndex = $$props.currentFileIndex);
    		if ("nScanedCharms" in $$props) $$invalidate(5, nScanedCharms = $$props.nScanedCharms);
    		if ("exportData" in $$props) $$invalidate(6, exportData = $$props.exportData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fInitialized,
    		domInput,
    		files,
    		videoReaderProps,
    		currentFileIndex,
    		nScanedCharms,
    		exportData,
    		$videoReaderProps,
    		onFileSelected,
    		change_handler,
    		input_change_handler,
    		input_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

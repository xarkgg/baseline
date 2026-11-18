/**
 * AOS (Animate on scroll) 3.0.0-beta.6
 * MIT - https://github.com/michalsnik/aos
 *
 * Vendored from the local `aos-next` checkout so the project has no runtime
 * dependency on the package registry. Only changes from upstream: the SCSS
 * import is dropped (styles live in `aos.css`), and the lodash throttle /
 * debounce helpers are inlined below.
 */

type AosSettings = {
  offset: number;
  delay: number;
  easing: string;
  duration: number;
  disable: boolean | "phone" | "tablet" | "mobile" | (() => boolean);
  once: boolean;
  mirror: boolean;
  anchorPlacement: string;
  startEvent: string;
  animatedClassName: string;
  initClassName: string | false;
  useClassNames: boolean;
  disableMutationObserver: boolean;
  throttleDelay: number;
  debounceDelay: number;
};

type AosElement = {
  node: HTMLElement;
  position?: { in: number; out: number };
  options?: {
    once: boolean;
    mirror: boolean;
    animatedClassNames: string[];
    id: string | null;
  };
  animated?: boolean;
};

/**
 * Minimal leading + trailing throttle, equivalent to lodash.throttle for the
 * way AOS uses it (scroll events).
 */
function throttle(fn: (...args: never[]) => void, wait: number) {
  const call = fn as unknown as (...args: unknown[]) => void;
  let last = 0;
  let timer: number | undefined;
  let lastArgs: unknown[] | null = null;

  return (...args: unknown[]) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    lastArgs = args;

    if (remaining <= 0) {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
      last = now;
      call(...args);
    } else if (timer === undefined) {
      timer = window.setTimeout(() => {
        timer = undefined;
        last = Date.now();
        if (lastArgs) call(...lastArgs);
      }, remaining);
    }
  };
}

/** Minimal debounce supporting the immediate/leading flag used by AOS. */
function debounce(fn: (...args: never[]) => void, wait: number, immediate = false) {
  const call = fn as unknown as (...args: unknown[]) => void;
  let timer: number | undefined;

  return (...args: unknown[]) => {
    const callNow = immediate && timer === undefined;
    if (timer !== undefined) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = undefined;
      if (!immediate) call(...args);
    }, wait);
    if (callNow) call(...args);
  };
}

/* ---------------------------------- libs --------------------------------- */

const offset = (el: HTMLElement | null) => {
  let x = 0;
  let y = 0;
  let node = el;

  while (node && !Number.isNaN(node.offsetLeft) && !Number.isNaN(node.offsetTop)) {
    x += node.offsetLeft - (node.tagName !== "BODY" ? node.scrollLeft : 0);
    y += node.offsetTop - (node.tagName !== "BODY" ? node.scrollTop : 0);
    node = node.offsetParent as HTMLElement | null;
  }

  return { top: y, left: x };
};

const observer = (() => {
  let callback: () => void = () => {};

  const containsAOSNode = (nodes: Node[]): boolean => {
    for (let i = 0; i < nodes.length; i += 1) {
      const currentNode = nodes[i] as HTMLElement;

      if (currentNode.dataset && currentNode.dataset["aos"]) return true;

      const children = currentNode.children;
      if (children && containsAOSNode(Array.from(children))) return true;
    }

    return false;
  };

  const check = (mutations?: MutationRecord[]) => {
    if (!mutations) return;

    mutations.forEach((mutation) => {
      const allNodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
      if (containsAOSNode(allNodes)) callback();
    });
  };

  const getMutationObserver = () =>
    window.MutationObserver ||
    (window as unknown as { WebKitMutationObserver?: typeof MutationObserver }).WebKitMutationObserver ||
    (window as unknown as { MozMutationObserver?: typeof MutationObserver }).MozMutationObserver;

  const isSupported = () => !!getMutationObserver();

  const ready = (selector: string, fn: () => void) => {
    const MutationObserverImpl = getMutationObserver();
    if (!MutationObserverImpl) return;

    const mutationObserver = new MutationObserverImpl(check);
    callback = fn;

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  };

  return { isSupported, ready };
})();

/* -------------------------------- helpers -------------------------------- */

const getInlineOption = (el: HTMLElement, key: string, fallback?: unknown) => {
  const attr = el.getAttribute("data-aos-" + key);

  if (typeof attr !== "undefined" && attr !== null) {
    if (attr === "true") return true;
    if (attr === "false") return false;
  }

  return attr || fallback;
};

const getPositionIn = (el: HTMLElement, defaultOffset: number, defaultAnchorPlacement: string) => {
  const windowHeight = window.innerHeight;
  const anchor = getInlineOption(el, "anchor") as string | undefined;
  const inlineAnchorPlacement = getInlineOption(el, "anchor-placement") as string | undefined;
  const additionalOffset = Number(
    getInlineOption(el, "offset", inlineAnchorPlacement ? 0 : defaultOffset),
  );
  const anchorPlacement = inlineAnchorPlacement || defaultAnchorPlacement;
  let finalEl: HTMLElement = el;

  if (anchor && document.querySelectorAll(anchor)) {
    finalEl = document.querySelectorAll(anchor)[0] as HTMLElement;
  }

  let triggerPoint = offset(finalEl).top - windowHeight;

  switch (anchorPlacement) {
    case "center-bottom":
      triggerPoint += finalEl.offsetHeight / 2;
      break;
    case "bottom-bottom":
      triggerPoint += finalEl.offsetHeight;
      break;
    case "top-center":
      triggerPoint += windowHeight / 2;
      break;
    case "center-center":
      triggerPoint += windowHeight / 2 + finalEl.offsetHeight / 2;
      break;
    case "bottom-center":
      triggerPoint += windowHeight / 2 + finalEl.offsetHeight;
      break;
    case "top-top":
      triggerPoint += windowHeight;
      break;
    case "bottom-top":
      triggerPoint += windowHeight + finalEl.offsetHeight;
      break;
    case "center-top":
      triggerPoint += windowHeight + finalEl.offsetHeight / 2;
      break;
    default:
      break;
  }

  return triggerPoint + additionalOffset;
};

const getPositionOut = (el: HTMLElement, defaultOffset: number) => {
  const windowHeight = window.innerHeight;
  const anchor = getInlineOption(el, "anchor") as string | undefined;
  const additionalOffset = getInlineOption(el, "offset", defaultOffset);
  let finalEl: HTMLElement = el;

  if (anchor && document.querySelectorAll(anchor)) {
    finalEl = document.querySelectorAll(anchor)[0] as HTMLElement;
  }

  return offset(finalEl).top + finalEl.offsetHeight - (additionalOffset as number);
};

const elements = (): AosElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-aos]")).map((node) => ({ node }));

const prepare = ($elements: AosElement[], options: AosSettings) => {
  $elements.forEach((el) => {
    const mirror = getInlineOption(el.node, "mirror", options.mirror) as boolean;
    const once = getInlineOption(el.node, "once", options.once) as boolean;
    const id = (getInlineOption(el.node, "id") as string) ?? null;
    const customClassNames = options.useClassNames && el.node.getAttribute("data-aos");

    const animatedClassNames = [options.animatedClassName]
      .concat(customClassNames ? customClassNames.split(" ") : [])
      .filter((className) => typeof className === "string");

    if (options.initClassName) {
      el.node.classList.add(options.initClassName);
    }

    el.position = {
      in: getPositionIn(el.node, options.offset, options.anchorPlacement),
      out: (mirror && getPositionOut(el.node, options.offset)) as number,
    };

    el.options = { once, mirror, animatedClassNames, id };
  });

  return $elements;
};

const detector = (() => {
  const ua = () => navigator.userAgent || navigator.vendor || "";

  const mobile = () =>
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
      ua(),
    );

  const phone = () =>
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      ua(),
    );

  return { mobile, phone, tablet: () => mobile() && !phone() };
})();

const handleScroll = ($elements: AosElement[]) =>
  $elements.forEach((el) => {
    const { options, position, node } = el;
    if (!options || !position) return;

    const top = window.pageYOffset;

    const show = () => {
      if (el.animated) return;
      options.animatedClassNames.forEach((className) => node.classList.add(className));
      document.dispatchEvent(new CustomEvent("aos:in", { detail: node }));
      if (options.id) document.dispatchEvent(new CustomEvent(`aos:in:${options.id}`, { detail: node }));
      el.animated = true;
    };

    const hide = () => {
      if (!el.animated) return;
      options.animatedClassNames.forEach((className) => node.classList.remove(className));
      document.dispatchEvent(new CustomEvent("aos:out", { detail: node }));
      el.animated = false;
    };

    if (options.mirror && top >= position.out && !options.once) {
      hide();
    } else if (top >= position.in) {
      show();
    } else if (el.animated && !options.once) {
      hide();
    }
  });

/* ---------------------------------- aos ---------------------------------- */

let $aosElements: AosElement[] = [];
let initialized = false;

let options: AosSettings = {
  offset: 120,
  delay: 0,
  easing: "ease",
  duration: 400,
  disable: false,
  once: true,
  mirror: false,
  anchorPlacement: "top-bottom",
  startEvent: "DOMContentLoaded",
  animatedClassName: "aos-animate",
  initClassName: "aos-init",
  useClassNames: false,
  disableMutationObserver: false,
  throttleDelay: 99,
  debounceDelay: 50,
};

const isBrowserNotSupported = () => {
  const doc = document as unknown as { all?: unknown };
  return !!doc.all && !window.atob;
};

const initializeScroll = () => {
  $aosElements = prepare($aosElements, options);
  handleScroll($aosElements);

  window.addEventListener(
    "scroll",
    throttle(() => handleScroll($aosElements), options.throttleDelay),
  );

  return $aosElements;
};

const refresh = (initialize = false) => {
  if (initialize) initialized = true;
  if (initialized) initializeScroll();
};

const refreshHard = () => {
  $aosElements = elements();

  if (isDisabled(options.disable) || isBrowserNotSupported()) {
    return disable();
  }

  refresh();
};

const isDisabled = (optionDisable: AosSettings["disable"]) =>
  optionDisable === true ||
  (optionDisable === "mobile" && detector.mobile()) ||
  (optionDisable === "phone" && detector.phone()) ||
  (optionDisable === "tablet" && detector.tablet()) ||
  (typeof optionDisable === "function" && optionDisable() === true);

const disable = () => {
  $aosElements.forEach((el) => {
    el.node.removeAttribute("data-aos");
    el.node.removeAttribute("data-aos-easing");
    el.node.removeAttribute("data-aos-duration");
    el.node.removeAttribute("data-aos-delay");

    if (options.initClassName) el.node.classList.remove(options.initClassName);
    if (options.animatedClassName) el.node.classList.remove(options.animatedClassName);
  });
};

const init = (settings: Partial<AosSettings> = {}) => {
  options = { ...options, ...settings };

  $aosElements = elements();

  if (!options.disableMutationObserver && !observer.isSupported()) {
    options.disableMutationObserver = true;
  }

  if (!options.disableMutationObserver) {
    observer.ready("[data-aos]", refreshHard);
  }

  if (isDisabled(options.disable) || isBrowserNotSupported()) {
    return disable();
  }

  const body = document.querySelector("body");
  if (body) {
    body.setAttribute("data-aos-easing", options.easing);
    body.setAttribute("data-aos-duration", String(options.duration));
    body.setAttribute("data-aos-delay", String(options.delay));
  }

  if (["DOMContentLoaded", "load"].indexOf(options.startEvent) === -1) {
    document.addEventListener(options.startEvent, () => refresh(true));
  } else {
    window.addEventListener("load", () => refresh(true));
  }

  if (
    options.startEvent === "DOMContentLoaded" &&
    ["complete", "interactive"].indexOf(document.readyState) > -1
  ) {
    refresh(true);
  }

  window.addEventListener("resize", debounce(refresh, options.debounceDelay, true));
  window.addEventListener("orientationchange", debounce(refresh, options.debounceDelay, true));

  return $aosElements;
};

const AOS = { init, refresh, refreshHard };

export default AOS;
export type { AosSettings };

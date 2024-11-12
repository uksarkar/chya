import { ChyaElementConditionStrategy } from "./enums/ChyaElementConditionStrategy";
import { ChyaTagType } from "./enums/ChyaTagType";
import {
  ChyaClassAttributeValue,
  ChyaElement,
  ChyaElementAttributeValue,
  ChyaElementExtends,
  ChyaSignalEffect,
  InputTextareaAttributes
} from "./interfaces";
import {
  addOrRemoveAttribute,
  buildDomElement,
  isNotEqual,
  isEmpty,
  isFn,
  removeClass,
  addClass,
  isInputOrTextareaTag
} from "./utils";

let activeEffect: ChyaSignalEffect | null = null;

// State
export function createEffect(fn: ChyaSignalEffect): () => void | undefined {
  activeEffect = fn;
  fn();
  activeEffect = null;

  return fn.clean as () => void;
}

export function createSignal<T = unknown>(): [
  () => T | undefined,
  (value: T | undefined | ((state: T | undefined) => T | undefined)) => void
];
export function createSignal<T>(
  init: T | (() => T)
): [() => T, (value: T | ((state: T) => T)) => void];
export function createSignal<T>(
  init?: T | (() => T)
): [
  () => T | undefined,
  (value: T | undefined | ((state: T | undefined) => T | undefined)) => void
] {
  let value = isFn(init) ? init() : init;
  const subscribers = new Set<() => void>();

  const set = (
    val: T | undefined | ((state: T | undefined) => T | undefined)
  ) => {
    const newValue = (isFn(val) ? val(value) : val) as T;
    const hasChange = isNotEqual(value, newValue);

    // assignment
    value = newValue;

    if (hasChange) {
      subscribers.forEach(listener => listener());
    }
  };

  const get = () => {
    if (!isEmpty(activeEffect)) {
      subscribers.add(activeEffect);

      // attach the cleaner
      activeEffect.clean = () => {
        subscribers?.delete(activeEffect!);
      };
    }

    return value;
  };

  return [get, set];
}

// Component
function handleClassAttributes(
  elm: ChyaElement,
  classes: ChyaClassAttributeValue
) {
  const handler = (
    cls: string | string | string[] | undefined | null,
    ref?: string | string | string[] | undefined | null
  ) => {
    const notEqRef = isNotEqual(cls, ref);
    if (!isEmpty(ref) && notEqRef) {
      removeClass(elm, ref);
    }

    if (notEqRef) {
      addClass(elm, cls);
      return true;
    }
    return false;
  };

  const handleFn = (
    fnClass: () => string | string | string[] | undefined | null
  ) => {
    let ref: string | string | string[] | undefined | null;

    elm.addDependencies?.(
      createEffect(() => {
        const actualClass = fnClass();
        if (handler(actualClass, ref)) {
          ref = actualClass;
        }
      })
    );
  };

  if (Array.isArray(classes)) {
    classes.forEach(cls => {
      if (isFn(cls)) {
        handleFn(cls);
      } else {
        handler(cls);
      }
    });
  } else if (isFn(classes)) {
    handleFn(classes);
  } else {
    handler(classes);
  }
}

// TODO: handling attributes could be simplify by using compiler, now handling everything on the runtime
// - differentiate the attributes (classes, events, normal attributes)
// - handle them via different method so no without using any module
// - shouldn't be used/included into the bundle
function handleElementAttributes(
  element: ChyaElement,
  attr:
    | Record<string, ChyaElementAttributeValue>
    | { class: ChyaClassAttributeValue }
) {
  Object.keys(attr).forEach(key => {
    const value = attr[key as keyof unknown] as ChyaElementAttributeValue;
    // handle classes
    if (key === "class") {
      handleClassAttributes(element, value as ChyaClassAttributeValue);
      return;
    }

    // handle events
    if (isFn(value) && key.startsWith("on")) {
      element.addEventListener(key.substring(2).toLowerCase(), value);
      return;
    }

    // handle other attributes
    if (isFn(value)) {
      let refValue: string | string[] | undefined | null;
      element.addDependencies?.(
        createEffect(() => {
          const actualValue = value();
          const notEq = isNotEqual(refValue, actualValue);

          if (!isEmpty(refValue) && notEq) {
            addOrRemoveAttribute(element, key, refValue);
          }

          if (notEq) {
            addOrRemoveAttribute(element, key, actualValue);
            refValue = actualValue;
          }
        })
      );
    } else {
      addOrRemoveAttribute(
        element,
        key,
        value as string | string[] | undefined | null
      );
    }
  });
}

export function createComponent<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attr?:
    | Record<string, ChyaElementAttributeValue>
    | { class: ChyaClassAttributeValue },
  ...children: (
    | ChyaElement
    | ((Text | Comment | DocumentFragment) & ChyaElementExtends)
  )[]
): ChyaElement<T> {
  const element = buildDomElement(tag);

  if (!isEmpty(attr)) {
    handleElementAttributes(element, attr);
  }

  if (children.length) {
    children.forEach(child => {
      element.appendChild(child);
      if (isFn(child.clean)) {
        element.addDependencies?.(() => child?.clean?.());
      }
    });
  }

  return element;
}

export function textComponent(text: () => string) {
  const t = buildDomElement(ChyaTagType.Text, "");
  t.addDependencies?.(
    createEffect(() => {
      t.textContent = text();
    })
  );

  return t;
}

export function conditionalComponent<T extends keyof HTMLElementTagNameMap>(
  tag: "input" | "textarea",
  attributes:
    | InputTextareaAttributes
    | Parameters<typeof createComponent<T>>[1],
  condition: ReturnType<typeof createSignal<boolean>>[0],
  strategy?: ChyaElementConditionStrategy
): ChyaElement<"input" | "textarea">;
export function conditionalComponent<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes: Parameters<typeof createComponent<T>>[1],
  condition: ReturnType<typeof createSignal<boolean>>[0],
  strategy?: ChyaElementConditionStrategy,
  ...children: Parameters<typeof createComponent<T>>[2][]
): ChyaElement<T>;
export function conditionalComponent<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes:
    | InputTextareaAttributes
    | Parameters<typeof createComponent<T>>[1],
  condition: ReturnType<typeof createSignal<boolean>>[0],
  strategy: ChyaElementConditionStrategy = ChyaElementConditionStrategy.Display,
  ...children: Parameters<typeof createComponent<T>>[2][]
) {
  const { bindings, event, ...attr } = (attributes ||
    {}) as InputTextareaAttributes;
  if (strategy === ChyaElementConditionStrategy.Display) {
    const element = isInputOrTextareaTag(tag)
      ? inputComponent(tag, bindings, event, attr)
      : createComponent(tag, attr, ...children);

    element.addDependencies?.(
      createEffect(() => {
        element.style.display = condition() ? "" : "none";
      })
    );

    return element;
  }

  // Remove Strategy: Conditionally add or remove element from the DOM
  let element:
    | ReturnType<typeof createComponent<T | "input" | "textarea">>
    | undefined;
  let placeholder: (Comment & ChyaElementExtends) | undefined;
  let parentNode: Node | undefined | null;

  const dep = createEffect(() => {
    // Identify parentNode once on the first effect run
    if (!parentNode) {
      parentNode = element?.parentNode || placeholder?.parentNode;
    }

    if ((element || placeholder) && !parentNode) {
      throw new Error("Unable to find the parent node");
    }

    // Conditionally render the element or placeholder
    if (condition()) {
      if (!element) {
        element = isInputOrTextareaTag(tag)
          ? inputComponent(tag, bindings, event, attr)
          : createComponent(tag, attr, ...children);
      }
      if (placeholder && parentNode?.contains(placeholder)) {
        parentNode.replaceChild(element, placeholder);
        placeholder = undefined;
      }
    } else {
      if (!placeholder) {
        placeholder = buildDomElement(ChyaTagType.Comment, "hidden");
      }
      if (element && parentNode?.contains(element)) {
        element.stage = 0;
        element.clean?.();
        parentNode.replaceChild(placeholder, element);
        element = undefined;
      }
    }
  });

  (element || placeholder)?.addDependencies?.(() => {
    if ((element || placeholder)!.stage !== 0) {
      dep();
    }
  });

  return element || placeholder!;
}

export function inputComponent(
  tag: "input" | "textarea",
  bindings?: ReturnType<typeof createSignal<string>>,
  event?: "input" | "change",
  attr?: Parameters<typeof createComponent<"input" | "textarea">>[1]
) {
  const input = createComponent(tag, attr);

  // Initial setting of input value
  if (bindings?.[0]) {
    input.addDependencies?.(
      createEffect(() => {
        input.value = bindings?.[0]();
      })
    );
  }

  // Update signal when input changes
  if (bindings?.[1]) {
    input.addEventListener(event || "input", e =>
      bindings?.[1]((e.target as HTMLInputElement).value)
    );
  }

  return input;
}

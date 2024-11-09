// Global variables

import { ChyaElement, ImplicitChyaElement } from "./interfaces";
import {
  addClass,
  compare,
  intoElement,
  isEmpty,
  isFn,
  removeClass
} from "./utils";

let activeEffect: (() => void) | null = null;

// State
export function createEffect(fn: () => void) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

export function createSignal<T>(
  init: T | (() => T)
): [() => T, (value: T | ((state: T) => T)) => void] {
  let value = isFn(init) ? init() : init;
  const subscribers = new Set<() => void>();

  const set = (val: T | ((state: T) => T)) => {
    const newValue = (isFn(val) ? val(value) : val) as T;
    const hasChange = compare(value, newValue);

    // assignment
    value = newValue;

    if (hasChange) {
      subscribers.forEach(listener => listener());
    }
  };

  const get = () => {
    if (!isEmpty(activeEffect)) {
      subscribers.add(activeEffect);
    }

    return value;
  };

  return [get, set];
}

interface Attr {
  class?:
    | string
    | (string | (() => string | undefined | null | []))[]
    | (() => string | undefined | null | []);
  [key: `on:${string}`]: () => void;
  "c-bind"?: ReturnType<typeof createSignal<string>>;
}

export function createComponent<T extends keyof HTMLElementTagNameMap>(
  tag: T | 0 | typeof createComponent<T>,
  attributes?: Attr | null,
  children?:
    | ImplicitChyaElement
    | ImplicitChyaElement[]
    | (() => ImplicitChyaElement),
  ...elements: ImplicitChyaElement[]
): HTMLElementTagNameMap[T] | DocumentFragment {
  if (isFn(tag)) {
    return tag({
      ...(attributes || {}),
      children,
      elements
    }) as HTMLElementTagNameMap[T];
  }

  if (
    (tag === "input" || tag === "textarea") &&
    attributes &&
    attributes["c-bind"]
  ) {
    return inputComponent(
      tag,
      attributes as InputOption
    ) as HTMLElementTagNameMap[T];
  }

  const element =
    tag === 0
      ? document.createDocumentFragment()
      : document.createElement(tag as T);

  // attr
  if (
    !isEmpty(attributes) &&
    element.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
  ) {
    Object.keys(attributes).forEach(key => {
      const value = attributes[key as keyof unknown];

      // classes
      if (key === "class") {
        if (isEmpty(value)) {
          return;
        }

        const handleCls = (cls: Attr["class"]) => {
          if (isFn(cls)) {
            let referenceCls: string | string[] | undefined | null;

            createEffect(() => {
              const val = cls();

              if (!isEmpty(val)) {
                addClass(element as HTMLElement, val!);

                if (referenceCls && referenceCls !== val!) {
                  removeClass(element as HTMLElement, referenceCls);
                }

                referenceCls = val!;
              } else if (referenceCls) {
                removeClass(element as HTMLElement, referenceCls);
              }
            });
          } else if (Array.isArray(cls)) {
            cls.forEach(cl => handleCls(cl));
          } else {
            addClass(element as HTMLElement, cls);
          }
        };

        handleCls(value as Attr["class"]);

        return;
      }

      // events
      if (key.startsWith("on:")) {
        if (isFn(value)) {
          element.addEventListener(key.replace("on:", ""), value);
        }
        return;
      }

      if (isFn(value)) {
        createEffect(() => {
          const attrVal = value();

          if (!isEmpty(attrVal)) {
            (element as HTMLElement).setAttribute(key, attrVal!);
          } else {
            (element as HTMLElement).removeAttribute(key);
          }
        });
      } else {
        (element as HTMLElement).setAttribute(key, value);
      }
    });
  }

  // children
  const addOrRemoveElement = (elm: ChyaElement | false, ref?: ChyaElement) => {
    if (!elm && ref) {
      if (ref.nodeType === Node.COMMENT_NODE) {
        return ref;
      }

      const newRef = document.createComment("removed");
      element.replaceChild(newRef, ref);

      return newRef;
    }

    if (elm && ref) {
      if (element.contains(elm)) {
        return elm;
      }

      element.replaceChild(elm, ref);
      return elm;
    }

    if (elm && !ref) {
      if (element.contains(elm)) {
        return elm;
      }
      element.appendChild(elm);
      return elm;
    }

    const newRef = document.createComment("future");
    element.appendChild(newRef);

    return newRef;
  };

  const handleChild = (
    childItems:
      | ImplicitChyaElement
      | ImplicitChyaElement[]
      | (() => ImplicitChyaElement)
  ) => {
    if (isFn(childItems)) {
      let ref: ChyaElement | undefined;
      createEffect(() => {
        ref = addOrRemoveElement(intoElement(childItems()), ref);
      });
    } else if (Array.isArray(childItems)) {
      childItems.forEach(child => {
        let ref: ChyaElement | undefined;
        if (isFn(child)) {
          createEffect(() => {
            const items = child();
            if (Array.isArray(items)) {
              // TODO: array implementation
            } else {
              ref = addOrRemoveElement(
                intoElement(items as ImplicitChyaElement),
                ref
              );
            }
          });
        } else {
          addOrRemoveElement(intoElement(child));
        }
      });
    } else {
      addOrRemoveElement(intoElement(childItems));
    }
  };

  if (!isEmpty(children)) {
    handleChild(children);
  }

  if (!isEmpty(elements)) {
    handleChild(elements);
  }

  return element;
}

export function textComponent(text: () => string): Text {
  const t = document.createTextNode("");
  createEffect(() => {
    t.textContent = text();
  });

  return t;
}

interface InputOption extends Attr {
  "c-bind"?: ReturnType<typeof createSignal<string>>;
  "c-event"?: "change" | "input";
}

function inputComponent(tag: "input" | "textarea", attr?: InputOption) {
  const { "c-bind": cBind, "c-event": cEvent, ...attrs } = attr || {};
  const input = createComponent(tag, attrs) as HTMLInputElement;

  // Initial setting of input value
  if (cBind?.[0]) {
    createEffect(() => {
      input.value = cBind?.[0]();
    });
  }

  // Update signal when input changes
  if (cBind?.[1]) {
    input.addEventListener(cEvent || "input", e =>
      cBind?.[1]((e.target as HTMLInputElement).value)
    );
  }

  return input;
}

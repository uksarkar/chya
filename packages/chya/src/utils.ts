import { ChyaElement, ImplicitChyaElement } from "./interfaces";

export function isEmpty<T>(val: T | null | undefined): val is null | undefined {
  return (val ?? "") === "";
}

export function isFn(
  val: unknown | null | undefined
): val is (...args: unknown[]) => unknown {
  return typeof val === "function";
}

export function intoElement(elm: ImplicitChyaElement): ChyaElement {
  if (isEmpty(elm)) {
    return document.createComment("empty");
  }

  if (typeof elm === "string" || typeof elm === "number") {
    return document.createTextNode(elm.toString());
  }

  return elm as ChyaElement;
}

export function compare(left: unknown, right: unknown): boolean {
  // If they are strictly equal, return false (no changes).
  if (Object.is(left, right)) return false;

  // Check if both are arrays.
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return true;
    for (let i = 0; i < left.length; i++) {
      if (compare(left[i], right[i])) return true;
    }
    return false;
  }

  // Check if both are objects.
  if (
    typeof left === "object" &&
    typeof right === "object" &&
    left !== null &&
    right !== null
  ) {
    const leftKeys = Object.keys(left as object);
    const rightKeys = Object.keys(right as object);

    // If they have different numbers of keys, they are different.
    if (leftKeys.length !== rightKeys.length) return true;

    // Check each key in the left object.
    for (const key of leftKeys) {
      if (
        !rightKeys.includes(key) ||
        compare(
          (left as Record<string, unknown>)[key],
          (right as Record<string, unknown>)[key]
        )
      ) {
        return true;
      }
    }
    return false;
  }

  return true;
}

export const addClass = (
  element: HTMLElement,
  cls: string | string[] | undefined | null
) => {
  if (Array.isArray(cls)) {
    element.classList.add(...cls);
  } else if (!isEmpty(cls)) {
    const items = cls.split(" ").filter(c => !isEmpty(c));
    element.classList.add(...items);
  }
};

export const removeClass = (
  element: HTMLElement,
  cls: string | string[] | undefined | null
) => {
  if (Array.isArray(cls)) {
    element.classList.remove(...cls);
  } else if (!isEmpty(cls)) {
    const items = cls.split(" ").filter(c => !isEmpty(c));
    element.classList.remove(...items);
  }
};

export type ChyaElement =
  | HTMLElement
  | SVGElement
  | Comment
  | Text
  | DocumentFragment;
export type ImplicitChyaElement = ChyaElement | string | number | boolean;
export type ChyaElementKey =
  | string
  | number
  | symbol
  | object
  | Map<unknown, unknown>
  | Set<unknown>
  | (() => unknown);

export interface ChyaComponentOption<T> {
  tag: T;
  children?:
    | ImplicitChyaElement
    | ImplicitChyaElement[]
    | (() => ImplicitChyaElement | ImplicitChyaElement[]);
  classes?: string | string[] | (() => string | undefined | null | string[]);
  attributes?: Record<string, string | (() => string | undefined | null)>;
  styles?: ElementCSSInlineStyle;
}

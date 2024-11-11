export type ChyaElementExtends = {
  stage?: number;
  dependencies?: Set<() => void>;
  addDependencies?: (dependency?: () => void) => void;
  clean?: () => void;
};
export type ChyaElement<
  T extends keyof HTMLElementTagNameMap | undefined = undefined
> = (T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : HTMLElement) &
  ChyaElementExtends;

export type ChyaElementAttributeValue =
  | string
  | string[]
  | (() => string | undefined | null);

export  type ChyaSignalEffect = (() => void) & { clean?: () => void };

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

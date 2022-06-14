import * as React from "react";
import {
  BeefedStyleHandlerSet,
  ClassName,
  InvertClassName,
  NonSymbol,
  ReturnStyle,
  StyleHandlerSet,
} from "./types";
import type { JSXElementConstructor } from "react";
import { StyleContext } from "./StyleProvider";
import { colorStringToRgb } from "./utils/colorStringToRgb";
import { SimpleConstrainedCache } from "./utils/SimpleConstrainedCache";

/**
 * Core builder fn. Takes in a set of handlers, and gives back a hook and component-builder.
 */
export const createStyleBuilder = <StyleHandlers extends StyleHandlerSet>({
  handlers: _handlers,
}: {
  handlers: StyleHandlers;
}) => {
  const handlers = Object.assign(
    {},
    _handlers
  ) as BeefedStyleHandlerSet<StyleHandlers>;
  const cache = new SimpleConstrainedCache({ maxNumRecords: 200 });

  /**
   * Fundamental styling function, used by the useStyle hook
   */
  const styles = <Cn extends ClassName<StyleHandlers>>(...classNames: Cn[]) => {
    const cacheKey = classNames.join(",");

    const styles = {} as Record<string, any>;

    // First, check the cache
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    // Start to aggregate styles
    for (let c of classNames || []) {
      const m = c.match(HandlerArgRegExp);
      const prop = m?.[1];
      const value = m?.[2];
      const handler =
        handlers?.[prop as NonSymbol<keyof typeof handlers>] || handlers?.[c];

      if (handler) {
        Object.assign(styles, handler(value));
      }
    }

    // Massage for bg-opacity
    if (typeof styles["--bg-opacity"] === "number" && styles?.backgroundColor) {
      const { r, g, b } = colorStringToRgb(styles.backgroundColor);
      styles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${styles["--bg-opacity"]})`;
    }
    delete styles["--bg-opacity"];

    // Add in the cache
    cache.set(cacheKey, styles);

    return styles;
  };

  /**
   * Core hook to apply styles based on props/style object
   */
  const useStyles = <Cn extends ClassName<StyleHandlers>>({
    baseClasses = [],
    darkClasses = [],
  }: {
    baseClasses?: Cn[];
    darkClasses?: Cn[];
  }) => {
    const { isDarkMode } = React.useContext(StyleContext);
    const classes = baseClasses.concat(isDarkMode ? darkClasses : []);
    const cacheKey = classes.join(",");

    return React.useMemo(() => styles(...classes), [cacheKey]);
  };

  /**
   * Utility to make a styled component
   */
  const makeStyledComponent = <
    T extends { style?: unknown },
    Cn extends ClassName<StyleHandlers>,
    Ref
  >(
    WrappedComponent: JSXElementConstructor<T>
  ) => {
    const ComponentWithStyles = React.forwardRef<
      Ref,
      T & { styled?: Cn[]; darkStyled?: Cn[] }
    >(({ styled, darkStyled, style, ...rest }, ref) => {
      const addedStyles = useStyles({
        baseClasses: styled,
        darkClasses: darkStyled,
      });

      return (
        // @ts-ignore
        <WrappedComponent
          ref={ref}
          {...rest}
          style={[addedStyles, ...[Array.isArray(style) ? style : [style]]]}
        />
      );
    });

    if ("displayName" in WrappedComponent) {
      ComponentWithStyles["displayName"] = WrappedComponent["displayName"];
    }

    return ComponentWithStyles;
  };

  return { styles, useStyles, makeStyledComponent };
};

const HandlerArgRegExp = /^(.+):(.+)$/;

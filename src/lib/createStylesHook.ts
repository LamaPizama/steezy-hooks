import React from 'react';

const parseCSSProperties = (styles: string): React.CSSProperties =>
    styles
        .split(';')
        .filter((style) => style.split(':')[0] && style.split(':')[1])
        .map((style) => [
            style
                .split(':')[0]
                .trim()
                .replace(/-./g, (c) => c.substr(1).toUpperCase()),
            style.split(':')[1].trim(),
        ])
        .reduce(
            (styleObj, style) => ({
                ...styleObj,
                [style[0]]: style[1],
            }),
            {}
        );

export const css = (template: TemplateStringsArray, ...values: Array<any>) =>
    template.reduce((acc, value, i) => {
        acc += value;
        if (!values[i]) {
            acc += '';
            return acc;
        }

        acc += values[i];
        return acc;
    }, '');

const applyCSS = <T>(
    fn: (props: T) => string,
    props: T
): React.CSSProperties => {
    const styles = fn(props).trim().replace(/\n/gi, '');
    return styles ? parseCSSProperties(styles) : {};
};

export const createStylesHook =
    <
        V = Record<string, unknown>,
        T = Record<string, (props: V) => ReturnType<typeof css>>
    >(
        styleDefinitions: T
    ) =>
    (
        props: Record<keyof T, V>
    ): Record<keyof T, { style: React.CSSProperties }> => {
        return Object.entries(styleDefinitions)
            .map(([key, fn]) => ({
                [key]: { style: applyCSS(fn, (props as any)[key]) },
            }))
            .reduce(
                (acc, styleObject) => ({ ...acc, ...styleObject }),
                {}
            ) as Record<keyof T, { style: React.CSSProperties }>;
    };

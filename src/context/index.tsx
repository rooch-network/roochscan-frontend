"use client"
import React, { Context, createContext, useState, PropsWithChildren } from 'react'
import { IContext, ThemeColor } from "@/types"

export const ContextInstance = createContext({}) as unknown as Context<IContext>;
export const { Provider } = ContextInstance;


export default function GlobalContext(props: PropsWithChildren) {

    const [themeColor, setThemeColor] = useState<ThemeColor>(ThemeColor.Dark)

    const handleSetThemeColor = (val: ThemeColor): void => setThemeColor(val);

    const initValue = {
        themeColor,
        handleSetThemeColor
    }
    return <Provider value={initValue}>{props.children}</Provider>

}
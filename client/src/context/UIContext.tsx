import * as React from "react"

const TOGGLE_DRAWER = "TOGGLE_DRAWER"

interface DrawerAction {
    type: "TOGGLE_DRAWER"
    payload: boolean
}

type Action = DrawerAction
type Dispatch = (action: Action) => void

interface State {
    isDrawerOpen: boolean
}

interface UIProviderProps {
    children: React.ReactNode
}

const initialState: State = {
    isDrawerOpen: false,
}

function uiReducer(state: State, action: Action) {
    switch (action.type) {
        case TOGGLE_DRAWER:
            return {
                ...state,
                isDrawerOpen: action.payload,
            }
        default:
            throw new Error(`Unhandled action type: ${action.type}`)
    }
}

export const UIContext = React.createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined)

export function UIStateProvider({ children }: UIProviderProps) {
    const [state, dispatch] = React.useReducer(uiReducer, initialState)

    const value = { state, dispatch }
    return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

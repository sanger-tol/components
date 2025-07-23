/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import { PrivilegeContext, BoardPrivilegeContextValue } from "..";

export const useBoardPrivilege = () => {
    const context = useContext<BoardPrivilegeContextValue | undefined>(PrivilegeContext);
    if (context === undefined) {
        // returns undefined for components that are not in a board
        return { privilege: undefined, setPrivilege: () => { } };
    }
    return context;
}

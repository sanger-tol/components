/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Modal } from "..";

export interface PRemovedColumnsModal {
    /**
     * Whether the modal is open.
     */
    open: boolean;
    /**
     * Setter for toggling modal open state.
     */
    setOpen: Dispatch<SetStateAction<boolean>>;
    /**
     * Sequential board number shown in the message.
     */
    boardNumber: string;
    /**
     * Renderable removed column labels.
     */
    removedColumns: ReactNode[];
    /**
     * Number of columns still available on the table.
     */
    columnsRemaining: number;
}

export function RemovedColumnsModal(
    props: PRemovedColumnsModal,
) {
    const { 
        open, 
        setOpen, 
        boardNumber, 
        removedColumns, 
        columnsRemaining 
    } = props;

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            size="sm"
        >
            <div className="tol-table-reset-config">
                <h5>Deleted Columns</h5>
                <div className="tol-table-reset-config-additions">
                    <h6 className="tol-table-reset-config-headings">
                        The board owner removed the following columns from <strong>Board {boardNumber}</strong>:
                    </h6>
                    {removedColumns.map(
                        (col: ReactNode, idx: number) => (
                            <span key={idx}>{col}</span>
                        ),
                    )}
                </div>

                {columnsRemaining === 0 && (
                    <p className="tol-warning-colour">
                        <strong>No columns remain.</strong> Open the table configuration drawer to <strong>reset the table</strong> or select new columns from the available options.
                    </p>
                )}
            </div>
        </Modal>
    );
}

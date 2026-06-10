/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal } from "..";
import { ReactNode } from "react";

export interface PRemovedColumnsModal {
    open: boolean;
    setOpen: (open: boolean) => void;
    boardNumber: string;
    removedColumns: ReactNode[];
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

/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { BUTTONS, Button, IConfigDifferences, Modal } from "..";

export interface PTableResetConfirmationModal {
  open: boolean;
  setOpen: (open: boolean) => void;
  setConfigOpen: (open: boolean) => void;
  onReset?: () => void;
  resetConfigDifferences?: IConfigDifferences;
}

export function TableResetConfirmationModal(
  props: PTableResetConfirmationModal,
) {
  const {
    open,
    setOpen,
    setConfigOpen,
    onReset,
    resetConfigDifferences,
  } = props;

  return (
    <Modal
      hasPendingChanges
      open={open}
      setOpen={setOpen}
      size="sm"
      closeButton={false}
    >
      {resetConfigDifferences ? (
        <div className="tol-table-reset-config">
          <h5>Reset Table Configuration</h5>
          <p>
            Are you sure you want to reset this table to the published
            configuration?
          </p>
          {resetConfigDifferences.remove?.length > 0 && (
            <div>
              <h6>
                This action will <strong>remove</strong> the following columns:
              </h6>
              {resetConfigDifferences.remove.map(
                (col: ReactNode, idx: number) => (
                  <span key={idx}>{col}</span>
                ),
              )}
            </div>
          )}
          {resetConfigDifferences.add?.length > 0 && (
            <div className="tol-table-reset-config-additions">
              <h6 className="tol-table-reset-config-headings">
                This action will <strong>add</strong> the following columns:
              </h6>
              {resetConfigDifferences.add.map(
                (col: ReactNode, idx: number) => (
                  <span key={idx}>{col}</span>
                ),
              )}
            </div>
          )}
          <p className="tol-danger-colour">
            Warning: Your current table configuration will be lost.
          </p>
          <Button
            {...BUTTONS.CONFIRM}
            onClick={() => {
              setOpen(false);
              setConfigOpen(false);
              onReset?.();
            }}
            testid="confirm-reset-button"
          />
          <Button
            {...BUTTONS.CANCEL}
            onClick={() => setOpen(false)}
          />
        </div>
      ) : (
        <p>No differences found. Please close this pop-up.</p>
      )}
    </Modal>
  );
}

/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useRef, useState } from "react";
import { Progress } from "rsuite";

export interface PProgressBar {
  /* Async generator that produces items to track progress for. (e.g., getListByCursor) */
  generator: AsyncIterable<any>;
  /* Total number of items expected from the generator */
  totalExpected: number;
  /* Optional text to display above the progress bar. */
  text?: ReactNode;
  /* Callback invoked when percentage reaches 100%. */
  onComplete?: () => any;
  /* Callback invoked when the generator completes a fetch successfully. */
  onFetch?: (items: any[]) => void;
  /* Callback invoked if an error occurs while consuming the generator. */
  onError?: (error: any) => void;
}

/**
 * @autodoc
 *
 * ProgressBar consumes an async generator and displays its progress.
 */
export function ProgressBar(props: PProgressBar) {
  const { generator, totalExpected, text, onComplete, onFetch, onError } = props;
  const [percentageComplete, setPercentageComplete] = useState<number>(0);
  const started = useRef<boolean>(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const consumeGenerator = async () => {
      const items: unknown[] = [];

      try {
        for await (const item of generator) {
          items.push(item);
          const percentage = totalExpected > 0
            ? Math.floor((items.length / totalExpected) * 100)
            : 0;
          setPercentageComplete(Math.min(percentage, 100));
        }
        onFetch?.(items);
      } catch (error) {
        onError?.(error);
      }
    };

    void consumeGenerator();
  }, [generator, onFetch, onError, totalExpected]);

  useEffect(() => {
    if (percentageComplete === 100) {
      onComplete?.();
    }
  }, [percentageComplete]);

  return (
    <>
      {text}
      <Progress.Line
        percent={percentageComplete}
        status={percentageComplete === 100 ? "success" : "active"}
      />
    </>
  );
}
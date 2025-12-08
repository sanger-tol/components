/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CodeBlock } from "react-code-blocks";
import {
  CenterContent,
  Widgets,
  IWidgetsComponent,
  RequiredAsterisk,
  IComponentDocumentation,
} from "..";


export interface PAutoDocPage {
  documentation: IComponentDocumentation;
}

export function AutoDocPage(props: PAutoDocPage) {
  const { documentation } = props;

  const HeaderWidget = (
    <>
      <h1>{documentation.name}</h1>
      <div className="tol-code-block">
        <CodeBlock
          text={documentation.filePath}
          language="javascript"
          showLineNumbers={false}
        />
        {documentation.description && <p style={{ marginTop: '12px' }}>{documentation.description}</p>}
      </div>
    </>
  );

  const PropsWidget = documentation.props.length > 0 ? (
    <>
      <h4>Props</h4>
      <div style={{ marginTop: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tol-grey)' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tol-grey)' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tol-grey)' }}>Default</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tol-grey)' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {documentation.props.map((prop) => (
              <tr key={prop.name}>
                <td style={{ color: "var(--tol-primary)", padding: '12px', borderBottom: '1px solid var(--tol-grey-translucent)' }}>
                  {prop.name}
                  {prop.required && <RequiredAsterisk />}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--tol-grey-translucent)' }}>{prop.type}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--tol-grey-translucent)' }}>{prop.defaultValue || '—'}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--tol-grey-translucent)' }}>{prop.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : null;

  const RemarksWidget = documentation.remarks && documentation.remarks.length > 0 ? (
    <>
      <h4>Remarks</h4>
      {documentation.remarks.map((remark, index) => (
        <div key={index}>
          <p>{remark}</p>
        </div>
      ))}
    </>
  ) : null;

  // @ts-ignore
  const ExamplesWidget = documentation.examples.length > 0 ? (
    <>
      <h4>Examples</h4>
      {documentation.examples.map((example, index) => (
        <div key={index}>
          {example.title && <h6>{example.title}</h6>}
          <div className="tol-code-block">
            <CodeBlock
              text={example.code}
              language="typescript"
              showLineNumbers={false}
            />
          </div>
          {example.description && <p>{example.description}</p>}
        </div>
      ))}
    </>
  ) : null;

  // Build components array for Widgets
  const components: IWidgetsComponent[] = [];
  components.push({ component: HeaderWidget, type: "full" });
  if (PropsWidget) components.push({ component: PropsWidget, type: "full" });
  if (RemarksWidget) components.push({ component: RemarksWidget, type: "full" });
  // if (ExamplesWidget) components.push({ component: ExamplesWidget, type: "full" });

  return (
    <CenterContent>
      <Widgets components={components} />
    </CenterContent>
  );
}
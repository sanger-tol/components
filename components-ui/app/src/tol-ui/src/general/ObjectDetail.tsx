/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface Props {
  data: object
}

const ObjectDetail = (props: Props) => {
  const { data } = props;
  return (
    <div className='tol-object-detail'>
      {Object.entries(data).map(([key, value]) =>
        <p key={key}>
          <strong>{key}:</strong> {value}
        </p>)}
    </div>
  );
};

export default ObjectDetail;

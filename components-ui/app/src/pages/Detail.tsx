/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Widgets } from '../tol-ui/src';
import { Link } from "react-router-dom";

const buttonStyle = {
  marginBottom: '10px'
};

const detail = {
  "id1": 1230139,
  "id2": 1230140,
  "id3": 9913,
  "id4": 102642,
  "id5": 572802,
  "id6": 270466,
};

function Detail() {

  const examples = (
    <div>
      <h2 style={{ marginBottom: 10 }}>Mock Species</h2>
      <div style={buttonStyle}>
        <Link to={'detail/' + detail.id1}>
          <Button text='Get detail for Graphomya maculata' type='primary'/>
        </Link>
      </div>
      <div style={buttonStyle}>
        <Link to={'detail/' + detail.id2}>
          <Button text='Get detail for Hebecnema nigra' type='primary'/>
        </Link>
      </div>
      <div style={buttonStyle}>
      <Link to={'detail/' + detail.id3}>
        <Button text='Get detail for Bos taurus' type='primary'/>
      </Link>
    </div>
    <div style={buttonStyle}>
      <Link to={'detail/' + detail.id4}>
        <Button text='Get detail for Abax parallelepipedus' type='primary'/>
      </Link>
    </div>
    <div style={buttonStyle}>
      <Link to={'detail/' + detail.id5}>
        <Button text='Get detail for Acleris holmaina' type='primary'/>
      </Link>
    </div>
    <div style={buttonStyle}>
      <Link to={'detail/' + detail.id6}>
        <Button text='Get detail for Limenitis camilla' type='primary'/>
      </Link>
    </div>
    </div>
  );

  const components = [
    {
      component: examples,
      type: 'full'
    }
  ];

  return (
    <Widgets
      components={components}
    />
  );
}

export default Detail;

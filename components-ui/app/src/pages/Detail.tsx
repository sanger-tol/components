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
          <Button>Get detail for Graphomya maculata</Button>
        </Link>
      </div>
      <div style={buttonStyle}>
        <Link to={'detail/' + detail.id2}>
          <Button>Get detail for Hebecnema nigra</Button>
        </Link>
      </div>
      <div style={buttonStyle}>
        <Link to={'detail/' + detail.id3}>
          <Button>Bos taurus</Button>
        </Link>
      </div>
      <div style={buttonStyle}>
        <Link to={'detail/' + detail.id4}>
          <Button>Get detail for Abax parallelepipedus</Button>
        </Link>
      </div>
      <div style={buttonStyle}>
        <Link to={'detail/' + detail.id5}>
          <Button>Get detail for Acleris holmaina</Button>
        </Link>
      </div>
      <div style={buttonStyle}>
        <Link to={'detail/' + detail.id6}>
          <Button>Get detail for Limenitis camilla</Button>
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

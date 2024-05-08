/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ResponsiveWidget, Widgets as W } from '../tol-ui/src';


const randomColour = () => "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");

const getDiv = () => {
  return (
    <div style={{
      backgroundColor: randomColour(),
      height: '100%',
      borderRadius: 6
    }}/>
  );
};

const components = [
  {
    component: <h2>Widget Sizes</h2>,
    type: 'full'
  },
  {
    component: getDiv(),
    type: 'sm'
  },
  {
    component: getDiv(),
    type: 'sm'
  },
  {
    component: getDiv(),
    type: 'sm'
  },
  {
    component: getDiv(),
    type: 'sm'
  },
  {
    component: getDiv(),
    type: 'md'
  },
  {
    component: getDiv(),
    type: 'md'
  },
  {
    component: getDiv(),
    type: 'lg'
  },
  {
    component: getDiv(),
    type: 'xl'
  }
];

const components2 = {
  components: {
    '1': {
      element: getDiv(),
      type: 'small'
    },
    '2': {
      element: getDiv(),
      type: 'small'
    },
    '3': {
      element: getDiv(),
      type: 'small'
    },
    '4': {
      element: getDiv(),
      type: 'small'
    },
    '5': {
      element: getDiv(),
      type: 'medium'
    },
    '6': {
      element: getDiv(),
      type: 'medium'
    },
    '7': {
      element: getDiv(),
      type: 'large'
    }
  },
  order: ['1', '2', '3', '4', '5', '6', '7']
};

function Widgets() {
  return (
    <div className="widgets">
      <W
        components={components}
      />
      <ResponsiveWidget id='widgets-page' widgets={components2} draggable={true}/>
    </div>
  );
}

export default Widgets;

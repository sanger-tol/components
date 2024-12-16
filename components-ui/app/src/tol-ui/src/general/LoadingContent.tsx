/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Loader
} from '../index';
  
  interface Props {
    text?: string
  }
  
  function LoadingContent(props: Props) {
    const {text} = props;
    return (
      <div className='fixed-full-page'>
      <div className='fixed-centered-loader'>
        <Loader />
      </div>
      <div className='fixed-centered-text'>
        {text || 'Loading...'}
      </div>
    </div>
    )
  }
  
  export default LoadingContent;
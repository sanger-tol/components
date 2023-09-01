/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { AutoComplete as RSAutoComplete } from 'rsuite';
import { httpClient } from '../services/http/httpClient';
import { MiniLoadingHelix, Status } from '../index';


interface Props {
  endpoint: string
  filter_by: string
  display: string[]
}

function RemoteAutoComplete(props: Props) {
  const { endpoint, filter_by, display } = props;
  const [value, setValue] = useState('')
  const [timeout, setTimeDelay] = useState(undefined)
  const [data, setData] = useState([''])
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState('')

  const handleOnChange = (event: any) => {
    setResponse('')
    setData([])
    setValue(event)
    clearTimeout(timeout)
    setIsLoading(true)
    const timeDelay = setTimeout(() => {
      if (endpoint){
        fetchData()
      }
    }, 800)
    // @ts-ignore
    setTimeDelay(timeDelay)
  }

  const fetchData = () => {
    httpClient().get('/' + endpoint, {
      params: {
        filter: {"contains": {[filter_by]: value}}
      }
      })
      .then((res: any) => {
        const dropdown_data = convertForDropdown(res.data.data)
        setData(dropdown_data)
      })
      .catch((error: any) => {
        console.error(error.message)
        setResponse(error.message)
      })
    setIsLoading(false)
  }

  const convertForDropdown = (dataArray: any) => {
    const arrayToReturn: any = []
    dataArray.map((item: any) => {
      let displayed_fields = ' '
      for (let i=0; i<display.length; i++){
        displayed_fields += item.attributes[display[i]] + ' '
      }
      arrayToReturn.push(item.attributes[filter_by]+displayed_fields)
    })
    return (arrayToReturn)
  }

  if (response === ''){
    return (
      <div>
        {isLoading ?
          <div className='tol-input'>
            <RSAutoComplete
              data={[value]}
              value={value}
              onChange={handleOnChange}
              renderMenuItem={() => {
                return (
                  <div className='centered-loader'>
                    <MiniLoadingHelix/>
                  </div>
                );
              }}
            />
          </div>
          :
          <div className='tol-input'>
            <RSAutoComplete
              data={data}
              value={value}
              placeholder='Species Name'
              onChange={handleOnChange} 
              />
          </div>
        }
      </div>
    );
  }else{
    return(
      <div>
        <div className='tol-input'>
            <RSAutoComplete
              data={[]}
              value={value}
              onChange={handleOnChange}
            />
        </div>
        <div>
          <Status
            status="danger"
            text={response}
          />
        </div>
      </div>
    )
  }
}


export default RemoteAutoComplete;

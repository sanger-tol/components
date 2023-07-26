/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from 'react';
import { Uploader } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { LoadingHelix, httpClient, Alert } from '../index';


interface WaitingUpload {
    message: string
}

interface Message {
    type: string,
    message: string
}

export interface Props {
    endpoint: string,
    fileType: string,
    generateMessages: (apiRes: any) => Message[]
}

function Dropzone(props: Props) {
    const { endpoint, fileType, generateMessages } = props
    const [fileList, setFileList] = useState<any[]>([])
    const [validate, setValidate] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [fail, setFail] = useState(false)

    useEffect(() => {
        if (fileList.length > 0){
            setIsLoading(true)
            setHasLoaded(false)
            setMessages([])
            validateFile()
            setFail(false)
        }
    }, [validate])

    const validateFile = () => {
        let formData = new FormData();
        formData.set("file", fileList[fileList.length -1].blobFile, fileList[fileList.length -1].name)

        httpClient().post("/" + endpoint, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })
        .then((res: any) => {
            setIsLoading(false)
            setHasLoaded(true)
            setMessages(generateMessages(res))
        })
        .catch((error: any) => {
            setIsLoading(false)
            setFail(true)
            setFileList([])
            console.error(error)
        })
    }

    const WaitingUpload = (props: WaitingUpload) => {
        return <div className='dropzone-container'>
            <FontAwesomeIcon className="file-upload" icon={faFileArrowUp} size="8x" />
            <p>{props.message}</p>
            {fileList.length > 0 ?
                <p className='file-name'>{String(fileList[fileList.length -1].name)}</p>
            : 
                <p></p>
            }
        </div>
    }

    return (
      <div className="tol-dropzone">
        <Uploader
            action="temp-error-please-ignore"
            draggable
            accept={fileType}
            onChange={setFileList}
            fileListVisible={false}
            onUpload={() => {setValidate(!validate)}}
        >
            <div>
                {isLoading ?
                    <div className='dropzone-container'>
                        <LoadingHelix/>
                    </div>
                :
                    <div>
                        {fail ?
                            <WaitingUpload message="Unexpected error, please try again"/>
                        :
                            <WaitingUpload message="Click or drag file to this area to upload"/>
                        }
                    </div>
                }
            </div>
        </Uploader>
        {hasLoaded ?
            <div className='mt-3'>
                {messages.map((message: Message, index: number) => {
                    return <Alert key={index} type={message.type} message={message.message} />
                })}
            </div>
        : <></>}
      </div>
    );
}

export default Dropzone;

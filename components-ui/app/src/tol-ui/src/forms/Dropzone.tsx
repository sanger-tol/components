/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { Uploader } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Loader, httpClient, StatusMessage, useStateFallback } from "../index";
import { MessageType } from "../messaging/Message";

interface WaitingUpload {
  message: string;
}

interface Message {
  type: string;
  message: MessageType;
}

export interface FileData {
  blobFile: File;
  fileKey: string;
  name: string;
  status: string;
}

export interface Props {
  endpoint: string;
  fileType: string;
  generateMessages: (apiRes: any) => Message[];
  setResponse?: any;
  onFileDrop?: (length: boolean) => void;
  fileListVisible?: boolean;
  fileList?: FileData[];
  setFileList?: (fileList: FileData[]) => void;
  parentToSubmit?: boolean;
  resetKey?: string | number;
}

function Dropzone(props: Props) {
  const {
    endpoint,
    fileType,
    generateMessages,
    setResponse,
    onFileDrop,
    fileListVisible = false,
    parentToSubmit = false,
    resetKey,
  } = props;

  const [fileList, setFileList] = useStateFallback<FileData[]>(
    props.fileList,
    props.setFileList,
    []
  );
  const [validate, setValidate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [fail, setFail] = useState(false);

  useEffect(() => {
    if (fileList.length > 0 && !parentToSubmit) {
      setIsLoading(true);
      setHasLoaded(false);
      setMessages([]);
      validateFile();
      setFail(false);
    }
    onFileDrop?.(fileList.length > 0);
  }, [validate]);

  const validateFile = () => {
    const formData = new FormData();
    formData.set(
      "file",
      fileList[fileList.length - 1].blobFile,
      fileList[fileList.length - 1].name
    );

    httpClient()
      .post("/" + endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res: any) => {
        if (setResponse) {
          setResponse(res);
        }
        setIsLoading(false);
        setHasLoaded(true);
        setMessages(generateMessages(res));
      })
      .catch((error: any) => {
        setIsLoading(false);
        setFail(true);
        setFileList([]);
        console.error(error);
      });
  };

  const WaitingUpload = (props: WaitingUpload) => {
    return (
      <div className="dropzone-container">
        <FontAwesomeIcon
          className="file-upload"
          icon={faFileArrowUp}
          size="8x"
        />
        <p>{props.message}</p>
        {fileList.length > 0 ? (
          <p className="file-name">
            {String(fileList[fileList.length - 1].name)}
          </p>
        ) : (
          <p></p>
        )}
      </div>
    );
  };

  return (
    <div className="tol-dropzone" key={resetKey}>
      <Uploader
        action="temp-error-please-ignore"
        draggable
        accept={fileType}
        onChange={setFileList}
        fileListVisible={fileListVisible}
        onUpload={() => {
          setValidate(!validate);
        }}
      >
        <div>
          {isLoading ? (
            <div className="dropzone-container">
              <Loader />
            </div>
          ) : (
            <div>
              {fail && fileList.length > 0 ? (
                <WaitingUpload message="Unexpected error, please try again" />
              ) : (
                <WaitingUpload message="Click or drag file to this area to upload" />
              )}
            </div>
          )}
        </div>
      </Uploader>
      {hasLoaded ? (
        <div className="mt-3">
          {messages.map((message: Message, index: number) => {
            return (
              <StatusMessage
                key={index}
                status={message.type as MessageType}
                message={message.message}
              />
            );
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Dropzone;

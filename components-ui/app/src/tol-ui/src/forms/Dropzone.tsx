/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { Uploader } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import {
  Loader,
  StatusMessage,
  useStateFallback,
  TsDataSource,
  TMessageType,
  IMessage,
  IWaitingUpload,
} from "..";

export interface FileData {
  blobFile: File;
  fileKey: string;
  name: string;
  status: string;
}

export interface PDropzone {
  resource: string;
  dataSource: TsDataSource;
  fileType: string;
  generateMessages?: (apiRes: any) => IMessage[];
  setResponse?: any;
  onFileDrop?: (length: boolean) => void;
  fileListVisible?: boolean;
  fileList?: FileData[];
  setFileList?: (fileList: FileData[]) => void;
  parentToSubmit?: boolean;
  resetKey?: string | number;
  validating?: boolean;
}

export function Dropzone(props: PDropzone) {
  const {
    resource,
    dataSource,
    fileType,
    generateMessages,
    setResponse,
    onFileDrop,
    fileListVisible = false,
    parentToSubmit = false,
    resetKey,
    validating = false
  } = props;

  const [fileList, setFileList] = useStateFallback<FileData[]>(
    props.fileList,
    props.setFileList,
    []
  );
  const [validate, setValidate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
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

    dataSource
      .custom({
        method: "POST",
        resource: resource,
        body: formData,
        options: {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      })
      .then((res: any) => {
        if (setResponse) {
          setResponse(res);
        }
        setIsLoading(false);
        setHasLoaded(true);
        setMessages(generateMessages ? generateMessages(res) : []);
      })
      .catch((error: any) => {
        setIsLoading(false);
        setFail(true);
        setFileList([]);
        console.error(error);
      });
  };

  const WaitingUpload = (props: IWaitingUpload) => {
    return (
      <div className="dropzone-container">
        <FontAwesomeIcon
          className="file-upload"
          icon={faFileArrowUp}
          size="8x"
        />
        <h6>{props.message}</h6>
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
        disabled={fileList.length > 0 && validating}
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
                <WaitingUpload
                  message={
                    (fileList.length > 0 && validating)
                      ? "Please reset to upload a new file."
                      : "Click or drag file to this area to upload"
                  }
                />
              )}
            </div>
          )}
        </div>
      </Uploader>
      {hasLoaded ? (
        <div className="mt-3">
          {messages.map((message: IMessage, index: number) => {
            return (
              <StatusMessage
                key={index}
                status={message.type as TMessageType}
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

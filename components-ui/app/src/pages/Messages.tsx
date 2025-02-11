/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Message,
  Widgets,
  Button,
  SingleSelect,
  Notification,
  Toaster,
  StaticMessage,
  PopUpMessage,
} from "../tol-ui/src";
import { Slider } from "rsuite";

function Messages() {
  const [toastPosition, setToastPosition] = useState("topCenter");
  const [toastType, setToastType] = useState("success");
  const [value, setValue] = useState(0);
  const toaster = Toaster();

  const toastPositions = [
    "topCenter",
    "topStart",
    "topEnd",
    "bottomCenter",
    "bottomStart",
    "bottomEnd",
  ];

  const type = ["info", "success", "warning", "error"];

  const staticMessages = (
    <div>
      <h4>We have now introduced simpler-to-implement static messages:</h4>
      <p>
        These messages contain only 2 simple necessary props: '<b>type</b>' and
        '<b>message</b>'. The other two props '<b>header</b>' and '
        <b>onClick</b>' are optional.
      </p>
      <p>
        If you want these messages to 'pop up' and be a toast, use the '
        <b>PopUpMessage</b>' function instead and pass the props to that.{" "}
      </p>
      <p style={{ marginBottom: "20px" }}>
        You can still use '<b>Message</b>' and '<b>Notification</b>' for more complex alerts and pop-ups, 
        but they need to be used with '<b>Toaster</b>'.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <StaticMessage message={"This is a success alert"} type={"success"} />
        <StaticMessage message={"This is an error alert"} type={"error"} />
        <StaticMessage message={"This is an info alert"} type={"info"} />
        <StaticMessage message={"This is a warning alert"} type={"warning"} />
      </div>
      <Button
        text={"Click me to see a pop up message"}
        onClick={() => {
          PopUpMessage({
            type: "success",
            message: "Data successfully saved to the quantum power grid.",
          });
        }}
      />
    </div>
  );

  const generalMessages = (
    <div>
      <h4 style={{ marginBottom: "20px" }}>
        General messages with different props:
      </h4>
      <Message
        children="This is a default info message"
        type="info"
        showIcon={true}
      />
      <br />
      <Message
        children="This is a success message with close button"
        type="success"
        showIcon={true}
        closable
      />
      <br />
      <Message
        children="This is a warning message with custom header"
        type="warning"
        showIcon={true}
        header="Warning!"
      />
      <br />
      <Message
        children="This is an error message with onClose function"
        type="error"
        showIcon={true}
        closable
        onClose={() => alert("Error message closed")}
      />
    </div>
  );

  const elaborateGeneralMessages = (
    <div>
      <h4 style={{ marginBottom: "20px" }}>
        General messages with more elaborate props:
      </h4>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Message
          children="This is an error message with custom style"
          type="error"
          showIcon={false}
          header={<h5>Error!</h5>}
          closable
          styles={{
            width: "50%",
            textAlign: "center",
          }}
        />
      </div>
      <br />
      <Message
        children={
          <>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
            <p>Any ReactNode can be added here...</p>
          </>
        }
        type="info"
        showIcon={true}
        header={"Message with more complicated children"}
        closable
      />
    </div>
  );

  const toastMessage = (
    <Message
      children="This is a toast message with a longer title to make sure it works..."
      type={toastType}
      showIcon={true}
      closable
      styles={{ marginTop: "5px" }}
    />
  );

  const toasts = (
    <div style={{ width: "100%" }}>
      <h4>Toasts/Alerts - Play around with them:</h4>
      <p>
        Can be customised the same way a message can be and are pushed via the
        Toaster hook...
      </p>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <SingleSelect
          data={toastPositions}
          value={toastPosition}
          placeholder="Select a position for the toast..."
          setValue={setToastPosition}
        />
        <SingleSelect
          data={type}
          value={toastType}
          placeholder="Select a type for the toast..."
          setValue={setToastType}
        />
        <Button 
          type={"success"}
          onClick={() => toaster.push(toastMessage, { placement: toastPosition, duration: 5000 })}
          text='Show Toast'
        />
      </div>
    </div>
  );

  const sendNotification = (severity: number) => {
    switch (severity) {
      case 0:
        toaster.push(
          <Notification
            type="info"
            header="Nothing to see here.."
            children={
              <div>
                <p style={{ fontSize: "8px" }}>All is well</p>
                <p style={{ fontSize: "6px" }}>Hello from Tiny Notification</p>
              </div>
            }
          />
        );
        break;
      case 1:
        toaster.push(
          <Notification
            type="success"
            header="Severity Level 1"
            children={"This is a success notification"}
          />
        );
        break;
      case 2:
        toaster.push(
          <Notification
            type="info"
            header="Severity Level 2"
            children={"This is an informational notification"}
          />
        );
        break;
      case 3:
        toaster.push(
          <Notification
            type="warning"
            header="Severity Level 3"
            children={"This is a warning notification"}
          />,
          { placement: "topStart", duration: 3000 }
        );
        break;
      case 4:
        toaster.push(
          <Notification
            type="error"
            header="Severity Level 4"
            children={
              <div>
                <h3>Scary Notification!</h3>
                <p
                  style={{
                    fontSize: "10px",
                    marginBottom: "-10px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  Boo!
                </p>
                <span
                  style={{
                    fontSize: "50px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  👻
                </span>
              </div>
            }
          />,
          { placement: "topEnd" }
        );
        break;
      default:
        return;
    }
  };

  const notifications = (
    <div>
      <h4>Notifications:</h4>
      <p style={{ marginBottom: "20px" }}>
        Can be customised similarly to messages and use the Toaster hook:
      </p>
      <p style={{ marginBottom: "10px" }}>Severity Level: {value}</p>
      <Slider
        min={0}
        max={4}
        onChange={setValue}
        value={value}
      />
      <div style={{ margin: "auto", width: "30%", display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <Button type={"success"}
        onClick={() => sendNotification(value)} text='Send Notification'/>
      </div>
    </div>
  );

  const components = [
    {
      component: staticMessages,
      type: "full",
    },
    {
      component: generalMessages,
      type: "full",
    },
    {
      component: elaborateGeneralMessages,
      type: "full",
    },
    {
      component: toasts,
      type: "full",
    },
    {
      component: notifications,
      type: "full",
    },
  ];

  return (
    <div>
      <Widgets components={components} />
    </div>
  );
}

export default Messages;

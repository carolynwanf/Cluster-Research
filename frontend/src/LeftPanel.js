import "./App.css";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import axios from "axios";

const localDevURL = "http://127.0.0.1:5000/";

export const LeftPanel = () => {
  const [getMessage, setGetMessage] = useState("No message yet");
  function connectToBackend() {
    axios
      .get(localDevURL + "test")
      .then((response) => {
        console.log("SUCCESS", response);
        setGetMessage(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <div className="left panel">
      <p className="title">Data</p>
      <p>{getMessage}</p>
      <Button onClick={connectToBackend()}>Push me</Button>
    </div>
  );
};

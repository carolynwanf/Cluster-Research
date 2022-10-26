import "../App.css";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Form from "react-bootstrap/Form";
import { drawGraph, clearSVG } from "../graph.js";

const localDevURL = "http://127.0.0.1:5000/";

// Data upload + control panel
export const LeftPanel = ({ width, height }) => {
  const [file, setFile] = useState();

  // File reader
  const fileReader = new FileReader();

  // Set file on file upload
  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file submission
  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        axios
          .post(localDevURL + "upload-data", {
            data: csvOutput,
          })
          .then((response) => {
            console.log("SUCCESS", response.data.data);
            let dataToPlot = response.data.data;
            clearSVG();
            drawGraph(width, height, dataToPlot);
          })
          .catch((error) => {
            console.log(error);
          });
      };

      fileReader.readAsText(file);
    }
  };

  return (
    <div className="left panel">
      <p className="title">Data</p>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload your own data</Form.Label>
        <Form.Control type="file" accept=".csv" onChange={handleOnChange} />
      </Form.Group>
      <Button
        id="dataUploadButton"
        variant="secondary"
        onClick={(e) => {
          handleOnSubmit(e);
        }}
      >
        import csv
      </Button>
    </div>
  );
};

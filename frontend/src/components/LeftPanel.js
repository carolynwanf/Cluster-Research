import "../App.css";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { drawGraph, clearSVG, changeOpacity } from "../graph.js";
import Slider from "@mui/material/Slider";

const localDevURL = "http://127.0.0.1:5000/";

// Data upload + control panel
export const LeftPanel = ({ width, height }) => {
  const [file, setFile] = useState();
  const [opacity, setOpacity] = useState(50);
  const [reductionMethod, setReductionMethod] = useState("TSNE");
  const [perplexity, setPerplexity] = useState(50);

  // File reader
  const fileReader = new FileReader();

  // Set file on file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file submission
  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        console.log("reductionMethod", reductionMethod);

        let req = { data: csvOutput, reductionMethod: reductionMethod };

        // Constructing request based on reduction Method
        if (reductionMethod === "TSNE") {
          req.perplexity = perplexity;
        }
        axios
          .post(localDevURL + "upload-data", req)
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

  // SLIDERS

  // Handle opacity changes
  const handleOpacityChange = (event, newOpacity) => {
    if (newOpacity !== opacity) {
      setOpacity(newOpacity);
    }
  };

  useEffect(() => {
    console.log("changing opacity", opacity / 100);
    changeOpacity(opacity / 100);
  }, [opacity]);

  // Handle perplexity changes
  const handlePerplexityChange = (event, newPerplexity) => {
    if (newPerplexity !== perplexity) {
      setPerplexity(newPerplexity);
    }
  };

  // Draw graph ONCE when the component mounts
  useEffect(() => {
    console.log("running effect");
    axios
      .get(localDevURL + "get-default-data")
      .then((response) => {
        console.log("SUCCESS", response.data.data);
        let dataToPlot = response.data.data;

        drawGraph(width, height, dataToPlot);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="left panel">
      <p className="title">Data</p>
      {/* File selection */}
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload your own data</Form.Label>
        <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
      </Form.Group>
      {/* Dimensionality reduction method selection */}
      <Tabs
        activeKey={reductionMethod}
        onSelect={(k) => setReductionMethod(k)}
        id="dimentionalityTabs"
        className="mb-3"
      >
        <Tab eventKey="TSNE" title="T-SNE">
          <div class="sliderBlock">
            <p>Perlexity</p>
            <Slider
              aria-label="perplexity"
              value={perplexity}
              onChange={handlePerplexityChange}
              min={0}
              max={100}
            />
            <p class="paramValue">{perplexity}</p>
          </div>
        </Tab>
        <Tab eventKey="UMAP" title="UMAP"></Tab>
      </Tabs>
      <Button
        id="dataUploadButton"
        variant="secondary"
        onClick={(e) => {
          handleOnSubmit(e);
        }}
      >
        import csv
      </Button>
      <hr />
      <p className="title"> Display settings</p>
      <div class="sliderBlock">
        <p>Opacity</p>
        <Slider
          aria-label="opacity"
          value={opacity}
          onChange={handleOpacityChange}
          step={10}
          marks
          min={0}
          max={100}
        />
        <p class="paramValue">{opacity}</p>
      </div>
    </div>
  );
};

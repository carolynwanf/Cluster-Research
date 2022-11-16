import "../App.css";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { drawGraph, clearSVG, changeOpacity } from "../helperFunctions.js";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";

const localDevURL = "http://127.0.0.1:5000/";

const LoadDataCircle = ({ loadingData }) => {
  if (!loadingData) {
    return <div></div>;
  } else {
    return <CircularProgress />;
  }
};

// Data upload + control panel
export const LeftPanel = ({ width, height }) => {
  const [file, setFile] = useState();
  const [opacity, setOpacity] = useState(50);
  const [reductionMethod, setReductionMethod] = useState("TSNE");
  const [perplexity, setPerplexity] = useState(50);
  const [loadingData, setLoadingData] = useState(false); // reset on error
  const [csvOutput, setCsvOutput] = useState(""); // reset
  const [csvColumns, setCsvColumns] = useState([
    <option key="none" value="none">
      no file uploaded
    </option>,
  ]); //reset
  const [selectedCol, setSelectedCol] = useState("none"); // reset

  // File reader
  const fileReader = new FileReader();

  // Set file on file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);

    // Uses first row from CSV to create dropdown of column names
    let rows;
    fileReader.onload = function (event) {
      setCsvOutput(event.target.result);

      rows = event.target.result.split("\n");

      let colNames = rows[0].split(",");

      let colItems = [
        <option key="select-a-column" value="select-a-column">
          select a column to color dots by
        </option>,
        <option key="none" value="none">
          none
        </option>,
      ];

      for (let colName of colNames) {
        colItems.push(
          <option key={colName} value={colName}>
            {colName}
          </option>
        );
      }
      setCsvColumns(colItems);
      setSelectedCol("none");
    };

    fileReader.readAsText(e.target.files[0]);
  };

  const handleColChange = (e) => {
    setSelectedCol(e.target.value);
  };

  // Handle file projection
  const handleFileProject = (e) => {
    e.preventDefault();

    // Submits post request if there is not a request already being processed
    if (file && !loadingData) {
      setLoadingData(true);

      let req = {
        data: csvOutput,
        reductionMethod: reductionMethod,
        selectedCol: selectedCol,
      };

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
          setLoadingData(false);
        })
        .catch((error) => {
          console.log(error);
          setLoadingData(false);
        });
    } else if (!file) {
      alert("No file uploaded");
    }
  };

  // Handle cached projection
  const handleCachedProject = (e) => {
    // TODO: handle!!
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
  }, [height, width]);

  return (
    <div className="left panel">
      <p className="title">Upload Data</p>
      {/* File selection */}
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
        <Form.Select aria-label="column-selection" onChange={handleColChange}>
          {csvColumns}
        </Form.Select>
      </Form.Group>

      {/* TODO: add column selector*/}
      {/* Dimensionality reduction method selection */}
      <Tabs
        activeKey={reductionMethod}
        onSelect={(k) => setReductionMethod(k)}
        id="dimentionalityTabs"
        className="mb-3"
      >
        <Tab eventKey="TSNE" title="T-SNE">
          <div className="sliderBlock">
            <p>Perlexity</p>
            <Slider
              aria-label="perplexity"
              value={perplexity}
              onChange={handlePerplexityChange}
              min={0}
              max={100}
            />
            <p className="paramValue">{perplexity}</p>
          </div>
        </Tab>
        <Tab eventKey="UMAP" title="UMAP"></Tab>
      </Tabs>
      <div className="submitButton">
        <Button
          id="dataUploadButton"
          variant="secondary"
          onClick={(e) => {
            handleFileProject(e);
          }}
        >
          project
        </Button>
        <LoadDataCircle loadingData={loadingData} />
      </div>

      <hr />
      {/* Use previously cached projection */}
      <p className="title">See a Previous Projection</p>
      <Form.Group controlId="formFile" className="mb-3">
        {/* TODO: add dropdown linked to local storage */}
      </Form.Group>
      <Button
        id="cachedDataButton"
        variant="secondary"
        onClick={(e) => {
          handleCachedProject(e);
        }}
      >
        project
      </Button>
      <hr />

      <p className="title"> Display settings</p>
      <div className="sliderBlock">
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
        <p className="paramValue">{opacity}</p>
      </div>
    </div>
  );
};

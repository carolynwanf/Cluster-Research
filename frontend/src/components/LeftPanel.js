import "../App.css";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Form from "react-bootstrap/Form";
import axios from "axios";
import {
  drawGraph,
  clearSVG,
  changeOpacity,
  changeDotSize,
} from "../helperFunctions.js";
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
  const [rawFile, setRawFile] = useState(); // File that hasn't been projected yet
  const [plottedData, setPlottedData] = useState([]); // Holds data that's currently plotted
  const [projectedFileData, setProjectedFileData] = useState([]); // Holds previously projected data that's being uploaded
  const [opacity, setOpacity] = useState(50);
  const [dotSize, setDotSize] = useState(2);
  const [reductionMethod, setReductionMethod] = useState("TSNE");
  const [perplexity, setPerplexity] = useState(50);
  const [loadingData, setLoadingData] = useState(false);
  const [csvOutput, setCsvOutput] = useState("");
  const [csvColumns, setCsvColumns] = useState([
    <option key="none" value="none">
      no file uploaded
    </option>,
  ]); //reset
  const [selectedCol, setSelectedCol] = useState("none");

  // File reader
  const fileReader = new FileReader();

  // Set projected file on projected file upload
  const handleProjectedFileChange = (e) => {
    fileReader.onload = function (event) {
      setProjectedFileData(JSON.parse(event.target.result));
    };

    fileReader.readAsText(e.target.files[0]);
  };

  // For plotting previously projected data
  const handleFilePlot = (e) => {
    // Clears svg and plots new data if there is new data
    if (projectedFileData.length > 0) {
      clearSVG();
      setPlottedData(projectedFileData);
      drawGraph(width, height, projectedFileData);
      setProjectedFileData([]);
    }
  };

  // Set raw file on raw file upload
  const handleRawFileChange = (e) => {
    setRawFile(e.target.files[0]);

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
    if (rawFile && !loadingData) {
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
          setPlottedData(dataToPlot);
          drawGraph(width, height, dataToPlot);
          setLoadingData(false);
        })
        .catch((error) => {
          console.log(error);
          setLoadingData(false);
        });
    } else if (!rawFile) {
      alert("No file uploaded");
    }
  };

  // Handles save of currently projected data
  const handleProjectionSave = (e) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(plottedData)
    )}`;
    console.log(plottedData);
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";
    link.click();
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

  // Handle dot size changes
  const handleDotSizeChange = (event, newSize) => {
    if (newSize !== dotSize) {
      setDotSize(newSize);
    }
  };

  useEffect(() => {
    console.log("changing dot size", dotSize);
    changeDotSize(dotSize);
  }, [dotSize]);

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
        setPlottedData(dataToPlot);
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
        <Form.Control
          type="file"
          accept=".csv"
          onChange={handleRawFileChange}
        />
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
      <Form.Group controlId="previousProjectionFile" className="mb-3">
        <Form.Control
          type="file"
          accept=".json"
          onChange={handleProjectedFileChange}
        />
      </Form.Group>
      <Button
        id="cachedDataButton"
        variant="secondary"
        onClick={(e) => {
          handleFilePlot(e);
        }}
      >
        plot
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
      <div className="sliderBlock">
        <p className="sliderLabel">Dot Size</p>
        <Slider
          aria-label="dot-size"
          value={dotSize}
          onChange={handleDotSizeChange}
          step={0.5}
          marks
          min={0}
          max={5}
        />
        <p className="paramValue">{dotSize}</p>
      </div>
      <Button
        id="saveProjectionButton"
        variant="secondary"
        onClick={(e) => {
          handleProjectionSave(e);
        }}
      >
        save projection
      </Button>
    </div>
  );
};

import "../App.css";
import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { contours } from "d3";
import { highlightToken } from "../graph.js";

// Analysis panel for displaying info
export const RightPanel = ({ points }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const generateTokens = () => {
    let newSelectedItems = [];
    let randomIndices = new Set();

    // Adds random indices
    if (countsArray.length > 5) {
      while (randomIndices.size < 5) {
        randomIndices.add(Math.floor(Math.random() * countsArray.length));
      }
    } else {
      for (let i = 0; i < countsArray.length; i++) randomIndices.add(i);
    }
    console.log(randomIndices);
    randomIndices.forEach((i) => {
      newSelectedItems.push(
        <tr key={countsArray[i][1].id} onClick={(e) => highlightToken(e)}>
          <td>{newSelectedItems.length + 1}</td>
          <td id={countsArray[i][1].id} className="token">
            {countsArray[i][0]}
          </td>
        </tr>
      );
    });

    setSelectedItems(newSelectedItems);
  };
  let countsArray = [];
  if (points.length > 0 && selectedItems.length === 0) {
    let counts = {};

    for (let point of points) {
      if (point.label in counts) {
        counts[point.label].count++;
        counts[point.label].id = counts[point.label].id + " " + point.id;
      } else {
        counts[point.label] = { count: 1, id: point.id };
      }
    }

    countsArray = Object.entries(counts);

    generateTokens();
  } // Update selected items if selection is cleared
  else if (points.length === 0 && selectedItems.length > 0) {
    setSelectedItems([]);
  }

  // Generates new tokens on refresh
  const handleRefreshTokens = (e) => {
    generateTokens();
  };

  return (
    <div className="right panel">
      <p className="title">Analysis</p>
      <Table bordered>
        <thead>
          <tr>
            <th>#</th>
            <th>5 representative sentences</th>
          </tr>
        </thead>
        <tbody>{selectedItems}</tbody>
      </Table>
      {/* TODO: add button to refresh representative tokens*/}
      <Button
        id="refreshTokensButton"
        variant="secondary"
        onClick={(e) => {
          handleRefreshTokens(e);
        }}
      >
        new sentences
      </Button>
    </div>
  );
};

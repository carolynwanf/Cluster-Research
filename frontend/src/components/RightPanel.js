import "../App.css";
import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { contours, count } from "d3";
import { highlightToken } from "../graph.js";

// Analysis panel for displaying info
export const RightPanel = ({ points }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [countsArray, setCountsArray] = useState([]);

  const generateTokens = (currCountsArray) => {
    let newSelectedItems = [];
    let randomIndices = new Set();

    // Adds random indices
    if (currCountsArray.length > 5) {
      while (randomIndices.size < 5) {
        randomIndices.add(Math.floor(Math.random() * currCountsArray.length));
      }
    } else {
      for (let i = 0; i < currCountsArray.length; i++) randomIndices.add(i);
    }

    randomIndices.forEach((i) => {
      newSelectedItems.push(
        <tr key={currCountsArray[i][1].id} onClick={(e) => highlightToken(e)}>
          <td>{newSelectedItems.length + 1}</td>
          <td id={currCountsArray[i][1].id} className="token">
            {currCountsArray[i][0]}
          </td>
        </tr>
      );
    });

    setSelectedItems(newSelectedItems);
  };

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

    let newCountsArray = Object.entries(counts);

    setCountsArray(newCountsArray);

    generateTokens(newCountsArray);
  } // Update selected items if selection is cleared
  else if (points.length === 0 && selectedItems.length > 0) {
    setSelectedItems([]);
  }

  // Generates new tokens on refresh
  const handleRefreshTokens = (e) => {
    generateTokens(countsArray);
  };

  return (
    <div className="right panel">
      <p className="title">Representative tokens</p>
      <p>{countsArray.length} total unique tokens</p>
      <Table bordered>
        <thead>
          <tr>
            <th>#</th>
            <th>token</th>
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

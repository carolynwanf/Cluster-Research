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

  // Generates max of 5 new representative labels
  const generateLabels = (currCountsArray) => {
    let newSelectedItems = [];
    let randomIndices = new Set();

    // Generates up to 5 random indices
    if (currCountsArray.length > 5) {
      while (randomIndices.size < 5) {
        randomIndices.add(Math.floor(Math.random() * currCountsArray.length));
      }
    } else {
      for (let i = 0; i < currCountsArray.length; i++) randomIndices.add(i);
    }

    // Adds corresponding items to selected items
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

  // Generates table items if there are selected points
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

    generateLabels(newCountsArray);
  } // Update selected items if selection is cleared
  else if (points.length === 0 && selectedItems.length > 0) {
    setSelectedItems([]);
  }

  // Generates new labels on refresh
  const handleRefreshLabels = (e) => {
    generateLabels(countsArray);
  };

  return (
    <div className="right panel">
      <p className="title">Representative labels</p>
      <Table bordered>
        <thead>
          <tr>
            <th>#</th>
            <th>label</th>
          </tr>
        </thead>
        <tbody>{selectedItems}</tbody>
      </Table>
      <p>({countsArray.length} total unique labels)</p>
      <Button
        id="refreshLabelsButton"
        variant="secondary"
        onClick={(e) => {
          handleRefreshLabels(e);
        }}
        disabled={selectedItems.length < 5 ? true : false}
      >
        new sentences
      </Button>
    </div>
  );
};

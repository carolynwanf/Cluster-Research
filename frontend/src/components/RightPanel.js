import "../App.css";
import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { highlightLabel, getCentroid } from "../helperFunctions.js";

// Analysis panel for displaying info
export const RightPanel = ({ plotPoints, pathPoints }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  // Generates table items if there are selected points
  if (plotPoints.length > 0 && selectedItems.length === 0) {
    let counts = {};

    let centroid = getCentroid(pathPoints);

    for (let point of plotPoints) {
      if (point.label in counts) {
        counts[point.label].count++;
        counts[point.label].id = counts[point.label].id + " " + point.id;
      } else {
        counts[point.label] = { count: 1, id: point.id };
      }

      counts[point.label].distFromCentroid = Math.sqrt(
        (point.cx - centroid.x) ** 2 + (point.cy - centroid.y) ** 2
      );

      console.log(counts[point.label].distFromCentroid);
    }

    let countsArray = Object.entries(counts);
    countsArray.sort(function (a, b) {
      return a[1].distFromCentroid - b[1].distFromCentroid;
    });

    let newSelectedItems = [];
    for (let [label, countInfo] of countsArray) {
      newSelectedItems.push(
        <tr key={countInfo.id} onClick={(e) => highlightLabel(e)}>
          <td>{newSelectedItems.length + 1}</td>
          <td id={countInfo.id} className="label">
            {label}
          </td>
        </tr>
      );
    }

    setSelectedItems(newSelectedItems);
  } // Update selected items if selection is cleared
  else if (plotPoints.length === 0 && selectedItems.length > 0) {
    setSelectedItems([]);
  }

  return (
    <div className="right panel">
      <p className="title">
        {selectedItems.length > 0 ? selectedItems.length + " total unique" : 0}{" "}
        items
      </p>
      <div className="tableDiv">
        <Table bordered>
          <thead>
            <tr>
              <th>#</th>
              <th>item</th>
            </tr>
          </thead>
          <tbody>{selectedItems}</tbody>
        </Table>
      </div>
      <div className="footerSpacing"></div>
    </div>
  );
};

import "../App.css";
import { useState } from "react";
import Table from "react-bootstrap/Table";

// Analysis panel for displaying info
export const RightPanel = ({ points }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Update selected items if new items have been selected
  if (points.length > 0 && selectedItems.length === 0) {
    let newSelectedItems = [];
    let counts = {};

    for (let point of points) {
      if (point.label in counts) {
        counts[point.label]++;
      } else {
        counts[point.label] = 1;
      }
    }

    for (let [label, count] of Object.entries(counts)) {
      newSelectedItems.push(
        <tr key={label}>
          <td>{label}</td>
          <td>{count}</td>
        </tr>
      );
    }

    setSelectedItems(newSelectedItems);

    // Update selected items if selection is cleared
  } else if (points.length === 0 && selectedItems.length > 0) {
    setSelectedItems([]);
  }

  return (
    <div className="right panel">
      <p className="title">Analysis</p>
      <Table bordered>
        <thead>
          <tr>
            <th>label</th>
            <th>frequency</th>
          </tr>
        </thead>
        <tbody>{selectedItems}</tbody>
      </Table>
    </div>
  );
};

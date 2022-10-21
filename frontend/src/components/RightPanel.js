import "../App.css";
import { useState } from "react";

// Analysis panel for displaying info
export const RightPanel = ({ points }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Update selected items if new items have been selected
  if (points.length > 0 && selectedItems.length === 0) {
    let newSelectedItems = [];
    let seenAlready = new Set();

    for (let point of points) {
      if (seenAlready.has(point.state)) {
        continue;
      } else {
        newSelectedItems.push(<li key={point.state}>{point.state}</li>);
        seenAlready.add(point.state);
      }
    }

    setSelectedItems(newSelectedItems);

    // Update selected items if selection is cleared
  } else if (points.length === 0 && selectedItems.length > 0) {
    setSelectedItems([]);
  }

  return (
    <div className="right panel">
      <p className="title">Analysis</p>
      <ul>{selectedItems}</ul>
      <button></button>
    </div>
  );
};

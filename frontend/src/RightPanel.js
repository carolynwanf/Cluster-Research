import "./App.css";
import { useState, useEffect } from "react";

let selectedItems;
export const RightPanel = ({ points }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Pick out selected items from points
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
  } else if (points.length === 0 && selectedItems.length > 0) {
    setSelectedItems([]);
  }

  //   useEffect(() => {
  //     if (points.length > 0) {
  //       selectedItems = [];

  //       for (let point of points) {
  //         selectedItems.push(<li key={point.id}>{point.id}</li>);
  //       }
  //       console.log(selectedItems);
  //     } else if (points.length === 0) {
  //       selectedItems = [];
  //     }
  //   }, [selectedItems]);
  return (
    <div className="right panel">
      <p className="title">Analysis</p>
      <ul>{selectedItems}</ul>
      <button></button>
    </div>
  );
};

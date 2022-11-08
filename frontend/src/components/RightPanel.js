import "../App.css";
import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

// Analysis panel for displaying info
export const RightPanel = ({ points }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Update selected items if new items have been selected
  // TODO: change to select 5 random sentences
  // Account for case where there are less than 5
  const generateTokens = () => {
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

      // Sort items in decreasing order by frequency
      newSelectedItems.sort(function (a, b) {
        return (
          b.props.children[1].props.children -
          a.props.children[1].props.children
        );
      });

      setSelectedItems(newSelectedItems);

      // Update selected items if selection is cleared
    } else if (points.length === 0 && selectedItems.length > 0) {
      setSelectedItems([]);
    }
  };

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
            <th>label</th>
            <th>frequency</th>
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
        refresh
      </Button>
    </div>
  );
};

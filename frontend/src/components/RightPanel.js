import "../App.css";
import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { highlightLabel, getCentroid } from "../helperFunctions.js";
import { InfoTooltip } from "./InfoTooltip.js";

// Analysis panel for displaying info
export const RightPanel = ({ plotPoints, pathPoints, topWords }) => {
  // console.log(topWords, plotPoints);
  const [selectedItems, setSelectedItems] = useState([]);
  const associatedWordsExplanation =
    "We run a linear classifier on points in the circled area versus points not in the circled area. We return the top 30 words that are positively and negatively associated with being in the circled area";

  // Generates table items if there are selected points
  useEffect(() => {
    if (plotPoints.length > 0) {
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
      }

      let countsArray = Object.entries(counts);
      countsArray.sort(function (a, b) {
        return a[1].distFromCentroid - b[1].distFromCentroid;
      });

      let newSelectedItems = [];
      for (let [label, countInfo] of countsArray) {
        // Highlights top words in the label if topwords is populated
        if (topWords.positiveWord !== null) {
          let splitLabel = label.split(" ");
          for (let i = splitLabel.length - 1; i > -1; i--) {
            let lowercaseCopy = splitLabel[i]
              .toLowerCase()
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

            if (lowercaseCopy === topWords.positiveWords[0]) {
              splitLabel[i] = (
                <mark className="positive-mark-1">{splitLabel[i]}</mark>
              );
            } else if (lowercaseCopy === topWords.positiveWords[1]) {
              splitLabel[i] = (
                <mark className="positive-mark-2">{splitLabel[i]}</mark>
              );
            } else if (lowercaseCopy === topWords.positiveWords[2]) {
              splitLabel[i] = (
                <mark className="positive-mark-3">{splitLabel[i]}</mark>
              );
            } else if (lowercaseCopy === topWords.negativeWord) {
              splitLabel[i] = (
                <mark className="negative-mark">{splitLabel[i]}</mark>
              );
            } else {
              splitLabel[i] = splitLabel[i];
            }

            // Adds space
            if (i === splitLabel.length - 1) {
              continue;
            } else {
              splitLabel.splice(i + 1, 0, " ");
            }
          }
          label = splitLabel;
          // console.log("newLabel", lab el);
        }
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
  }, [plotPoints, topWords]);

  return (
    <div className="right panel">
      <div className="title">
        <p>Associated words</p>
        <InfoTooltip text={associatedWordsExplanation} />
      </div>
      <div id="cloud-div">
        <div id="positive-cloud-div">
          <p>Inside</p>
        </div>
        <div id="negative-cloud-div">
          <p>Outside</p>
        </div>
      </div>
      <div id="unique-items-div">
        <p className="title">
          {selectedItems.length > 0
            ? selectedItems.length + " total unique"
            : 0}{" "}
          items
        </p>
      </div>
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

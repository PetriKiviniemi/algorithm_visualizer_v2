import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const GRID_ROWS = 18;
export const GRID_COLS = 50;

export const GridNodeModes = {
  WALL: "grid-column-wall",
  NEUTRAL: "grid-column-neutral",
  START: "grid-column-start",
  END: "grid-column-end",
  WEIGHTED: "grid-column-weighted",
  PATH: "grid-column-path",
  PATH_START: "grid-column-path-start",
  PATH_END: "grid-column-path-end",
};

// For making integer to an rgb value
const normalize = (value, min, max) => (value - min) / (max - min);

const interpolateColor = (weight, minWeight, maxWeight) => {
  const startColor = [48, 213, 199]; // [48, 213, 199]
  const endColor = [95, 0, 184]; // [95, 0, 184]
  const normalizedWeight = normalize(weight, minWeight, maxWeight);

  const r = Math.round(
    startColor[0] + normalizedWeight * (endColor[0] - startColor[0])
  );
  const g = Math.round(
    startColor[1] + normalizedWeight * (endColor[1] - startColor[1])
  );
  const b = Math.round(
    startColor[2] + normalizedWeight * (endColor[2] - startColor[2])
  );

  return `rgb(${r}, ${g}, ${b})`;
};

export const sleep = (ms) => {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (timestamp) => {
      if (timestamp - start >= ms) {
        resolve();
      } else {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  });
};

export const GridNode = ({
  nodeObj,
  onDragStart,
  onMouseEnter,
  onDragEnd,
  onClick,
}) => {
  const [className, setClassName] = useState("grid-column");

  // Dynamic styling in addition to CSS from file
  const [innerStyle, setInnerStyle] = useState({});

  const handleDragStart = (e) => {
    e.preventDefault();
    onDragStart(e, nodeObj);
  };

  const handleMouseEnter = (e) => {
    onMouseEnter(e, nodeObj);
  };

  const handleDragEnd = (e) => {
    onDragEnd(e, nodeObj);
  };

  const handleClick = (e) => {
    onClick(e, nodeObj);
  };

  useEffect(() => {
    setInnerStyle({});
    setClassName(nodeObj.mode)
  }, [nodeObj.mode]);

  useEffect(() => {
    if (className == "grid-column-weighted") {
      setInnerStyle((prevStyle) => ({
        ...prevStyle,
        backgroundColor: interpolateColor(
          nodeObj.weight,
          0,
          GRID_ROWS - 1 + (GRID_COLS - 1)
        ),
      }));
    }
  }, [className]);

  return (
    <div
      className={className}
      style={{
        width: `${100 / (GRID_COLS + 8)}vw`,
        height: `${100 / (GRID_ROWS + 8)}vh`,
      }}
      draggable
      onDragStart={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {className == "grid-column-start" ? (
        <div className="bi bi-caret-right" style={{ fontSize: "1.7vw" }} />
      ) : null}
      {className == "grid-column-end" ? (
        <div className="bi bi-bullseye" style={{ fontSize: "1.5vw" }} />
      ) : null}
      {className == "grid-column-weighted" ? (
        <div className="grid-column-weighted-inner" style={innerStyle} />
      ) : null}
      {className == "grid-column-path" ? (
        <div className="grid-column-path-inner" style={innerStyle} />
      ) : null}
      {
        className == "grid-column-path-start" ? (
          <div className="grid-column-path-inner" style={innerStyle}>
            <div className="bi bi-caret-right" style={{ fontSize: "1.7vw" }} />
          </div>
        ) : null
      }
      {
        className == "grid-column-path-end" ? (
          <div className="grid-column-path-inner" style={innerStyle}>
            <div className="bi bi-bullseye" style={{ fontSize: "1.5vw" }} />
          </div>
        ) : null
      }
    </div>
  );
};

export const DropdownMenu = ({ title, items, selectItemCallback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const selectItem = (item) => {
    selectItemCallback(item.target.textContent);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div className="dropdown-button" onClick={handleOpen}>
        {title}
        <div
          className="bi bi-chevron-down"
          style={{ marginLeft: "5px", fontSize: "1rem" }}
        />
      </div>
      <div style={{ marginTop: "50px" }}>
        {!isOpen ? (
          <div></div>
        ) : (
          <div className="dropdown-content">
            {items.map((item) => {
              return (
                <div className="dropdown-item" onClick={selectItem}>
                  {item}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const CustomButton = ({ title, callback }) => {
  return (
    <div className="custom-button" onClick={callback}>
      {title}
    </div>
  );
};

export const CustomTextButton = ({ title, callback }) => {
  return (
    <div className="custom-text-button" onClick={callback}>
      {title}
    </div>
  );
};

export const CustomSlider = ({ title, range, callback }) => {
  const [value, setValue] = useState(Math.floor((range[0] + range[1]) / 2));

  useEffect(() => {
    callback(value);
  }, []);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (callback) {
      callback(newValue);
    }
  };

  return (
    <div className="slider-container">
      <div className="slider-value">{`${title}: ${value}%`}</div>
      <input
        type="range"
        min={range[0]}
        max={range[1]}
        value={value}
        onChange={handleChange}
        className="slider"
      />
    </div>
  );
};

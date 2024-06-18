import React, {useState, useEffect, useRef, useCallback} from 'react';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const GRID_ROWS = 18;
export const GRID_COLS = 50;

export const GridNodeModes = {
  WALL: 'WALL',
  NEUTRAL: 'NEUTRAL',
  START: 'START',
  END: 'END',
  WEIGHTED: 'WEIGHTED',
  PATH: 'PATH',
}

// For making integer to an rgb value
const normalize = (value, min, max) => (value - min) / (max - min);

const interpolateColor = (weight, minWeight, maxWeight) => {
    const startColor = (48, 213, 199) // [48, 213, 199]
    const endColor = (95, 0, 184);   // [95, 0, 184]
    const normalizedWeight = normalize(weight, minWeight, maxWeight);

    const r = Math.round(startColor[0] + normalizedWeight * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + normalizedWeight * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + normalizedWeight * (endColor[2] - startColor[2]));

    return `rgb(${r}, ${g}, ${b})`;
};

export const GridNode = ({nodeObj, onDragStart, onMouseEnter, onDragEnd, onClick}) => {
  const [className, setClassName] = useState("grid-column")

  const handleDragStart = (e) => {
    e.preventDefault();
    onDragStart(e, nodeObj);
  }

  const handleMouseEnter = (e) => {
    onMouseEnter(e, nodeObj);
  }

  const handleDragEnd = (e) => {
    onDragEnd(e, nodeObj);
  }

  const handleClick = (e) => {
    onClick(e, nodeObj)
  }

  // Dynamic styling in addition to CSS from file
  const style = {
    width: `${100 / (GRID_COLS + 8)}vw`,
    height: `${100 / (GRID_ROWS + 8)}vh`,
  };

  useEffect(() => {
    if(nodeObj.mode == GridNodeModes.START)
      setClassName("grid-column-start")
    else if(nodeObj.mode == GridNodeModes.END)
      setClassName("grid-column-end")
    else if(nodeObj.mode == GridNodeModes.NEUTRAL)
      setClassName("grid-column-neutral")
    else if(nodeObj.mode == GridNodeModes.WALL)
      setClassName("grid-column-wall")
    else if(nodeObj.mode == GridNodeModes.WEIGHTED)
    {
      setClassName("grid-column-weighted")
    }
  }, [nodeObj.mode])

  // TODO:: Fix
  if(className == 'grid-column-weighted')
      style.backgroundColor = interpolateColor(nodeObj.weight, 0, GRID_ROWS * GRID_COLS)

  return(
    <div 
      className={className}
      style={style}
      draggable 
      onDragStart={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {
          className == "grid-column-start" 
          ? <div className="bi bi-caret-right" style={{'fontSize': '1.7vw'}}/>
          : null
      }
      {
          className == "grid-column-end" 
          ? <div className="bi bi-bullseye" style={{'fontSize': '1.5vw'}}/>
          : null
      }
    </div>
  )
}

export const DropdownMenu = ({title, items, selectItemCallback}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null);

  const handleOpen = () => {
    console.log(isOpen)
    setIsOpen(!isOpen)
  }

  const selectItem = (item) => {
    selectItemCallback(item)
    setIsOpen(false)
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return(
    <div className="dropdown-container" ref={dropdownRef}>
      <div 
        className="dropdown-button"
        onClick={handleOpen}>
        {title}
        <div className="bi bi-chevron-down" style={{'marginLeft': '5px', 'fontSize': '1rem'}}/>
      </div>
      <div style={{'marginTop': '50px'}}>
        {!isOpen ? <div></div> :
          <div className="dropdown-content">
            {items.map((item) => {
              return <div className="dropdown-item" onClick={selectItem}>{item}</div>
              })
            }
          </div>
        }
      </div>
    </div>
  )
}

export const CustomButton = ({title, callback}) => {
  return(
    <div className="custom-button" onClick={callback}>
      {title}
    </div>
  )
}

export const CustomTextButton = ({title, callback}) => {
  return(
    <div className="custom-text-button" onClick={callback}>
      {title}
    </div>
  )
}

export const CustomSlider = ({ title, range, callback }) => {
  const [value, setValue] = useState((range[0] + range[1]) / 2);

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
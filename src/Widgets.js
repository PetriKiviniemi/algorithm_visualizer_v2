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
}

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

  useEffect(() => {
    if(nodeObj.mode == GridNodeModes.START)
      setClassName("grid-column-start")
    else if(nodeObj.mode == GridNodeModes.END)
      setClassName("grid-column-end")
    else if(nodeObj.mode == GridNodeModes.NEUTRAL)
      setClassName("grid-column-neutral")
    else if(nodeObj.mode == GridNodeModes.WALL)
      setClassName("grid-column-wall")
  }, [nodeObj.mode])

  return(
    <div 
      className={className}
      style={{"width": `${100/(GRID_COLS+8)}vw`, "height": `${100/(GRID_ROWS+8)}vh`}}
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
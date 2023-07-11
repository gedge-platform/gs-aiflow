import { useCallback, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

const startHandleStyle = { width:'12px', height:'12px' };
const endHandleStyle = { width:'12px', height:'12px' };

function PodNode({ id, data, isConnectable }) {
  const [stat, setStat] = useState("waiting")
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);
  useEffect(() => {
    setStatus(data.status)
  }, [data]);
  const setStatus = (status) => {
    if (status == 'Pending') {
      setStat("Pending")
    }
    else if (status == 'Succeeded') {
      setStat("Succeeded")
    }
    else if (status == 'Failed') {
      setStat("Failed")
    }
    else if (status == 'Running') {
      setStat("Running")
    }
    else {
      setStat("Waiting")
    }
  }

  function getStatusBorder() {
    if (stat == 'Pending') {
      return 'orange'
    }
    else if (stat == 'Succeeded') {
      return '#005200'
    }
    else if (stat == 'Failed') {
      return 'red'
    }
    else if (stat == 'Running') {
      return '#23C723';
    }
    else {
      return '#2196f3';
    }
  }

  function getBackgroundColor() {
    if (typeof data === 'undefined' || data == null) return '#FFFFFF';
    if (typeof data.task === 'undefined' || data.task == null) return '#FFFFFF';

    if (data.task == 'Train') {
      return '#F5C9B2'
    }
    else if (data.task == 'Validate') {
      return '#9AC8F5'
    }
    else if (data.task == 'Optimization') {
      return '#CBF5DC'
    }
    else if (data.task == 'Opt_Validate') {
      return '#BBBBBB';
    }
    else {
      return '#BBBBBB';
    }
  }

  return (
    <div className="pod_node_border" style={{ backgroundColor: getStatusBorder()}}>
      <div className="pod_node" style={{ border: '#000000' + ' solid 3px', backgroundColor: getBackgroundColor() }}>
        {/* <Handle type="target" position={Position.Top} isConnectable={isConnectable} /> */}
        <div>
          {/* <label htmlFor="text">{data.type}</label> */}
          <h3 htmlFor='text'>{id}</h3>
          {/* <input id="text" name="text" onChange={onChange} className="nodrag" /> */}

        </div>
        {/* <div>
        <span className='loading-btn-wrapper'>
            <button className={statPrefix + stat + statPostfix}>
                <span className="success-btn__text">
                    {stat}  
                </span>
            </button>
        </span>
        </div> */}

        {/* <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      /> */}
        <Handle
          type="target"
          position={Position.Left}
          id="d"
          style={startHandleStyle}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="c"
          style={endHandleStyle}
          isConnectable={isConnectable}
        />
        {/* <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} /> */}
      </div>
    </div>
  );
}

export default PodNode;

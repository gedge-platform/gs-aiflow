import { useCallback, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

const handleStyle = { left: 10 };

function TextUpdaterNode({ id, data, isConnectable }) {
  const statPrefix = "success-btn--"
  const statPostfix = "_layout"
  const [stat, setStat] = useState("waiting")
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);
  useEffect(()=>{
    setStatus(data.status)
  }, [data]);
  const setStatus = (status) => {
    if(status == 'pending'){
        setStat("pending")
    }
    else if(status == 'Succeeded'){
        setStat("Succeeded")
    }
    else if(status == 'failed'){
        setStat("failed")
    }
    else{
        setStat("waiting")
    }
  }
  return (
    <div className="text-updater-node">
      {/* <Handle type="target" position={Position.Top} isConnectable={isConnectable} /> */}
      <div>
        <label htmlFor="text">{data.type}</label>
        <label htmlFor='text'>{id}</label>
        {/* <input id="text" name="text" onChange={onChange} className="nodrag" /> */}

      </div>
      <div>
        <span className='loading-btn-wrapper'>
            <button className={statPrefix + stat + statPostfix}>
                <span className="success-btn__text">
                    {stat}  
                </span>
            </button>
        </span>
        </div>
        
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
        // style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="c"
        // style={handleStyle}
        isConnectable={isConnectable}
      />
      {/* <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} /> */}
    </div>
  );
}

export default TextUpdaterNode;

import {React, useState} from "react";
import Flow from "./react_flow_chart";
import { ReactFlowProvider } from "reactflow";

//ReactFlowProvider wrapper용
function DagMonitoring(props) {
    const setProjectID = props.setProjectID;
    return (
    <> 
        <ReactFlowProvider>
            <Flow setProjectID={setProjectID}></Flow>
        </ReactFlowProvider>
    </>
    
    );
}

export {
    DagMonitoring
};
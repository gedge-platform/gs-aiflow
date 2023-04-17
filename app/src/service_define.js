import React from "react";
import Flow, {ExampleBasic, Flowchart} from "./react_flow_chart";
import {QueryClient, QueryClientProvider} from 'react-query'
import {Route,Routes,Router} from 'react-router-dom';
import Switch from "switch";
import { ProjectList } from "./project_list";
const queryClient = new QueryClient();
// const customStyles = {
//   content: {
//     top: '50%',
//     left: '50%',
//     right: 'auto',
//     bottom: 'auto',
//     marginRight: '-50%',
//     transform: 'translate(-50%, -50%)',
//     backgroundColor: "white",
//     borderRadius: "10px",
//     boxShadow: "3px 3px 5px rgba(0, 0, 0, 0.5)",
//     padding: "20px",
//     border: "1px solid #525151",
//     fontSize:"14px",
//     fontWeight:"normal",
//     width:"500px",
//     width: "auto",
//     height: "83%",
//     height: "auto",
//   },
// };

function ServiceDefine() {
    return (
        <> < div id = 'service_define_main' > 
    </div>
    <QueryClientProvider client={queryClient}>
        <Routes>
            <Route path="" element={<ProjectList id='user_1'/>}></Route>
            <Route path="detail/:projectID" element={<Flow/>}></Route>
        </Routes>
      </QueryClientProvider>


    </>
    
    );
}

export {
    ServiceDefine
};
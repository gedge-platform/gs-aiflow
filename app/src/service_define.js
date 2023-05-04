import {React, useState} from "react";
import Flow, {ExampleBasic, Flowchart} from "./react_flow_chart";
import {QueryClient, QueryClientProvider} from 'react-query'
import {Route,Routes,Router} from 'react-router-dom';
import Switch from "switch";
import { ProjectList } from "./project_list";
import { ProjectDetail } from "./project_detail";
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

function ServiceDefine(props) {
    const setPage = props.setPage
    const [selectedProject, setSelectedProject] = useState("");

    return (
        <> < div id = 'service_define_main' > 
    </div>

    <QueryClientProvider client={queryClient}>
        <div className="content_box" >
        <Routes>
            <Route path="" element={<ProjectList id='user1' setPage={setPage} setSelectedProject={[selectedProject, setSelectedProject]}/>}></Route>
        </Routes>
        </div>
        <div className="content_box">
        <Routes>
            <Route path="" element={<ProjectDetail id='user1' setSelectedProject={[selectedProject, setSelectedProject]}/>}></Route>
        </Routes>
        </div>

        </QueryClientProvider>
    </>
    
    );
}

export {
    ServiceDefine
};
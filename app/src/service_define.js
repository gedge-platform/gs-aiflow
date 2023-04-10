import React from "react";
import Flow, {ExampleBasic, Flowchart} from "./react_flow_chart";
import {QueryClient, QueryClientProvider} from 'react-query'
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
        <> < div id = 'service_define_main' > <h1>지능형 서비스 정의</h1>
    </div>
    <QueryClientProvider client={queryClient}>
    <Flow/>
      </QueryClientProvider>


    </>
    
    );
}

export {
    ServiceDefine
};
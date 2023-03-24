import React from "react";
import Flow, {ExampleBasic, Flowchart} from "./react_flow_chart";
import {QueryClient, QueryClientProvider} from 'react-query'
const queryClient = new QueryClient();
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
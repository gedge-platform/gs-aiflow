import {useCallback, useState, useEffect} from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
    updateEdge,
    Connection,
    PanOnScrollMode,
} from 'reactflow';
import { useQuery} from 'react-query';

import dagre from 'dagre';
import 'reactflow/dist/style.css';
import Sidebar from './service_define_sidebar';
import NodeInfo from './service_define_node_info';
import TextUpdaterNode from './textUpdaterNode';
import './css/textUpdaterNode.scss'
import axios from 'axios';
import Modal from 'react-modal';
import "./css/dagModal.css";
import DagModal from './dag_modal';

const nodeTypes = { textUpdater: TextUpdaterNode };
const rfStyle = {
    backgroundColor: '#B8CEFF',
  };
const initialNodes = [
    {
        id: '1',
        type:'textUpdater',
        position: {
            x: 0,
            y: 0
        },
        data: {
            type:'deployment',
            label: '라벨1',
            origin:'22',
            status:'pending',
            erwerewr:'rewr',
            sdfwerwrq:"vcvcx",
            yaml:"apiVersion: apps/v1\nkind: Deployment\nmetadata:\n name: nignx-deployment"
        }
    }, {
        id: '2',
        position: {
            x: 500,
            y: 0
        },
        type:'textUpdater',
        data: {
            type:'service',
            label: '라벨2',
            status:'success',
            yaml:"werwerqweqw,l,v;dkfopwekopqewqe",
        }
    }, {
        id: '3',
        position: {
            x: 1000,
            y: 0
        },
        type:'textUpdater',
        data: {
            type:'job',
            label: '라벨3',
            status:'failed',
            yaml:"werwerqweqw,l,v;dkfopwekopqewqeaskq x;pxlxl,x,xdkl;papq0",
        }
    }, {
        id: '4',
        position: {
            x: 1500,
            y: 0
        },
        type:'textUpdater',
        data: {
            type:'gom',
            label: '라벨4',
            status:'waiting',
            yaml:"eeewqkopw,oozxca",
        }
    }, {
        id: '5',
        position: {
            x: 2000,
            y: 0
        },
        type:'textUpdater',
        data: {
            type:'sadasd',
            label: '라벨5',
            status:'success',
            yaml:"102185089065",
        }
    }
];

const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2'
    },
    {
        id: 'e1-3',
        source: '2',
        target: '3'
    },
    {
        id: 'e1-4',
        source: '3',
        target: '4'
    },
    {
        id: 'e1-5',
        source: '4',
        target: '5'
    }
];

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [value, setValue] = useState(false);
    const [selectedNodeData, setSelectedNodeData] = useState(null);
    const [toggleFlag, setToggleFlag] = useState(false);
    const id = 'e';
    const {isLoading, error, data, isFetching} = useQuery(
        [],()=>{
            return axios.get(process.env.REACT_APP_API+'/api/getDAG/' + id)
            .then((res) => {
                setNodes((node) => {
                    return res['data']['nodes'];
                });
                setEdges((edge) => {
                    return res['data']['edges'];
                });
                return res['data']
            })
        },{
            refetchInterval:5000
        }
    );
    
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );
    

    //정렬
    useEffect(()=>{
        var g = new dagre.graphlib.Graph();
        //nodesep 위아래
        //ranksep 옆
        g.setGraph({rankdir:'LR', align:'UL', marginx:0,marginy:0,ranksep:100});
        g.setDefaultEdgeLabel(function() { return {}; });
        g.setNode("kspacey",    { label: "Kevin Spacey",  width: 144, height: 100 });
        g.setNode("swilliams",  { label: "Saul Williams", width: 160, height: 100 });
        g.setNode("bpitt",      { label: "Brad Pitt",     width: 108, height: 100 });
        g.setNode("hford",      { label: "Harrison Ford", width: 168, height: 100 });
        g.setNode("lwilson",    { label: "Luke Wilson",   width: 144, height: 100 });
        g.setNode("kbacon",     { label: "Kevin Bacon",   width: 121, height: 100 });
        
        // Add edges to the graph.
        g.setEdge("kspacey",   "swilliams");
        g.setEdge("swilliams", "kbacon");
        g.setEdge("bpitt",     "kbacon");
        g.setEdge("hford",     "lwilson");
        g.setEdge("lwilson",   "kbacon");
        dagre.layout(g);
        console.log(g);
    },[]);
    
    useEffect(() => {
        if (value == true) {
            setValue(false);
            addNode();
        }
    }, [value])
    const addNode = useCallback(() => {
        setNodes((nodes) => {
            return [
                ...nodes, {
                    id: String(Math.random()),
                    position: {
                        x: 100,
                        y: 100
                    },
                    data: {
                        label: "yo"
                    }
                }
            ];
        });
    }, []);

    const onEdgeUpdate = useCallback(
        (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
        []
    );

    const onNodeClick = (target, node) => {
        setSelectedNodeData(node);
        // setToggleFlag(true);
        setTitle(node.id);
        openModal();
    };

    const onPaneClick = (e) => {
      setToggleFlag(false);
        setSelectedNodeData(null);
    };

    //https://reactflow.dev/docs/examples/nodes/update-node/
    const onEdgeClick = (target, edge, dd) => {
        var selectedEdge = edges.find(elem => elem.id == edge.id);
        selectedEdge['animated'] = true;
        selectedEdge['type'] = 'smoothstep';
        selectedEdge['style'] = {stroke:'red',
                        storkeWidth:2};
                        selectedEdge['markerEnd'] = {type: MarkerType.ArrowClosed,
                            width:20,
                            height:20,
                        color:'red'};
        setEdges(edges);
        setEdges((edges) => {
            return [
                ...edges
            ];
        });
        console.log(edges)
    }


    let subtitle;
    const [modalIsOpen, setIsOpen] = useState(false); 
    function openModal() {
      setIsOpen(true);
    }
  
    const [title, setTitle] = useState("hello")

    function afterOpenModal() {
      // references are now sync'd and can be accessed.
      subtitle.text = selectedNodeData.id;
    }
  
    function closeModal() {
      setIsOpen(false);
    }

    return (
        <div id='reactflow_wrapper'>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onConnect={onConnect}
                onEdgeUpdate={onEdgeUpdate}
                nodeTypes={nodeTypes}
                fitView
                maxZoom={1.0}
                minZoom={1.0}
                translateExtent={[[-300,-100], [2500,300]]}
                panOnScrollMode = {PanOnScrollMode.Horizontal}
                zoomOnScroll={false}
                nodesDraggable={false}
                style={rfStyle}>
                {/* <MiniMap/> */}
                {/* <Controls/> */}
                <Background/>

                <Sidebar width={320} children={<NodeInfo setValue={setValue} nodeData={selectedNodeData}/>} toggleFlag={{value:toggleFlag, set:setToggleFlag}}>
                </Sidebar>
            </ReactFlow>

      <div>
      <button onClick={openModal}>Open Modal</button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        className="layer_event"
        ariaHideApp={false}
      >
        <h3 ref={(_subtitle) => (subtitle = _subtitle)}>{title}</h3>
        <button onClick={closeModal}>close</button>
        <DagModal nodeType={"Pod"} data={selectedNodeData}/>
      </Modal>
    </div>
        </div>

    );
}

export default Flow;
import {React, useState,  useRef, useCallback, useEffect} from "react";
import {QueryClient, QueryClientProvider} from 'react-query'
import {Route,Routes,Router, useParams} from 'react-router-dom';
import { Row, Col, Divider } from "antd";
import ReactFlow, {
    ReactFlowProvider,
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
import './css/textUpdaterNode.scss'
import axios from 'axios';
import Modal from 'react-modal';
import "./css/dagModal.css";
import DagModal from './dag_modal';
import dagre from 'dagre';
import {  Button  } from 'antd';
import { UndoOutlined, DeleteOutlined, DashOutlined } from "@ant-design/icons";
import TextUpdaterNode from './textUpdaterNode';
import './css/textUpdaterNode.scss'
import { DagDefineSideBar } from "./dag_define_sidebar";
import { useQuery} from 'react-query';
const queryClient = new QueryClient();

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = { textUpdater: TextUpdaterNode };
const rfStyle = {
    backgroundColor: '#B8CEFF',
    height:'500px'
  };
function DagDefine(props) {
    const {projectID} = useParams();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {isLoading, error, data, isFetching, refetch} = useQuery(
        [],()=>{
            return axios.get(process.env.REACT_APP_API+'/api/getDAG/' + projectID)
            .then((res) => {
                var nodes = res['data']['nodes'];
                var edges = res['data']['edges'];
                sortGraph(nodes, edges);
                return res['data']
            })
        },{
            refetchOnWindowFocus:false,
            retry:0,
        }
    );

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    const nodeWidth = 252;
    const nodeHeight = 142;
    
    const getLayoutedElements = (nodes, edges, direction = 'LR') => {
        const isHorizontal = direction === 'LR';
        dagreGraph.setGraph({ rankdir: direction });
      
        nodes.forEach((node) => {
          dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });
      
        edges.forEach((edge) => {
          dagreGraph.setEdge(edge.source, edge.target);
        });
      
        dagre.layout(dagreGraph);
      
        nodes.forEach((node) => {
          const nodeWithPosition = dagreGraph.node(node.id);
          node.targetPosition = isHorizontal ? 'left' : 'top';
          node.sourcePosition = isHorizontal ? 'right' : 'bottom';
      
          // We are shifting the dagre node position (anchor=center center) to the top left
          // so it matches the React Flow node anchor point (top left).
          node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
          };
      
          return node;
        });
      
        return { nodes, edges };
      };
    
      const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }, []);
    
      const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          const type = event.dataTransfer.getData('application/reactflow');
    
          // check if the dropped element is valid
          if (typeof type === 'undefined' || !type) {
            return;
          }
    
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
          const newNode = {
            id: getId(),
            type,
            position,
            data: { label: `${type} node` },
          };
    
          setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
      );

    const [refresh, setRefresh] = useState(false);
    function sortGraph(nodes, edges){
        console.log(nodes)
        var layoutedElems = getLayoutedElements(
            nodes,
            edges
          );
        setNodes((node) => {
            return layoutedElems.nodes
        });
        setEdges((edge) => {
            return layoutedElems.edges
        });
        setRefresh(!refresh);
        
    }

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        return node;
      })
    );
    
  }, [refresh, setNodes]); const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);


    return (
        <>

    <QueryClientProvider client={queryClient}>
    <Row>
        <div className="content_box" style={{width:'100%', height:'300px'}}>
        </div>
    </Row>
    <Row>
      <ReactFlowProvider>
      <Col flex="200px">
        <div className="content_box" style={{width:'100%', height:'400px'}}>
            <DagDefineSideBar/>
        </div>
    </Col>
    <Col flex="10px"></Col>
      <Col flex="auto">
        <div className="content_box" style={{width:'100%', height:'400px'}} ref={reactFlowWrapper}>
            <div style={{width:'100%', height:'40px'}}>
                <Button style={{float: 'right', backgroundColor: '#CC0000'}} type="primary" icon={<DeleteOutlined />}>Delete</Button>
                <Button style={{float: 'right', marginRight:'15px', }} type="primary" icon={<DashOutlined />} onClick={() => {sortGraph(nodes, edges)}}>Sort Graph</Button>
                <Button style={{float: 'right', marginRight:'15px', backgroundColor: '#00CC00'}} icon={<UndoOutlined />} onClick={refetch} type="primary">Reset Graph</Button>
            </div>
            <div style={{width:'100%', height:'320px'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                panOnScrollMode = {PanOnScrollMode.Horizontal}
                onDrop={onDrop}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onConnect={onConnect}
                style={rfStyle}>
                <Background/>

                {/* <Sidebar width={320} children={<NodeInfo setValue={setValue} nodeData={selectedNodeData}/>} toggleFlag={{value:toggleFlag, set:setToggleFlag}}>
                </Sidebar> */}
            </ReactFlow></div>
        </div>
        </Col>

      </ReactFlowProvider>
    </Row>
        </QueryClientProvider>
    </>
    
    );
}

export {
    DagDefine
};
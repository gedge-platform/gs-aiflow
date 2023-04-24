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
import {useParams} from 'react-router-dom';

import 'reactflow/dist/style.css';
import Sidebar from './service_define_sidebar';
import NodeInfo from './service_define_node_info';
import TextUpdaterNode from './textUpdaterNode';
import './css/textUpdaterNode.scss'
import axios from 'axios';
import Modal from 'react-modal';
import "./css/dagModal.css";
import DagModal from './dag_modal';
import dagre from 'dagre';
import {  Button  } from 'antd';
import { CaretRightOutlined , CloseOutlined } from "@ant-design/icons";

const nodeTypes = { textUpdater: TextUpdaterNode };
const rfStyle = {
    backgroundColor: '#B8CEFF',
    height:'500px'
  };

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

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [value, setValue] = useState(false);
    const [selectedNodeData, setSelectedNodeData] = useState(null);
    const [toggleFlag, setToggleFlag] = useState(false);
    const id = useParams().projectID;
    const {isLoading, error, data, isFetching} = useQuery(
        [],()=>{
            return axios.get(process.env.REACT_APP_API+'/api/getDAG/' + id)
            .then((res) => {
                var nodes = res['data']['nodes'];
                var edges = res['data']['edges'];
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
    const [popUpModalIsOpen, setPopUpIsOpen] = useState(false); 
    function openModal() {
      setIsOpen(true);
    }

    function openPopUpModal() {
      setPopUpIsOpen(true);
    }
    const [title, setTitle] = useState("hello")

    function afterOpenModal() {
      // references are now sync'd and can be accessed.
      subtitle.text = selectedNodeData.id;
    }

    function afterPopUpOpenModal() {
      // references are now sync'd and can be accessed.
      subtitle.text = "실패했습니다."
    }
  
    function closeModal() {
      setIsOpen(false);
    }

    function closePopUp(){
        setPopUpIsOpen(false);
    }


    function launchProject() {
        axios.post(process.env.REACT_APP_API + '/api/project/launch', 
        {projectID: "ss"})
        .then(response => {
            if(response.data['status'] == 'success'){
                setTitle("실행에 성공했습니다.")
            }
            else{
                setTitle("실행에 실패했습니다. 워크플로를 초기화 해주십시오.")
            }
            openPopUpModal()
        })

    }

    function InitProject() {
        axios.post(process.env.REACT_APP_API + '/api/project/init', 
        {projectID: "ss"})
        .then(response => {
            console.log(response)
        })
    }

    return (
        <div id='reactflow_wrapper'>

        <div style={{display:'flex'}} >
            <h2>{id}</h2>
        <div align='right' style={{flex:1, display:'flex', justifyContent:'flex-end'}}> 
          {/* <h2 >프로젝트 목록</h2>  */}
          <Button style={{backgroundColor: '#00CC00', margin:'auto 0'}} type="primary" icon={<CaretRightOutlined />} onClick={launchProject}>
          Launch Project
          </Button>
          <div style={{width:'15px'}}/>
          <Button style={{backgroundColor: '#CC0000', margin:'auto 0'}} type="primary" icon={<CloseOutlined />} onClick={InitProject}>
          Init Project
          </Button>
        </div>
        </div>
        <div style={{width:'100%', height:'500px'}}>
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

                {/* <Sidebar width={320} children={<NodeInfo setValue={setValue} nodeData={selectedNodeData}/>} toggleFlag={{value:toggleFlag, set:setToggleFlag}}>
                </Sidebar> */}
            </ReactFlow>
        </div>
            
      <div>
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
      <Modal
        isOpen={popUpModalIsOpen}
        onAfterOpen={afterPopUpOpenModal}
        onRequestClose={closePopUp}
        contentLabel="Example Modal"
        className="layer_event"
        ariaHideApp={false}
      >
        <h3 ref={(_subtitle) => (subtitle = _subtitle)}>{title}</h3>
        <button onClick={closePopUp}>close</button>
      </Modal>
    </div>
        </div>

    );
}

export default Flow;
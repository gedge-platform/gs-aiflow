import { useCallback, useState, useEffect } from 'react';
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
import { useQuery } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';

import 'reactflow/dist/style.css';
import Sidebar from './service_define_sidebar';
import NodeInfo from './service_define_node_info';
import TextUpdaterNode from './textUpdaterNode';
import PodNode from './pod_node_small';
import './css/textUpdaterNode.scss'
import axios from 'axios';
import Modal from 'react-modal';
import "./css/dagModal.css";
import DagModal from './dag_modal';
import dagre from 'dagre';
import { Button, Row, Col, Divider, Select } from 'antd';
import { CaretRightOutlined, CloseOutlined } from "@ant-design/icons";
import DagMonitoringDetail from './dag_monitoring_detail';
import Icon from '@ant-design/icons/lib/components/Icon';

const nodeTypes = { textUpdater: TextUpdaterNode, Pod: PodNode };
const rfStyle = {
  backgroundColor: '#B8CEFF',
  height: '500px'
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

function Flow(props) {
  const setProjectID = props.setProjectID;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [value, setValue] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [toggleFlag, setToggleFlag] = useState(false);
  const [pjList, setPjList] = useState([]);
  const id = useParams().projectID;
  const navigate = useNavigate();
  const { isLoading, error, data, isFetching, refetch} = useQuery(
    ["dag" + id], () => {
      return axios.get(process.env.REACT_APP_API + '/api/getDAG/' + id)
        .then((res) => {
          var nodes = res['data']['nodes'];
          var edges = res['data']['edges'];

          //style
          edges.forEach((elem) => {
            elem.animated = true;
            elem.style = {stroke: 'red', 
                          strokeWidth: 4};
            elem.markerEnd = {type: MarkerType.ArrowClosed, color:'red', width: '7px', height:'7px'};
          });
        
        // selectedEdge['markerEnd'] = {
        //   type: MarkerType.ArrowClosed,
        //   width: 20,
        //   height: 20,
        //   color: 'red'
        // };

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
    }, {
    refetchInterval: 5000
  }
  );


const getProjectList = async ( id ) => {
  const { data } = await axios.get(process.env.REACT_APP_API+'/api/getProjectList/' + id);
  var list = data.project_list;
  list.forEach(function(item){
      item.value = item.project_name;
      item.label = item.project_name;
  })
  setPjList(list)
  return list;
};

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
    // setToggleFlag(true);
    setTitle(node.id);
    setSelectedNodeData(node);
    // openModal();
  };

  const onPaneClick = (e) => {
    setToggleFlag(false);
    // setSelectedNodeData(null);
  };

  //https://reactflow.dev/docs/examples/nodes/update-node/
  const onEdgeClick = (target, edge, dd) => {
    var selectedEdge = edges.find(elem => elem.id == edge.id);
    selectedEdge['animated'] = true;
    selectedEdge['type'] = 'smoothstep';
    selectedEdge['style'] = {
      stroke: 'red',
      storkeWidth: 2
    };
    selectedEdge['markerEnd'] = {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: 'red'
    };
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

  function closePopUp() {
    setPopUpIsOpen(false);
  }


  function launchProject() {
    axios.post(process.env.REACT_APP_API + '/api/project/launch',
      { projectID: id })
      .then(response => {
        if (response.data['status'] == 'success') {
          setTitle("실행에 성공했습니다.")
        }
        else {
          setTitle("실행에 실패했습니다. 워크플로를 초기화 해주십시오.")
        }
        openPopUpModal()
      })

  }

  function InitProject() {
    axios.post(process.env.REACT_APP_API + '/api/project/init',
      { projectID: id })
      .then(response => {
        console.log(response)
      })
  }
  const { isProjectLoading, isProjectError, projectData, projectError, projectRefetch } = useQuery(["projectList"], () => {
    return getProjectList('user1')
  }, {
    refetchOnWindowFocus:false,
    retry:0,
  });

  const onChangeProjectSelect = (data) =>{
    setProjectID(data);
    setSelectedNodeData(null);
    navigate('/monitoring/' + data)
  } 


  return (
    <div id='reactflow_wrapper'>
      <Select style={{width : "180px", fontWeight:'bold'}} defaultValue={id} onChange={onChangeProjectSelect} placeholder='select project'
      options={pjList}></Select>
      <div className='content_box' style={{minHeight:'200px'}}>
        <DagMonitoringDetail nodes={nodes} data={selectedNodeData} edges={edges} projectID={id} />
      </div>

      <div className='content_box'>
        <div style={{ display: 'flex',height:'50px' }} >
          {/* <h2>{id}</h2> */}
          <div style={{ height: '100%' }}>
            <Row>
              <div className='dag_status_color waiting' />
              <span className='dag_status_span'>Waiting</span>
              <div className='dag_status_color pending' />
              <span className='dag_status_span'>Pending</span>
              <div className='dag_status_color running' />
              <span className='dag_status_span'>Running</span>
              <div className='dag_status_color succeeded' />
              <span className='dag_status_span'>Succeeded</span>
              <div className='dag_status_color failed' />
              <span className='dag_status_span'>Failed</span>
            </Row>
            <Divider style={{ margin: '0', height: '5px' }}></Divider>
            <Row>
              <div className='dag_task_color train' />
              <span className='dag_status_span'>Train</span>
              <div className='dag_task_color validate' />
              <span className='dag_status_span'>Validate</span>
              <div className='dag_task_color optimization' />
              <span className='dag_status_span'>Optimization</span>
              <div className='dag_task_color opt_validate' />
              <span className='dag_status_span'>Opt_Validate</span>
            </Row>
          </div>
          <div align='right' style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {/* <h2 >프로젝트 목록</h2>  */}
            <Button style={{ backgroundColor: '#00CC00', margin: 'auto 0' }} type="primary" icon={<CaretRightOutlined />} onClick={launchProject}>
              Launch Project
            </Button>
            <div style={{ width: '15px' }} />
            <Button style={{ backgroundColor: '#CC0000', margin: 'auto 0' }} type="primary" icon={<CloseOutlined />} onClick={InitProject}>
              Init Project
            </Button>
          </div>
        </div>
        <div style={{ width: '100%', height: '400px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            // onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            nodeTypes={nodeTypes}
            fitView
            maxZoom={1.0}
            minZoom={1.0}
            translateExtent={[[-300, -100], [2500, 300]]}
            panOnScrollMode={PanOnScrollMode.Horizontal}
            zoomOnScroll={false}
            nodesDraggable={false}
            style={rfStyle}>
            {/* <MiniMap/> */}
            {/* <Controls/> */}
            <Background />

            {/* <Sidebar width={320} children={<NodeInfo setValue={setValue} nodeData={selectedNodeData}/>} toggleFlag={{value:toggleFlag, set:setToggleFlag}}>
                </Sidebar> */}
          </ReactFlow>
        </div>
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
          <DagModal nodeType={"Pod"} data={selectedNodeData} />
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
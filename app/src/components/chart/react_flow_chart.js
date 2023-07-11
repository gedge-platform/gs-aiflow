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
  useNodes,
  ReactFlowProvider
} from 'reactflow';
import { useQuery } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';

import 'reactflow/dist/style.css';
import { catchError } from '../../utils/network';
import TextUpdaterNode from '../chart_node/textUpdaterNode';
import PodNode from '../chart_node/pod_node_small';
import 'css/textUpdaterNode.scss'
import axios from 'axios';
// import Modal from 'react-modal';
// import Modal from 'antd';
import "css/dagModal.css";
import DagModal from 'components/modals/dag_modal';
import dagre from 'dagre';
import { Button, Row, Col, Divider, Select , notification, Modal} from 'antd';
import { CaretRightOutlined, CloseOutlined , FileSearchOutlined} from "@ant-design/icons";
import DagMonitoringDetail from '../dag/dag_monitoring_detail';
import Icon from '@ant-design/icons/lib/components/Icon';

const nodeTypes = { textUpdater: TextUpdaterNode, Pod: PodNode };
const rfStyle = {
  backgroundColor: '#B8CEFF',
  height: '500px'
};

const nodeWidth = 252;
const nodeHeight = 142;

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  var dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, width: 0, height:0 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);
  var label = dagreGraph._label;

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

  return { nodes, edges, label };
};

function Flow(props) {
  const setProjectID = props.setProjectID;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [value, setValue] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null); 
  const [api, contextHolder] = notification.useNotification();
  const [toggleFlag, setToggleFlag] = useState(false);
  const [pjList, setPjList] = useState([]);
  const id = useParams().projectID;
  const navigate = useNavigate();
  const [needFitView, setNeedFitView]=useState(true);
  const { isLoading, error, data, isFetching, refetch} = useQuery(
    ["dag" + id], () => {
      if(id == undefined){
        return ;
      }
      return axios.get(process.env.REACT_APP_API + '/api/project/dag/' + id, {withCredentials:true})
        .then((res) => {
          return setGraph(res);
        })
        .catch((error) => {
          catchError(error, navigate);
        }
      );
    }, {
    refetchInterval: 5000,
  }
  );

  const setGraph = (res) => {
    var nodes = res['data']['nodes'];
    var edges = res['data']['edges'];

    //style
    nodes.forEach((elem) => {
      elem.data.isConnectable = false;
      elem.data.needStatus = true;
    });

    edges.forEach((elem) => {
      elem.animated = true;
      elem.style = {
        stroke: 'red',
        strokeWidth: 4
      };
      elem.markerEnd = { type: MarkerType.ArrowClosed, color: 'red', width: '7px', height: '7px' };
    });

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

    if (needFitView) {
      setNeedFitView(false);
      if (reactFlowInstance) {
        reactFlowInstance.fitBounds({ x: 0, y: 0, width: layoutedElems.label.width, height: layoutedElems.label.height })
      }
    }
    //fit view
    return res['data'];
  }


  const getProjectList = async (id) => {
    const { data } = await axios.get(process.env.REACT_APP_API + '/api/project', { withCredentials: true });
    var list = data.project_list;
    list.forEach(function (item) {
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

  const onNodeContextMenu = (target, node) => {
    setTitle(node.id);
    openModal();
    
  }

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
      { projectID: id }, {withCredentials:true})
      .then(response => {
        if (response.data['status'] == 'success') {
          openNotificationWithIcon("success", {message:"Launch Project", description:"실행에 성공했습니다."})
        }
        else {
          openNotificationWithIcon("error", {message:"Launch Project", description:"실행에 실패했습니다. 워크플로를 초기화 해주십시오."})
        }
      })
      .catch(error => {
        openNotificationWithIcon("error", {message:"Launch Project", description:"서버 에러, 실행에 실패했습니다."})
      })

  }

  function InitProject() {
    axios.post(process.env.REACT_APP_API + '/api/project/init',
      { projectID: id }, {withCredentials:true})
      .then(response => {
        if (response.data['status'] == 'success') {
          openNotificationWithIcon("success", {message:"Init Project", description:"초기화에 성공했습니다."})
        }
        else{
          openNotificationWithIcon("error", {message:"Init Project", description:"초기화에 실패했습니다."})
        }
      })
      .catch(error => {
        openNotificationWithIcon("error", {message:"Init Project", description:"서버 에러, 초기화에 실패했습니다."})
      })
  }
  const { isProjectLoading, isProjectError, projectData, projectError, projectRefetch } = useQuery(["projectList"], () => {
    return getProjectList()
  }, {
    refetchOnWindowFocus:false,
    retry:0,
  });

  const onChangeProjectSelect = (data) =>{
    setNeedFitView(true)
    setProjectID(data);
    setSelectedNodeData(null);
    navigate('/monitoring/' + data)
  } 

  const nodeColor = (node) =>{
    if(node){
      if(node.data){
        if(node.data.task){
          var task = node.data.task;
          if(task == "Train"){
              return '#F5C9B2'
          }
          else if(task == "Validate"){
            return '#9AC8F5';
          }
          else if(task == "Optimization"){
            return '#CBF5DC';
          }
          else if(task == "Opt_Validate"){
            return '#BBBBBB';
          }
        }
      }
    }
    return '#666666'
  }
  const openNotificationWithIcon = (type, data) => {
    console.log(api, type, api[type])
    api[type](data);
  };

  return (
    <div id='reactflow_wrapper'>
      {contextHolder}
      <div style={{width:'100%', display: 'flex'}}>
        <Select style={{width : "180px", fontWeight:'bold'}} defaultValue={id} onChange={onChangeProjectSelect} placeholder='select project'
        options={pjList}></Select>

        <div style={{marginLeft:'auto'}}>
          <a href={'/api/storage/' + id} target="_blank">
            <Button style={{backgroundColor: '#FFFFFF', color: '#000000'}} type="primary" icon={<FileSearchOutlined />}>Storage</Button>
          </a>
          </div>
      </div>
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
            onContextMenu={(e)=>{e.preventDefault();}}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            nodeTypes={nodeTypes}
            fitView
            onInit={setReactFlowInstance}
            // translateExtent={[[-300, -100], [2500, 300]]}
            panOnScrollMode={PanOnScrollMode.Horizontal}
            zoomOnScroll={true}
            nodesDraggable={false}
            style={rfStyle}>
            <MiniMap nodeColor={nodeColor} nodeStrokeWidth={5} nodeStrokeColor={'black'}/>
            <Controls/>
            <Background />

            {/* <Sidebar width={320} children={<NodeInfo setValue={setValue} nodeData={selectedNodeData}/>} toggleFlag={{value:toggleFlag, set:setToggleFlag}}>
                </Sidebar> */}
          </ReactFlow>
        </div>
      </div>


      <div>

        <Modal
          title = "Log 보기"
          open={modalIsOpen}
          onCancel={closeModal}
          onOk={afterOpenModal}
          destroyOnClose={true}
        >
          <div
            style={{ height: '400px' }}>

            <h3 ref={(_subtitle) => (subtitle = _subtitle)}>이름 : {title}</h3>
            {/* <DagModal nodeType={"Pod"} data={selectedNodeData} /> */}
            "이부분은 로그가 출력될 부분입니다."
          </div>
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
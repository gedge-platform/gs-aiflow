import { React, useState, useRef, useCallback, useEffect } from "react";
import { QueryClient, QueryClientProvider } from 'react-query'
import { Route, Routes, Router, useParams } from 'react-router-dom';
import { Row, Col, Modal, Form } from "antd";
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
    getIncomers,
    getOutgoers,
    getConnectedEdges,
    deleteElements,
} from 'reactflow';

import './css/textUpdaterNode.scss'
import axios from 'axios';
import "./css/dagModal.css";
import dagre from 'dagre';
import { Button } from 'antd';
import { UndoOutlined, DeleteOutlined, DashOutlined, SaveOutlined} from "@ant-design/icons";
import TextUpdaterNode from './textUpdaterNode';
import './css/textUpdaterNode.scss'
import { DagDefineSideBar } from "./dag_define_sidebar";
import { useQuery } from 'react-query';
import DagDefineModal from "./dag_define_modal";
import DagDefineDetail from "./dag_define_detail";
const queryClient = new QueryClient();

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = { textUpdater: TextUpdaterNode };
const rfStyle = {
    backgroundColor: '#B8CEFF',
    height: '500px'
};
function DagDefine(props) {
    const { projectID } = useParams();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const { isLoading, error, data, isFetching, refetch } = useQuery(
        [], () => {
            return axios.get(process.env.REACT_APP_API + '/api/getDAG/' + projectID)
                .then((res) => {
                    var nodes = res['data']['nodes'];
                    var edges = res['data']['edges'];
                    sortGraph(nodes, edges);
                    return res['data']
                })
        }, {
        refetchOnWindowFocus: false,
        retry: 0,
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

    const onNodeClick = ((target, node) => {
        setSelectedNode(node);
    })

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

            if (!checkNodeType(type)) {
                setModalText('현재 이 기능은 사용할 수 없습니다.');
                showModal(true);
                return;
            }

            addNewNodeData(type, newNode);

        },
        [reactFlowInstance]
    );

    function addNewNodeData(type, node) {
        setTaskType(type);
        setTaskCreating(node);
        form = {};
        setTaskOpen(true);

    }

    function checkNodeType(type) {
        //일단 파드만 TODO:
        if (type == 'Pod')
            return true;
        else
            return false;
    }

    const [refresh, setRefresh] = useState(false);
    function sortGraph(nodes, edges) {
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

    }, [refresh, setNodes]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodesDelete = useCallback(
        (deleted) => {
            console.log(deleted)
            setEdges(
                deleted.reduce((acc, node) => {
                    const incomers = getIncomers(node, nodes, edges);
                    const outgoers = getOutgoers(node, nodes, edges);
                    const connectedEdges = getConnectedEdges([node], edges);

                    const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

                    const createdEdges = incomers.flatMap(({ id: source }) =>
                        outgoers.map(({ id: target }) => ({ id: `${source}->${target}`, source, target }))
                    );

                    return [...remainingEdges, ...createdEdges];
                }, edges)
            );
        },
        [nodes, edges]
    );

    function onNodeDeleteClick() {
        if (selectedNode) {
            const deleteNode = [selectedNode];
            reactFlowInstance.deleteElements({ nodes: deleteNode, edges: [] });
            setSelectedNode(null);
        }
    }

    //modal
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');
    const [taskOpen, setTaskOpen] = useState(false);
    const [taskConfirmLoading, setTaskConfirmLoading] = useState(false);
    const [taskType, setTaskType] = useState(null);
    const [taskCreating, setTaskCreating] = useState(null);
    var form = {}

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setModalText('The modal will be closed after two seconds');
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    function makeNode() {
        if (taskType == "Pod") {
            makeNodePod();
        }
    }

    function makeNodePod() {
        console.log(form)
        const name = form.name;
        const type = form.type;
        const status = form.status;
        const precondition = form.precondition;
        const task = form.task;
        const runtime = form.runtime;
        const tensorRT = form.tensorRT;
        const cuda = form.cuda;

        if (!name) {
            return;
        }
        if (!precondition) {
            return;
        }
        if (!task) {
            return;
        }
        if (!runtime) {
            return;
        }
        if (!tensorRT) {
            return;
        }
        if (!cuda) {
            return;
        }
        if (status != "success") {
            return;
        }

        taskCreating.id = name;
        taskCreating.data.label = name;
        taskCreating.data.task = task;
        taskCreating.data.runtime = runtime;
        taskCreating.data.tensorRT = tensorRT;
        taskCreating.data.cuda = cuda;
        taskCreating.data.type = type;

        const newEdges = [];
        precondition.forEach((prec) => {
            newEdges.push({
                id: name + "_" + prec, source: prec, target: name
            });
        })

        setTaskOpen(false);
        setNodes((nds) => nds.concat(taskCreating));
        setEdges((egs) => egs.concat(newEdges));

    }

    return (
        <>

            <QueryClientProvider client={queryClient}>
                <Row>
                    <ReactFlowProvider>
                        <Col flex="200px">
                            <div className="content_box" style={{ width: '100%', height: '400px' }}>
                                <DagDefineSideBar />
                            </div>
                        </Col>
                        <Col flex="10px"></Col>
                        <Col flex="auto">
                            <div className="content_box" style={{ width: '100%', height: '400px' }} ref={reactFlowWrapper}>
                                <div style={{ width: '100%', height: '40px' }}>
                                    <Button style={{ float: 'right', backgroundColor: '#CC0000' }} type="primary" icon={<DeleteOutlined />} onClick={onNodeDeleteClick}>Delete</Button>
                                    <Button style={{ float: 'right', marginRight: '15px', backgroundColor: '#00CC00' }} icon={<SaveOutlined />} onClick={()=>{}} type="primary">Save</Button>
                                    <Button style={{ float: 'right', marginRight: '15px', }} type="primary" icon={<DashOutlined />} onClick={() => { sortGraph(nodes, edges) }}>Sort Graph</Button>
                                    <Button style={{ float: 'right', marginRight: '15px', backgroundColor: '#CC9900' }} icon={<UndoOutlined />} onClick={refetch} type="primary">Reset Graph</Button>
                                </div>
                                <div style={{ width: '100%', height: '320px' }}>
                                    <ReactFlow
                                        nodes={nodes}
                                        edges={edges}
                                        fitView
                                        panOnScrollMode={PanOnScrollMode.Horizontal}
                                        onDrop={onDrop}
                                        onNodesChange={onNodesChange}
                                        onEdgesChange={onEdgesChange}
                                        onDragOver={onDragOver}
                                        onInit={setReactFlowInstance}
                                        onConnect={onConnect}
                                        onNodeClick={onNodeClick}
                                        deleteKeyCode={["Backspace", "Delete"]}
                                        onNodesDelete={onNodesDelete}
                                        style={rfStyle}>
                                        <Background />

                                        {/* <Sidebar width={320} children={<NodeInfo setValue={setValue} nodeData={selectedNodeData}/>} toggleFlag={{value:toggleFlag, set:setToggleFlag}}>
                </Sidebar> */}
                                    </ReactFlow></div>
                            </div>
                        </Col>

                    </ReactFlowProvider>
                </Row>
                <Modal
                    title="생성 불가"
                    open={open}
                    onOk={handleCancel}
                    onCancel={() => { setOpen(false); }}
                    confirmLoading={confirmLoading}
                    footer={
                        <div>
                            <Button type="primary" onClick={() => { setOpen(false); }}>
                                확인
                            </Button>
                        </div>
                    }
                // onCancel={handleCancel}
                >
                    <p>{modalText}</p>
                </Modal>

                <Modal
                    title="Task 생성"
                    open={taskOpen}
                    onOk={makeNode}
                    confirmLoading={taskConfirmLoading}
                    onCancel={() => { setTaskOpen(false); }}
                    destroyOnClose={true}
                >
                    <DagDefineModal type={taskType} form={form} nodes={nodes} />
                </Modal>
            </QueryClientProvider>

            <Row>
                <div className="content_box" style={{ width: '100%', height: '300px' }}>
                    <DagDefineDetail data={selectedNode} edges={edges} projectID={projectID} />
                </div>
            </Row>
        </>

    );
}

export {
    DagDefine
};
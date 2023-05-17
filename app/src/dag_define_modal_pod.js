import { React, useEffect, useState } from 'react';
import { Form, Input, Select } from 'antd';
import axios from 'axios';
import { useQuery } from 'react-query';

const DagDefineModalPod = (props) => {
  const form = props.form;
  const nodes = props.nodes;

  const [nameStatus, setNameStatus] = useState({ status: "", help: "" })
  const [frameworkList, setFrameworkList] = useState([])
  const [runtimeList, setRuntimeList] = useState([])
  const [tensorRTList, setTensorRTList] = useState([])


  const getEnv = async () => {
    const { data } = await axios.get(process.env.REACT_APP_API + '/api/pod/env', {withCredentials:true});
    return data;
  };

  const getModelsAPI = async () => {
    const {data} = await axios.get(process.env.REACT_APP_API + '/api/pod/env/model', {withCredentials:true})
    console.log(data)
    return data;
  };


  // const { isLoading, isError, data, error } = useQuery(["env"], () => { return getEnv() }, {
  //   refetchOnWindowFocus: false,
  //   retry: 0,
  // });

  const {isLoading, isError, data, error} = useQuery(["models"], () => { return getModelsAPI() }, {
    refetchOnWindowFocus: false,
    retry: 0,
  });

  const options = [];
  const ids = [];
  nodes.forEach((node) => {
    options.push({
      label: node.id,
      value: node.id
    });
    ids.push(node.id);
  });

  function getModels(){
    if(isError){
      return;
    }
    if(data){
      if(data.model){
        const models = [];
        data.model.forEach((model) => {
          models.push(<Select.Option value={model}>{model}</Select.Option>)
        })
        return models;
      }
    }
    return;
  }

  function getFrameworks(){
    if(frameworkList){
      const frameworks = [];
        frameworkList.forEach((framework) => {
          frameworks.push(<Select.Option value={framework}>{framework}</Select.Option>)
        })
        return frameworks;
    }
    return;
  }

  function getRuntimes(){
    if(runtimeList){
      const runtimes = [];
      runtimeList.forEach((runtime) => {
        runtimes.push(<Select.Option value={runtime.runtime_name}>{runtime.runtime_name}</Select.Option>)
      })
      return runtimes;
    }
    return;
  }

  function getTensorRTs(){
    if(tensorRTList){
      const tensorRTs = [];
      tensorRTList.forEach((tensorRT) => {
        tensorRTs.push(<Select.Option value={tensorRT.tensorrt_name}>{tensorRT.tensorrt_name}</Select.Option>)
      })
      return tensorRTs;
    }
    return;
  }

  var specialNameRegex = /^[A-Za-z0-9\-]+$/;

  function checkName(data) {
    var status = "";
    if (ids.includes(data.target.value)) {
      status = "error";
      setNameStatus({ status: "error", help: "name is duplicated" })
    }
    else if(!specialNameRegex.test(data.target.value)){
      status = "error";
      setNameStatus({ status: "error", help: "name is wrong" })
    }
    else {
      status = "success";
      setNameStatus({ status: "success", help: "" })
    }
    form.name = data.target.value;
    form.status = status;
  }

  function onChangePrecondition(data) {
    form.precondition = data;
  }

  function onChangeModel(data) {
    form.model = data;
    axios.get(process.env.REACT_APP_API + "/api/pod/env/framework/" + data, {withCredentials:true})
    .then((res) => {
      setFrameworkList(res.data.framework);
    })
    .catch((error) => {
      setFrameworkList([]);
    });
  }
  
  function onChangeTask(data) {
    form.task = data;
  }

  function onChangeFrameWorks(data) {
    form.framework = data;
    axios.get(process.env.REACT_APP_API + "/api/pod/env/runtime/" + form.model + "/" + data, {withCredentials:true})
    .then((res) => {
      setRuntimeList(res.data.runtime)
    })
    .catch((error) => {
      setRuntimeList([]);
    });
  }

  function onChangeRuntime(data) {
    form.runtime = data;
    axios.get(process.env.REACT_APP_API + "/api/pod/env/tensorrt/" + data, {withCredentials:true})
    .then((res) => {
      setTensorRTList(res.data.tensorrt)
    })
    .catch((error) => {
      setTensorRTList([]);
    });
  }

  function onChangeTensorRT(data) {
    form.tensorRT = data;
  }

  return (
    <div>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
        disabled={false}
        style={{ maxWidth: '800px' }}
      >
        <Form.Item label="Type">
          <Input disabled={false} value={"Pod"} />
        </Form.Item>
        <Form.Item label="Name" validateStatus={nameStatus.status}
          help={nameStatus.help} hasFeedback>
          <Input placeholder='Task Name' onChange={checkName} />
          <label>알파벳과 숫자, 특수문자 - 만 가능합니다.</label>
        </Form.Item>
        <Form.Item label="Task">
          <Select onChange={onChangeTask}>
            <Select.Option value="Train">Train</Select.Option>
            <Select.Option value="Validate">Validate</Select.Option>
            <Select.Option value="Optimization">Optimization</Select.Option>
            <Select.Option value="Opt_Validate">Opt_Validate</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Precondition">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select"
            defaultValue={[]}
            options={options}
            onChange={onChangePrecondition}
          />
        </Form.Item>
        <Form.Item label="Model">
          <Select onChange={onChangeModel}>
            {!isLoading && getModels()}
          </Select>
        </Form.Item>
         <Form.Item label="Framework">
          <Select onChange={onChangeFrameWorks}>
            {!isLoading && getFrameworks()}
          </Select>
        </Form.Item>
         <Form.Item label="Runtime">
          <Select onChange={onChangeRuntime}>
            {!isLoading && getRuntimes()}
          </Select>
        </Form.Item>
        <Form.Item label="TensorRT">
          <Select onChange={onChangeTensorRT}>
            {!isLoading && getTensorRTs()}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
}

export default DagDefineModalPod;
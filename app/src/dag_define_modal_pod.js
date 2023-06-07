import { React, useEffect, useState } from 'react';
import { Form, Input, Select } from 'antd';
import axios from 'axios';
import { useQuery } from 'react-query';

const DagDefineModalPod = (props) => {
  const form = props.form;
  const nodes = props.nodes;
  const originName = props.name;

  const [nameStatus, setNameStatus] = useState( form.name != null && form.name != undefined && form.name != '' ? { status: "success", help: "" } : { status: "", help: "" })
  const [frameworkList, setFrameworkList] = useState([])
  const [runtimeList, setRuntimeList] = useState([])
  const [tensorRTList, setTensorRTList] = useState([])

  const [selectedModel, setSelectedModel] = useState(form.model ? form.model : null);
  const [selectedFramework, setSelectedFramework] = useState(getDefaultFrameworkList);
  const [selectedRuntime, setSelectedRuntime] = useState(getDefaultRuntimeList);
  const [selectedTensorRT, setSelectedTensorRT] = useState(getDefaultTensorRTList);

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
    if(originName != null && originName != undefined){
      if(node.id == originName){
        return;
      }
    }

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
    if(originName != null){
      if(data.target.value == originName){
        status = "success";
        setNameStatus({ status: "success", help: "" })
        
        form.name = data.target.value;
        form.status = status;
        return;
      }
    }

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
    setSelectedModel(data);

    axios.get(process.env.REACT_APP_API + "/api/pod/env/framework/" + data, {withCredentials:true})
    .then((res) => {
      setFrameworkList(res.data.framework);
    })
    .catch((error) => {
      setFrameworkList([]);
    });

    onChangeFrameWorks(null);
  }
  
  function onChangeTask(data) {
    form.task = data;
  }

  function onChangeFrameWorks(data) {
    form.framework = data;
    setSelectedFramework(data);

    axios.get(process.env.REACT_APP_API + "/api/pod/env/runtime/" + form.model + "/" + data, {withCredentials:true})
    .then((res) => {
      setRuntimeList(res.data.runtime)
    })
    .catch((error) => {
      setRuntimeList([]);
    });


    onChangeRuntime(null);
  }

  function onChangeRuntime(data) {
    form.runtime = data;
    setSelectedRuntime(data);

    axios.get(process.env.REACT_APP_API + "/api/pod/env/tensorrt/" + data, {withCredentials:true})
    .then((res) => {
      setTensorRTList(res.data.tensorrt)
    })
    .catch((error) => {
      setTensorRTList([]);
    });

    onChangeTensorRT(null);
  }

  function onChangeTensorRT(data) {
    form.tensorRT = data;
    setSelectedTensorRT(data);
  }

  function getDefaultName(){
    if(form.name != null && form.name != undefined){
      var status = "success";
      form.status = status;
      return form.name;
    }
    else{
      return '';
    }
  }

  function getDefaultFrameworkList(){
    if(form.model != null && form.model != undefined){
      axios.get(process.env.REACT_APP_API + "/api/pod/env/framework/" + form.model, {withCredentials:true})
      .then((res) => {
        setFrameworkList(res.data.framework);
      })
      .catch((error) => {
        setFrameworkList([]);
      });
    }

    if(form.framework != null && form.framework != undefined){
      return form.framework;
    }
    return '';
  }


  function getDefaultRuntimeList(){
    if(form.framework != null && form.framework != undefined
      && form.model != null && form.model != undefined){
      axios.get(process.env.REACT_APP_API + "/api/pod/env/runtime/" + form.model + "/" + form.framework, {withCredentials:true})
      .then((res) => {
        console.log(res)
        setRuntimeList(res.data.runtime);
      })
      .catch((error) => {
        setRuntimeList([]);
      });
    }

    if(form.runtime != null && form.runtime != undefined){
      return form.runtime;
    }
    return '';
  }


  function getDefaultTensorRTList(){
    if(form.runtime != null && form.runtime != undefined){
      axios.get(process.env.REACT_APP_API + "/api/pod/env/tensorrt/" + form.runtime, {withCredentials:true})
      .then((res) => {
        setTensorRTList(res.data.tensorrt)
      })
      .catch((error) => {
        setTensorRTList([]);
      });
    }

    if(form.tensorRT != null && form.tensorRT != undefined){
      return form.tensorRT;
    }
    return '';
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
          <Input placeholder='Task Name' value={getDefaultName()} onChange={checkName} />
          <label>알파벳과 숫자, 특수문자 - 만 가능합니다.</label>
        </Form.Item>
        <Form.Item label="Task">
          <Select onChange={onChangeTask} defaultValue={form.task != null && form.task != undefined ? form.task : ''}>
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
            defaultValue={form.precondition != null && form.precondition != undefined ? form.precondition : [] }
            options={options}
            onChange={onChangePrecondition}
          />
        </Form.Item>
        <Form.Item label="Model">
          <Select onChange={onChangeModel}
          // defaultValue={form.model != null && form.model != undefined ? form.model : null }>
          value={selectedModel}
          >
            {!isLoading && getModels()}
          </Select>
        </Form.Item>
         <Form.Item label="Framework">
          <Select onChange={onChangeFrameWorks} defaultValue={getDefaultFrameworkList} value={selectedFramework}>
            {!isLoading && getFrameworks()}
          </Select>
        </Form.Item>
         <Form.Item label="Runtime">
          <Select onChange={onChangeRuntime} defaultValue={getDefaultRuntimeList } value={selectedRuntime}>
            {!isLoading && getRuntimes()}
          </Select>
        </Form.Item>
        <Form.Item label="TensorRT">
          <Select onChange={onChangeTensorRT} defaultValue={getDefaultTensorRTList} value={selectedTensorRT} >
            {!isLoading && getTensorRTs()}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
}

export default DagDefineModalPod;
import { React, useEffect, useState } from 'react';
import { Form, Input, Select } from 'antd';
import axios from 'axios';
import { useQuery } from 'react-query';

const DagDefineModalPod = (props) => {
  const form = props.form;
  const nodes = props.nodes;

  const [nameStatus, setNameStatus] = useState({ status: "", help: "" })

  const getEnv = async () => {
    const { data } = await axios.get(process.env.REACT_APP_API + '/api/pod/env');
    return data;
  };


  const { isLoading, isError, data, error } = useQuery(["env"], () => { return getEnv() }, {
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

  function getRuntimes(){
    if(data){
      if(data.runtime){
        const runtimes = [];
        data.runtime.forEach((runtime) => {
          runtimes.push(<Select.Option value={runtime}>{runtime}</Select.Option>)
        })
        return runtimes;
      }
    }
    return (
      <>
      </>
    )
  }

  function getCudas(){
    if(data){
      if(data.cuda){
        const cudas = [];
        data.cuda.forEach((cuda) => {
          cudas.push(<Select.Option value={cuda}>{cuda}</Select.Option>)
        })
        return cudas;
      }
    }
    return (
      <>
      </>
    )
  }

  function getTensorRTs(){
    if(data){
      if(data.tensorrt){
        const tensorrts = [];
        data.tensorrt.forEach((tensorrt) => {
          tensorrts.push(<Select.Option value={tensorrt}>{tensorrt}</Select.Option>)
        })
        return tensorrts;
      }
    }
    return (
      <>
      </>
    )
  }


  function checkName(data) {
    var status = "";
    if (ids.includes(data.target.value)) {
      status = "error";
      setNameStatus({ status: "error", help: "name is duplicated" })
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

  function onChangeTask(data) {
    form.task = data;
  }

  function onChangeRuntime(data) {
    form.runtime = data;
  }

  function onChangeTensorRT(data) {
    form.tensorRT = data;
  }

  function onChangeCuda(data) {
    form.cuda = data;
  }

  return (
    <div>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        disabled={false}
        style={{ maxWidth: '600px' }}
      >
        <Form.Item label="Type">
          <Input disabled={false} value={"Pod"} />
        </Form.Item>
        <Form.Item label="Name" validateStatus={nameStatus.status}
          help={nameStatus.help} hasFeedback>
          <Input placeholder='Task Name' onChange={checkName} />
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
        <Form.Item label="Cuda+Cudnn">
          <Select onChange={onChangeCuda}>
            {!isLoading && getCudas()}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
}

export default DagDefineModalPod;
import { React, useEffect, useState } from 'react';
import DagDefineModalPod from './dag_define_modal_pod';

const DagDefineModal = (props) => {
  const type = props.type;
  const form = props.form;
  const nodes = props.nodes;
  var modal = null;
  if (type == "Pod") {
    form.type = "Pod";
    form.name = "";
    form.status = "";
    form.precondition = [];
    form.task = null;
    form.runtime = null;
    form.tensorRT = null;
    form.cuda = null;
    
    modal = <DagDefineModalPod form={form} nodes={nodes} />
  }
  else {
    modal = 'error';
  }
  return (
    // 모달이 열릴때 openModal 클래스가 생성된다.
    <div id='dag_define_modal_wrapper'>
      {modal}
    </div>
  );
}

export default DagDefineModal;
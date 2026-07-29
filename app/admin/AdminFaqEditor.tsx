"use client";

type FaqRow={question:string;answer:string};

function parseFaq(value:string):FaqRow[]{
  const rows=value.split("\n").filter(Boolean).map(line=>{
    const splitAt=line.indexOf("|");
    return splitAt<0
      ?{question:line.trim(),answer:""}
      :{question:line.slice(0,splitAt).trim(),answer:line.slice(splitAt+1).trim()};
  });
  return rows.length?rows:[{question:"",answer:""}];
}

function serializeFaq(rows:FaqRow[]){
  return rows.map(row=>`${row.question.replace(/[|\r\n]+/g," ").trim()}|${row.answer.replace(/[|\r\n]+/g," ").trim()}`).join("\n");
}

export default function AdminFaqEditor({value,onChange,onSave,saveLabel}:{value:string;onChange:(value:string)=>void;onSave:()=>void;saveLabel:string}){
  const rows=parseFaq(value);
  function update(index:number,field:keyof FaqRow,nextValue:string){
    onChange(serializeFaq(rows.map((row,i)=>i===index?{...row,[field]:nextValue}:row)));
  }
  function move(index:number,direction:-1|1){
    const target=index+direction;
    if(target<0||target>=rows.length)return;
    const next=[...rows];
    [next[index],next[target]]=[next[target],next[index]];
    onChange(serializeFaq(next));
  }
  function remove(index:number){
    const next=rows.filter((_,i)=>i!==index);
    onChange(serializeFaq(next.length?next:[{question:"",answer:""}]));
  }
  function add(){
    onChange(serializeFaq([...rows,{question:"",answer:""}]));
  }
  const completed=rows.filter(row=>row.question.trim()||row.answer.trim());
  return <div className="smart-faq-editor">
    <div className="smart-faq-toolbar"><div><b>FAQ questions</b><span>Add, arrange and edit each question separately.</span></div><span>{completed.length} questions</span></div>
    <div className="smart-faq-list">{rows.map((row,index)=><article className="smart-faq-row" key={index}>
      <div className="smart-faq-row-head"><b>FAQ {String(index+1).padStart(2,"0")}</b><div><button disabled={index===0} onClick={()=>move(index,-1)} title="Move up">↑</button><button disabled={index===rows.length-1} onClick={()=>move(index,1)} title="Move down">↓</button><button className="faq-delete" onClick={()=>remove(index)}>Delete</button></div></div>
      <label><span>Question</span><input value={row.question} onChange={e=>update(index,"question",e.target.value)} placeholder="Write the customer question"/></label>
      <label><span>Answer</span><textarea value={row.answer} onChange={e=>update(index,"answer",e.target.value)} placeholder="Write a clear, helpful answer"/></label>
    </article>)}</div>
    <div className="smart-faq-actions"><button className="add-row-button" onClick={add}>+ Add another FAQ</button><button className="publish-product" onClick={onSave}>{saveLabel}</button></div>
    {completed.length>0&&<div className="faq-admin-preview"><div className="faq-preview-title"><div><span>Live storefront preview</span><h3>Frequently asked questions</h3></div><span>{completed.length} items</span></div>{completed.map((row,i)=><details open={i===0} key={i}><summary>{row.question||"Question not added yet"}</summary><p>{row.answer||"Answer not added yet."}</p></details>)}</div>}
  </div>
}

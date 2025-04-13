import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const URL  = "http://192.168.1.3/"
  const [refresh , setRefresh] = useState(false)
  const [progress , setprogress] = useState(0)
  const [directoryList, setDirectoryList] = useState([0]);
  const [newFilename , setNewFilename] = useState('')

  async function getDirectoryList() {
    const response = await fetch(URL);
    const data = await response.json();
    console.log(data);
    setDirectoryList(data);
  }
  useEffect(() => {
    getDirectoryList();
  }, [refresh]);

  const handelChange = async (e)=> {
    const file  = e.target.files[0]
    const xhr = new XMLHttpRequest()
    xhr.open('POST' ,URL , true)
    xhr.setRequestHeader('filename' , file.name)
  
  xhr.addEventListener('load' ,(e)=> {
    console.log(xhr.response)
    setRefresh(!refresh)
  })
  xhr.upload.addEventListener('progress' , (e)=> {
    setprogress(((e.loaded / e.total) *100).toFixed(2))
  })
  xhr.send(file)
  
  }

  const handelDelete = async (filename)=> {
   const response = await  fetch(URL , {
      method:'DELETE',
     body : filename
    })
    setRefresh(!refresh)


    const data = await response.text()
    console.log(data);
  }

  const handelRename =(oldFilename)=> {
    setNewFilename(oldFilename)
  }

  const handelSave = async(oldFilename)=> {
   if(newFilename){
    const response = await  fetch(URL , {
      method:'PATCH',
     body : JSON.stringify({oldFilename , newFilename})
    })
    const data = await response.text()
    console.log(data);
    setNewFilename("")
    setRefresh(!refresh)

   }

  }
  return (
    <>
    <h1>My Drive</h1>
    <div  className="input-row">
     <label htmlFor="upload">Upload File: <p>Progress: {progress} %</p> </label>
    <input type="file" id="upload" onChange={handelChange} />
    
    </div >
    <div  className="input-row">
    <label htmlFor="rename">Rename:</label>
    <input type="text" id="rename" className="rename-input" onChange={(e)=>setNewFilename(e.target.value)} value={newFilename} />
    </div>
   
      <ol>
        {directoryList.map((item, index) => {
          return (
            <li key={index}>
              {item} <a href={`${URL}${item}?action=open`}>Preview</a>{" "}
              <a href={`${URL}${item}?action=download`}>
                Download
              </a>
              <button onClick={()=>handelRename(item)}>Rename</button>
              <button onClick={()=>handelSave(item)}>Save</button>
              <button onClick={()=> handelDelete(item)}>Delete</button>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default App;

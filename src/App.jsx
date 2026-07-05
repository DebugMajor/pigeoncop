import Camera from './components/Camera'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import DetectionLog from './components/DetectionLog'
import Footer from './components/Footer'
import StatusPanel from './components/StatusPanel'
import './App.css'
import { useState } from "react";

function App() {
  const [status, setStatus] = useState("offline");

  return (
    <>
      <Header />
      <Camera status={status} setStatus={setStatus} />
      <br />
      <ControlPanel status={status} setStatus={setStatus} />
      <div className="dashboard-grid">
        <DetectionLog />
        <StatusPanel />
      </div>
      <Footer />
    </>
  )
}



export default App

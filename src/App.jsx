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
  const [detections, setDetections] = useState([]);

  const handleDetection = (detection) => {
    setDetections(prevDetections => [
      ...prevDetections,
      detection
    ]);
  }

  return (
    <>
      <Header />
      <Camera status={status} setStatus={setStatus} onDetection={handleDetection} />
      <br />
      <ControlPanel status={status} setStatus={setStatus} />
      <div className="dashboard-grid">
        <DetectionLog detections={detections} />
        <StatusPanel />
      </div>
      <Footer />
    </>
  )
}



export default App

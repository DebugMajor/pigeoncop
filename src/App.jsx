import Camera from './components/Camera'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import DetectionLog from './components/DetectionLog'
import Footer from './components/Footer'
import StatusPanel from './components/StatusPanel'
import './App.css'


function App() {
  return (
    <>
      <Header />
      <Camera />
      <br />
      <ControlPanel />
      <div className="dashboard-grid">
        <DetectionLog />
        <StatusPanel />
      </div>
      <Footer />
    </>
  )
}



export default App

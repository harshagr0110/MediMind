import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Myprofile from './pages/Myprofile'
import MyAppointments from './pages/MyAppointments'
import About from './pages/About'
import Contact from './pages/Contact'
import Doctors from './pages/Doctors'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Verify from './pages/Verify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DiseasePrediction from './pages/DiseasePrediction'

function App() {
  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="toastify-custom"
      />
      <Navbar />
  
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 my-12">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/my-profile' element={<Myprofile />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='appointment/:docId' element={<Appointment />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/payment-success' element={<Verify />} />
          <Route path='/disease-prediction' element={<DiseasePrediction />} />
        </Routes> 

      </main>
      <Footer />
    </div>
  )
}

export default App

import { Route, Routes } from 'react-router-dom'
import SignIn from './Signin'
import Pickup from './Pickup'
import PickupDetails from './PickupDetails'

function App() {
  return (
    <Routes>
    <Route path="/" element={<SignIn />} />
    <Route path="/pickup" element={<Pickup />} />
    <Route path="/pickupdetails/:awbNumber" element={<PickupDetails />} />
  </Routes>  )
}

export default App
import { FC } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Live } from "./features/live/Live"
import { View } from "./features/view/View"

const App: FC = () => {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Live />} />
          <Route path="/view" element={<View />} />
          <Route
            path="*"
            element={<Live/>}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

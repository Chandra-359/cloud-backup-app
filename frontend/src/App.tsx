import { SignedIn, SignedOut } from "@clerk/clerk-react"
import Homepage from "./components/Homepage"
import Landing from "./components/Landing"

function App() {
  return (
    <header>
      <SignedOut>
        <Landing />
      </SignedOut>
      <SignedIn>
        <Homepage />
      </SignedIn>
    </header>
  )
}

export default App
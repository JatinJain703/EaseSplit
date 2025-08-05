import { Main} from "./Components/Main"
import { Dashboard } from "./Components/Dashboard"
import { Routes,Route } from "react-router-dom"
import { SignupandLogin } from "./Components/SignupLogin"
import { Friends } from "./Components/Friends"
import { Groups } from "./Components/Groups"
import { FriendDetail } from "./Components/FriendDetail"
import { Activity } from "./Components/Activity"
import { MyAcc } from "./Components/MyAcc"
import { GroupDetail } from "./Components/GroupDetail"
import { Friendtransac } from "./Components/Friendtransac"
import { Grouptransac } from "./Components/Grouptransac"
import { ErrorBoundary } from "./Components/ErrorBoundary"
export default function App()
{
  return (
    <>
       <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path="/SignupLogin" element={<SignupandLogin/>}/>
          <Route path="/Dashboard" element={<Dashboard/>}/>
          <Route path="/Friends" element={<Friends/>}/>
          <Route path="/Groups" element={<Groups/>}/>
          <Route path="/Activity" element={
            <ErrorBoundary>
            <Activity/>
            </ErrorBoundary>
            }/>
          <Route path="/MyAcc" element={<MyAcc/>}/>
           <Route path="/friend/:name" element={<FriendDetail />} />
           <Route path="/friend/:name/transactions" element={<Friendtransac />} />
           <Route path="/Group/:name" element={<GroupDetail />} />
           <Route path="/Group/:name/transactions" element={<Grouptransac />} />
       </Routes>
    </>
  )
}
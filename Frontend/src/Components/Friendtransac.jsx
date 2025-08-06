import { Header } from "./Header"
import { Footer } from "./Footer"
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import { TailSpin } from "react-loader-spinner";
export function Friendtransac() {
  const location = useLocation()
  const [friend, setfriend] = useState(location.state)
  const [Expenses, setExpenses] = useState([])
  const [Settlement, setSettlement] = useState([])
  const [expandedItems, setExpandedItems] = useState(new Set())
  const currentUserId = localStorage.getItem("userid")
  const [loading, setloading] = useState(true);
  async function fetchAct() {
    try {
      const response = await axios.get("https://easesplit.onrender.com/Friendtransac", {
        headers: {
          userid: localStorage.getItem("userid"),
          friendid: friend.userId,
        },
      })
      return response.data
    } catch (err) {
      console.log(err)
      return {
        expenses: [],
        settlements: [],
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAct()
      setExpenses((data.expenses || []).map((exp) => ({ ...exp, type: "expense" })))
      setSettlement((data.settlements || []).map((sett) => ({ ...sett, type: "settlement" })))
      setloading(false);
    }
    fetchData()
  }, [])

  const getUserName = (userId) => {
    if (userId === currentUserId) return "You"
    if (userId === friend.userId) return friend.name
    return "Unknown User"
  }

  const allActivities = [...Expenses, ...Settlement].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatAmount = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 flex justify-center px-4 py-6 overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col">
          <div className="bg-blue-100 px-6 py-4 border-b border-blue-200 rounded-t-2xl">
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-bold text-blue-800">{friend.name}</h2>
            </div>
          </div>
          {loading ? <div className="flex justify-center items-center flex-grow bg-white">
            <TailSpin
              height={80}
              width={80}
              color="#3b82f6"
              ariaLabel="loading-spinner"
              radius="0.5"
              visible={true}
            />
          </div> :
            <div className="flex-grow flex flex-col px-6 py-8 overflow-auto">
              <div className="space-y-6">
                {allActivities.length > 0 ? (
                  <div>
                    <div className="space-y-4">
                      {allActivities.map((item) => (
                        <div key={item._id}>
                          {item.type === "expense" ? (
                            <div>
                              <button
                                className="w-full text-left bg-white shadow-md p-4 rounded-xl border border-gray-200 hover:bg-blue-50 transition-all"
                                onClick={() => toggleExpanded(item._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-lg font-semibold text-blue-800">
                                      {getUserName(item.paidBy)} paid {formatAmount(item.amount)}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                                    <div className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</div>
                                  </div>
                                  <div className="text-blue-600">
                                    <svg
                                      className={`w-5 h-5 transition-transform ${expandedItems.has(item._id) ? "rotate-180" : ""
                                        }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </button>

                              {expandedItems.has(item._id) && (
                                <div className="mt-2 bg-blue-50 rounded-xl p-4 border border-blue-200">
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Expense Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Description:</span>
                                          <span className="font-medium text-gray-900">{item.description}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Paid by:</span>
                                          <span className="font-medium text-gray-900">{getUserName(item.paidBy)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Total:</span>
                                          <span className="font-medium text-gray-900">{formatAmount(item.amount)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Split Between</h4>
                                      <div className="space-y-2">
                                        {(item.splitBetween || []).map((split, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200"
                                          >
                                            <span className="text-sm text-gray-700">{getUserName(split.userId)}</span>
                                            <span className="text-sm font-medium text-blue-800">
                                              {formatAmount(split.share)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (

                            <div className="w-full text-left bg-white shadow-md p-4 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-lg font-semibold text-blue-800">Settlement</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {getUserName(item.from)} settled {formatAmount(item.amount)} with{" "}
                                    {getUserName(item.to)}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</div>
                                </div>
                                <div className="text-lg font-bold text-green-600">{formatAmount(item.amount)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">
                      No transactions found with {friend.name}. Your shared expenses and settlements will appear here!
                    </p>
                  </div>
                )}
              </div>
            </div>
          }
        </div>
      </main>
      <Footer />
    </div>
  )
}

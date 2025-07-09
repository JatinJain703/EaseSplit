
import { useState } from "react"

export function AddExpense({ onClose, onSubmit, title = "Add Expense", members = [] }) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paidBy, setPaidBy] = useState(localStorage.getItem("userid") || "")
  const [involved, setInvolved] = useState(members.map((m) => m.id))
  const [splitType, setSplitType] = useState("equal")
  const [shares, setShares] = useState({})

  const handleCheckboxChange = (id) => {
    if (involved.includes(id)) {
      setInvolved(involved.filter((uid) => uid !== id))
    } else {
      setInvolved([...involved, id])
    }
  }

  const handleShareChange = (id, value) => {
    setShares((prev) => ({ ...prev, [id]: Number(value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const split =
      splitType === "equal"
        ? involved.map((id) => ({ userId:id, share: +(amount / involved.length).toFixed(2) }))
        : involved.map((id) => ({ userId:id, share: shares[id] || 0 }))

    const payload = {
      paidBy,
      amount: Number(amount),
      description,
      splitBetween: split,
    }

    onSubmit(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200">
       
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-800">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹0.00"
                required
              />
            </div>

           
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Paid By</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                required
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner, Snacks"
                required
              />
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Involved Members</label>
              <div className="grid grid-cols-2 gap-3">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={involved.includes(member.id)}
                      onChange={() => handleCheckboxChange(member.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Split Type</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
                value={splitType}
                onChange={(e) => setSplitType(e.target.value)}
              >
                <option value="equal">Equally</option>
                <option value="unequal">Unequally</option>
              </select>
            </div>

            
            {splitType === "unequal" && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Share Per Member</label>
                <div className="space-y-3">
                  {involved.map((id) => {
                    const member = members.find((m) => m.id === id)
                    return (
                      <div key={id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <span className="w-32 text-gray-700 font-medium">{member?.name}</span>
                        <input
                          type="number"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                          value={shares[id] || ""}
                          onChange={(e) => handleShareChange(id, e.target.value)}
                          placeholder="₹0.00"
                          required
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

           
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


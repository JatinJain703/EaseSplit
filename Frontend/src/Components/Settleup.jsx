import { useState } from "react"

export function Settleup({ onClose, onSubmit, members, title = "Settle Up" }) {
  const currentUserId = localStorage.getItem("userid")
  const filteredMembers = members.filter((m) => m.id !== currentUserId)
  const [selectedMember, setSelectedMember] = useState("")
  const [amount, setAmount] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      to: selectedMember,
      amount: Number.parseFloat(amount),
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Settle Up With</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a member
                </option>
                {filteredMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            
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
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Settle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
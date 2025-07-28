import { useState } from "react"
import { useRecoilValue } from "recoil"
import { FriendsAtom } from "../atoms/atom"

export function Addgroup({ onsubmit, onclose }) {
  const Friends = useRecoilValue(FriendsAtom)
  const [name, setName] = useState("")
  const [selectedFriends, setSelectedFriends] = useState([])
  const [newMembers, setNewMembers] = useState([])

  const handleFriendSelect = (e) => {
    const selectedEmail = e.target.value
    if (selectedEmail && !selectedFriends.find((f) => f.email === selectedEmail)) {
      const friend = Friends.AllFriends.find((f) => f.email === selectedEmail)
      if (friend) {
        setSelectedFriends([...selectedFriends, { name: friend.name, email: friend.email }])
      }
    }
    e.target.value = "" 
  }

  const removeFriend = (emailToRemove) => {
    setSelectedFriends(selectedFriends.filter((f) => f.email !== emailToRemove))
  }

  const handleNewMemberChange = (index, field, value) => {
    const updated = [...newMembers]
    updated[index][field] = value
    setNewMembers(updated)
  }

  const addNewMemberField = () => {
    setNewMembers([...newMembers, { name: "", email: "" }])
  }

  const removeNewMemberField = (index) => {
    setNewMembers(newMembers.filter((_, i) => i !== index))
  }

  const handlesubmit = (e) => {
    e.preventDefault()

    
    const validNewMembers = newMembers.filter((member) => member.name.trim() && member.email.trim())

    
    const allMembers = [...selectedFriends, ...validNewMembers]

    const payload = {
      name,
      members: allMembers,
    }

    onsubmit(payload)
    onclose()
  }

  
  const availableFriends =
    Friends?.AllFriends?.filter((friend) => !selectedFriends.find((selected) => selected.email === friend.email)) || []

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-800">Add Group</h2>
            <button onClick={onclose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        
        <div className="px-6 py-6">
          <form onSubmit={handlesubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>

            
            {Friends?.AllFriends && Friends.AllFriends.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Add Existing Friends</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
                  onChange={handleFriendSelect}
                  value=""
                >
                  <option value="" disabled>
                    Select a friend to add
                  </option>
                  {availableFriends.map((friend, index) => (
                    <option key={index} value={friend.email}>
                      {friend.name} ({friend.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            
            {selectedFriends.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Friends</label>
                <div className="space-y-2">
                  {selectedFriends.map((friend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100"
                    >
                      <div>
                        <div className="text-sm font-medium text-blue-800">{friend.name}</div>
                        <div className="text-xs text-blue-600">{friend.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFriend(friend.email)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            <div className="text-center">
              <button
                type="button"
                onClick={addNewMemberField}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                + Add New Friend
              </button>
            </div>

            
            {newMembers.length > 0 && (
              <div>
                <div className="space-y-3">
                  {newMembers.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">New Friend {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeNewMemberField(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                          value={member.name}
                          onChange={(e) => handleNewMemberChange(index, "name", e.target.value)}
                          placeholder="Name"
                          required
                        />
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                          value={member.email}
                          onChange={(e) => handleNewMemberChange(index, "email", e.target.value)}
                          placeholder="Email"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {(selectedFriends.length > 0 || newMembers.length > 0) && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Group Members ({selectedFriends.length + newMembers.filter((m) => m.name.trim()).length}):
                </h4>
                <div className="space-y-1">
                  {selectedFriends.map((friend, index) => (
                    <div key={index} className="text-sm text-blue-800">
                      • {friend.name} ({friend.email})
                    </div>
                  ))}
                  {newMembers
                    .filter((m) => m.name.trim())
                    .map((member, index) => (
                      <div key={index} className="text-sm text-green-800">
                        • {member.name} {member.email && `(${member.email})`}{" "}
                        <span className="text-xs text-gray-500">(New)</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onclose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
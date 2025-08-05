import FullLogo from "../assets/FullLogo.jpg"

export function Header() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <img
                            src={FullLogo || "/placeholder.svg"}
                            alt="EaseSplit Logo"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover"
                        />
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            <span className="text-blue-600">Ease</span>
                            <span className="text-gray-800">Split</span>
                        </h1>
                    </div>

                </div>
            </div>
        </header>
    )
}

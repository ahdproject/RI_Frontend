import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex items-center
                    justify-center p-4">
      <div className="text-center max-w-md">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20
                        bg-gray-100 border border-gray-200 rounded-2xl mb-6">
          <FileQuestion size={36} className="text-gray-600" />
        </div>

        {/* Text */}
        <h1 className="text-6xl font-black text-amber-500 mb-3">
          404
        </h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or
          you do not have permission to access it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center
                        justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  )
}
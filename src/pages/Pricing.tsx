import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      description: 'Get daily credits to try basic features',
      price: 0,
      period: '/mo',
      billingNote: '',
      buttonText: 'Get Free',
      buttonStyle: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      limit: '100 compute units / day',
      features: [
        'Full access to real-time models',
        'Limited access to image, video, 3D, and lipsync models',
        'Limited access to image upscaling',
        'Limited access to LoRA training',
      ]
    },
    {
      name: 'Basic',
      description: 'Access our most popular features',
      price: 9,
      period: '/mo',
      billingNote: 'billed monthly',
      buttonText: 'Get Basic',
      buttonStyle: 'bg-black hover:bg-gray-800 text-white',
      limit: '5,000 compute units / month',
      heading: 'Everything in Free plus:',
      features: [
        'Commercial license',
        'Full access to image, 3D, and lipsync models',
        'Full access to LoRA training',
        'Upscale images up to 4k resolution',
        'Access to selected video models',
      ]
    },
    {
      name: 'Pro',
      description: 'Advanced features and discounts on compute units',
      price: 35,
      period: '/mo',
      billingNote: 'billed monthly',
      buttonText: 'Get Pro',
      buttonStyle: 'bg-black hover:bg-gray-800 text-white',
      limit: '20,000 compute units / month',
      heading: 'Everything in Basic plus:',
      features: [
        'Access to all video models',
        'Higher concurrency',
        'Full access to Krea Nodes and Apps',
        'Bulk discounts on extra compute units',
        'Early access to new features',
      ]
    },
    {
      name: 'Max',
      description: 'Full access with higher discounts on compute units',
      price: 105,
      period: '/mo',
      billingNote: 'billed monthly',
      buttonText: 'Get Max',
      buttonStyle: 'bg-black hover:bg-gray-800 text-white',
      limit: '60,000 compute units / month',
      heading: 'Everything in Pro plus:',
      features: [
        'Unlimited LoRA trainings',
        'Unlimited Concurrency',
        'Upscale videos and images to 22k resolution',
        'Unlimited relaxed generations on selected models',
        'High priority queues',
      ],
      slider: true
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          {/* Logo/Icon - Left */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/SharePointImageStudioLogo.png"
              alt="SharePoint Image Studio Logo"
              className="w-16 h-16 object-contain"
            />
            <span className="font-semibold text-gray-900">SharePoint Image Studio</span>
          </Link>

          {/* Navigation - Right */}
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Pricing</h1>
          <p className="text-gray-600 text-lg">See our plans for individuals, businesses, and enterprises.</p>
        </div>

        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            Monthly
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2">
            Yearly
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">-20% off</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ gridAutoRows: '1fr' }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{plan.description}</p>

                <div className="flex items-baseline mb-1">
                  <span className="text-4xl font-bold text-gray-900">USD {plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                <div className="h-4">
                  {plan.billingNote && (
                    <p className="text-xs text-gray-500">{plan.billingNote}</p>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <button className={`w-full py-3 rounded-full font-medium text-sm transition-colors mb-6 ${plan.buttonStyle}`}>
                {plan.buttonText} →
              </button>

              {/* Compute Units */}
              <div className="flex items-center gap-2 text-sm text-gray-900 mb-6 pb-6 border-b border-gray-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{plan.limit}</span>
              </div>

              {/* Slider for Max Plan - Fixed height for alignment */}
              <div className="mb-6" style={{ minHeight: plan.slider ? 'auto' : '0px' }}>
                {plan.slider && (
                  <>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>40k</span>
                      <span>60k</span>
                      <span>80k</span>
                      <span>100k</span>
                    </div>
                    <input
                      type="range"
                      min="40000"
                      max="100000"
                      defaultValue="60000"
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #000 0%, #000 33%, #e5e7eb 33%, #e5e7eb 100%)'
                      }}
                    />
                  </>
                )}
              </div>

              {/* Features - Grow to fill space */}
              <div className="flex-1">
                {plan.heading && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                    <span>{plan.heading}</span>
                  </div>
                )}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-gray-900 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* View All Features Link */}
              <button className="mt-6 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                View all features →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Layers, 
  Lock, 
  Sparkles, 
  Wrench 
} from 'lucide-react'

export interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}

interface StepItem {
  id: string
  number: string
  title: string
  badge: string
  subtitle: string
  icon: React.ReactNode
  instructions: string[]
  tip: string
}

const TUTORIAL_STEPS: StepItem[] = [
  {
    id: 'step-compatibility',
    number: '01',
    title: 'Inspect Your RO Tap Neck',
    badge: 'Compatibility & Prep',
    subtitle: 'Engineered for standard push-lever and spigot faucets.',
    icon: <Wrench className="w-8 h-8 text-blue-400" aria-hidden="true" />,
    instructions: [
      'Check that your RO faucet has a standard 12mm–18mm cylindrical neck and push-down lever (Kent, Aquaguard, Pureit, A.O. Smith, and universal units).',
      'Wipe the tap spigot and hinge dry to ensure optimal polymer grip.',
    ],
    tip: 'No plumbing tools, screwdrivers, or modifications required.',
  },
  {
    id: 'step-alignment',
    number: '02',
    title: 'Align the Contoured Collar',
    badge: 'Positioning',
    subtitle: 'Slide the ergonomic U-cradle directly under the lever.',
    icon: <Layers className="w-8 h-8 text-cyan-400" aria-hidden="true" />,
    instructions: [
      'Hold Presser with the curved ergonomic handle facing forward.',
      'Slide the open U-cradle over the tap neck directly beneath the push lever.',
      'Ensure the pressing paddle aligns squarely over the lever actuator.',
    ],
    tip: 'The smooth guide grooves ensure automatic self-centering.',
  },
  {
    id: 'step-locking',
    number: '03',
    title: 'Snap Retention Clips into Place',
    badge: 'Locking',
    subtitle: 'Listen for the reassuring tactile dual-click.',
    icon: <Lock className="w-8 h-8 text-yellow-400" aria-hidden="true" />,
    instructions: [
      'Gently push Presser forward until the retention arms snap around the tap body.',
      'Verify that the dual retention clips firmly clasp the faucet without wobbling.',
      'The silicone contact pads prevent scratching and eliminate vibration.',
    ],
    tip: 'Precision snap-fit provides rock-solid stability during continuous pours.',
  },
  {
    id: 'step-operation',
    number: '04',
    title: 'Engage Hands-Free Pouring',
    badge: 'Operation',
    subtitle: 'Press down to start continuous flow; flick to stop.',
    icon: <Droplets className="w-8 h-8 text-green-400" aria-hidden="true" />,
    instructions: [
      'Press down on the Presser paddle to hold the RO tap valve fully open.',
      'Walk away while filling large water pitchers, cooking pots, or tea kettles.',
      'Flick the quick-release lip upward with one finger to instantly stop flow.',
    ],
    tip: 'No more standing and pinching the tap for minutes at a time!',
  },
  {
    id: 'step-care',
    number: '05',
    title: 'Quick Release & Maintenance',
    badge: 'Care & Cleaning',
    subtitle: 'One-second removal; 100% dishwasher safe.',
    icon: <Sparkles className="w-8 h-8 text-purple-400" aria-hidden="true" />,
    instructions: [
      'Pull back gently on the release tab to unclip Presser whenever needed.',
      'Wash by hand under warm water or place in the top rack of your dishwasher.',
      'Molded from BPA-free, food-safe, UV-resistant recyclable polymer.',
    ],
    tip: 'Designed to last for years of daily kitchen and pantry use.',
  },
]

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  triggerRef,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = TUTORIAL_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Attach Presser"
      description="Interactive multi-step walkthrough for attaching Presser to standard RO water filter taps"
      triggerRef={triggerRef}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Step Progression Bar / Pills */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-1 sm:gap-2">
            {TUTORIAL_STEPS.map((step, idx) => {
              const isActive = idx === currentStepIndex
              const isCompleted = idx < currentStepIndex

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  aria-label={`Go to step ${step.number}: ${step.title}`}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isActive
                      ? 'w-8 sm:w-10 bg-white'
                      : isCompleted
                      ? 'w-3 sm:w-4 bg-neutral-500 hover:bg-neutral-400'
                      : 'w-2 sm:w-2.5 bg-neutral-800 hover:bg-neutral-700'
                  }`}
                />
              )
            })}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-neutral-400">
            Step {currentStep.number} of {TUTORIAL_STEPS.length}
          </span>
        </div>

        {/* Active Step Content */}
        <div 
          className="space-y-4"
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Header & Badge */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-800/80 border border-neutral-700/80 rounded-2xl shrink-0 flex items-center justify-center">
              {currentStep.icon}
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-300 bg-neutral-800 rounded-full border border-neutral-700">
                {currentStep.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentStep.title}
              </h3>
              <p className="text-sm sm:text-base text-neutral-400">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Bulleted Walkthrough Instructions */}
          <ul className="space-y-2.5 pt-2">
            {currentStep.instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-neutral-200">
                <span className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 text-xs font-bold text-white shrink-0">
                  {i + 1}
                </span>
                <span>{inst}</span>
              </li>
            ))}
          </ul>

          {/* Pro Tip Callout */}
          <div className="p-3.5 bg-neutral-800/40 border border-neutral-800 rounded-2xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-neutral-300">
              <span className="font-semibold text-white">Pro Tip: </span>
              {currentStep.tip}
            </p>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={isFirstStep}
            leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
            className={isFirstStep ? 'opacity-0 pointer-events-none' : ''}
          >
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {!isLastStep ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                leftIcon={<Check className="w-4 h-4" aria-hidden="true" />}
              >
                Got It!
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TutorialModal

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaCheck, FaMapMarkerAlt, FaBuilding, FaEuroSign, FaCog } from 'react-icons/fa';

interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  rent: number;
  utilities: number;
  population: number;
  traffic: number;
  isOccupied: boolean;
  lat?: number;
  lng?: number;
  suburb?: string;
  road?: string;
}

interface WizardData {
  location: Location;
  population: number;
  traffic: number;
  machineType: 'single' | 'kiosk';
  monthlyRent: number;
  monthlyUtilities: number;
  purchaseOption: 'buy' | 'lease';
  machineCost: number;
  monthlyLeaseCost: number;
}

interface VendingMachineWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: WizardData) => void;
  initialLocation: Location;
}

const VendingMachineWizard: React.FC<VendingMachineWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialLocation
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    location: initialLocation,
    population: initialLocation.population,
    traffic: initialLocation.traffic,
    machineType: 'single',
    monthlyRent: 0,
    monthlyUtilities: 0,
    purchaseOption: 'buy',
    machineCost: 8000, // Default: €8,000 for buying
    monthlyLeaseCost: 150, // Default: €150/month for leasing
  });

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(wizardData);
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.population > 0 && wizardData.traffic > 0;
      case 2:
        return wizardData.machineType !== null;
      case 3:
        return wizardData.monthlyRent > 0 && wizardData.monthlyUtilities >= 0;
      case 4:
        return wizardData.purchaseOption !== null && 
               (wizardData.purchaseOption === 'buy' ? wizardData.machineCost > 0 : wizardData.monthlyLeaseCost > 0);
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Setup Vending Machine Business</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= currentStep
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <FaCheck /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Location</span>
              <span>Machine Type</span>
              <span>Costs</span>
              <span>Purchase</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FaMapMarkerAlt className="text-blue-500 text-xl" />
                    <h3 className="text-xl font-semibold text-gray-800">Location Details</h3>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">{wizardData.location.name}</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {wizardData.location.suburb && (
                        <div>🏘️ {wizardData.location.suburb}</div>
                      )}
                      {wizardData.location.road && (
                        <div>🛣️ {wizardData.location.road}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Population
                      </label>
                      <input
                        type="number"
                        value={wizardData.population}
                        onChange={(e) => updateWizardData({ population: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter population"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Traffic (% of population passing by daily)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={wizardData.traffic}
                        onChange={(e) => updateWizardData({ traffic: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter traffic %"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FaBuilding className="text-green-500 text-xl" />
                    <h3 className="text-xl font-semibold text-gray-800">Machine Type</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => updateWizardData({ machineType: 'single' })}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        wizardData.machineType === 'single'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-3">🥤</div>
                      <h4 className="font-semibold text-lg mb-2">Single Machine</h4>
                      <p className="text-gray-600 text-sm">
                        One vending machine for snacks, drinks, or other products. Perfect for smaller locations.
                      </p>
                    </button>

                    <button
                      onClick={() => updateWizardData({ machineType: 'kiosk' })}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        wizardData.machineType === 'kiosk'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-3">🏪</div>
                      <h4 className="font-semibold text-lg mb-2">E-Kiosk</h4>
                      <p className="text-gray-600 text-sm">
                        Multiple machines in one location. Higher investment but better revenue potential.
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FaEuroSign className="text-yellow-500 text-xl" />
                    <h3 className="text-xl font-semibold text-gray-800">Monthly Costs</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rent (€)
                      </label>
                      <input
                        type="number"
                        value={wizardData.monthlyRent}
                        onChange={(e) => updateWizardData({ monthlyRent: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter monthly rent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Utilities (€)
                      </label>
                      <input
                        type="number"
                        value={wizardData.monthlyUtilities}
                        onChange={(e) => updateWizardData({ monthlyUtilities: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter monthly utilities"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Tip</h4>
                    <p className="text-blue-700 text-sm">
                      Rent and utilities are your main monthly expenses. Consider negotiating with property owners for better rates.
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FaCog className="text-purple-500 text-xl" />
                    <h3 className="text-xl font-semibold text-gray-800">Machine Purchase</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => updateWizardData({ purchaseOption: 'buy' })}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          wizardData.purchaseOption === 'buy'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">💰</div>
                        <h4 className="font-semibold">Buy Machine</h4>
                        <p className="text-sm text-gray-600">One-time purchase</p>
                      </button>

                      <button
                        onClick={() => updateWizardData({ purchaseOption: 'lease' })}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          wizardData.purchaseOption === 'lease'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">📅</div>
                        <h4 className="font-semibold">Lease Machine</h4>
                        <p className="text-sm text-gray-600">Monthly payments</p>
                      </button>
                    </div>

                    {wizardData.purchaseOption === 'buy' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Machine Cost (€)
                        </label>
                        <input
                          type="number"
                          value={wizardData.machineCost}
                          onChange={(e) => updateWizardData({ machineCost: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter machine cost"
                        />
                        <p className="text-xs text-gray-500 mt-1">Typical range: €5,000 - €12,000 per machine</p>
                      </div>
                    )}

                    {wizardData.purchaseOption === 'lease' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Lease Cost (€)
                        </label>
                        <input
                          type="number"
                          value={wizardData.monthlyLeaseCost}
                          onChange={(e) => updateWizardData({ monthlyLeaseCost: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter monthly lease cost"
                        />
                        <p className="text-xs text-gray-500 mt-1">Typical range: €100 - €200 per machine per month</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">📊 Business Summary</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>Location: {wizardData.location.name}</div>
                      <div>Population: {wizardData.population.toLocaleString()}</div>
                      <div>Traffic: {wizardData.traffic}%</div>
                      <div>Type: {wizardData.machineType === 'single' ? 'Single Machine' : 'E-Kiosk'}</div>
                      <div>Monthly Rent: €{wizardData.monthlyRent}</div>
                      <div>Monthly Utilities: €{wizardData.monthlyUtilities}</div>
                      <div>Purchase: {wizardData.purchaseOption === 'buy' ? `€${wizardData.machineCost}` : `€${wizardData.monthlyLeaseCost}/month`}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              <FaArrowLeft />
              <span>Previous</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  canProceed()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
                  canProceed()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaCheck />
                <span>Complete Setup</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VendingMachineWizard;

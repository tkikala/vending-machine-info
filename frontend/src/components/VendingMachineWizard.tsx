import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaCheck, FaMapMarkerAlt, FaBuilding, FaEuroSign, FaCog } from 'react-icons/fa';
import './VendingMachineWizard.css';

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
  businessType: 'single' | 'kiosk';
  monthlyRent: number;
  monthlyUtilities: number;
  deposit: number;
  purchaseOption: 'buy' | 'lease';
  machineCost: number;
  monthlyLeaseCost: number;
  machineQuantity: number;
}

interface VendingMachineWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: WizardData) => void;
  initialLocation: Location;
  darkMode?: boolean;
}

const VendingMachineWizard: React.FC<VendingMachineWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialLocation,
  darkMode = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    location: initialLocation,
    population: initialLocation.population,
    traffic: initialLocation.traffic,
    businessType: 'single',
    monthlyRent: 0,
    monthlyUtilities: 0,
    deposit: 0,
    purchaseOption: 'buy',
    machineCost: 8000, // Default: €8,000 for buying
    monthlyLeaseCost: 150, // Default: €150/month for leasing
    machineQuantity: 1, // Default: 1 machine
  });

  // Reset wizard state when it opens
  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData({
      location: initialLocation,
      population: initialLocation.population,
      traffic: initialLocation.traffic,
      businessType: 'single',
      monthlyRent: 0,
      monthlyUtilities: 0,
      deposit: 0,
      purchaseOption: 'buy',
      machineCost: 8000,
      monthlyLeaseCost: 150,
      machineQuantity: 1,
    });
  };

  // Reset wizard when it opens
  useEffect(() => {
    if (isOpen) {
      resetWizard();
    }
  }, [isOpen, initialLocation]);

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleBusinessTypeChange = (businessType: 'single' | 'kiosk') => {
    updateWizardData({ 
      businessType,
      machineQuantity: businessType === 'single' ? 1 : 4
    });
  };

  const nextStep = () => {
    if (currentStep < 5) {
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
    resetWizard(); // Reset wizard state after completion
    onClose();
  };

  const handleClose = () => {
    resetWizard(); // Reset wizard state when dismissed
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.population > 0 && wizardData.traffic > 0;
      case 2:
        return wizardData.businessType !== null;
      case 3:
        return wizardData.monthlyRent > 0 && wizardData.monthlyUtilities >= 0 && wizardData.deposit >= 0;
      case 4:
        return wizardData.purchaseOption !== null && 
               (wizardData.purchaseOption === 'buy' ? wizardData.machineCost > 0 : wizardData.monthlyLeaseCost > 0) &&
               wizardData.machineQuantity > 0;
      case 5:
        return true; // Review step, always can proceed
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
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`vending-wizard ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Setup Vending Machine Business</h2>
            <button
              onClick={handleClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-2xl transition-colors`}
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= currentStep
                        ? 'bg-purple-600 text-white'
                        : darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <FaCheck /> : step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step < currentStep ? 'bg-purple-600' : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Location</span>
              <span>Business Type</span>
              <span>Location Costs</span>
              <span>Machine Costs</span>
              <span>Review</span>
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
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Location Details</h3>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>{wizardData.location.name}</h4>
                    <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Population
                      </label>
                      <input
                        type="number"
                        value={wizardData.population}
                        onChange={(e) => updateWizardData({ population: Number(e.target.value) })}
                        onFocus={handleInputFocus}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="Enter population"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Traffic (% of population passing by daily)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={wizardData.traffic}
                        onChange={(e) => updateWizardData({ traffic: Number(e.target.value) })}
                        onFocus={handleInputFocus}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
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
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Business Type</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleBusinessTypeChange('single')}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        wizardData.businessType === 'single'
                          ? darkMode 
                            ? 'border-purple-500 bg-purple-900/30' 
                            : 'border-purple-500 bg-purple-50'
                          : darkMode 
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-3">🥤</div>
                      <h4 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Single Machine</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        One vending machine for snacks, drinks, or other products. Perfect for smaller locations.
                      </p>
                    </button>

                    <button
                      onClick={() => handleBusinessTypeChange('kiosk')}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        wizardData.businessType === 'kiosk'
                          ? darkMode 
                            ? 'border-purple-500 bg-purple-900/30' 
                            : 'border-purple-500 bg-purple-50'
                          : darkMode 
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-3">🏪</div>
                      <h4 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>E-Kiosk</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Location Costs</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Monthly Rent (€)
                      </label>
                      <input
                        type="number"
                        value={wizardData.monthlyRent}
                        onChange={(e) => updateWizardData({ monthlyRent: Number(e.target.value) })}
                        onFocus={handleInputFocus}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="Enter monthly rent"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Monthly Utilities (€)
                      </label>
                      <input
                        type="number"
                        value={wizardData.monthlyUtilities}
                        onChange={(e) => updateWizardData({ monthlyUtilities: Number(e.target.value) })}
                        onFocus={handleInputFocus}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="Enter monthly utilities"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Deposit (€)
                      </label>
                      <input
                        type="number"
                        value={wizardData.deposit}
                        onChange={(e) => updateWizardData({ deposit: Number(e.target.value) })}
                        onFocus={handleInputFocus}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="Enter deposit amount"
                      />
                    </div>
                  </div>

                  <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-4 rounded-lg`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>💡 Tip</h4>
                    <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                      Rent, utilities, and deposit are your main location expenses. Consider negotiating with property owners for better rates.
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
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Vending Machine Costs</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Number of Machines
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={wizardData.machineQuantity}
                        onChange={(e) => updateWizardData({ machineQuantity: Number(e.target.value) })}
                        onFocus={handleInputFocus}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="Enter number of machines"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => updateWizardData({ purchaseOption: 'buy' })}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          wizardData.purchaseOption === 'buy'
                            ? darkMode 
                              ? 'border-purple-500 bg-purple-900/30' 
                              : 'border-purple-500 bg-purple-50'
                            : darkMode 
                              ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">💰</div>
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Buy Machine</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>One-time purchase</p>
                      </button>

                      <button
                        onClick={() => updateWizardData({ purchaseOption: 'lease' })}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          wizardData.purchaseOption === 'lease'
                            ? darkMode 
                              ? 'border-purple-500 bg-purple-900/30' 
                              : 'border-purple-500 bg-purple-50'
                            : darkMode 
                              ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">📅</div>
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Lease Machine</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monthly payments</p>
                      </button>
                    </div>

                    {wizardData.purchaseOption === 'buy' && (
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Machine Cost per Unit (€)
                        </label>
                        <input
                          type="number"
                          value={wizardData.machineCost}
                          onChange={(e) => updateWizardData({ machineCost: Number(e.target.value) })}
                          onFocus={handleInputFocus}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-800'
                          }`}
                          placeholder="Enter machine cost per unit"
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Typical range: €5,000 - €12,000 per machine</p>
                        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Total Cost: €{(wizardData.machineCost * wizardData.machineQuantity).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {wizardData.purchaseOption === 'lease' && (
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Monthly Lease Cost per Unit (€)
                        </label>
                        <input
                          type="number"
                          value={wizardData.monthlyLeaseCost}
                          onChange={(e) => updateWizardData({ monthlyLeaseCost: Number(e.target.value) })}
                          onFocus={handleInputFocus}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-800'
                          }`}
                          placeholder="Enter monthly lease cost per unit"
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Typical range: €100 - €200 per machine per month</p>
                        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Total Monthly Cost: €{(wizardData.monthlyLeaseCost * wizardData.machineQuantity).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FaCheck className="text-green-500 text-xl" />
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Review & Complete</h3>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg`}>
                    <h4 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Business Setup Summary</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Location Details */}
                      <div>
                        <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>📍 Location</h5>
                        <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div>{wizardData.location.name}</div>
                          {wizardData.location.suburb && <div>🏘️ {wizardData.location.suburb}</div>}
                          {wizardData.location.road && <div>🛣️ {wizardData.location.road}</div>}
                          <div>👥 Population: {wizardData.population.toLocaleString()}</div>
                          <div>🚶 Traffic: {wizardData.traffic}%</div>
                        </div>
                      </div>

                      {/* Business Type */}
                      <div>
                        <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>🏢 Business Type</h5>
                        <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div>{wizardData.businessType === 'single' ? '🥤 Single Machine' : '🏪 E-Kiosk'}</div>
                          <div>🔢 Machines: {wizardData.machineQuantity}</div>
                        </div>
                      </div>

                      {/* Location Costs */}
                      <div>
                        <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>💰 Location Costs</h5>
                        <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div>🏠 Monthly Rent: €{wizardData.monthlyRent}</div>
                          <div>⚡ Monthly Utilities: €{wizardData.monthlyUtilities}</div>
                          <div>🔒 Deposit: €{wizardData.deposit}</div>
                        </div>
                      </div>

                      {/* Machine Costs */}
                      <div>
                        <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>🤖 Machine Costs</h5>
                        <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div>📋 Option: {wizardData.purchaseOption === 'buy' ? 'Buy' : 'Lease'}</div>
                          {wizardData.purchaseOption === 'buy' ? (
                            <div>💵 Total Cost: €{(wizardData.machineCost * wizardData.machineQuantity).toLocaleString()}</div>
                          ) : (
                            <div>📅 Monthly Cost: €{(wizardData.monthlyLeaseCost * wizardData.machineQuantity).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Investment */}
                    <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                      <h5 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>💼 Total Investment</h5>
                      <div className={`text-sm space-y-1 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                        <div>🔒 Deposit: €{wizardData.deposit}</div>
                        {wizardData.purchaseOption === 'buy' && (
                          <div>🤖 Machines: €{(wizardData.machineCost * wizardData.machineQuantity).toLocaleString()}</div>
                        )}
                        <div className={`font-semibold pt-2 border-t ${darkMode ? 'border-purple-700' : 'border-purple-200'}`}>
                          Total: €{wizardData.deposit + (wizardData.purchaseOption === 'buy' ? wizardData.machineCost * wizardData.machineQuantity : 0)}
                        </div>
                      </div>
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
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentStep === 1
                  ? darkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              <FaArrowLeft />
              <span>Previous</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  canProceed()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : darkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  canProceed()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : darkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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

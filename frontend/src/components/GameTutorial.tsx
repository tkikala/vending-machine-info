import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaCoins, FaChartLine, FaPlay, FaPause, FaUndo, FaTimes } from 'react-icons/fa';
import { MdLocationOn, MdAttachMoney, MdInventory } from 'react-icons/md';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  action?: string;
}

const GameTutorial: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Vending Tycoon! 🎮",
      description: "Build your vending machine empire from scratch. Start with $10,000 and grow your business by placing machines in strategic locations.",
      icon: "🎯"
    },
    {
      id: 2,
      title: "Choose Your Locations",
      description: "Click on any location marker on the map to see details. Each location has different rent, utilities, population, and traffic levels that affect your profits.",
      icon: "📍"
    },
    {
      id: 3,
      title: "Place Your Machines",
      description: "Each vending machine costs $3,000. Choose locations with high population and traffic for maximum revenue. You can only place one machine per location.",
      icon: "🥤"
    },
    {
      id: 4,
      title: "Monitor Your Business",
      description: "Watch your revenue, costs, and profits in real-time. The game simulates customer behavior based on location factors and product demand.",
      icon: "📊"
    },
    {
      id: 5,
      title: "Control Game Speed",
      description: "Use the pause/play button and speed controls to manage your game. Speed up time to see long-term results or slow down to make strategic decisions.",
      icon: "⏱️"
    },
    {
      id: 6,
      title: "Track Performance",
      description: "Click on your machines to see detailed analytics including revenue, costs, customer count, and product inventory levels.",
      icon: "📈"
    },
    {
      id: 7,
      title: "Ready to Start!",
      description: "You're all set! Start by placing your first vending machine and watch your business grow. Good luck, tycoon!",
      icon: "🚀"
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Tutorial Content */}
        <div className="text-center mb-8">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-6xl mb-4"
          >
            {currentTutorial.icon}
          </motion.div>
          
          <motion.h2
            key={`title-${currentStep}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-2xl font-bold text-gray-800 mb-4"
          >
            {currentTutorial.title}
          </motion.h2>
          
          <motion.p
            key={`desc-${currentStep}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-gray-600 text-lg leading-relaxed"
          >
            {currentTutorial.description}
          </motion.p>
        </div>

        {/* Game Controls Preview */}
        {currentStep === 4 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-50 rounded-xl p-6 mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Game Controls:</h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-blue-500 text-white">
                  <FaPlay />
                </button>
                <span className="text-sm text-gray-600">Play/Pause</span>
              </div>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>1x</option>
                  <option>2x</option>
                  <option>5x</option>
                </select>
                <span className="text-sm text-gray-600">Speed</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-red-500 text-white">
                  <FaUndo />
                </button>
                <span className="text-sm text-gray-600">Reset</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Location Preview */}
        {currentStep === 1 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6 mb-6 relative h-32"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FaMapMarkerAlt className="text-4xl text-blue-600 mx-auto mb-2" />
                <div className="bg-white px-3 py-1 rounded text-sm font-medium shadow-lg">
                  University Campus
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Preview */}
        {currentStep === 3 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-50 rounded-xl p-6 mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Business Stats:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$0</div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$0</div>
                <div className="text-sm text-gray-600">Profit</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Start Game!' : 'Next'}
          </button>
        </div>

        {/* Skip Tutorial */}
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Skip tutorial
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameTutorial;

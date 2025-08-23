import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaCoins, FaChartLine, FaCog, FaPlay, FaPause, FaUndo, FaQuestionCircle } from 'react-icons/fa';
import RealBavariaMap from './RealBavariaMap';
import { MdLocationOn, MdAttachMoney, MdInventory, MdSpeed } from 'react-icons/md';
import GameTutorial from './GameTutorial';

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
  machineId?: string;
}

interface VendingMachine {
  id: string;
  locationId: string;
  products: Product[];
  revenue: number;
  costs: number;
  profit: number;
  customerCount: number;
  satisfaction: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  demand: number;
}

interface GameState {
  money: number;
  day: number;
  isPaused: boolean;
  locations: Location[];
  machines: VendingMachine[];
  selectedLocation?: Location;
  selectedMachine?: VendingMachine;
  gameSpeed: number;
}

const VendingGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    money: 10000,
    day: 1,
    isPaused: false,
    gameSpeed: 1,
    locations: [
      { id: '1', name: 'München Universität', x: 25, y: 30, rent: 800, utilities: 200, population: 15000, traffic: 85, isOccupied: false },
      { id: '2', name: 'Olympia Einkaufszentrum', x: 45, y: 35, rent: 1200, utilities: 300, population: 8000, traffic: 90, isOccupied: false },
      { id: '3', name: 'BMW Headquarters', x: 65, y: 40, rent: 600, utilities: 150, population: 5000, traffic: 75, isOccupied: false },
      { id: '4', name: 'Klinikum Großhadern', x: 75, y: 50, rent: 1000, utilities: 250, population: 3000, traffic: 80, isOccupied: false },
      { id: '5', name: 'Aral Tankstelle', x: 60, y: 70, rent: 400, utilities: 100, population: 2000, traffic: 70, isOccupied: false },
    ],
    machines: [],
  });

  const [darkMode, setDarkMode] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Game loop
  useEffect(() => {
    if (gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev };
        
        // Process each machine
        newState.machines.forEach(machine => {
          const location = newState.locations.find(l => l.id === machine.locationId);
          if (!location) return;

          // Calculate daily revenue based on location factors
          const baseCustomers = Math.floor(location.population * 0.01 * (location.traffic / 100));
          const dailyCustomers = Math.floor(baseCustomers * (0.8 + Math.random() * 0.4));
          
          let dailyRevenue = 0;
          let totalSales = 0;
          
          machine.products.forEach(product => {
            // Restock products if they're running low
            if (product.stock < 10) {
              product.stock = Math.max(product.stock, 50);
            }
            
            const sales = Math.min(dailyCustomers, product.stock);
            dailyRevenue += sales * product.price;
            totalSales += sales;
            product.stock = Math.max(0, product.stock - sales);
          });

          machine.revenue += dailyRevenue;
          machine.customerCount += totalSales;
        });

        // Add daily costs and calculate profit
        newState.machines.forEach(machine => {
          const location = newState.locations.find(l => l.id === machine.locationId);
          if (location) {
            machine.costs += (location.rent + location.utilities) / 30; // Daily costs
            machine.profit = machine.revenue - machine.costs;
          }
        });

        newState.day += 1;
        return newState;
      });
    }, 1000 / gameState.gameSpeed);

    return () => clearInterval(interval);
  }, [gameState.isPaused, gameState.gameSpeed]);

  const placeMachine = useCallback((locationId: string) => {
    const machineCost = 3000;
    if (gameState.money < machineCost) return;

    const newMachine: VendingMachine = {
      id: `machine-${Date.now()}`,
      locationId,
      products: [
        { id: '1', name: 'Coca Cola', price: 2.50, cost: 1.20, stock: 50, demand: 0.8 },
        { id: '2', name: 'Snickers', price: 1.50, cost: 0.80, stock: 30, demand: 0.6 },
        { id: '3', name: 'Water', price: 1.00, cost: 0.30, stock: 40, demand: 0.9 },
        { id: '4', name: 'Chips', price: 2.00, cost: 1.00, stock: 25, demand: 0.7 },
      ],
      revenue: 0,
      costs: 0,
      profit: 0,
      customerCount: 0,
      satisfaction: 0.8,
    };

    setGameState(prev => ({
      ...prev,
      money: prev.money - machineCost,
      machines: [...prev.machines, newMachine],
      locations: prev.locations.map(loc => 
        loc.id === locationId ? { ...loc, isOccupied: true, machineId: newMachine.id } : loc
      ),
    }));
  }, [gameState.money]);

  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const changeSpeed = (speed: number) => {
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const resetGame = () => {
    setGameState({
      money: 10000,
      day: 1,
      isPaused: false,
      gameSpeed: 1,
      locations: [
        { id: '1', name: 'München Universität', x: 25, y: 30, rent: 800, utilities: 200, population: 15000, traffic: 85, isOccupied: false },
        { id: '2', name: 'Olympia Einkaufszentrum', x: 45, y: 35, rent: 1200, utilities: 300, population: 8000, traffic: 90, isOccupied: false },
        { id: '3', name: 'BMW Headquarters', x: 65, y: 40, rent: 600, utilities: 150, population: 5000, traffic: 75, isOccupied: false },
        { id: '4', name: 'Klinikum Großhadern', x: 75, y: 50, rent: 1000, utilities: 250, population: 3000, traffic: 80, isOccupied: false },
        { id: '5', name: 'Aral Tankstelle', x: 60, y: 70, rent: 400, utilities: 100, population: 2000, traffic: 70, isOccupied: false },
      ],
      machines: [],
    });
  };

  const cashOut = () => {
    const totalProfit = gameState.machines.reduce((sum, m) => sum + m.profit, 0);
    if (totalProfit > 0) {
      setGameState(prev => ({
        ...prev,
        money: prev.money + totalProfit,
        machines: prev.machines.map(machine => ({
          ...machine,
          revenue: 0,
          costs: 0,
          profit: 0,
        }))
      }));
    }
  };

  const totalRevenue = gameState.machines.reduce((sum, m) => sum + m.revenue, 0);
  const totalProfit = gameState.machines.reduce((sum, m) => sum + m.profit, 0);

    return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border-b transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🎮 Vending Tycoon</div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Day {gameState.day}</div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FaCoins className="text-yellow-500 text-xl" />
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>€{gameState.money.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-green-500 text-xl" />
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>€{totalProfit.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  title="Toggle Dark Mode"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                
                <button
                  onClick={() => setShowTutorial(true)}
                  className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  title="Show Tutorial"
                >
                  <FaQuestionCircle />
                </button>
                
                <button
                  onClick={togglePause}
                  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  {gameState.isPaused ? <FaPlay /> : <FaPause />}
                </button>
                
                <select
                  value={gameState.gameSpeed}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeSpeed(Number(e.target.value))}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={5}>5x</option>
                </select>
                
                                 <button
                   onClick={cashOut}
                   disabled={totalProfit <= 0}
                   className={`p-2 rounded-lg transition-colors ${
                     totalProfit > 0 
                       ? 'bg-green-500 text-white hover:bg-green-600' 
                       : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                   }`}
                   title="Cash Out Profits"
                 >
                   💰
                 </button>
                 
                 <button
                   onClick={resetGame}
                   className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                 >
                   <FaUndo />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl p-6 border transition-colors duration-300`}
            >
              <h2 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <MdLocationOn className="mr-2 text-blue-500" />
                Bayern Map
              </h2>
              
              <RealBavariaMap
                locations={gameState.locations}
                darkMode={darkMode}
                onLocationClick={(location) => {
                  setGameState(prev => ({ ...prev, selectedLocation: location }));
                  setShowLocationModal(true);
                }}
              />
            </motion.div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl p-6 border transition-colors duration-300`}
            >
              <h3 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <MdAttachMoney className="mr-2 text-green-500" />
                Business Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Machines</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{gameState.machines.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Revenue</span>
                  <span className="font-semibold text-green-500">€{totalRevenue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Profit</span>
                  <span className="font-semibold text-blue-500">€{totalProfit.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Customers Served</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {gameState.machines.reduce((sum, m) => sum + m.customerCount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Machines List */}
            {gameState.machines.length > 0 && (
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl p-6 border transition-colors duration-300`}
              >
                <h3 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <MdInventory className="mr-2 text-purple-500" />
                  Your Machines
                </h3>
                
                <div className="space-y-3">
                  {gameState.machines.map((machine) => {
                    const location = gameState.locations.find(l => l.id === machine.locationId);
                    return (
                      <motion.div
                        key={machine.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 rounded-lg cursor-pointer border transition-colors duration-300 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setGameState(prev => ({ ...prev, selectedMachine: machine }));
                          setShowMachineModal(true);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{location?.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>€{machine.profit.toFixed(0)} profit</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-500">€{machine.revenue.toFixed(0)}</div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{machine.customerCount} customers</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && gameState.selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
            onClick={() => setShowLocationModal(false)}
          >
                         <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors duration-300`}
               onClick={(e: React.MouseEvent) => e.stopPropagation()}
             >
               <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{gameState.selectedLocation.name}</h3>
               
               <div className="space-y-3 mb-6">
                 <div className="flex justify-between">
                   <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Monthly Rent</span>
                   <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>€{gameState.selectedLocation.rent}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Utilities</span>
                   <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>€{gameState.selectedLocation.utilities}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Population</span>
                   <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{gameState.selectedLocation.population.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Traffic</span>
                   <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{gameState.selectedLocation.traffic}%</span>
                 </div>
               </div>
              
                             {gameState.selectedLocation.isOccupied ? (
                 <div className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   <div className="text-lg font-semibold text-green-500 mb-2">✓ Machine Placed</div>
                   <div className="text-sm">This location is already occupied</div>
                 </div>
               ) : (
                 <div className="space-y-3">
                   <div className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                     <div className="text-lg font-semibold mb-2">Place Vending Machine</div>
                     <div className="text-sm">Cost: €3,000</div>
                   </div>
                   
                   <button
                     onClick={() => {
                       placeMachine(gameState.selectedLocation!.id);
                       setShowLocationModal(false);
                     }}
                     disabled={gameState.money < 3000}
                     className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                   >
                     {gameState.money < 3000 ? 'Not Enough Money' : 'Place Machine'}
                   </button>
                 </div>
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

             {/* Machine Modal */}
       <AnimatePresence>
                 {showMachineModal && gameState.selectedMachine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
            onClick={() => setShowMachineModal(false)}
          >
                          <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto transition-colors duration-300`}
               onClick={(e: React.MouseEvent) => e.stopPropagation()}
             >
               <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Machine Details</h3>
               
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-3 rounded-lg`}>
                     <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Revenue</div>
                     <div className="text-lg font-semibold text-green-500">€{gameState.selectedMachine.revenue.toFixed(0)}</div>
                   </div>
                   <div className={`${darkMode ? 'bg-red-900/30' : 'bg-red-50'} p-3 rounded-lg`}>
                     <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Costs</div>
                     <div className="text-lg font-semibold text-red-500">€{gameState.selectedMachine.costs.toFixed(0)}</div>
                   </div>
                   <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} p-3 rounded-lg`}>
                     <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Profit</div>
                     <div className="text-lg font-semibold text-blue-500">€{gameState.selectedMachine.profit.toFixed(0)}</div>
                   </div>
                   <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} p-3 rounded-lg`}>
                     <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customers</div>
                     <div className="text-lg font-semibold text-purple-500">{gameState.selectedMachine.customerCount}</div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Products</h4>
                   <div className="space-y-2">
                     {gameState.selectedMachine.products.map((product) => (
                       <div key={product.id} className={`flex justify-between items-center p-2 rounded ${
                         darkMode ? 'bg-gray-700' : 'bg-gray-50'
                       }`}>
                         <div>
                           <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{product.name}</div>
                           <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stock: {product.stock}</div>
                         </div>
                         <div className="text-right">
                           <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>€{product.price}</div>
                           <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>€{product.cost} cost</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </motion.div>
          </motion.div>
                 )}
       </AnimatePresence>

       {/* Tutorial Modal */}
       <AnimatePresence>
         {showTutorial && (
           <GameTutorial onClose={() => setShowTutorial(false)} />
         )}
       </AnimatePresence>
     </div>
   );
 };

export default VendingGame;

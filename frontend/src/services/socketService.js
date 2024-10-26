// src/services/socketService.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const useCabLocations = () => {
  const [cabs, setCabs] = useState([]);

  useEffect(() => {
    const handleCabLocations = (updatedCabs) => {
      console.log('Received updated cab locations:', updatedCabs);
      setCabs(updatedCabs);
    };

    socket.on('cabLocations', handleCabLocations);

    return () => {
      socket.off('cabLocations', handleCabLocations);
      console.log('Cleanup: Removed cab location listener');
    };
  }, []);

  return cabs;
};

export default useCabLocations;

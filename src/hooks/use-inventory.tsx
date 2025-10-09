
'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Chemical, Equipment, LabLog } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';

let logIdCounter = 0;
const getUniqueLogId = () => {
    return `${Date.now()}-${logIdCounter++}`;
};

type InventoryContextType = {
    inventoryChemicals: Chemical[];
    inventoryEquipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[];
    labLogs: LabLog[];
    safetyGogglesOn: boolean;
    heldItem: Chemical | null;
    setSafetyGogglesOn: (on: boolean) => void;
    handleAddChemicalToInventory: (chemical: Chemical) => void;
    handleAddEquipmentToInventory: (equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => void;
    handleResetExperiment: () => void;
    handlePickUpChemical: (chemical: Chemical) => void;
    handleClearHeldItem: () => void;
    addLog: (text: string, isCustom?: boolean) => void;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// A lightweight provider for managing inventory and logs across all lab pages.
export function InventoryProvider({ children }: { children: React.ReactNode }) {
    const [inventoryChemicals, setInventoryChemicals] = useState<Chemical[]>([]);
    const [inventoryEquipment, setInventoryEquipment] = useState<Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[]>([]);
    const [labLogs, setLabLogs] = useState<LabLog[]>([]);
    const [safetyGogglesOn, setSafetyGogglesOn] = useState(true);
    const [heldItem, setHeldItem] = useState<Chemical | null>(null);
    const { toast } = useToast();

    const addLog = useCallback((text: string, isCustom: boolean = false) => {
        const newLog: LabLog = {
          id: getUniqueLogId(),
          timestamp: new Date().toISOString(),
          text,
          isCustom,
        };
        setLabLogs(prevLogs => [...prevLogs, newLog]);
    }, []);

    const handleAddChemicalToInventory = useCallback((chemical: Chemical) => {
        setInventoryChemicals(prev => {
            if (prev.some((c) => c.id === chemical.id)) {
                return prev;
            }
            addLog(`Added ${chemical.name} to inventory.`);
            return [...prev, chemical];
        });
    }, [addLog]);

    const handleAddEquipmentToInventory = useCallback((equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => {
        setInventoryEquipment(prev => {
            if (prev.some((e) => e.id === equipment.id)) {
              return prev;
            }
            addLog(`Added ${equipment.name} to inventory.`);
            return [...prev, equipment];
        });
    }, [addLog]);

    const handleResetExperiment = useCallback(() => {
        setInventoryChemicals([]);
        setInventoryEquipment([]);
        setLabLogs([]);
        setHeldItem(null);
        localStorage.removeItem('atomican_inventory_chemicals');
        localStorage.removeItem('atomican_inventory_equipment');
        localStorage.removeItem('atomican_lab_logs');
        addLog('Global inventory and logs have been reset.');
        window.dispatchEvent(new Event('reset-workbench'));
    }, [addLog]);

    const handlePickUpChemical = useCallback((chemical: Chemical) => {
        setHeldItem(chemical);
    }, []);

    const handleClearHeldItem = useCallback(() => {
        setHeldItem(null);
    }, []);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedChemicals = localStorage.getItem('atomican_inventory_chemicals');
            const savedEquipment = localStorage.getItem('atomican_inventory_equipment');
            const savedLogs = localStorage.getItem('atomican_lab_logs');
            if (savedChemicals) setInventoryChemicals(JSON.parse(savedChemicals));
            if (savedEquipment) setInventoryEquipment(JSON.parse(savedEquipment));
            if (savedLogs) setLabLogs(JSON.parse(savedLogs));
        } catch (e) {
            console.error("Failed to load from local storage", e);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem('atomican_inventory_chemicals', JSON.stringify(inventoryChemicals));
            localStorage.setItem('atomican_inventory_equipment', JSON.stringify(inventoryEquipment));
            localStorage.setItem('atomican_lab_logs', JSON.stringify(labLogs));
        } catch (e) {
            console.error("Failed to save to local storage", e);
        }
    }, [inventoryChemicals, inventoryEquipment, labLogs]);


    const value = useMemo(() => ({
        inventoryChemicals,
        inventoryEquipment,
        labLogs,
        safetyGogglesOn,
        heldItem,
        setSafetyGogglesOn,
        handleAddChemicalToInventory,
        handleAddEquipmentToInventory,
        addLog,
        handleResetExperiment,
        handlePickUpChemical,
        handleClearHeldItem,
    }), [
        inventoryChemicals,
        inventoryEquipment,
        labLogs,
        safetyGogglesOn,
        heldItem,
        addLog,
        handleAddChemicalToInventory,
        handleAddEquipmentToInventory,
        handleResetExperiment,
        handlePickUpChemical,
        handleClearHeldItem,
    ]);

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
}

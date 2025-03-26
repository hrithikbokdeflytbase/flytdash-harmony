
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Zap, BellRing, CheckSquare, Search, Target, Route } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Mock data for drones
const DRONES = [
  { value: 'drone-1', label: 'Drone 1' },
  { value: 'drone-2', label: 'Drone 2' },
  { value: 'drone-3', label: 'Drone 3' },
  { value: 'drone-4', label: 'Drone 4' },
  { value: 'drone-5', label: 'Drone 5' },
];

interface AdvancedFiltersProps {
  triggerType: string;
  setTriggerType: (value: string) => void;
  selectedDrones: string[];
  setSelectedDrones: (drones: string[]) => void;
  isLoading?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  triggerType,
  setTriggerType,
  selectedDrones,
  setSelectedDrones,
  isLoading = false
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSelectDrone = (value: string) => {
    if (selectedDrones.includes(value)) {
      setSelectedDrones(selectedDrones.filter(drone => drone !== value));
    } else {
      setSelectedDrones([...selectedDrones, value]);
    }
  };

  const handleSelectAllDrones = () => {
    if (selectedDrones.length === DRONES.length) {
      setSelectedDrones([]);
    } else {
      setSelectedDrones(DRONES.map(drone => drone.value));
    }
  };

  return (
    <div className="p-400 space-y-400 bg-background-level-4 rounded-b-xl border-t border-outline-primary transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-400">
        <div className="space-y-200">
          <Label htmlFor="trigger-type" className="text-sm text-text-icon-02 block">Trigger Type</Label>
          <Select value={triggerType} onValueChange={setTriggerType} disabled={isLoading}>
            <SelectTrigger 
              id="trigger-type" 
              className="w-full bg-background-level-3 border-outline-primary"
            >
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent className="bg-background-level-2 border-[rgba(255,255,255,0.08)]">
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary-100" />
                  <span>All Types</span>
                </div>
              </SelectItem>
              <SelectItem value="normal">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary-100" />
                  <span>Normal</span>
                </div>
              </SelectItem>
              <SelectItem value="alarm">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-primary-100" />
                  <span>Alarm Sensor</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-200">
          <Label className="text-sm text-text-icon-02 block">Drones</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isLoading}
                aria-expanded={open}
                className="flex w-full justify-between items-center rounded-md border border-outline-primary bg-background-level-3 px-300 py-200 text-sm text-text-icon-01 hover:bg-surface-states-hover transition-colors"
              >
                <span>{selectedDrones.length > 0 
                  ? `${selectedDrones.length} drone${selectedDrones.length > 1 ? 's' : ''} selected` 
                  : "Select drones"}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-0 bg-background-level-3 border-[rgba(255,255,255,0.08)] shadow-md rounded-lg" 
              align="start"
              sideOffset={8}
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
            >
              <Command className="bg-transparent rounded-md">
                <div className="flex items-center p-3 border-b border-[rgba(255,255,255,0.08)]">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-text-icon-02" />
                  <CommandInput 
                    placeholder="Search drones..." 
                    className="h-10 text-text-icon-01 bg-background-level-4 rounded flex-1 border-none text-sm placeholder:text-text-icon-02 placeholder:opacity-60 focus:outline-none focus:ring-0" 
                  />
                </div>
                <div className="p-4">
                  <CommandList className="max-h-[240px] overflow-y-auto custom-scrollbar">
                    <CommandEmpty className="text-text-icon-02 py-3 text-center">No drones found</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="select-all"
                        onSelect={handleSelectAllDrones}
                        className="flex items-center gap-2 w-full py-2 px-1 mb-2 rounded hover:bg-surface-states-hover"
                      >
                        <div className="flex h-4 w-4 items-center justify-center rounded-[4px]">
                          <Checkbox 
                            checked={selectedDrones.length === DRONES.length} 
                            className="data-[state=checked]:bg-primary-200 border-[rgba(255,255,255,0.24)] h-4 w-4 rounded-[4px]"
                          />
                        </div>
                        <span className="font-medium text-text-icon-01 text-sm">Select All</span>
                      </CommandItem>
                      <Separator className="my-2 bg-[rgba(255,255,255,0.08)]" />
                      {DRONES.map((drone) => (
                        <CommandItem
                          key={drone.value}
                          value={drone.value}
                          onSelect={() => handleSelectDrone(drone.value)}
                          className="flex items-center gap-2 w-full py-2 px-1 my-1 rounded hover:bg-surface-states-hover"
                        >
                          <Checkbox 
                            checked={selectedDrones.includes(drone.value)} 
                            className="data-[state=checked]:bg-primary-200 border-[rgba(255,255,255,0.24)] h-4 w-4 rounded-[4px]"
                          />
                          <span className="text-text-icon-01 text-sm font-medium">
                            {drone.label}
                          </span>
                          {selectedDrones.includes(drone.value) && (
                            <Check className="h-4 w-4 ml-auto text-primary-100" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;

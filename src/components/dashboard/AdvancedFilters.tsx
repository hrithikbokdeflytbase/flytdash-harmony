
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
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  triggerType,
  setTriggerType,
  selectedDrones,
  setSelectedDrones
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSelectDrone = (value: string) => {
    if (selectedDrones.includes(value)) {
      setSelectedDrones(selectedDrones.filter(drone => drone !== value));
    } else {
      setSelectedDrones([...selectedDrones, value]);
    }
  };

  return (
    <div className="p-400 space-y-400 bg-background-level-3 rounded-b-200 border-t border-outline-primary animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-400">
        <div className="space-y-200">
          <Label htmlFor="trigger-type" className="fb-body1-medium text-text-icon-01">Trigger Type</Label>
          <Select value={triggerType} onValueChange={setTriggerType}>
            <SelectTrigger id="trigger-type" className="w-full bg-background-level-2 border-outline-primary">
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="alarm">Alarm Sensor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-200">
          <Label className="fb-body1-medium text-text-icon-01">Drones</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                aria-expanded={open}
                className="flex w-full justify-between items-center rounded-md border border-outline-primary bg-background-level-2 px-300 py-200 text-sm text-text-icon-01"
              >
                <span>{selectedDrones.length > 0 
                  ? `${selectedDrones.length} drone${selectedDrones.length > 1 ? 's' : ''} selected` 
                  : "Select drones"}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search drones..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No drones found</CommandEmpty>
                  <CommandGroup>
                    {DRONES.map((drone) => (
                      <CommandItem
                        key={drone.value}
                        value={drone.value}
                        onSelect={() => handleSelectDrone(drone.value)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Checkbox 
                            checked={selectedDrones.includes(drone.value)} 
                            className="data-[state=checked]:bg-primary-100"
                          />
                          <span>{drone.label}</span>
                          {selectedDrones.includes(drone.value) && (
                            <Check className="h-4 w-4 ml-auto text-primary-100" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;

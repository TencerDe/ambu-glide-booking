
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    bloodGroup: user?.bloodGroup || '',
    age: user?.age || '',
    preferredHospital: user?.preferredHospital || '',
    healthIssues: user?.healthIssues || []
  });

  const healthIssueOptions = [
    { id: 'bp', label: 'Blood Pressure' },
    { id: 'sugar', label: 'Diabetes/Sugar' },
    { id: 'heart', label: 'Heart Patient' },
    { id: 'respiratory', label: 'Respiratory Issues' },
    { id: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, preferredHospital: value }));
  };

  const handleHealthIssueChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      healthIssues: checked
        ? [...(prev.healthIssues || []), id]
        : (prev.healthIssues || []).filter(item => item !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert age to number
    const updatedData = {
      ...formData,
      age: formData.age ? parseInt(formData.age as string, 10) : undefined
    };
    
    updateProfile(updatedData);
    toast.success('Profile updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Input
            id="bloodGroup"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleInputChange}
            placeholder="e.g., A+, B-, O+"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Your age"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="preferredHospital">Preferred Hospital</Label>
          <Select 
            value={formData.preferredHospital} 
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fortis_gurgaon">Fortis Hospital, Gurgaon</SelectItem>
              <SelectItem value="apollo_delhi">Apollo Hospital, Delhi</SelectItem>
              <SelectItem value="max_noida">Max Super Specialty Hospital, Noida</SelectItem>
              <SelectItem value="aiims_delhi">AIIMS, Delhi</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {formData.preferredHospital === 'other' && (
            <Input
              className="mt-2"
              placeholder="Specify hospital name"
              name="otherHospital"
              onChange={(e) => setFormData(prev => ({...prev, preferredHospital: e.target.value}))}
            />
          )}
        </div>
        
        <div>
          <Label className="mb-2 block">Health Issues</Label>
          <div className="grid grid-cols-2 gap-4">
            {healthIssueOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id}
                  checked={(formData.healthIssues || []).includes(option.id)}
                  onCheckedChange={(checked) => 
                    handleHealthIssueChange(option.id, checked === true)
                  }
                />
                <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Button type="submit" className="w-full gradient-bg">
        Update Profile
      </Button>
    </form>
  );
};

export default ProfileForm;

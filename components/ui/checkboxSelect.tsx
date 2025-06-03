// components/CheckboxSelect.tsx
import React, { useState, useEffect, FC } from 'react';
import Select, { components, OptionProps, MultiValue , StylesConfig } from 'react-select';
import { motion } from 'framer-motion';

import { DatabaseService } from "@/lib/database"


// --- Custom Option Component พร้อม Type ---
// ใช้ `OptionProps` จาก react-select เพื่อให้ได้ Type ที่ถูกต้อง
const Option: FC<OptionProps<SelectOptionType, true>> = (props) => {
    // --- สร้างอ็อบเจ็กต์สำหรับ Styles ที่นี่ ---
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null} // จัดการ state ที่ component หลัก
          style={{ marginRight: '8px' }}
        />
        <label>{props.label}</label>
      </components.Option>
    </motion.div>
  );
};

// --- Type สำหรับ Props ของ CheckboxSelect ---
interface CheckboxSelectProps {
  projectId: string | null; // อนุญาตให้เป็น null ได้
}
export interface FileVoice {
  id: string;
  file_name: string;
  timestamp: string;
}

// Type สำหรับ Option ที่ react-select จะใช้งาน
// value ควรเป็นค่าที่ไม่ซ้ำกัน (unique) ในที่นี้เราใช้ file_name
export interface SelectOptionType {
  value: number|string; // ใช้ number หรือ string ขึ้นอยู่กับ id ของไฟล์
  label: string;
}

 interface CheckboxSelectProps {
  projectId: string | null;
  // ฟังก์ชันที่จะรับค่าที่ถูกเลือก (เป็น Array ของ SelectOptionType)
  onSelectionChange?: (selected: MultiValue<SelectOptionType>) => void;
}

// --- Component หลัก ---
const CheckboxSelect: FC<CheckboxSelectProps> = ({ projectId, onSelectionChange }) => {
  const [options, setOptions] = useState<SelectOptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MultiValue<SelectOptionType>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
    const transparentStyles: StylesConfig<SelectOptionType, true> = {
    // 1. กล่องควบคุมหลัก (Control)
    control: (styles, { isFocused }) => ({
      ...styles,
      // --- การเปลี่ยนแปลงหลักอยู่ตรงนี้ ---
      backgroundColor: 'transparent', // ทำให้พื้นหลังโปร่งใส
      borderWidth: '1px',             // กำหนดความหนาของเส้นขอบ
      // --- จบการเปลี่ยนแปลง ---

      borderColor: isFocused ? '#4f46e5' : '#a0aec0', // เปลี่ยนสีเทาให้เข้มขึ้นเล็กน้อย
      boxShadow: isFocused ? '0 0 0 1px #4f46e5' : styles.boxShadow,
      color: '#111827', // กำหนดสีตัวอักษรหลักให้ชัดเจน
      '&:hover': {
        borderColor: '#4f46e5',
      },
    }),

    // 2. ตัวเลือกใน Dropdown (Option) - อาจปรับสีเพื่อให้เข้ากับพื้นหลังใหม่
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? '#4f46e5' : isFocused ? '#e0e7ff' : '#ffffff', // พื้นหลังของ dropdown ยังเป็นสีขาว
      color: isSelected ? 'white' : '#111827',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isSelected ? '#c7d2fe' : undefined,
      },
    }),
    
    // 3. ป้ายที่ถูกเลือก (MultiValue) - ปรับให้ดูดีบนพื้นหลังโปร่งใส
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: 'rgba(224, 231, 255, 0.8)', // ใช้ rgba เพื่อให้โปร่งแสงเล็กน้อย
      border: '1px solid rgba(79, 70, 229, 0.2)',
      borderRadius: '6px',
    }),

    multiValueLabel: (styles) => ({
      ...styles,
      color: '#3730a3',
      fontWeight: '500',
    }),

    multiValueRemove: (styles) => ({
      ...styles,
      color: '#4338ca',
      ':hover': {
        backgroundColor: '#c7d2fe',
        color: '#312e81',
      },
    }),

    // 4. Placeholder - ทำให้แน่ใจว่ามองเห็นได้ชัด
    placeholder: (styles) => ({
        ...styles,
        color: '#6b7280', // สีเทาสำหรับ placeholder
    }),

    // 5. Menu - ทำให้แน่ใจว่า dropdown ยังมีพื้นหลังทึบ
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#ffffff',
    })
  };

  const handleChange = (selected: MultiValue<SelectOptionType>) => {
    // อัปเดต state ภายใน component ตัวเอง
    setSelectedOptions(selected);

    // เรียกใช้ฟังก์ชันที่ได้รับมาจาก prop พร้อมส่งข้อมูลกลับไป
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  };
  useEffect(() => {
    if (!projectId) {
      setOptions([]);
      setSelectedOptions([]);
      setError(null);
      return;
    }

    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedOptions([]); // รีเซ็ตค่าเมื่อเปลี่ยนโปรเจค

      try {
        const files: FileVoice[] = await DatabaseService.getFileVoiceByProject(projectId);

        const formattedOptions: SelectOptionType[] = files.map((file) => ({
          value: file.id,
          label: file.file_name+"_____Upload at : " + file.timestamp,
        }));

        setOptions(formattedOptions);
      } catch (err) {
        console.error('Failed to fetch files:', err);
        setError('เกิดข้อผิดพลาดในการโหลดไฟล์เสียง');
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [projectId]);

 

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Select<SelectOptionType, true> // <--- Generic Type สำคัญมาก
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      components={{ Option }}
      isLoading={isLoading}
      placeholder={isLoading ? 'กำลังโหลดข้อมูล...' : 'เลือกไฟล์ที่ต้องการ...'}
      noOptionsMessage={() =>
        !projectId
          ? 'กรุณาเลือกโปรเจคก่อน'
          : 'ไม่พบไฟล์ในโปรเจคนี้'
      }
      
      styles={transparentStyles}
    />
  );
};

export default CheckboxSelect;
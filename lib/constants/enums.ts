import { DrawType, HairCategory, KNOWN_HAIR_GRADES, KNOWN_HAIR_TEXTURES, KNOWN_HAIR_ORIGINS } from '@/types/database.types'

// Hair grade options - uses string values for dynamic support
// These are the known/common grades, but the system accepts any string from admin
export const hairGradeOptions = [
  { value: null, label: 'N/A' },
  { value: 'GRADE_A', label: 'Raw Baby Hair' },
  { value: 'GRADE_B', label: 'Single Donor' },
  { value: 'GRADE_C', label: 'VIP Virgin' },
  { value: 'GRADE_D', label: 'Virgin Remy' },
  { value: 'GRADE_E', label: 'Raw Hair' },
]

// Hair texture options - uses string values for dynamic support
// These are the known/common textures, but the system accepts any string from admin
export const hairTextureOptions = [
  { value: 'STRAIGHT', label: 'Straight' },
  { value: 'BODY_WAVE', label: 'Body Wave' },
  { value: 'LOOSE_WAVE', label: 'Loose Wave' },
  { value: 'DEEP_WAVE', label: 'Deep Wave' },
  { value: 'WATER_WAVE', label: 'Water Wave' },
  { value: 'KINKY_CURLY', label: 'Kinky Curly' },
  { value: 'JERRY_CURL', label: 'Jerry Curl' },
  { value: 'LOOSE_DEEP', label: 'Loose Deep' },
  { value: 'NATURAL_WAVE', label: 'Natural Wave' },
  { value: 'PIXIE_CURLS', label: 'Pixie Curls' },
  { value: 'BONE_STRAIGHT', label: 'Bone Straight' },
]

// Hair origin options - uses string values for dynamic support
// These are the known/common origins, but the system accepts any string from admin
export const hairOriginOptions = [
  { value: 'VIETNAM', label: 'Vietnam' },
  { value: 'PHILIPPINES', label: 'Philippines' },
  { value: 'INDIA', label: 'India' },
  { value: 'BURMA', label: 'Burma' },
  { value: 'CAMBODIA', label: 'Cambodia' },
  { value: 'CHINA', label: 'China' },
]

export const hairCategoryOptions = [
  { value: HairCategory.BUNDLES, label: 'Bundles' },
  { value: HairCategory.CLOSURE, label: 'Closure' },
  { value: HairCategory.FRONTAL, label: 'Frontal' },
  { value: HairCategory.WIG, label: 'Wig' },
  { value: HairCategory.PONYTAIL, label: 'Ponytail' },
  { value: HairCategory.CLIP_INS, label: 'Clip-ins' },
]

export const drawTypeOptions = [
  { value: null, label: 'N/A' },
  { value: DrawType.SINGLE_DRAWN, label: 'Single Drawn' },
  { value: DrawType.DOUBLE_DRAWN, label: 'Double Drawn' },
  { value: DrawType.SUPER_DOUBLE_DRAWN, label: 'Super Double Drawn' },
]

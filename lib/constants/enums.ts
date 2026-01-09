import { DrawType, HairCategory, HairGrade, HairOrigin, HairTexture } from '@/types/database.types'

export const hairGradeOptions = [
  { value: null, label: 'N/A' },
  { value: HairGrade.GRADE_A, label: 'Raw Baby Hair' },
  { value: HairGrade.GRADE_B, label: 'Single Donor' },
  { value: HairGrade.GRADE_C, label: 'VIP Virgin' },
  { value: HairGrade.GRADE_D, label: 'Virgin Remy' },
  { value: HairGrade.GRADE_E, label: 'Raw Hair' },
]

export const hairTextureOptions = [
  { value: HairTexture.STRAIGHT, label: 'Straight' },
  { value: HairTexture.BODY_WAVE, label: 'Body Wave' },
  { value: HairTexture.LOOSE_WAVE, label: 'Loose Wave' },
  { value: HairTexture.DEEP_WAVE, label: 'Deep Wave' },
  { value: HairTexture.WATER_WAVE, label: 'Water Wave' },
  { value: HairTexture.KINKY_CURLY, label: 'Kinky Curly' },
  { value: HairTexture.JERRY_CURL, label: 'Jerry Curl' },
  { value: HairTexture.LOOSE_DEEP, label: 'Loose Deep' },
  { value: HairTexture.NATURAL_WAVE, label: 'Natural Wave' },
]

export const hairOriginOptions = [
  { value: HairOrigin.VIETNAM, label: 'Vietnam' },
  { value: HairOrigin.PHILIPPINES, label: 'Philippines' },
  { value: HairOrigin.INDIA, label: 'India' },
  { value: HairOrigin.BURMA, label: 'Burma' },
  { value: HairOrigin.CAMBODIA, label: 'Cambodia' },
  { value: HairOrigin.CHINA, label: 'China' },
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

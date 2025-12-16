// Constants for Hair Attributes and Form Options

import {
  HairGrade,
  HairTexture,
  HairOrigin,
  HairCategory,
  DrawType,
} from '@/types/database.types';

export const HAIR_GRADES = [
  { value: HairGrade.GRADE_A, label: 'Grade A - Raw Baby' },
  { value: HairGrade.GRADE_B, label: 'Grade B - Single Donor' },
  { value: HairGrade.GRADE_C, label: 'Grade C - VIP Virgin' },
  { value: HairGrade.GRADE_D, label: 'Grade D - Regular Virgin/Remy' },
];

export const HAIR_TEXTURES = [
  { value: HairTexture.STRAIGHT, label: 'Straight' },
  { value: HairTexture.BODY_WAVE, label: 'Body Wave' },
  { value: HairTexture.LOOSE_WAVE, label: 'Loose Wave' },
  { value: HairTexture.DEEP_WAVE, label: 'Deep Wave' },
  { value: HairTexture.WATER_WAVE, label: 'Water Wave' },
  { value: HairTexture.KINKY_CURLY, label: 'Kinky Curly' },
  { value: HairTexture.JERRY_CURL, label: 'Jerry Curl' },
  { value: HairTexture.LOOSE_DEEP, label: 'Loose Deep' },
  { value: HairTexture.NATURAL_WAVE, label: 'Natural Wave' },
];

export const HAIR_ORIGINS = [
  { value: HairOrigin.VIETNAM, label: 'Vietnam' },
  { value: HairOrigin.PHILIPPINES, label: 'Philippines' },
  { value: HairOrigin.INDIA, label: 'India' },
  { value: HairOrigin.BURMA, label: 'Burma' },
  { value: HairOrigin.CAMBODIA, label: 'Cambodia' },
  { value: HairOrigin.CHINA, label: 'China' },
];

export const HAIR_CATEGORIES = [
  { value: HairCategory.BUNDLES, label: 'Bundles' },
  { value: HairCategory.CLOSURE, label: 'Closure' },
  { value: HairCategory.FRONTAL, label: 'Frontal' },
  { value: HairCategory.WIG, label: 'Wig' },
  { value: HairCategory.PONYTAIL, label: 'Ponytail' },
  { value: HairCategory.CLIP_INS, label: 'Clip-Ins' },
];

export const DRAW_TYPES = [
  { value: DrawType.SINGLE_DRAWN, label: 'Single Drawn' },
  { value: DrawType.DOUBLE_DRAWN, label: 'Double Drawn' },
  { value: DrawType.SUPER_DOUBLE_DRAWN, label: 'Super Double Drawn' },
];

export const AVAILABLE_LENGTHS = [
  8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32,
];

import { Preferences } from '@capacitor/preferences';
import type { Clinic, VisitRecord } from '../types';

const CLINICS_KEY = 'clinics';
const VISITS_KEY = 'visits';

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 获取所有诊所
export const getClinics = async (): Promise<Clinic[]> => {
  const { value } = await Preferences.get({ key: CLINICS_KEY });
  return value ? JSON.parse(value) : [];
};

// 保存诊所
export const saveClinic = async (clinic: Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Clinic> => {
  const clinics = await getClinics();
  const newClinic: Clinic = {
    ...clinic,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  clinics.push(newClinic);
  await Preferences.set({ key: CLINICS_KEY, value: JSON.stringify(clinics) });
  return newClinic;
};

// 更新诊所
export const updateClinic = async (id: string, clinicData: Partial<Clinic>): Promise<Clinic | null> => {
  const clinics = await getClinics();
  const index = clinics.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  clinics[index] = {
    ...clinics[index],
    ...clinicData,
    updatedAt: new Date().toISOString(),
  };
  await Preferences.set({ key: CLINICS_KEY, value: JSON.stringify(clinics) });
  return clinics[index];
};

// 删除诊所
export const deleteClinic = async (id: string): Promise<boolean> => {
  const clinics = await getClinics();
  const filteredClinics = clinics.filter(c => c.id !== id);
  if (filteredClinics.length === clinics.length) return false;
  
  await Preferences.set({ key: CLINICS_KEY, value: JSON.stringify(filteredClinics) });
  
  // 同时删除该诊所的所有拜访记录
  const visits = await getVisits();
  const filteredVisits = visits.filter(v => v.clinicId !== id);
  await Preferences.set({ key: VISITS_KEY, value: JSON.stringify(filteredVisits) });
  
  return true;
};

// 获取单个诊所
export const getClinicById = async (id: string): Promise<Clinic | null> => {
  const clinics = await getClinics();
  return clinics.find(c => c.id === id) || null;
};

// 获取所有拜访记录
export const getVisits = async (): Promise<VisitRecord[]> => {
  const { value } = await Preferences.get({ key: VISITS_KEY });
  return value ? JSON.parse(value) : [];
};

// 获取某个诊所的拜访记录
export const getVisitsByClinicId = async (clinicId: string): Promise<VisitRecord[]> => {
  const visits = await getVisits();
  return visits
    .filter(v => v.clinicId === clinicId)
    .sort((a, b) => new Date(b.visitTime).getTime() - new Date(a.visitTime).getTime());
};

// 保存拜访记录
export const saveVisit = async (visit: Omit<VisitRecord, 'id' | 'createdAt'>): Promise<VisitRecord> => {
  const visits = await getVisits();
  const newVisit: VisitRecord = {
    ...visit,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  visits.push(newVisit);
  await Preferences.set({ key: VISITS_KEY, value: JSON.stringify(visits) });
  return newVisit;
};

// 删除拜访记录
export const deleteVisit = async (id: string): Promise<boolean> => {
  const visits = await getVisits();
  const filteredVisits = visits.filter(v => v.id !== id);
  if (filteredVisits.length === visits.length) return false;
  
  await Preferences.set({ key: VISITS_KEY, value: JSON.stringify(filteredVisits) });
  return true;
};

// 诊所信息类型定义
export interface Clinic {
  id: string;
  name: string;
  address: string;
  doctorName: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// 拜访记录类型定义
export interface VisitRecord {
  id: string;
  clinicId: string;
  visitTime: string;
  event: string;
  createdAt: string;
}

// 表单数据类型
export interface ClinicFormData {
  name: string;
  address: string;
  doctorName: string;
  phone: string;
}

export interface VisitFormData {
  visitTime: string;
  event: string;
}

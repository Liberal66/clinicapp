import React from 'react';
import type { Clinic } from '../types';
import { formatAddress } from '../services/location';

interface ClinicListProps {
  clinics: Clinic[];
  onSelect: (clinic: Clinic) => void;
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinic: Clinic) => void;
}

const ClinicList: React.FC<ClinicListProps> = ({
  clinics,
  onSelect,
  onEdit,
  onDelete,
}) => {
  if (clinics.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏥</div>
        <p>暂无诊所信息</p>
        <p className="empty-hint">点击右上角 + 按钮添加诊所</p>
      </div>
    );
  }

  return (
    <div className="clinic-list">
      {clinics.map(clinic => (
        <div key={clinic.id} className="clinic-card">
          <div className="clinic-info" onClick={() => onSelect(clinic)}>
            <h3 className="clinic-name">{clinic.name}</h3>
            <p className="clinic-doctor">👨‍⚕️ {clinic.doctorName || '未填写大夫'}</p>
            <p className="clinic-address">📍 {formatAddress(clinic.address) || '未填写地址'}</p>
            {clinic.phone && (
              <p className="clinic-phone">📞 {clinic.phone}</p>
            )}
          </div>
          <div className="clinic-actions">
            <button
              className="action-btn edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(clinic);
              }}
            >
              编辑
            </button>
            <button
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(clinic);
              }}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClinicList;

import { useState } from 'react';
import type { ClinicFormData } from '../types';
import { getCurrentPosition, formatAddress, formatDistance } from '../services/location';
import type { NearbyClinic } from '../services/location';

interface ClinicFormProps {
  initialData?: Partial<ClinicFormData>;
  onSubmit: (data: ClinicFormData) => void;
  onCancel: () => void;
  submitText?: string;
}

const ClinicForm = ({
  initialData,
  onSubmit,
  onCancel,
  submitText = '保存',
}: ClinicFormProps) => {
  const [formData, setFormData] = useState<ClinicFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    doctorName: initialData?.doctorName || '',
    phone: initialData?.phone || '',
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [nearbyClinics, setNearbyClinics] = useState<NearbyClinic[]>([]);
  const [showClinicSelector, setShowClinicSelector] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    setNearbyClinics([]);
    setShowClinicSelector(false);

    try {
      const result = await getCurrentPosition();

      // 更新地址
      setFormData(prev => ({ ...prev, address: result.address }));

      // 如果找到周边诊所，显示选择器
      if (result.nearbyClinics && result.nearbyClinics.length > 0) {
        setNearbyClinics(result.nearbyClinics);
        setShowClinicSelector(true);

        // 如果只有一个诊所，直接填入名称
        if (result.nearbyClinics.length === 1) {
          setFormData(prev => ({
            ...prev,
            name: result.nearbyClinics![0].name,
          }));
        }
      }
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : '获取位置失败');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectClinic = (clinic: NearbyClinic) => {
    setFormData(prev => ({
      ...prev,
      name: clinic.name,
      address: clinic.address,
    }));
    setShowClinicSelector(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入诊所名称');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="clinic-form">
      <div className="form-group">
        <label htmlFor="name">诊所名称 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="请输入诊所名称或点击获取位置自动识别"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">地址</label>
        <div className="address-input-group">
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="点击右侧按钮获取当前位置"
            readOnly
          />
          <button
            type="button"
            className="location-btn"
            onClick={handleGetLocation}
            disabled={isLocating}
          >
            {isLocating ? '定位中...' : '📍 获取位置'}
          </button>
        </div>
        {locationError && <span className="error-text">{locationError}</span>}
        {formData.address && (
          <span className="address-preview">{formatAddress(formData.address)}</span>
        )}
      </div>

      {/* 周边诊所选择弹窗 */}
      {showClinicSelector && nearbyClinics.length > 0 && (
        <div className="nearby-clinics-section">
          <label>🎯 发现周边诊所，点击选择：</label>
          <div className="nearby-clinics-list">
            {nearbyClinics.map((clinic, index) => (
              <button
                key={index}
                type="button"
                className="nearby-clinic-item"
                onClick={() => handleSelectClinic(clinic)}
              >
                <span className="clinic-item-name">{clinic.name}</span>
                <span className="clinic-item-distance">{formatDistance(clinic.distance)}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="dismiss-btn"
            onClick={() => setShowClinicSelector(false)}
          >
            手动输入名称
          </button>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="doctorName">大夫姓名</label>
        <input
          type="text"
          id="doctorName"
          name="doctorName"
          value={formData.doctorName}
          onChange={handleChange}
          placeholder="请输入大夫姓名"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">联系电话</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="请输入联系电话"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn-submit">
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default ClinicForm;
